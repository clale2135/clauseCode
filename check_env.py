#!/usr/bin/env python3
"""Debug script to check .env loading"""
import os
from dotenv import load_dotenv

print(f"Current directory: {os.getcwd()}")
print(f".env file exists: {os.path.exists('.env')}")
print(f".env file path: {os.path.abspath('.env')}")

# Load .env
load_dotenv()

# Check if key is loaded
openai_key = os.getenv("OPENAI_API_KEY")
if openai_key:
    # Show first/last few chars for security
    masked = f"{openai_key[:7]}...{openai_key[-4:]}" if len(openai_key) > 11 else "***"
    print(f"✅ OPENAI_API_KEY loaded: {masked}")
    print(f"   Length: {len(openai_key)} characters")
    
    # Check for common issues
    if openai_key.startswith('"') or openai_key.startswith("'"):
        print("   ⚠️  WARNING: Key starts with a quote character")
    if openai_key.endswith('"') or openai_key.endswith("'"):
        print("   ⚠️  WARNING: Key ends with a quote character")
    if ' ' in openai_key:
        print("   ⚠️  WARNING: Key contains spaces")
    if not openai_key.startswith('sk-'):
        print("   ⚠️  WARNING: OpenAI keys typically start with 'sk-'")
else:
    print("❌ OPENAI_API_KEY not found")
    
# Show what config.py sees
print("\n--- Testing config.py ---")
from config import config
if config.OPENAI_API_KEY:
    masked = f"{config.OPENAI_API_KEY[:7]}...{config.OPENAI_API_KEY[-4:]}"
    print(f"✅ config.OPENAI_API_KEY: {masked}")
else:
    print("❌ config.OPENAI_API_KEY is empty/None")
