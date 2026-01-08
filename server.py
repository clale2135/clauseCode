#!/usr/bin/env python3
"""
Async Sanic server that accepts POST requests from the Chrome extension
and makes API calls to OpenAI and SerpAPI using credentials from .env
"""

from sanic import Sanic, response
from sanic.response import json as json_response, html, file
from sanic_cors import CORS
import csv
import os
import sys
from datetime import datetime
import httpx
from dotenv import load_dotenv
import aiofiles
import PyPDF2
from docx import Document as DocxDocument
from io import BytesIO
from lxml import html as lxml_html
import re

# Load environment variables from .env
load_dotenv()

# Import configuration
from config import config

app = Sanic("ClauseCodeAI")
CORS(app)

# Serve static files
app.static('/static', './static')

# Get API keys from config (which handles both env vars and Google Secrets Manager)
OPENAI_API_KEY = config.OPENAI_API_KEY or ''
SERPAPI_KEY = config.SERPAPI_KEY or ''

# CSV file path - use /tmp for cloud deployments
CSV_FILE = config.CSV_FILE
HEADERS = config.HEADERS

# Ensure CSV file exists with headers
async def init_csv():
    try:
        if not os.path.exists(CSV_FILE):
            async with aiofiles.open(CSV_FILE, 'w', newline='', encoding='utf-8') as f:
                await f.write(','.join(HEADERS) + '\n')
    except Exception as e:
        print(f"Warning: Could not create CSV file: {e}")

@app.route('/save', methods=['POST'])
async def save_data(request):
    try:
        data = request.json
        
        # Extract data from request
        timestamp = data.get('timestamp', datetime.now().isoformat())
        agent = data.get('agent', '')
        analysis_type = data.get('analysisType', '')
        page_title = data.get('pageTitle', '')
        page_url = data.get('pageUrl', '')
        result_text = data.get('resultText', '')
        
        # Try to append to CSV, but don't fail if we can't
        try:
            import csv as csv_module
            from io import StringIO
            
            # Create CSV row
            output = StringIO()
            writer = csv_module.writer(output)
            writer.writerow([timestamp, agent, analysis_type, page_title, page_url, result_text])
            csv_line = output.getvalue()
            
            # Append to file asynchronously
            async with aiofiles.open(CSV_FILE, 'a', encoding='utf-8') as f:
                await f.write(csv_line)
        except Exception as e:
            print(f"Warning: Could not save to CSV: {e}")
            # Still return success - the analysis worked, just couldn't save
        
        return json_response({'status': 'ok', 'message': 'Data processed successfully'}, status=200)
    
    except Exception as e:
        return json_response({'status': 'error', 'message': str(e)}, status=500)

@app.route('/', methods=['GET'])
async def home(request):
    try:
        async with aiofiles.open('index.html', 'r', encoding='utf-8') as f:
            content = await f.read()
        return html(content)
    except FileNotFoundError:
        return json_response({
            'status': 'ok',
            'message': 'Analysis Data Server Running',
            'csv_file': CSV_FILE,
            'endpoints': {
                'save': 'POST /save (accepts JSON)',
                'health': 'GET /health',
                'analyze': 'POST /analyze',
                'upload': 'POST /upload'
            }
        }, status=200)

@app.route('/health', methods=['GET'])
async def health(request):
    return json_response({'status': 'ok', 'message': 'Server is running'}, status=200)

@app.route('/upload', methods=['POST'])
async def upload_file(request):
    """Handle file uploads (PDF, Word documents)"""
    try:
        if not request.files:
            return json_response({'error': 'No file uploaded'}, status=400)
        
        uploaded_file = request.files.get('file')
        if not uploaded_file:
            return json_response({'error': 'No file in request'}, status=400)
        
        file_content = uploaded_file.body
        file_name = uploaded_file.name
        
        # Extract text based on file type
        text = ''
        if file_name.lower().endswith('.pdf'):
            text = extract_pdf_text(file_content)
        elif file_name.lower().endswith(('.doc', '.docx')):
            text = extract_docx_text(file_content)
        else:
            return json_response({'error': 'Unsupported file type. Please upload PDF or Word documents.'}, status=400)
        
        if not text:
            return json_response({'error': 'Could not extract text from document'}, status=400)
        
        return json_response({
            'status': 'ok',
            'text': text,
            'filename': file_name
        }, status=200)
    
    except Exception as e:
        return json_response({'error': str(e)}, status=500)

def extract_pdf_text(file_content):
    """Extract text from PDF file"""
    try:
        pdf_file = BytesIO(file_content)
        pdf_reader = PyPDF2.PdfReader(pdf_file)
        text = ''
        for page in pdf_reader.pages:
            text += page.extract_text() + '\n'
        return text.strip()
    except Exception as e:
        print(f"PDF extraction error: {e}")
        return ''

def extract_docx_text(file_content):
    """Extract text from Word document"""
    try:
        doc_file = BytesIO(file_content)
        doc = DocxDocument(doc_file)
        text = '\n'.join([paragraph.text for paragraph in doc.paragraphs])
        return text.strip()
    except Exception as e:
        print(f"DOCX extraction error: {e}")
        return ''

@app.route('/scrape-url', methods=['POST'])
async def scrape_url(request):
    """Scrape content from a URL"""
    try:
        data = request.json
        url = data.get('url', '').strip()
        
        if not url:
            return json_response({'error': 'URL is required'}, status=400)
        
        # Add protocol if missing
        if not url.startswith(('http://', 'https://')):
            url = 'https://' + url
        
        # Fetch the URL content
        async with httpx.AsyncClient(timeout=30.0, follow_redirects=True) as client:
            response = await client.get(url, headers={
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            })
        
        if response.status_code != 200:
            return json_response({'error': f'Failed to fetch URL: HTTP {response.status_code}'}, status=400)
        
        # Parse HTML and extract text
        tree = lxml_html.fromstring(response.content)
        
        # Remove script and style elements
        for element in tree.xpath('//script | //style | //noscript'):
            element.getparent().remove(element)
        
        # Get text content
        text = tree.text_content()
        
        # Clean up the text
        text = re.sub(r'\n\s*\n', '\n\n', text)  # Remove excessive blank lines
        text = re.sub(r' +', ' ', text)  # Remove excessive spaces
        text = text.strip()
        
        if not text:
            return json_response({'error': 'No text content found on the page'}, status=400)
        
        # Get page title
        title_elements = tree.xpath('//title/text()')
        page_title = title_elements[0].strip() if title_elements else 'Untitled Page'
        
        return json_response({
            'status': 'ok',
            'text': text,
            'url': url,
            'title': page_title
        }, status=200)
    
    except httpx.RequestError as e:
        return json_response({'error': f'Failed to fetch URL: {str(e)}'}, status=400)
    except Exception as e:
        return json_response({'error': str(e)}, status=500)

@app.route('/analyze', methods=['POST'])
async def analyze(request):
    """Analyze page content using AI"""
    try:
        print("=== /analyze endpoint called ===", flush=True)
        sys.stdout.flush()
        
        if not OPENAI_API_KEY:
            print("ERROR: OpenAI API key not configured", flush=True)
            return json_response({'error': 'OpenAI API key not configured in .env'}, status=500)

        # Log API key status (masked for security)
        key_preview = OPENAI_API_KEY[:10] + "..." + OPENAI_API_KEY[-4:] if len(OPENAI_API_KEY) > 14 else "***"
        print(f"Using API key: {key_preview}", flush=True)
        sys.stdout.flush()

        data = request.json
        page_text = data.get('pageText', '')
        system_prompt = data.get('systemPrompt', '')
        
        print(f"Request data received - page_text length: {len(page_text)}, system_prompt length: {len(system_prompt)}", flush=True)
        sys.stdout.flush()

        # Call OpenAI API asynchronously
        print("Calling OpenAI API...", flush=True)
        sys.stdout.flush()
        
        async with httpx.AsyncClient(timeout=60.0) as client:
            response = await client.post(
                'https://api.openai.com/v1/chat/completions',
                headers={
                    'Content-Type': 'application/json',
                    'Authorization': f'Bearer {OPENAI_API_KEY}'
                },
                json={
                    'model': 'gpt-4o-mini',
                    'messages': [
                        {'role': 'system', 'content': system_prompt},
                        {'role': 'user', 'content': f'PAGE CONTENT:\n{page_text}\n\nAnalyze this page content according to your role and provide your insights.'}
                    ]
                }
            )

        print(f"OpenAI API response status: {response.status_code}", flush=True)
        sys.stdout.flush()

        if response.status_code != 200:
            error_data = response.json()
            error_message = error_data.get('error', {}).get('message', 'OpenAI API error')
            print(f"=== OpenAI API Error ===", flush=True)
            print(f"Error message: {error_message}", flush=True)
            print(f"Response status: {response.status_code}", flush=True)
            print(f"Full response: {error_data}", flush=True)
            sys.stdout.flush()
            return json_response({'error': error_message}, status=400)

        result = response.json()
        return json_response({'result': result['choices'][0]['message']['content']}, status=200)

    except Exception as e:
        return json_response({'error': str(e)}, status=500)

@app.route('/search-alternatives', methods=['POST'])
async def search_alternatives(request):
    """Search for alternative services"""
    try:
        if not SERPAPI_KEY:
            return json_response({'error': 'SerpAPI key not configured in .env'}, status=500)

        data = request.json
        service_name = data.get('serviceName', '')

        query = f'alternatives to {service_name}'
        
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.get(
                'https://serpapi.com/search.json',
                params={
                    'engine': 'google',
                    'q': query,
                    'api_key': SERPAPI_KEY
                }
            )

        if response.status_code != 200:
            return json_response({'error': 'SerpAPI error'}, status=400)

        data = response.json()
        alternatives = []
        
        if data.get('organic_results'):
            for result in data['organic_results'][:5]:
                alternatives.append({
                    'title': result.get('title'),
                    'link': result.get('link'),
                    'snippet': result.get('snippet')
                })

        return json_response({'alternatives': alternatives}, status=200)

    except Exception as e:
        return json_response({'error': str(e)}, status=500)

@app.before_server_start
async def setup(app, loop):
    await init_csv()
    print(f"CSV file: {CSV_FILE}")
    print(f"OpenAI API Key configured: {'Yes' if OPENAI_API_KEY else 'No'}")

if __name__ == '__main__':
    port = config.PORT
    print(f"Starting ClauseCodeAI server on http://{config.HOST}:{port}")
    app.run(host=config.HOST, port=port, debug=config.DEBUG, access_log=True)
