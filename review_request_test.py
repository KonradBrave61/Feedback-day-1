#!/usr/bin/env python3
"""
REVIEW REQUEST FOCUSED TESTING
Tests the specific endpoints mentioned in the review request:
1. Team Loading (GET /api/teams)
2. Team Creation (POST /api/teams) 
3. Team Updates (PUT /api/teams/{team_id})
4. Team Deletion (DELETE /api/teams/{team_id})
5. Authentication token validation
6. Constellation pulling (POST /api/constellations/pull)
"""
import requests
import json
import uuid
import random
import string
from datetime import datetime

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

print(f"🎯 REVIEW REQUEST FOCUSED TESTING")
print(f"Testing API at: {API_URL}")
print("=" * 80)

def generate_random_string(length=8):
    """Generate a random string of fixed length"""
    letters = string.ascii_lowercase
    return ''.join(random.choice(letters) for i in range(length))

def test_review_request_endpoints():
    """Test the specific endpoints mentioned in the review request"""
    
    # Generate unique test data
    random_suffix = generate_random_string()
    test_username = f"reviewtest_{random_suffix}"
    test_email = f"reviewtest_{random_suffix}@example.com"
    test_password = "ReviewTest123!"
    
    # User registration data
    user_data = {
        "username": test_username,
        "email": test_email,
        "password": test_password,
        "coach_level": 5,
        "favorite_position": "FW",
        "favorite_element": "Fire",
        "favourite_team": "Raimon",
        "profile_picture": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==",
        "bio": "Review request testing user",
        "kizuna_stars": 100
    }
    
    test_results = []
    
    print("🔐 STEP 1: AUTHENTICATION TOKEN TESTING")
    print("-" * 50)
    
    # Register user
    response = requests.post(f"{API_URL}/auth/register", json=user_data)
    if response.status_code != 200:
        print(f"❌ CRITICAL: User registration failed: {response.status_code}")
        print(f"   Response: {response.text}")
        return
    
    user_response = response.json()
    auth_token = user_response["access_token"]
    user_id = user_response["user"]["id"]
    headers = {"Authorization": f"Bearer {auth_token}"}
    
    print(f"✅ User registered successfully: {test_username}")
    print(f"   User ID: {user_id}")
    print(f"   Token length: {len(auth_token)} characters")
    
    # Test token validation
    response = requests.get(f"{API_URL}/auth/me", headers=headers)
    if response.status_code == 200:
        user_info = response.json()
        if user_info["id"] == user_id:
            print("✅ Authentication token is valid and working correctly")
            test_results.append(("Authentication Token Validation", True))
        else:
            print("❌ Token valid but returned wrong user data")
            test_results.append(("Authentication Token Validation", False))
    else:
        print(f"❌ Token validation failed: {response.status_code}")
        test_results.append(("Authentication Token Validation", False))
        return
    
    print("\n📝 STEP 2: TEAM CREATION (POST /api/teams)")
    print("-" * 50)
    
    # Team creation data
    team_data = {
        "name": f"Review Test Team {random_suffix}",
        "formation": "4-3-3",
        "players": [],
        "bench_players": [],
        "tactics": [],
        "coach": None,
        "description": "Team created for review request testing",
        "is_public": True,
        "tags": ["review", "test", "api"]
    }
    
    response = requests.post(f"{API_URL}/teams", json=team_data, headers=headers)
    if response.status_code == 200:
        team = response.json()
        team_id = team["id"]
        print(f"✅ Team created successfully: {team['name']}")
        print(f"   Team ID: {team_id}")
        print(f"   Formation: {team['formation']}")
        print(f"   Public: {team['is_public']}")
        print(f"   User ID matches: {team['user_id'] == user_id}")
        test_results.append(("Team Creation (POST /api/teams)", True))
    else:
        print(f"❌ Team creation failed: {response.status_code}")
        print(f"   Response: {response.text}")
        test_results.append(("Team Creation (POST /api/teams)", False))
        return
    
    print("\n📋 STEP 3: TEAM LOADING (GET /api/teams)")
    print("-" * 50)
    
    response = requests.get(f"{API_URL}/teams", headers=headers)
    if response.status_code == 200:
        teams = response.json()
        if isinstance(teams, list) and len(teams) > 0:
            our_team = next((t for t in teams if t["id"] == team_id), None)
            if our_team:
                print(f"✅ Teams loaded successfully: Found {len(teams)} teams")
                print(f"   Our test team found: {our_team['name']}")
                print(f"   Team belongs to correct user: {our_team['user_id'] == user_id}")
                test_results.append(("Team Loading (GET /api/teams)", True))
            else:
                print(f"❌ Teams loaded but our test team not found among {len(teams)} teams")
                test_results.append(("Team Loading (GET /api/teams)", False))
        else:
            print("❌ No teams returned or invalid format")
            test_results.append(("Team Loading (GET /api/teams)", False))
    else:
        print(f"❌ Team loading failed: {response.status_code}")
        print(f"   Response: {response.text}")
        test_results.append(("Team Loading (GET /api/teams)", False))
    
    print("\n✏️ STEP 4: TEAM UPDATES (PUT /api/teams/{team_id})")
    print("-" * 50)
    
    # Test 1: Basic team update
    update_data_1 = {
        "name": f"Updated Review Team {random_suffix}",
        "formation": "3-5-2",
        "description": "Updated description for review testing"
    }
    
    response = requests.put(f"{API_URL}/teams/{team_id}", json=update_data_1, headers=headers)
    if response.status_code == 200:
        updated_team = response.json()
        print(f"✅ Basic team update successful:")
        print(f"   New name: {updated_team['name']}")
        print(f"   New formation: {updated_team['formation']}")
        print(f"   New description: {updated_team['description']}")
        
        # Test 2: Privacy status change (public to private)
        privacy_update = {"is_public": False}
        response = requests.put(f"{API_URL}/teams/{team_id}", json=privacy_update, headers=headers)
        if response.status_code == 200:
            private_team = response.json()
            print(f"✅ Privacy changed to private: {private_team['is_public']}")
            
            # Test 3: Privacy status change (private to public)
            privacy_update = {"is_public": True}
            response = requests.put(f"{API_URL}/teams/{team_id}", json=privacy_update, headers=headers)
            if response.status_code == 200:
                public_team = response.json()
                print(f"✅ Privacy changed back to public: {public_team['is_public']}")
                test_results.append(("Team Updates (PUT /api/teams/{team_id})", True))
            else:
                print(f"❌ Privacy update to public failed: {response.status_code}")
                test_results.append(("Team Updates (PUT /api/teams/{team_id})", False))
        else:
            print(f"❌ Privacy update to private failed: {response.status_code}")
            test_results.append(("Team Updates (PUT /api/teams/{team_id})", False))
    else:
        print(f"❌ Basic team update failed: {response.status_code}")
        print(f"   Response: {response.text}")
        test_results.append(("Team Updates (PUT /api/teams/{team_id})", False))
    
    print("\n🗑️ STEP 5: TEAM DELETION (DELETE /api/teams/{team_id})")
    print("-" * 50)
    
    # First verify team exists
    response = requests.get(f"{API_URL}/teams/{team_id}", headers=headers)
    if response.status_code != 200:
        print("❌ Team doesn't exist before deletion test")
        test_results.append(("Team Deletion (DELETE /api/teams/{team_id})", False))
    else:
        # Delete the team
        response = requests.delete(f"{API_URL}/teams/{team_id}", headers=headers)
        if response.status_code == 200:
            delete_response = response.json()
            print(f"✅ Team deletion API returned success: {delete_response.get('message', 'No message')}")
            
            # Verify team is actually deleted
            response = requests.get(f"{API_URL}/teams/{team_id}", headers=headers)
            if response.status_code == 404:
                print("✅ Team successfully deleted and no longer accessible")
                test_results.append(("Team Deletion (DELETE /api/teams/{team_id})", True))
            else:
                print(f"❌ Delete API succeeded but team still accessible (status: {response.status_code})")
                test_results.append(("Team Deletion (DELETE /api/teams/{team_id})", False))
        else:
            print(f"❌ Team deletion failed: {response.status_code}")
            print(f"   Response: {response.text}")
            test_results.append(("Team Deletion (DELETE /api/teams/{team_id})", False))
    
    print("\n🌟 STEP 6: CONSTELLATION PULLING (POST /api/constellations/pull)")
    print("-" * 50)
    
    # Get available constellations
    response = requests.get(f"{API_URL}/constellations/", headers=headers)
    if response.status_code == 200:
        constellations = response.json()
        if constellations:
            constellation_id = constellations[0]["id"]
            print(f"✅ Found {len(constellations)} constellations")
            print(f"   Using constellation: {constellations[0]['name']}")
            
            # Test gacha pull
            pull_data = {
                "constellation_id": constellation_id,
                "pull_count": 1,
                "platform_bonuses": {
                    "nintendo": True,
                    "playstation": False,
                    "pc": False
                }
            }
            
            response = requests.post(f"{API_URL}/constellations/pull", json=pull_data, headers=headers)
            if response.status_code == 200:
                pull_result = response.json()
                print(f"✅ Constellation pull successful:")
                print(f"   Success: {pull_result['success']}")
                print(f"   Kizuna Stars spent: {pull_result['kizuna_stars_spent']}")
                print(f"   Kizuna Stars remaining: {pull_result['kizuna_stars_remaining']}")
                print(f"   Characters obtained: {len(pull_result['characters_obtained'])}")
                test_results.append(("Constellation Pull (POST /api/constellations/pull)", True))
            else:
                print(f"❌ Constellation pull failed: {response.status_code}")
                print(f"   Response: {response.text}")
                test_results.append(("Constellation Pull (POST /api/constellations/pull)", False))
        else:
            print("❌ No constellations available for pulling")
            test_results.append(("Constellation Pull (POST /api/constellations/pull)", False))
    else:
        print(f"❌ Failed to get constellations: {response.status_code}")
        test_results.append(("Constellation Pull (POST /api/constellations/pull)", False))
    
    print("\n🔒 STEP 7: AUTHENTICATION ENFORCEMENT TESTING")
    print("-" * 50)
    
    # Test accessing protected endpoints without token
    response = requests.get(f"{API_URL}/teams")
    if response.status_code == 403:
        print("✅ No token access properly rejected (403)")
        
        # Test with invalid token
        invalid_headers = {"Authorization": "Bearer invalid_token_12345"}
        response = requests.get(f"{API_URL}/teams", headers=invalid_headers)
        if response.status_code in [401, 403]:
            print(f"✅ Invalid token properly rejected ({response.status_code})")
            test_results.append(("Authentication Enforcement", True))
        else:
            print(f"❌ Invalid token should be rejected but got {response.status_code}")
            test_results.append(("Authentication Enforcement", False))
    else:
        print(f"❌ No token should be rejected but got {response.status_code}")
        test_results.append(("Authentication Enforcement", False))
    
    # FINAL RESULTS
    print("\n" + "="*80)
    print("🏆 REVIEW REQUEST TEST RESULTS SUMMARY")
    print("="*80)
    
    passed = sum(1 for _, result in test_results if result)
    total = len(test_results)
    
    for test_name, result in test_results:
        status = "✅ PASS" if result else "❌ FAIL"
        print(f"{status} {test_name}")
    
    print(f"\nTotal Tests: {total}")
    print(f"Passed: {passed}")
    print(f"Failed: {total - passed}")
    print(f"Success Rate: {(passed/total)*100:.1f}%")
    
    if passed == total:
        print("\n🎉 ALL REVIEW REQUEST TESTS PASSED!")
        print("✅ Authentication token fixes are working correctly")
        print("✅ All team management endpoints are functional")
        print("✅ Constellation pulling system is operational")
    else:
        print(f"\n⚠️  {total - passed} test(s) failed - review issues above")
    
    return passed, total

if __name__ == "__main__":
    test_review_request_endpoints()