#!/usr/bin/env python3
import requests

# Get the backend URL from the frontend .env file
with open('/app/frontend/.env', 'r') as f:
    for line in f:
        if line.startswith('REACT_APP_BACKEND_URL='):
            BACKEND_URL = line.strip().split('=')[1].strip('"\'')
            break

# Ensure the URL doesn't have trailing slash
if BACKEND_URL.endswith('/'):
    BACKEND_URL = BACKEND_URL[:-1]

print(f"Testing API at: {BACKEND_URL}")

# Test root endpoint
try:
    response = requests.get(f"{BACKEND_URL}/", timeout=10)
    print(f"Root endpoint status: {response.status_code}")
    if response.status_code == 200:
        print(f"Root response: {response.json()}")
    else:
        print(f"Root error: {response.text}")
except Exception as e:
    print(f"Root endpoint error: {e}")

# Test API status endpoint
try:
    response = requests.get(f"{BACKEND_URL}/api/status", timeout=10)
    print(f"Status endpoint status: {response.status_code}")
    if response.status_code == 200:
        print(f"Status response: {response.json()}")
    else:
        print(f"Status error: {response.text}")
except Exception as e:
    print(f"Status endpoint error: {e}")