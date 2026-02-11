#!/usr/bin/env python3
"""
Async Sanic server that accepts POST requests from the Chrome extension
and makes API calls to OpenAI and SerpAPI using credentials from .env
"""

from sanic import Sanic, response
from sanic.response import json as json_response, html, file
from sanic_cors import CORS
from sanic_session import Session, InMemorySessionInterface
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
from google.oauth2 import id_token
from google.auth.transport import requests as google_requests
import secrets

# Load environment variables from .env
load_dotenv()

# Import configuration
from config import config

# Import database module
from database import get_db

app = Sanic("ClauseCodeAI")
CORS(app, supports_credentials=True)

# Setup session management
session = Session(app, interface=InMemorySessionInterface())
app.config.SESSION_COOKIE_NAME = "clausecode_session"
app.config.SESSION_COOKIE_HTTPONLY = True
app.config.SESSION_COOKIE_SAMESITE = "Lax"
app.config.SECRET_KEY = config.SESSION_SECRET

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
        page_content = data.get('pageContent', '')
        
        # Get user_id from session if authenticated
        user_id = None
        if hasattr(request.ctx, 'session') and request.ctx.session.get('authenticated'):
            user_data = request.ctx.session.get('user', {})
            user_id = user_data.get('user_id')
        
        # Save to CSV (only if enabled - disabled on cloud deployments)
        csv_saved = False
        if config.USE_CSV:
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
                csv_saved = True
            except Exception as e:
                print(f"⚠️ Could not save to CSV: {e}")
        
        # Save to Firestore (if enabled)
        firestore_doc_id = None
        if config.USE_FIRESTORE:
            try:
                db = await get_db()
                if db and db.initialized:
                    firestore_doc_id = await db.save_analysis(
                        timestamp=timestamp,
                        agent=agent,
                        analysis_type=analysis_type,
                        page_title=page_title,
                        page_url=page_url,
                        result_text=result_text,
                        page_content=page_content,
                        user_id=user_id
                    )
            except Exception as e:
                print(f"⚠️ Could not save to Firestore: {e}")
        
        # Build response
        response_data = {
            'status': 'ok',
            'message': 'Data processed successfully',
            'saved_to': []
        }
        
        if csv_saved:
            response_data['saved_to'].append('csv')
        
        if firestore_doc_id:
            response_data['saved_to'].append('firestore')
            response_data['firestore_doc_id'] = firestore_doc_id
        
        return json_response(response_data, status=200)
    
    except Exception as e:
        return json_response({'status': 'error', 'message': str(e)}, status=500)

@app.route('/analyses', methods=['GET'])
async def list_analyses(request):
    """Get list of saved analyses from Firestore"""
    try:
        # Get query parameters
        limit = int(request.args.get('limit', 50))
        agent = request.args.get('agent', None)
        analysis_type = request.args.get('analysis_type', None)
        user_id = request.args.get('user_id', None)
        
        # Get from Firestore
        db = await get_db()
        if not db or not db.initialized:
            return json_response({
                'status': 'error',
                'message': 'Firestore not available'
            }, status=503)
        
        analyses = await db.list_analyses(
            limit=limit,
            agent=agent,
            analysis_type=analysis_type,
            user_id=user_id
        )
        
        # Convert datetime objects to ISO format for JSON
        for analysis in analyses:
            if 'timestamp' in analysis and hasattr(analysis['timestamp'], 'isoformat'):
                analysis['timestamp'] = analysis['timestamp'].isoformat()
            if 'created_at' in analysis and hasattr(analysis['created_at'], 'isoformat'):
                analysis['created_at'] = analysis['created_at'].isoformat()
        
        return json_response({
            'status': 'ok',
            'count': len(analyses),
            'analyses': analyses
        }, status=200)
    
    except Exception as e:
        return json_response({
            'status': 'error',
            'message': str(e)
        }, status=500)

@app.route('/analyses/<doc_id>', methods=['GET'])
async def get_analysis(request, doc_id: str):
    """Get a single analysis by document ID"""
    try:
        db = await get_db()
        if not db or not db.initialized:
            return json_response({
                'status': 'error',
                'message': 'Firestore not available'
            }, status=503)
        
        analysis = await db.get_analysis(doc_id)
        
        if not analysis:
            return json_response({
                'status': 'error',
                'message': 'Analysis not found'
            }, status=404)
        
        # Convert datetime objects to ISO format
        if 'timestamp' in analysis and hasattr(analysis['timestamp'], 'isoformat'):
            analysis['timestamp'] = analysis['timestamp'].isoformat()
        if 'created_at' in analysis and hasattr(analysis['created_at'], 'isoformat'):
            analysis['created_at'] = analysis['created_at'].isoformat()
        
        return json_response({
            'status': 'ok',
            'analysis': analysis
        }, status=200)
    
    except Exception as e:
        return json_response({
            'status': 'error',
            'message': str(e)
        }, status=500)

@app.route('/analyses/<doc_id>', methods=['DELETE'])
async def delete_analysis(request, doc_id: str):
    """Delete a single analysis by document ID"""
    try:
        db = await get_db()
        if not db or not db.initialized:
            return json_response({
                'status': 'error',
                'message': 'Firestore not available'
            }, status=503)
        
        success = await db.delete_analysis(doc_id)
        
        if not success:
            return json_response({
                'status': 'error',
                'message': 'Failed to delete analysis'
            }, status=500)
        
        return json_response({
            'status': 'ok',
            'message': 'Analysis deleted successfully'
        }, status=200)
    
    except Exception as e:
        return json_response({
            'status': 'error',
            'message': str(e)
        }, status=500)

@app.route('/', methods=['GET'])
async def home(request):
    try:
        async with aiofiles.open('landing.html', 'r', encoding='utf-8') as f:
            content = await f.read()
        return html(content)
    except FileNotFoundError:
        return json_response({
            'status': 'ok',
            'message': 'ClauseCode AI - Analysis Data Server',
            'storage': 'Firestore' if config.USE_FIRESTORE else 'CSV',
            'endpoints': {
                'save': 'POST /save (accepts JSON)',
                'list_analyses': 'GET /analyses?limit=50&agent=&analysis_type=',
                'get_analysis': 'GET /analyses/{doc_id}',
                'view_analyses': 'GET /saved-analyses.html',
                'health': 'GET /health',
                'analyze': 'POST /analyze',
                'upload': 'POST /upload'
            }
        }, status=200)

@app.route('/app.html', methods=['GET'])
async def app_page(request):
    """Serve the main app"""
    try:
        async with aiofiles.open('index.html', 'r', encoding='utf-8') as f:
            content = await f.read()
        return html(content)
    except FileNotFoundError:
        return json_response({'error': 'App not found'}, status=404)

@app.route('/presentation.html', methods=['GET'])
async def presentation(request):
    try:
        async with aiofiles.open('presentation.html', 'r', encoding='utf-8') as f:
            content = await f.read()
        return html(content)
    except FileNotFoundError:
        return json_response({'error': 'Presentation not found'}, status=404)

@app.route('/pitch-deck.html', methods=['GET'])
async def pitch_deck(request):
    try:
        async with aiofiles.open('pitch-deck.html', 'r', encoding='utf-8') as f:
            content = await f.read()
        return html(content)
    except FileNotFoundError:
        return json_response({'error': 'Pitch deck not found'}, status=404)

@app.route('/PITCH_NARRATION.md', methods=['GET'])
async def pitch_narration(request):
    try:
        return await file('PITCH_NARRATION.md')
    except FileNotFoundError:
        return json_response({'error': 'Pitch narration not found'}, status=404)

@app.route('/saved-analyses.html', methods=['GET'])
async def saved_analyses_page(request):
    """Serve the saved analyses viewer page"""
    try:
        async with aiofiles.open('saved-analyses.html', 'r', encoding='utf-8') as f:
            content = await f.read()
        return html(content)
    except FileNotFoundError:
        return json_response({'error': 'Saved analyses page not found'}, status=404)

@app.route('/terms.html', methods=['GET'])
async def terms_page(request):
    """Serve the terms and conditions page"""
    try:
        async with aiofiles.open('terms.html', 'r', encoding='utf-8') as f:
            content = await f.read()
        return html(content)
    except FileNotFoundError:
        return json_response({'error': 'Terms and conditions page not found'}, status=404)

@app.route('/landing.html', methods=['GET'])
async def landing_page(request):
    """Serve the landing page"""
    try:
        async with aiofiles.open('landing.html', 'r', encoding='utf-8') as f:
            content = await f.read()
        return html(content)
    except FileNotFoundError:
        return json_response({'error': 'Landing page not found'}, status=404)

@app.route('/accessibility-stats.html', methods=['GET'])
async def accessibility_stats_page(request):
    """Serve the accessibility statistics page"""
    try:
        async with aiofiles.open('accessibility-stats.html', 'r', encoding='utf-8') as f:
            content = await f.read()
        return html(content)
    except FileNotFoundError:
        return json_response({'error': 'Accessibility stats page not found'}, status=404)

@app.route('/case-studies.html', methods=['GET'])
async def case_studies_page(request):
    """Serve the case studies page"""
    try:
        async with aiofiles.open('case-studies.html', 'r', encoding='utf-8') as f:
            content = await f.read()
        return html(content)
    except FileNotFoundError:
        return json_response({'error': 'Case studies page not found'}, status=404)

@app.route('/case-detail.html', methods=['GET'])
async def case_detail_page(request):
    """Serve the case detail page"""
    try:
        async with aiofiles.open('case-detail.html', 'r', encoding='utf-8') as f:
            content = await f.read()
        return html(content)
    except FileNotFoundError:
        return json_response({'error': 'Case detail page not found'}, status=404)

@app.route('/gwc.pdf', methods=['GET'])
async def gwc_pdf(request):
    """Serve the GWC research PDF"""
    try:
        return await file('gwc.pdf')
    except FileNotFoundError:
        return json_response({'error': 'PDF not found'}, status=404)

# Google OAuth endpoints
@app.route('/auth/google', methods=['POST'])
async def google_auth(request):
    """Verify Google OAuth token and create session"""
    try:
        data = request.json
        token = data.get('credential')
        
        if not token:
            return json_response({'status': 'error', 'message': 'No token provided'}, status=400)
        
        # Verify the token with Google
        try:
            idinfo = id_token.verify_oauth2_token(
                token, 
                google_requests.Request(), 
                config.GOOGLE_CLIENT_ID
            )
            
            # Token is valid, extract user info
            user_data = {
                'user_id': idinfo['sub'],
                'email': idinfo['email'],
                'name': idinfo.get('name', ''),
                'picture': idinfo.get('picture', ''),
                'email_verified': idinfo.get('email_verified', False)
            }
            
            # Store in session
            request.ctx.session['user'] = user_data
            request.ctx.session['authenticated'] = True
            
            return json_response({
                'status': 'ok',
                'user': user_data
            }, status=200)
            
        except ValueError as e:
            # Invalid token
            return json_response({
                'status': 'error',
                'message': f'Invalid token: {str(e)}'
            }, status=401)
    
    except Exception as e:
        return json_response({
            'status': 'error',
            'message': str(e)
        }, status=500)

@app.route('/auth/logout', methods=['POST'])
async def logout(request):
    """Logout user and clear session"""
    try:
        request.ctx.session.clear()
        return json_response({'status': 'ok', 'message': 'Logged out'}, status=200)
    except Exception as e:
        return json_response({'status': 'error', 'message': str(e)}, status=500)

@app.route('/auth/me', methods=['GET'])
async def get_current_user(request):
    """Get current logged-in user info"""
    try:
        if request.ctx.session.get('authenticated'):
            user_data = request.ctx.session.get('user')
            return json_response({
                'status': 'ok',
                'authenticated': True,
                'user': user_data
            }, status=200)
        else:
            return json_response({
                'status': 'ok',
                'authenticated': False
            }, status=200)
    except Exception as e:
        return json_response({
            'status': 'error',
            'message': str(e)
        }, status=500)

@app.route('/ask-question', methods=['POST'])
async def ask_question(request):
    """Handle follow-up questions about analysis with conversation memory"""
    try:
        if not OPENAI_API_KEY:
            return json_response({'error': 'OpenAI API key not configured'}, status=500)
        
        data = request.json
        question = data.get('question', '').strip()
        page_content = data.get('pageContent', '')
        analysis_result = data.get('analysisResult', '')
        conversation_history = data.get('conversationHistory', [])
        
        if not question:
            return json_response({'error': 'Question is required'}, status=400)
        
        # Build conversation messages with memory
        messages = [
            {
                'role': 'system',
                'content': 'You are a helpful assistant answering questions about a contract/document analysis. Be concise, accurate, and refer to specific parts of the contract or analysis when relevant. Format your response in clean HTML with proper headings (<h3>), paragraphs (<p>), lists (<ul>, <ol>), and styling (<strong>, <em>) for readability.'
            },
            {
                'role': 'user',
                'content': f'ORIGINAL CONTRACT/DOCUMENT:\n{page_content[:4000]}\n\nANALYSIS RESULT:\n{analysis_result[:4000]}'
            },
            {
                'role': 'assistant',
                'content': 'I understand. I have reviewed the contract and analysis. What would you like to know?'
            }
        ]
        
        # Add conversation history
        for msg in conversation_history:
            messages.append({
                'role': msg.get('role', 'user'),
                'content': msg.get('content', '')
            })
        
        # Add current question
        messages.append({
            'role': 'user',
            'content': question
        })
        
        # Call OpenAI API
        async with httpx.AsyncClient(timeout=60.0) as client:
            response = await client.post(
                'https://api.openai.com/v1/chat/completions',
                headers={
                    'Content-Type': 'application/json',
                    'Authorization': f'Bearer {OPENAI_API_KEY}'
                },
                json={
                    'model': 'gpt-5.1-chat-latest',
                    'messages': messages
                }
            )
        
        if response.status_code != 200:
            error_data = response.json()
            error_message = error_data.get('error', {}).get('message', 'OpenAI API error')
            return json_response({'error': error_message}, status=400)
        
        result = response.json()
        answer = result['choices'][0]['message']['content']
        
        return json_response({
            'status': 'ok',
            'answer': answer
        }, status=200)
    
    except Exception as e:
        return json_response({'error': str(e)}, status=500)

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
        
        # Check if input looks like content instead of a URL
        if len(url) > 200 or '\n' in url or url.count(' ') > 10:
            return json_response({
                'error': 'It looks like you pasted content instead of a URL. Please paste only the website address (e.g., united.com/terms), or use the "Paste Text" option instead.'
            }, status=400)
        
        # Validate URL format
        if not re.match(r'^[\w\-\.]+\.[a-zA-Z]{2,}', url) and not url.startswith(('http://', 'https://')):
            return json_response({
                'error': 'Invalid URL format. Please enter a valid website address (e.g., example.com or https://example.com)'
            }, status=400)
        
        # Add protocol if missing
        if not url.startswith(('http://', 'https://')):
            url = 'https://' + url
        
        # Enhanced headers to appear more like a real browser
        headers = {
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.9',
            'Accept-Encoding': 'gzip, deflate, br',
            'Connection': 'keep-alive',
            'Upgrade-Insecure-Requests': '1',
            'Sec-Fetch-Dest': 'document',
            'Sec-Fetch-Mode': 'navigate',
            'Sec-Fetch-Site': 'none',
            'Cache-Control': 'max-age=0'
        }
        
        # Try to fetch the URL content with better configuration
        async with httpx.AsyncClient(
            timeout=45.0, 
            follow_redirects=True,
            verify=True,  # Keep SSL verification
            max_redirects=10
        ) as client:
            try:
                response = await client.get(url, headers=headers)
            except httpx.TimeoutException:
                return json_response({
                    'error': 'The website took too long to respond (timeout after 45 seconds). The site may be slow or blocking automated access.'
                }, status=400)
            except httpx.ConnectError:
                return json_response({
                    'error': 'Could not connect to the website. Please check the URL and try again.'
                }, status=400)
        
        # Check response status
        if response.status_code == 403:
            return json_response({
                'error': 'Access forbidden: This website is blocking automated access. Please try copying and pasting the text content manually instead.'
            }, status=400)
        elif response.status_code == 404:
            return json_response({
                'error': 'Page not found (404). Please check the URL and try again.'
            }, status=400)
        elif response.status_code == 429:
            return json_response({
                'error': 'Rate limited: The website is blocking too many requests. Please wait a moment and try again.'
            }, status=400)
        elif response.status_code >= 500:
            return json_response({
                'error': f'The website is experiencing server errors (HTTP {response.status_code}). Please try again later.'
            }, status=400)
        elif response.status_code != 200:
            return json_response({
                'error': f'Failed to fetch URL: HTTP {response.status_code}. The website may be blocking automated access.'
            }, status=400)
        
        # Check if we got an actual HTML page (not JSON API response or redirect page)
        content_type = response.headers.get('content-type', '').lower()
        if 'application/json' in content_type:
            return json_response({
                'error': 'This URL returns JSON data instead of a webpage. Please use a regular webpage URL.'
            }, status=400)
        
        # Parse HTML and extract text
        try:
            tree = lxml_html.fromstring(response.content)
        except Exception as e:
            return json_response({
                'error': 'Could not parse the webpage content. The page may be using dynamic JavaScript that requires a browser to view.'
            }, status=400)
        
        # Remove script and style elements
        for element in tree.xpath('//script | //style | //noscript | //iframe'):
            element.getparent().remove(element)
        
        # Get text content
        text = tree.text_content()
        
        # Clean up the text
        text = re.sub(r'\n\s*\n', '\n\n', text)  # Remove excessive blank lines
        text = re.sub(r' +', ' ', text)  # Remove excessive spaces
        text = text.strip()
        
        # Check if we got meaningful content
        if not text or len(text) < 100:
            return json_response({
                'error': 'Could not extract meaningful text from this page. The website may use JavaScript to load content dynamically, or may be blocking automated access. Please try copying and pasting the text manually instead.'
            }, status=400)
        
        # Get page title
        title_elements = tree.xpath('//title/text()')
        page_title = title_elements[0].strip() if title_elements else 'Untitled Page'
        
        return json_response({
            'status': 'ok',
            'text': text,
            'url': url,
            'title': page_title
        }, status=200)
    
    except httpx.TooManyRedirects:
        return json_response({
            'error': 'Too many redirects. The website may be misconfigured or blocking automated access.'
        }, status=400)
    except httpx.RequestError as e:
        error_msg = str(e).lower()
        if 'ssl' in error_msg or 'certificate' in error_msg:
            return json_response({
                'error': 'SSL certificate error. The website may have security issues or be blocking automated access.'
            }, status=400)
        return json_response({
            'error': f'Failed to fetch URL: {str(e)}. The website may be blocking automated access or temporarily unavailable.'
        }, status=400)
    except Exception as e:
        return json_response({
            'error': f'An unexpected error occurred: {str(e)}. Please try copying and pasting the text manually instead.'
        }, status=500)

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
                    'model': 'gpt-5.1-chat-latest',
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
    # Only initialize CSV if enabled (disabled on cloud)
    if config.USE_CSV:
        await init_csv()
        print(f"📁 CSV file: {CSV_FILE}")
    else:
        print(f"📁 CSV disabled (cloud deployment - ephemeral filesystem)")
    
    print(f"🔑 OpenAI API Key configured: {'Yes' if OPENAI_API_KEY else 'No'}")
    
    # Initialize Firebase/Firestore
    if config.USE_FIRESTORE:
        try:
            db = await get_db()
            if db and db.initialized:
                print(f"✅ Firestore initialized successfully (project: {config.FIREBASE_PROJECT_ID})")
            else:
                print("⚠️ Firestore not available")
                if not config.USE_CSV:
                    print("❌ ERROR: No storage backend available!")
        except Exception as e:
            print(f"⚠️ Firestore initialization failed: {e}")

if __name__ == '__main__':
    port = config.PORT
    print(f"Starting ClauseCodeAI server on http://{config.HOST}:{port}")
    app.run(host=config.HOST, port=port, debug=config.DEBUG, access_log=True)
