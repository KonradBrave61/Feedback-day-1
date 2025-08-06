#!/usr/bin/env python3
"""
Protected Endpoints Testing Suite
Tests specific endpoints mentioned in the review request for token expiration handling
"""
import requests
import json
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

print(f"🛡️ Testing Protected Endpoints at: {API_URL}")

def generate_random_string(length=8):
    """Generate a random string for unique test data"""
    letters = string.ascii_lowercase
    return ''.join(random.choice(letters) for i in range(length))

def create_test_user_and_team():
    """Create a test user, team and return tokens and IDs"""
    random_suffix = generate_random_string()
    user_data = {
        "username": f"protectedtest_{random_suffix}",
        "email": f"protectedtest_{random_suffix}@example.com",
        "password": "ProtectedTest123!",
        "coach_level": 1,
        "favorite_position": "MF",
        "favorite_element": "Fire",
        "favourite_team": "Raimon",
        "profile_picture": "https://example.com/avatar.jpg",
        "bio": "Protected endpoints test user",
        "kizuna_stars": 50
    }
    
    print(f"📝 Creating test user: {user_data['username']}")
    response = requests.post(f"{API_URL}/auth/register", json=user_data)
    
    if response.status_code != 200:
        print(f"❌ Failed to create user: {response.status_code} - {response.text}")
        return None, None, None
    
    data = response.json()
    token = data['access_token']
    user_id = data['user']['id']
    
    # Create a test team
    headers = {"Authorization": f"Bearer {token}"}
    team_data = {
        "name": "Protected Endpoints Test Team",
        "formation": "4-4-2",
        "players": [
            {
                "character_id": "char1",
                "position_id": "GK",
                "user_level": 50,
                "user_rarity": "Legendary",
                "user_equipment": {
                    "boots": {"id": "boots1", "name": "Speed Boots", "stats": {"speed": 10}},
                    "bracelets": {"id": "bracelet1", "name": "Power Bracelet", "stats": {"power": 8}},
                    "pendants": {"id": "pendant1", "name": "Defense Pendant", "stats": {"defense": 12}}
                },
                "user_hissatsu": [
                    {"id": "tech1", "name": "God Hand", "type": "Catch", "element": "Fire", "power": 120}
                ]
            }
        ],
        "bench_players": [
            {
                "character_id": "char2",
                "slot_id": "bench_1",
                "user_level": 45,
                "user_rarity": "Epic",
                "user_equipment": {
                    "boots": {"id": "boots2", "name": "Agility Boots", "stats": {"agility": 9}},
                    "bracelets": None,
                    "pendants": None
                },
                "user_hissatsu": [
                    {"id": "tech2", "name": "Fire Shot", "type": "Shoot", "element": "Fire", "power": 100}
                ]
            }
        ],
        "tactics": [
            {"id": "tactic1", "name": "Offensive", "description": "Focus on attack", "effect": "+10 Attack"}
        ],
        "coach": {
            "id": "coach1",
            "name": "Mark Evans",
            "title": "Legendary Coach",
            "portrait": "https://example.com/coach.jpg",
            "bonuses": {"attack": 5, "defense": 3},
            "specialties": ["Motivation", "Strategy"]
        },
        "description": "Test team for protected endpoints testing",
        "is_public": False,
        "tags": ["test", "protected"],
        "save_slot": 1,
        "save_slot_name": "Protected Test Slot"
    }
    
    print("  Creating test team...")
    response = requests.post(f"{API_URL}/teams", json=team_data, headers=headers)
    
    if response.status_code != 200:
        print(f"❌ Failed to create test team: {response.status_code} - {response.text}")
        return token, user_id, None
    
    team_id = response.json()["id"]
    print(f"✅ Test team created: {team_id}")
    
    return token, user_id, team_id

def create_expired_token(user_id):
    """Create an expired JWT token for testing"""
    SECRET_KEY = "your-secret-key-here-change-in-production"
    ALGORITHM = "HS256"
    
    # Create token that expired 1 minute ago
    expire = datetime.utcnow() - timedelta(minutes=1)
    to_encode = {"sub": user_id, "exp": expire}
    expired_token = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return expired_token

def test_protected_endpoints_with_valid_token():
    """Test all protected endpoints mentioned in review request with valid tokens"""
    print("\n✅ Testing Protected Endpoints with Valid Tokens...")
    
    token, user_id, team_id = create_test_user_and_team()
    if not token:
        return False
    
    headers = {"Authorization": f"Bearer {token}"}
    
    # Test all protected endpoints mentioned in the review request
    endpoints_to_test = [
        ("GET", "/teams", "Load user teams", None),
        ("POST", "/teams", "Save teams", {
            "name": "New Test Team",
            "formation": "3-5-2",
            "players": [],
            "bench_players": [],
            "tactics": [],
            "coach": {"id": "coach2", "name": "Test Coach 2"},
            "description": "Another test team",
            "is_public": True,
            "tags": ["new"],
            "save_slot": 2,
            "save_slot_name": "New Test Slot"
        }),
        ("GET", "/save-slots", "Get save slots", None),
        ("GET", f"/teams/{team_id}/details", "Get team details", None) if team_id else None,
        ("PUT", f"/teams/{team_id}", "Update team privacy", {"is_public": True}) if team_id else None
    ]
    
    # Filter out None entries
    endpoints_to_test = [e for e in endpoints_to_test if e is not None]
    
    all_passed = True
    for method, endpoint, description, payload in endpoints_to_test:
        print(f"  Testing {method} {endpoint} - {description}")
        
        try:
            if method == "GET":
                response = requests.get(f"{API_URL}{endpoint}", headers=headers)
            elif method == "POST":
                response = requests.post(f"{API_URL}{endpoint}", json=payload, headers=headers)
            elif method == "PUT":
                response = requests.put(f"{API_URL}{endpoint}", json=payload, headers=headers)
            
            if response.status_code in [200, 201]:
                print(f"    ✅ {description}: SUCCESS ({response.status_code})")
            else:
                print(f"    ❌ {description}: FAILED ({response.status_code}) - {response.text}")
                all_passed = False
                
        except Exception as e:
            print(f"    💥 {description}: ERROR - {e}")
            all_passed = False
    
    return all_passed

def test_protected_endpoints_with_expired_token():
    """Test all protected endpoints with expired tokens"""
    print("\n⏰ Testing Protected Endpoints with Expired Tokens...")
    
    token, user_id, team_id = create_test_user_and_team()
    if not token:
        return False
    
    # Create expired token
    expired_token = create_expired_token(user_id)
    expired_headers = {"Authorization": f"Bearer {expired_token}"}
    
    # Test all protected endpoints mentioned in the review request
    endpoints_to_test = [
        ("GET", "/teams", "Load user teams", None),
        ("POST", "/teams", "Save teams", {
            "name": "Expired Token Test Team",
            "formation": "4-3-3",
            "players": [],
            "bench_players": [],
            "tactics": [],
            "coach": {"id": "coach3", "name": "Expired Test Coach"},
            "description": "Should fail with expired token",
            "is_public": False,
            "tags": ["expired"],
            "save_slot": 3,
            "save_slot_name": "Expired Test Slot"
        }),
        ("GET", "/save-slots", "Get save slots", None),
        ("GET", f"/teams/{team_id}/details", "Get team details", None) if team_id else None,
        ("PUT", f"/teams/{team_id}", "Update team privacy", {"is_public": False}) if team_id else None
    ]
    
    # Filter out None entries
    endpoints_to_test = [e for e in endpoints_to_test if e is not None]
    
    all_passed = True
    for method, endpoint, description, payload in endpoints_to_test:
        print(f"  Testing {method} {endpoint} - {description}")
        
        try:
            if method == "GET":
                response = requests.get(f"{API_URL}{endpoint}", headers=expired_headers)
            elif method == "POST":
                response = requests.post(f"{API_URL}{endpoint}", json=payload, headers=expired_headers)
            elif method == "PUT":
                response = requests.put(f"{API_URL}{endpoint}", json=payload, headers=expired_headers)
            
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
                
        except Exception as e:
            print(f"    💥 {description}: ERROR - {e}")
            all_passed = False
    
    return all_passed

def test_authentication_error_responses():
    """Test that authentication errors return proper 401 responses"""
    print("\n🚫 Testing Authentication Error Responses...")
    
    token, user_id, team_id = create_test_user_and_team()
    if not token:
        return False
    
    # Test different types of invalid authentication
    test_scenarios = [
        ("Expired Token", create_expired_token(user_id)),
        ("Invalid Token", "invalid.jwt.token.here"),
        ("Malformed Token", "Bearer malformed"),
        ("Empty Token", "")
    ]
    
    all_passed = True
    for scenario_name, test_token in test_scenarios:
        print(f"  Testing scenario: {scenario_name}")
        
        if test_token:
            headers = {"Authorization": f"Bearer {test_token}"}
        else:
            headers = {"Authorization": "Bearer "}
        
        # Test a key endpoint
        response = requests.get(f"{API_URL}/teams", headers=headers)
        
        if response.status_code == 401:
            try:
                error_data = response.json()
                detail = error_data.get("detail", "")
                if "Could not validate credentials" in detail:
                    print(f"    ✅ {scenario_name}: CORRECT 401 with 'Could not validate credentials'")
                else:
                    print(f"    ⚠️ {scenario_name}: 401 but wrong message: {detail}")
                    all_passed = False
            except:
                print(f"    ⚠️ {scenario_name}: 401 but no JSON response")
                all_passed = False
        else:
            print(f"    ❌ {scenario_name}: WRONG STATUS ({response.status_code}) - Expected 401")
            all_passed = False
    
    return all_passed

def test_backend_token_validation():
    """Test backend token validation logic"""
    print("\n🔍 Testing Backend Token Validation...")
    
    token, user_id, team_id = create_test_user_and_team()
    if not token:
        return False
    
    # Test valid token
    print("  Testing valid token validation...")
    headers = {"Authorization": f"Bearer {token}"}
    response = requests.get(f"{API_URL}/auth/me", headers=headers)
    
    if response.status_code == 200:
        user_data = response.json()
        if user_data.get("id") == user_id:
            print("    ✅ Valid token: Correctly validated and returned user data")
            valid_token_test = True
        else:
            print("    ❌ Valid token: Validated but returned wrong user data")
            valid_token_test = False
    else:
        print(f"    ❌ Valid token: Failed validation ({response.status_code})")
        valid_token_test = False
    
    # Test expired token
    print("  Testing expired token validation...")
    expired_token = create_expired_token(user_id)
    expired_headers = {"Authorization": f"Bearer {expired_token}"}
    response = requests.get(f"{API_URL}/auth/me", headers=expired_headers)
    
    if response.status_code == 401:
        error_data = response.json()
        if "Could not validate credentials" in error_data.get("detail", ""):
            print("    ✅ Expired token: Correctly rejected with proper error")
            expired_token_test = True
        else:
            print(f"    ❌ Expired token: Rejected but wrong error: {error_data}")
            expired_token_test = False
    else:
        print(f"    ❌ Expired token: Not properly rejected ({response.status_code})")
        expired_token_test = False
    
    return valid_token_test and expired_token_test

def main():
    """Run all protected endpoints tests"""
    print("🚀 Starting Protected Endpoints Testing Suite")
    print("=" * 70)
    
    test_results = []
    
    # Run all tests
    tests = [
        ("Protected Endpoints with Valid Token", test_protected_endpoints_with_valid_token),
        ("Protected Endpoints with Expired Token", test_protected_endpoints_with_expired_token),
        ("Authentication Error Responses", test_authentication_error_responses),
        ("Backend Token Validation", test_backend_token_validation)
    ]
    
    for test_name, test_func in tests:
        print(f"\n{'='*70}")
        print(f"🧪 Running: {test_name}")
        print('='*70)
        
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
    print(f"\n{'='*70}")
    print("📊 PROTECTED ENDPOINTS TEST SUMMARY")
    print('='*70)
    
    passed = sum(1 for _, result in test_results if result)
    total = len(test_results)
    
    for test_name, result in test_results:
        status = "✅ PASSED" if result else "❌ FAILED"
        print(f"{status}: {test_name}")
    
    print(f"\n🎯 Overall Result: {passed}/{total} tests passed")
    
    if passed == total:
        print("🎉 ALL PROTECTED ENDPOINTS TESTS PASSED!")
        print("✅ Backend authentication for protected endpoints is working correctly")
        print("✅ Token expiration handling is properly implemented")
        print("✅ All key endpoints return proper 401 responses for expired tokens")
        return True
    else:
        print("⚠️ Some protected endpoints tests failed")
        print("❌ Backend authentication for protected endpoints needs attention")
        return False

if __name__ == "__main__":
    success = main()
    exit(0 if success else 1)