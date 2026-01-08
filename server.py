#!/usr/bin/env python3
"""
Simple Flask server that accepts POST requests from the Chrome extension
and makes API calls to OpenAI and SerpAPI using credentials from .env
"""

from flask import Flask, request, jsonify
import csv
import os
from datetime import datetime
import requests
from dotenv import load_dotenv

# Load environment variables from .env
load_dotenv()

app = Flask(__name__)

# Get API keys from .env
OPENAI_API_KEY = os.getenv('OPENAI_API_KEY', '')
SERPAPI_KEY = os.getenv('SERPAPI_KEY', '')

# CSV file path - use /tmp for Railway or local dir
import tempfile
csv_dir = tempfile.gettempdir() if os.getenv('RAILWAY_ENVIRONMENT_NAME') else os.path.dirname(__file__)
CSV_FILE = os.path.join(csv_dir, 'analysis_data.csv')
HEADERS = ['Timestamp', 'Agent', 'Analysis Type', 'Page Title', 'Page URL', 'Result Text']

# Ensure CSV file exists with headers
def init_csv():
    try:
        if not os.path.exists(CSV_FILE):
            with open(CSV_FILE, 'w', newline='', encoding='utf-8') as f:
                writer = csv.writer(f)
                writer.writerow(HEADERS)
    except Exception as e:
        print(f"Warning: Could not create CSV file: {e}")

@app.route('/save', methods=['POST'])
def save_data():
    try:
        data = request.get_json()
        
        # Extract data from request
        timestamp = data.get('timestamp', datetime.now().isoformat())
        agent = data.get('agent', '')
        analysis_type = data.get('analysisType', '')
        page_title = data.get('pageTitle', '')
        page_url = data.get('pageUrl', '')
        result_text = data.get('resultText', '')
        
        # Try to append to CSV, but don't fail if we can't
        try:
            with open(CSV_FILE, 'a', newline='', encoding='utf-8') as f:
                writer = csv.writer(f)
                writer.writerow([timestamp, agent, analysis_type, page_title, page_url, result_text])
        except Exception as e:
            print(f"Warning: Could not save to CSV: {e}")
            # Still return success - the analysis worked, just couldn't save
        
        return jsonify({'status': 'ok', 'message': 'Data processed successfully'}), 200
    
    except Exception as e:
        return jsonify({'status': 'error', 'message': str(e)}), 500

@app.route('/', methods=['GET'])
def home():
    return jsonify({
        'status': 'ok',
        'message': 'Analysis Data Server Running',
        'csv_file': CSV_FILE,
        'endpoints': {
            'save': 'POST /save (accepts JSON)',
            'health': 'GET /health'
        }
    }), 200

@app.route('/health', methods=['GET'])
def health():
    return jsonify({'status': 'ok', 'message': 'Server is running'}), 200

@app.route('/analyze', methods=['POST'])
def analyze():
    """Analyze page content using AI"""
    try:
        if not OPENAI_API_KEY:
            return jsonify({'error': 'OpenAI API key not configured in .env'}), 500

        data = request.get_json()
        page_text = data.get('pageText', '')
        system_prompt = data.get('systemPrompt', '')

        # Call OpenAI API
        response = requests.post(
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

        if not response.ok:
            error_data = response.json()
            return jsonify({'error': error_data.get('error', {}).get('message', 'OpenAI API error')}), 400

        result = response.json()
        return jsonify({'result': result['choices'][0]['message']['content']}), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/search-alternatives', methods=['POST'])
def search_alternatives():
    """Search for alternative services"""
    try:
        if not SERPAPI_KEY:
            return jsonify({'error': 'SerpAPI key not configured in .env'}), 500

        data = request.get_json()
        service_name = data.get('serviceName', '')

        query = f'alternatives to {service_name}'
        response = requests.get(
            'https://serpapi.com/search.json',
            params={
                'engine': 'google',
                'q': query,
                'api_key': SERPAPI_KEY
            }
        )

        if not response.ok:
            return jsonify({'error': 'SerpAPI error'}), 400

        data = response.json()
        alternatives = []
        
        if data.get('organic_results'):
            for result in data['organic_results'][:5]:
                alternatives.append({
                    'title': result.get('title'),
                    'link': result.get('link'),
                    'snippet': result.get('snippet')
                })

        return jsonify({'alternatives': alternatives}), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    init_csv()
    port = int(os.getenv('PORT', 5001))
    print(f"Starting server on http://0.0.0.0:{port}")
    print(f"CSV file: {CSV_FILE}")
    print(f"OpenAI API Key configured: {'Yes' if OPENAI_API_KEY else 'No'}")
    app.run(host='0.0.0.0', port=port, debug=False)
