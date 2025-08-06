#!/usr/bin/env python3
"""
Focused Review Request Backend Testing
Specifically testing endpoints mentioned in the review request:
1. Community Hub API endpoints (/api/community/teams and /api/community/stats)
2. Authentication endpoints to verify login functionality works
3. Profile-related endpoints to ensure profile page functionality is working
4. Any endpoints that might be related to the color function fixes in TeamCard component
"""

import requests
import json
import random
import string
import sys

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
ROOT_URL = BACKEND_URL

print(f"🎯 FOCUSED REVIEW REQUEST BACKEND TESTING")
print(f"Testing API at: {API_URL}")
print(f"Testing Root at: {ROOT_URL}")
print("=" * 80)

def generate_random_string(length=8):
    """Generate a random string of fixed length"""
    letters = string.ascii_lowercase
    return ''.join(random.choice(letters) for i in range(length))

# Global variables for authentication
auth_token = None
user_id = None

def test_authentication_endpoints():
    """Test authentication endpoints - critical for frontend"""
    global auth_token, user_id
    
    print("\n🔐 TESTING AUTHENTICATION ENDPOINTS")
    print("-" * 50)
    
    # Generate unique test user
    random_suffix = generate_random_string()
    test_username = f"reviewuser_{random_suffix}"
    test_email = f"review_{random_suffix}@example.com"
    test_password = "ReviewPass123!"
    
    user_data = {
        "username": test_username,
        "email": test_email,
        "password": test_password,
        "coach_level": 25,
        "favorite_position": "MF",
        "favorite_element": "Fire",
        "favourite_team": "Raimon",
        "profile_picture": "https://example.com/avatar.jpg",
        "bio": "Review test user",
        "kizuna_stars": 50
    }
    
    # Test user registration
    try:
        response = requests.post(f"{API_URL}/auth/register", json=user_data, timeout=10)
        if response.status_code == 200:
            data = response.json()
            auth_token = data["access_token"]
            user_id = data["user"]["id"]
            print(f"✅ User registration successful: {test_username}")
            print(f"✅ Auth token generated: {auth_token[:20]}...")
        else:
            print(f"❌ User registration failed: {response.status_code} - {response.text}")
            return False
    except Exception as e:
        print(f"❌ User registration error: {e}")
        return False
    
    # Test user login
    try:
        login_data = {"email": test_email, "password": test_password}
        response = requests.post(f"{API_URL}/auth/login", json=login_data, timeout=10)
        if response.status_code == 200:
            print(f"✅ User login successful")
        else:
            print(f"❌ User login failed: {response.status_code} - {response.text}")
            return False
    except Exception as e:
        print(f"❌ User login error: {e}")
        return False
    
    # Test token validation
    try:
        headers = {"Authorization": f"Bearer {auth_token}"}
        response = requests.get(f"{API_URL}/auth/me", headers=headers, timeout=10)
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Token validation successful: {data['username']}")
        else:
            print(f"❌ Token validation failed: {response.status_code} - {response.text}")
            return False
    except Exception as e:
        print(f"❌ Token validation error: {e}")
        return False
    
    return True

def test_profile_endpoints():
    """Test profile-related endpoints"""
    print("\n👤 TESTING PROFILE-RELATED ENDPOINTS")
    print("-" * 50)
    
    if not auth_token:
        print("❌ Authentication required for profile tests")
        return False
    
    headers = {"Authorization": f"Bearer {auth_token}"}
    
    # Test profile update
    try:
        update_data = {
            "bio": "Updated bio for review test",
            "coach_level": 30,
            "favorite_position": "FW"
        }
        response = requests.put(f"{API_URL}/auth/me", json=update_data, headers=headers, timeout=10)
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Profile update successful: bio='{data['bio']}', level={data['coach_level']}")
        else:
            print(f"❌ Profile update failed: {response.status_code} - {response.text}")
            return False
    except Exception as e:
        print(f"❌ Profile update error: {e}")
        return False
    
    # Test followers endpoint
    try:
        response = requests.get(f"{API_URL}/community/followers", headers=headers, timeout=10)
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Followers endpoint working: {len(data['followers'])} followers")
        else:
            print(f"❌ Followers endpoint failed: {response.status_code} - {response.text}")
            return False
    except Exception as e:
        print(f"❌ Followers endpoint error: {e}")
        return False
    
    # Test following endpoint
    try:
        response = requests.get(f"{API_URL}/community/following", headers=headers, timeout=10)
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Following endpoint working: {len(data['following'])} following")
        else:
            print(f"❌ Following endpoint failed: {response.status_code} - {response.text}")
            return False
    except Exception as e:
        print(f"❌ Following endpoint error: {e}")
        return False
    
    return True

def test_community_hub_endpoints():
    """Test Community Hub API endpoints - critical for frontend"""
    print("\n🏘️ TESTING COMMUNITY HUB ENDPOINTS")
    print("-" * 50)
    
    if not auth_token:
        print("❌ Authentication required for community tests")
        return False
    
    headers = {"Authorization": f"Bearer {auth_token}"}
    
    # Test /api/community/teams endpoint
    try:
        response = requests.get(f"{API_URL}/community/teams", headers=headers, timeout=10)
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Community teams endpoint working: {len(data)} teams found")
            
            # Test with search parameter
            response = requests.get(f"{API_URL}/community/teams?search=test", headers=headers, timeout=10)
            if response.status_code == 200:
                search_data = response.json()
                print(f"✅ Community teams search working: {len(search_data)} teams found")
            else:
                print(f"⚠️ Community teams search failed: {response.status_code}")
            
            # Test with limit parameter
            response = requests.get(f"{API_URL}/community/teams?limit=5", headers=headers, timeout=10)
            if response.status_code == 200:
                limit_data = response.json()
                print(f"✅ Community teams limit working: {len(limit_data)} teams returned")
            else:
                print(f"⚠️ Community teams limit failed: {response.status_code}")
                
        else:
            print(f"❌ Community teams endpoint failed: {response.status_code} - {response.text}")
            return False
    except Exception as e:
        print(f"❌ Community teams endpoint error: {e}")
        return False
    
    # Test /api/community/stats endpoint
    try:
        response = requests.get(f"{API_URL}/community/stats", headers=headers, timeout=10)
        if response.status_code == 200:
            data = response.json()
            
            # Verify required stats fields
            required_fields = ["total_users", "total_teams", "total_public_teams", "total_likes", "total_views"]
            missing_fields = [field for field in required_fields if field not in data]
            
            if not missing_fields:
                print(f"✅ Community stats endpoint working:")
                print(f"   - Total users: {data['total_users']}")
                print(f"   - Total teams: {data['total_teams']}")
                print(f"   - Public teams: {data['total_public_teams']}")
                print(f"   - Total likes: {data['total_likes']}")
                print(f"   - Total views: {data['total_views']}")
            else:
                print(f"⚠️ Community stats missing fields: {missing_fields}")
                return False
        else:
            print(f"❌ Community stats endpoint failed: {response.status_code} - {response.text}")
            return False
    except Exception as e:
        print(f"❌ Community stats endpoint error: {e}")
        return False
    
    # Test community leaderboard
    try:
        response = requests.get(f"{API_URL}/community/leaderboard", headers=headers, timeout=10)
        if response.status_code == 200:
            data = response.json()
            
            required_sections = ["top_by_likes", "top_by_teams", "most_followed"]
            missing_sections = [section for section in required_sections if section not in data]
            
            if not missing_sections:
                print(f"✅ Community leaderboard working:")
                print(f"   - Top by likes: {len(data['top_by_likes'])} users")
                print(f"   - Top by teams: {len(data['top_by_teams'])} users")
                print(f"   - Most followed: {len(data['most_followed'])} users")
            else:
                print(f"⚠️ Community leaderboard missing sections: {missing_sections}")
                return False
        else:
            print(f"❌ Community leaderboard failed: {response.status_code} - {response.text}")
            return False
    except Exception as e:
        print(f"❌ Community leaderboard error: {e}")
        return False
    
    return True

def test_team_management_endpoints():
    """Test team management endpoints that support profile functionality"""
    print("\n⚽ TESTING TEAM MANAGEMENT ENDPOINTS")
    print("-" * 50)
    
    if not auth_token:
        print("❌ Authentication required for team tests")
        return False
    
    headers = {"Authorization": f"Bearer {auth_token}"}
    
    # Test get user teams
    try:
        response = requests.get(f"{API_URL}/teams", headers=headers, timeout=10)
        if response.status_code == 200:
            data = response.json()
            print(f"✅ User teams endpoint working: {len(data)} teams found")
        else:
            print(f"❌ User teams endpoint failed: {response.status_code} - {response.text}")
            return False
    except Exception as e:
        print(f"❌ User teams endpoint error: {e}")
        return False
    
    # Test save slots endpoint
    try:
        response = requests.get(f"{API_URL}/save-slots", headers=headers, timeout=10)
        if response.status_code == 200:
            data = response.json()
            if "slots" in data and len(data["slots"]) == 5:
                print(f"✅ Save slots endpoint working: {len(data['slots'])} slots available")
            else:
                print(f"⚠️ Save slots unexpected structure: {data}")
                return False
        else:
            print(f"❌ Save slots endpoint failed: {response.status_code} - {response.text}")
            return False
    except Exception as e:
        print(f"❌ Save slots endpoint error: {e}")
        return False
    
    return True

def test_character_and_equipment_endpoints():
    """Test character and equipment endpoints for team building"""
    print("\n🎮 TESTING CHARACTER AND EQUIPMENT ENDPOINTS")
    print("-" * 50)
    
    if not auth_token:
        print("❌ Authentication required for character tests")
        return False
    
    headers = {"Authorization": f"Bearer {auth_token}"}
    
    # Test characters endpoint
    try:
        response = requests.get(f"{API_URL}/characters", headers=headers, timeout=10)
        if response.status_code == 200:
            data = response.json()
            if len(data) > 0:
                # Check if characters have required fields including element
                character = data[0]
                required_fields = ["id", "name", "position", "element"]
                missing_fields = [field for field in required_fields if field not in character]
                
                if not missing_fields:
                    print(f"✅ Characters endpoint working: {len(data)} characters available")
                    print(f"✅ Character element field present: {character['element']}")
                else:
                    print(f"⚠️ Characters missing fields: {missing_fields}")
                    return False
            else:
                print(f"⚠️ No characters found")
                return False
        else:
            print(f"❌ Characters endpoint failed: {response.status_code} - {response.text}")
            return False
    except Exception as e:
        print(f"❌ Characters endpoint error: {e}")
        return False
    
    # Test equipment endpoint
    try:
        response = requests.get(f"{API_URL}/equipment", headers=headers, timeout=10)
        if response.status_code == 200:
            data = response.json()
            if len(data) > 0:
                # Check if equipment has required fields
                equipment = data[0]
                required_fields = ["id", "name", "category", "rarity"]
                missing_fields = [field for field in required_fields if field not in equipment]
                
                if not missing_fields:
                    print(f"✅ Equipment endpoint working: {len(data)} equipment items available")
                else:
                    print(f"⚠️ Equipment missing fields: {missing_fields}")
                    return False
            else:
                print(f"⚠️ No equipment found")
                return False
        else:
            print(f"❌ Equipment endpoint failed: {response.status_code} - {response.text}")
            return False
    except Exception as e:
        print(f"❌ Equipment endpoint error: {e}")
        return False
    
    return True

def test_unauthorized_access():
    """Test that endpoints properly handle unauthorized access"""
    print("\n🔒 TESTING UNAUTHORIZED ACCESS HANDLING")
    print("-" * 50)
    
    # Test protected endpoint without token
    try:
        response = requests.get(f"{API_URL}/community/stats", timeout=10)
        if response.status_code == 403:
            print("✅ Unauthorized access properly rejected (403)")
        else:
            print(f"⚠️ Unexpected response for unauthorized access: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Unauthorized access test error: {e}")
        return False
    
    # Test protected endpoint with invalid token
    try:
        headers = {"Authorization": "Bearer invalid_token_here"}
        response = requests.get(f"{API_URL}/community/stats", headers=headers, timeout=10)
        if response.status_code == 401:
            print("✅ Invalid token properly rejected (401)")
        else:
            print(f"⚠️ Unexpected response for invalid token: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Invalid token test error: {e}")
        return False
    
    return True

def main():
    """Run all focused review tests"""
    print("Starting focused review request backend testing...")
    
    test_results = []
    
    # Run all tests
    test_results.append(("Authentication Endpoints", test_authentication_endpoints()))
    test_results.append(("Profile Endpoints", test_profile_endpoints()))
    test_results.append(("Community Hub Endpoints", test_community_hub_endpoints()))
    test_results.append(("Team Management Endpoints", test_team_management_endpoints()))
    test_results.append(("Character & Equipment Endpoints", test_character_and_equipment_endpoints()))
    test_results.append(("Unauthorized Access Handling", test_unauthorized_access()))
    
    # Print summary
    print("\n" + "=" * 80)
    print("🎯 FOCUSED REVIEW REQUEST BACKEND TESTING SUMMARY")
    print("=" * 80)
    
    passed = sum(1 for _, result in test_results if result)
    total = len(test_results)
    
    print(f"📊 RESULTS:")
    print(f"   Total Test Categories: {total}")
    print(f"   ✅ Passed: {passed}")
    print(f"   ❌ Failed: {total - passed}")
    print(f"   📈 Success Rate: {(passed/total)*100:.1f}%")
    
    print(f"\n📋 DETAILED RESULTS:")
    for test_name, result in test_results:
        status = "✅ PASS" if result else "❌ FAIL"
        print(f"   {status}: {test_name}")
    
    if passed == total:
        print(f"\n🎉 ALL TESTS PASSED! Backend APIs are working correctly.")
        print(f"✅ Community Hub endpoints (/api/community/teams and /api/community/stats) are functional")
        print(f"✅ Authentication endpoints are working properly")
        print(f"✅ Profile-related endpoints are operational")
        print(f"✅ Team management and character/equipment endpoints are working")
    else:
        print(f"\n⚠️ Some tests failed. Please check the detailed output above.")
    
    print("=" * 80)
    
    return passed == total

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)