#!/usr/bin/env python3
"""
Token Expiration Testing Suite
Tests JWT token expiration handling and authentication error responses
"""
import requests
import json
import time
import jwt
from datetime import datetime, timedelta
import uuid
import random
import string

# Get the backend URL from the frontend .env file
with open('/app/frontend/.env', 'r') as f:
    for line in f:
        if line.startswith('REACT_APP_BACKEND_URL='):
            BACKEND_URL = line.strip().split('=')[1].strip('"\'')
            break

# Ensure the URL doesn't have trailing slash
if BACKEND_URL.endswith('/'):
    BACKEND_URL = BACKEND_URL[:-1]

# Add the /api prefix
API_URL = f"{BACKEND_URL}/api"

print(f"🔐 Testing Token Expiration at: {API_URL}")

def generate_random_string(length=8):
    """Generate a random string for unique test data"""
    letters = string.ascii_lowercase
    return ''.join(random.choice(letters) for i in range(length))

def create_test_user():
    """Create a test user and return credentials"""
    random_suffix = generate_random_string()
    user_data = {
        "username": f"tokentest_{random_suffix}",
        "email": f"tokentest_{random_suffix}@example.com",
        "password": "TokenTest123!",
        "coach_level": 1,
        "favorite_position": "MF",
        "favorite_element": "Fire",
        "favourite_team": "Raimon",
        "profile_picture": "https://example.com/avatar.jpg",
        "bio": "Token expiration test user",
        "kizuna_stars": 50
    }
    
    print(f"📝 Creating test user: {user_data['username']}")
    response = requests.post(f"{API_URL}/auth/register", json=user_data)
    
    if response.status_code == 200:
        data = response.json()
        print(f"✅ User created successfully with token")
        return data['access_token'], user_data
    else:
        print(f"❌ Failed to create user: {response.status_code} - {response.text}")
        return None, None

def create_expired_token(user_id):
    """Create an expired JWT token for testing"""
    SECRET_KEY = "your-secret-key-here-change-in-production"
    ALGORITHM = "HS256"
    
    # Create token that expired 1 minute ago
    expire = datetime.utcnow() - timedelta(minutes=1)
    to_encode = {"sub": user_id, "exp": expire}
    expired_token = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return expired_token

def create_invalid_token():
    """Create an invalid JWT token for testing"""
    return "invalid.jwt.token.here"

def test_valid_token_access():
    """Test that valid tokens work correctly"""
    print("\n🔍 Testing Valid Token Access...")
    
    # Create test user and get valid token
    token, user_data = create_test_user()
    if not token:
        return False
    
    headers = {"Authorization": f"Bearer {token}"}
    
    # Test protected endpoints with valid token
    endpoints_to_test = [
        ("GET", "/auth/me", "Get current user"),
        ("GET", "/teams", "Load user teams"),
        ("GET", "/save-slots", "Get save slots")
    ]
    
    all_passed = True
    for method, endpoint, description in endpoints_to_test:
        print(f"  Testing {method} {endpoint} - {description}")
        
        if method == "GET":
            response = requests.get(f"{API_URL}{endpoint}", headers=headers)
        
        if response.status_code == 200:
            print(f"    ✅ {description}: SUCCESS (200)")
        else:
            print(f"    ❌ {description}: FAILED ({response.status_code}) - {response.text}")
            all_passed = False
    
    return all_passed

def test_expired_token_handling():
    """Test that expired tokens return 401 errors"""
    print("\n⏰ Testing Expired Token Handling...")
    
    # Create test user first to get user_id
    token, user_data = create_test_user()
    if not token:
        return False
    
    # Decode the valid token to get user_id
    try:
        payload = jwt.decode(token, options={"verify_signature": False})
        user_id = payload.get("sub")
    except:
        print("❌ Failed to decode token to get user_id")
        return False
    
    # Create expired token
    expired_token = create_expired_token(user_id)
    headers = {"Authorization": f"Bearer {expired_token}"}
    
    # Test protected endpoints with expired token
    endpoints_to_test = [
        ("GET", "/auth/me", "Get current user"),
        ("GET", "/teams", "Load user teams"),
        ("GET", "/save-slots", "Get save slots")
    ]
    
    all_passed = True
    for method, endpoint, description in endpoints_to_test:
        print(f"  Testing {method} {endpoint} - {description}")
        
        if method == "GET":
            response = requests.get(f"{API_URL}{endpoint}", headers=headers)
        
        if response.status_code == 401:
            try:
                error_data = response.json()
                if "Could not validate credentials" in error_data.get("detail", ""):
                    print(f"    ✅ {description}: CORRECT 401 with proper error message")
                else:
                    print(f"    ⚠️ {description}: 401 but wrong error message: {error_data}")
                    all_passed = False
            except:
                print(f"    ⚠️ {description}: 401 but no JSON response")
                all_passed = False
        else:
            print(f"    ❌ {description}: WRONG STATUS ({response.status_code}) - Expected 401")
            all_passed = False
    
    return all_passed

def test_invalid_token_handling():
    """Test that invalid tokens return 401 errors"""
    print("\n🚫 Testing Invalid Token Handling...")
    
    invalid_token = create_invalid_token()
    headers = {"Authorization": f"Bearer {invalid_token}"}
    
    # Test protected endpoints with invalid token
    endpoints_to_test = [
        ("GET", "/auth/me", "Get current user"),
        ("GET", "/teams", "Load user teams"),
        ("GET", "/save-slots", "Get save slots")
    ]
    
    all_passed = True
    for method, endpoint, description in endpoints_to_test:
        print(f"  Testing {method} {endpoint} - {description}")
        
        if method == "GET":
            response = requests.get(f"{API_URL}{endpoint}", headers=headers)
        
        if response.status_code == 401:
            try:
                error_data = response.json()
                if "Could not validate credentials" in error_data.get("detail", ""):
                    print(f"    ✅ {description}: CORRECT 401 with proper error message")
                else:
                    print(f"    ⚠️ {description}: 401 but wrong error message: {error_data}")
                    all_passed = False
            except:
                print(f"    ⚠️ {description}: 401 but no JSON response")
                all_passed = False
        else:
            print(f"    ❌ {description}: WRONG STATUS ({response.status_code}) - Expected 401")
            all_passed = False
    
    return all_passed

def test_missing_token_handling():
    """Test that missing tokens return 403 errors"""
    print("\n❓ Testing Missing Token Handling...")
    
    # Test protected endpoints without any token
    endpoints_to_test = [
        ("GET", "/auth/me", "Get current user"),
        ("GET", "/teams", "Load user teams"),
        ("GET", "/save-slots", "Get save slots")
    ]
    
    all_passed = True
    for method, endpoint, description in endpoints_to_test:
        print(f"  Testing {method} {endpoint} - {description}")
        
        if method == "GET":
            response = requests.get(f"{API_URL}{endpoint}")  # No headers
        
        if response.status_code == 403:
            print(f"    ✅ {description}: CORRECT 403 for missing token")
        else:
            print(f"    ❌ {description}: WRONG STATUS ({response.status_code}) - Expected 403")
            all_passed = False
    
    return all_passed

def test_team_management_with_expired_token():
    """Test specific team management endpoints with expired tokens"""
    print("\n🏆 Testing Team Management with Expired Tokens...")
    
    # Create test user and team first
    token, user_data = create_test_user()
    if not token:
        return False
    
    # Create a test team with valid token
    headers = {"Authorization": f"Bearer {token}"}
    team_data = {
        "name": "Test Team for Token Expiration",
        "formation": "4-4-2",
        "players": [],
        "bench_players": [],
        "tactics": [],
        "coach": {"id": "coach1", "name": "Test Coach"},
        "description": "Test team for token expiration testing",
        "is_public": False,
        "tags": ["test"],
        "save_slot": 1,
        "save_slot_name": "Token Test Slot"
    }
    
    print("  Creating test team with valid token...")
    response = requests.post(f"{API_URL}/teams", json=team_data, headers=headers)
    
    if response.status_code != 200:
        print(f"    ❌ Failed to create test team: {response.status_code}")
        return False
    
    team_id = response.json()["id"]
    print(f"    ✅ Test team created: {team_id}")
    
    # Get user_id from token
    try:
        payload = jwt.decode(token, options={"verify_signature": False})
        user_id = payload.get("sub")
    except:
        print("❌ Failed to decode token to get user_id")
        return False
    
    # Create expired token
    expired_token = create_expired_token(user_id)
    expired_headers = {"Authorization": f"Bearer {expired_token}"}
    
    # Test team management endpoints with expired token
    endpoints_to_test = [
        ("GET", f"/teams/{team_id}/details", "Get team details"),
        ("PUT", f"/teams/{team_id}", "Update team privacy", {"is_public": True}),
        ("POST", "/teams", "Create new team", team_data)
    ]
    
    all_passed = True
    for method, endpoint, description, *payload in endpoints_to_test:
        print(f"  Testing {method} {endpoint} - {description}")
        
        if method == "GET":
            response = requests.get(f"{API_URL}{endpoint}", headers=expired_headers)
        elif method == "PUT":
            response = requests.put(f"{API_URL}{endpoint}", json=payload[0], headers=expired_headers)
        elif method == "POST":
            response = requests.post(f"{API_URL}{endpoint}", json=payload[0], headers=expired_headers)
        
        if response.status_code == 401:
            try:
                error_data = response.json()
                if "Could not validate credentials" in error_data.get("detail", ""):
                    print(f"    ✅ {description}: CORRECT 401 with proper error message")
                else:
                    print(f"    ⚠️ {description}: 401 but wrong error message: {error_data}")
                    all_passed = False
            except:
                print(f"    ⚠️ {description}: 401 but no JSON response")
                all_passed = False
        else:
            print(f"    ❌ {description}: WRONG STATUS ({response.status_code}) - Expected 401")
            all_passed = False
    
    return all_passed

def test_token_expiration_timing():
    """Test that tokens expire exactly after 30 minutes"""
    print("\n⏱️ Testing Token Expiration Timing...")
    
    # Create test user
    token, user_data = create_test_user()
    if not token:
        return False
    
    # Decode token to check expiration time
    try:
        payload = jwt.decode(token, options={"verify_signature": False})
        exp_timestamp = payload.get("exp")
        issued_at = datetime.utcnow()
        expires_at = datetime.fromtimestamp(exp_timestamp)
        
        time_diff = expires_at - issued_at
        minutes_diff = time_diff.total_seconds() / 60
        
        print(f"  Token issued at: {issued_at}")
        print(f"  Token expires at: {expires_at}")
        print(f"  Time difference: {minutes_diff:.2f} minutes")
        
        # Check if it's approximately 30 minutes (allow 1 minute tolerance)
        if 29 <= minutes_diff <= 31:
            print(f"    ✅ Token expiration timing is correct (~30 minutes)")
            return True
        else:
            print(f"    ❌ Token expiration timing is wrong (expected ~30 minutes, got {minutes_diff:.2f})")
            return False
            
    except Exception as e:
        print(f"    ❌ Failed to decode token: {e}")
        return False

def main():
    """Run all token expiration tests"""
    print("🚀 Starting Token Expiration Testing Suite")
    print("=" * 60)
    
    test_results = []
    
    # Run all tests
    tests = [
        ("Valid Token Access", test_valid_token_access),
        ("Token Expiration Timing", test_token_expiration_timing),
        ("Expired Token Handling", test_expired_token_handling),
        ("Invalid Token Handling", test_invalid_token_handling),
        ("Missing Token Handling", test_missing_token_handling),
        ("Team Management with Expired Token", test_team_management_with_expired_token)
    ]
    
    for test_name, test_func in tests:
        print(f"\n{'='*60}")
        print(f"🧪 Running: {test_name}")
        print('='*60)
        
        try:
            result = test_func()
            test_results.append((test_name, result))
            
            if result:
                print(f"✅ {test_name}: PASSED")
            else:
                print(f"❌ {test_name}: FAILED")
                
        except Exception as e:
            print(f"💥 {test_name}: ERROR - {e}")
            test_results.append((test_name, False))
    
    # Print summary
    print(f"\n{'='*60}")
    print("📊 TOKEN EXPIRATION TEST SUMMARY")
    print('='*60)
    
    passed = sum(1 for _, result in test_results if result)
    total = len(test_results)
    
    for test_name, result in test_results:
        status = "✅ PASSED" if result else "❌ FAILED"
        print(f"{status}: {test_name}")
    
    print(f"\n🎯 Overall Result: {passed}/{total} tests passed")
    
    if passed == total:
        print("🎉 ALL TOKEN EXPIRATION TESTS PASSED!")
        print("✅ Backend authentication token expiration handling is working correctly")
        return True
    else:
        print("⚠️ Some token expiration tests failed")
        print("❌ Backend authentication token expiration handling needs attention")
        return False

if __name__ == "__main__":
    success = main()
    exit(0 if success else 1)