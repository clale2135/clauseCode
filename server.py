#!/usr/bin/env python3
"""
Simple Flask server that accepts POST requests from the Chrome extension
and appends analysis results to a CSV file.
"""

from flask import Flask, request, jsonify
import csv
import os
from datetime import datetime

app = Flask(__name__)

# CSV file path in the chrome_extension folder
CSV_FILE = os.path.join(os.path.dirname(__file__), 'analysis_data.csv')
HEADERS = ['Timestamp', 'Agent', 'Analysis Type', 'Page Title', 'Page URL', 'Result Text']

# Ensure CSV file exists with headers
def init_csv():
    if not os.path.exists(CSV_FILE):
        with open(CSV_FILE, 'w', newline='', encoding='utf-8') as f:
            writer = csv.writer(f)
            writer.writerow(HEADERS)

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
        
        # Append to CSV
        with open(CSV_FILE, 'a', newline='', encoding='utf-8') as f:
            writer = csv.writer(f)
            writer.writerow([timestamp, agent, analysis_type, page_title, page_url, result_text])
        
        return jsonify({'status': 'ok', 'message': 'Data saved successfully'}), 200
    
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

if __name__ == '__main__':
    init_csv()
    print(f"Starting server on http://localhost:5001")
    print(f"CSV file: {CSV_FILE}")
    app.run(host='127.0.0.1', port=5001, debug=False)
