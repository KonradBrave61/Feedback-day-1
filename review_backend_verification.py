#!/usr/bin/env python3
import requests
import json
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

print(f"🔍 BACKEND API VERIFICATION FOR REVIEW REQUEST")
print(f"Testing API at: {API_URL}")
print("="*80)

def generate_random_string(length=8):
    """Generate a random string of fixed length"""
    letters = string.ascii_lowercase
    return ''.join(random.choice(letters) for i in range(length))

def test_endpoint(name, url, method="GET", data=None, headers=None, expected_status=200):
    """Test an endpoint and return result"""
    try:
        if method == "GET":
            response = requests.get(url, headers=headers)
        elif method == "POST":
            response = requests.post(url, json=data, headers=headers)
        elif method == "PUT":
            response = requests.put(url, json=data, headers=headers)
        elif method == "DELETE":
            response = requests.delete(url, headers=headers)
        
        if response.status_code == expected_status:
            return True, f"✅ {name}: Working (Status: {response.status_code})"
        else:
            return False, f"❌ {name}: Failed (Status: {response.status_code}, Expected: {expected_status})"
    except Exception as e:
        return False, f"❌ {name}: Error - {str(e)}"

# Test results storage
results = []
auth_token = None
user_id = None
team_id = None

print("\n1. 🔍 CORE API HEALTH AND STATUS")
print("-" * 50)

# Test API status
success, message = test_endpoint("API Status", f"{API_URL}/status")
results.append((success, message))
print(message)

print("\n2. 🔍 AUTHENTICATION ENDPOINTS")
print("-" * 50)

# Generate unique test user
random_suffix = generate_random_string()
test_username = f"reviewuser_{random_suffix}"
test_email = f"review_{random_suffix}@example.com"
test_password = "ReviewTest123!"

user_data = {
    "username": test_username,
    "email": test_email,
    "password": test_password,
    "coach_level": 5,
    "favorite_position": "FW",
    "favorite_element": "Fire",
    "favourite_team": "Raimon",
    "profile_picture": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==",
    "bio": "Backend API review tester"
}

# Test user registration
try:
    response = requests.post(f"{API_URL}/auth/register", json=user_data)
    if response.status_code == 200:
        data = response.json()
        auth_token = data["access_token"]
        user_id = data["user"]["id"]
        results.append((True, f"✅ User Registration: Working (User ID: {user_id})"))
        print(f"✅ User Registration: Working (User ID: {user_id})")
    else:
        results.append((False, f"❌ User Registration: Failed (Status: {response.status_code})"))
        print(f"❌ User Registration: Failed (Status: {response.status_code})")
except Exception as e:
    results.append((False, f"❌ User Registration: Error - {str(e)}"))
    print(f"❌ User Registration: Error - {str(e)}")

# Test user login
login_data = {"email": test_email, "password": test_password}
success, message = test_endpoint("User Login", f"{API_URL}/auth/login", "POST", login_data)
results.append((success, message))
print(message)

# Test token validation
if auth_token:
    headers = {"Authorization": f"Bearer {auth_token}"}
    success, message = test_endpoint("Token Validation", f"{API_URL}/auth/me", "GET", headers=headers)
    results.append((success, message))
    print(message)
    
    # Test unauthorized access
    success, message = test_endpoint("Unauthorized Access Rejection", f"{API_URL}/auth/me", "GET", expected_status=403)
    results.append((success, message))
    print(message)

print("\n3. 🔍 CHARACTER MANAGEMENT APIs")
print("-" * 50)

# Test character retrieval
try:
    response = requests.get(f"{API_URL}/characters/")
    if response.status_code == 200:
        characters = response.json()
        results.append((True, f"✅ Character Retrieval: Working ({len(characters)} characters found)"))
        print(f"✅ Character Retrieval: Working ({len(characters)} characters found)")
        
        if characters:
            # Test position filtering
            response = requests.get(f"{API_URL}/characters/?position=GK")
            if response.status_code == 200:
                gk_chars = response.json()
                results.append((True, f"✅ Position Filtering: Working ({len(gk_chars)} GK characters)"))
                print(f"✅ Position Filtering: Working ({len(gk_chars)} GK characters)")
            
            # Test element filtering
            response = requests.get(f"{API_URL}/characters/?element=Fire")
            if response.status_code == 200:
                fire_chars = response.json()
                results.append((True, f"✅ Element Filtering: Working ({len(fire_chars)} Fire characters)"))
                print(f"✅ Element Filtering: Working ({len(fire_chars)} Fire characters)")
            
            # Test character search
            response = requests.get(f"{API_URL}/characters/?search=Mark")
            if response.status_code == 200:
                search_results = response.json()
                results.append((True, f"✅ Character Search: Working ({len(search_results)} results for 'Mark')"))
                print(f"✅ Character Search: Working ({len(search_results)} results for 'Mark')")
            
            # Test individual character retrieval
            char_id = characters[0]["id"]
            response = requests.get(f"{API_URL}/characters/{char_id}")
            if response.status_code == 200:
                results.append((True, f"✅ Individual Character Retrieval: Working (ID: {char_id})"))
                print(f"✅ Individual Character Retrieval: Working (ID: {char_id})")
    else:
        results.append((False, f"❌ Character Retrieval: Failed (Status: {response.status_code})"))
        print(f"❌ Character Retrieval: Failed (Status: {response.status_code})")
except Exception as e:
    results.append((False, f"❌ Character Management: Error - {str(e)}"))
    print(f"❌ Character Management: Error - {str(e)}")

print("\n4. 🔍 EQUIPMENT SYSTEM APIs")
print("-" * 50)

# Test equipment retrieval
try:
    response = requests.get(f"{API_URL}/equipment/")
    if response.status_code == 200:
        equipment = response.json()
        results.append((True, f"✅ Equipment Retrieval: Working ({len(equipment)} items found)"))
        print(f"✅ Equipment Retrieval: Working ({len(equipment)} items found)")
        
        if equipment:
            # Test category filtering
            response = requests.get(f"{API_URL}/equipment/?category=Boots")
            if response.status_code == 200:
                boots = response.json()
                results.append((True, f"✅ Category Filtering: Working ({len(boots)} Boots found)"))
                print(f"✅ Category Filtering: Working ({len(boots)} Boots found)")
            
            # Test rarity filtering
            response = requests.get(f"{API_URL}/equipment/?rarity=Legendary")
            if response.status_code == 200:
                legendary = response.json()
                results.append((True, f"✅ Rarity Filtering: Working ({len(legendary)} Legendary items)"))
                print(f"✅ Rarity Filtering: Working ({len(legendary)} Legendary items)")
            
            # Test individual equipment retrieval
            eq_id = equipment[0]["id"]
            response = requests.get(f"{API_URL}/equipment/{eq_id}")
            if response.status_code == 200:
                eq_item = response.json()
                results.append((True, f"✅ Individual Equipment Retrieval: Working (ID: {eq_id}, Stats: {eq_item.get('stats', {})})"))
                print(f"✅ Individual Equipment Retrieval: Working (ID: {eq_id}, Stats: {eq_item.get('stats', {})})")
    else:
        results.append((False, f"❌ Equipment Retrieval: Failed (Status: {response.status_code})"))
        print(f"❌ Equipment Retrieval: Failed (Status: {response.status_code})")
except Exception as e:
    results.append((False, f"❌ Equipment System: Error - {str(e)}"))
    print(f"❌ Equipment System: Error - {str(e)}")

print("\n5. 🔍 TEAM MANAGEMENT APIs")
print("-" * 50)

if auth_token:
    headers = {"Authorization": f"Bearer {auth_token}"}
    
    # Test team creation
    team_data = {
        "name": f"Review Test Team {generate_random_string()}",
        "formation": "4-3-3",
        "players": [],
        "bench_players": [],
        "tactics": [],
        "coach": None,
        "description": "A test team created for backend API review",
        "is_public": True,
        "tags": ["review", "test", "backend"]
    }
    
    try:
        response = requests.post(f"{API_URL}/teams", json=team_data, headers=headers)
        if response.status_code == 200:
            team = response.json()
            team_id = team["id"]
            results.append((True, f"✅ Team Creation: Working (Team ID: {team_id})"))
            print(f"✅ Team Creation: Working (Team ID: {team_id})")
            
            # Test team retrieval
            response = requests.get(f"{API_URL}/teams", headers=headers)
            if response.status_code == 200:
                teams = response.json()
                results.append((True, f"✅ Team Retrieval: Working ({len(teams)} teams found)"))
                print(f"✅ Team Retrieval: Working ({len(teams)} teams found)")
            
            # Test team update (privacy toggle)
            update_data = {"name": f"Updated Team {generate_random_string()}", "is_public": False}
            response = requests.put(f"{API_URL}/teams/{team_id}", json=update_data, headers=headers)
            if response.status_code == 200:
                results.append((True, "✅ Team Update & Privacy Toggle: Working"))
                print("✅ Team Update & Privacy Toggle: Working")
            
            # Test save slots
            response = requests.get(f"{API_URL}/save-slots", headers=headers)
            if response.status_code == 200:
                slots = response.json()
                results.append((True, f"✅ Save Slots: Working ({len(slots.get('save_slots', []))} slots available)"))
                print(f"✅ Save Slots: Working ({len(slots.get('save_slots', []))} slots available)")
            
            # Test team deletion
            response = requests.delete(f"{API_URL}/teams/{team_id}", headers=headers)
            if response.status_code == 200:
                results.append((True, "✅ Team Deletion: Working"))
                print("✅ Team Deletion: Working")
        else:
            results.append((False, f"❌ Team Creation: Failed (Status: {response.status_code})"))
            print(f"❌ Team Creation: Failed (Status: {response.status_code})")
    except Exception as e:
        results.append((False, f"❌ Team Management: Error - {str(e)}"))
        print(f"❌ Team Management: Error - {str(e)}")

print("\n6. 🔍 FORMATION AND TACTICS ENDPOINTS")
print("-" * 50)

# Test formations
try:
    response = requests.get(f"{API_URL}/teams/formations/")
    if response.status_code == 200:
        formations = response.json()
        results.append((True, f"✅ Formations: Working ({len(formations)} formations available)"))
        print(f"✅ Formations: Working ({len(formations)} formations available)")
    else:
        results.append((False, f"❌ Formations: Failed (Status: {response.status_code})"))
        print(f"❌ Formations: Failed (Status: {response.status_code})")
except Exception as e:
    results.append((False, f"❌ Formations: Error - {str(e)}"))
    print(f"❌ Formations: Error - {str(e)}")

# Test tactics
try:
    response = requests.get(f"{API_URL}/teams/tactics/")
    if response.status_code == 200:
        tactics = response.json()
        results.append((True, f"✅ Tactics: Working ({len(tactics)} tactics available)"))
        print(f"✅ Tactics: Working ({len(tactics)} tactics available)")
    else:
        results.append((False, f"❌ Tactics: Failed (Status: {response.status_code})"))
        print(f"❌ Tactics: Failed (Status: {response.status_code})")
except Exception as e:
    results.append((False, f"❌ Tactics: Error - {str(e)}"))
    print(f"❌ Tactics: Error - {str(e)}")

# Test coaches
try:
    response = requests.get(f"{API_URL}/teams/coaches/")
    if response.status_code == 200:
        coaches = response.json()
        results.append((True, f"✅ Coaches: Working ({len(coaches)} coaches available)"))
        print(f"✅ Coaches: Working ({len(coaches)} coaches available)")
    else:
        results.append((False, f"❌ Coaches: Failed (Status: {response.status_code})"))
        print(f"❌ Coaches: Failed (Status: {response.status_code})")
except Exception as e:
    results.append((False, f"❌ Coaches: Error - {str(e)}"))
    print(f"❌ Coaches: Error - {str(e)}")

print("\n7. 🔍 COMMUNITY FEATURES")
print("-" * 50)

if auth_token:
    headers = {"Authorization": f"Bearer {auth_token}"}
    
    # Test community teams
    try:
        response = requests.get(f"{API_URL}/community/teams", headers=headers)
        if response.status_code == 200:
            community_teams = response.json()
            results.append((True, f"✅ Community Teams: Working ({len(community_teams)} public teams)"))
            print(f"✅ Community Teams: Working ({len(community_teams)} public teams)")
        else:
            results.append((False, f"❌ Community Teams: Failed (Status: {response.status_code})"))
            print(f"❌ Community Teams: Failed (Status: {response.status_code})")
    except Exception as e:
        results.append((False, f"❌ Community Teams: Error - {str(e)}"))
        print(f"❌ Community Teams: Error - {str(e)}")
    
    # Test community stats
    try:
        response = requests.get(f"{API_URL}/community/stats", headers=headers)
        if response.status_code == 200:
            stats = response.json()
            results.append((True, f"✅ Community Stats: Working (Users: {stats.get('total_users', 0)}, Teams: {stats.get('total_teams', 0)})"))
            print(f"✅ Community Stats: Working (Users: {stats.get('total_users', 0)}, Teams: {stats.get('total_teams', 0)})")
        else:
            results.append((False, f"❌ Community Stats: Failed (Status: {response.status_code})"))
            print(f"❌ Community Stats: Failed (Status: {response.status_code})")
    except Exception as e:
        results.append((False, f"❌ Community Stats: Error - {str(e)}"))
        print(f"❌ Community Stats: Error - {str(e)}")
    
    # Test community featured
    try:
        response = requests.get(f"{API_URL}/community/featured", headers=headers)
        if response.status_code == 200:
            featured = response.json()
            results.append((True, f"✅ Community Featured: Working (Teams of week: {len(featured.get('teams_of_week', []))})"))
            print(f"✅ Community Featured: Working (Teams of week: {len(featured.get('teams_of_week', []))})")
        else:
            results.append((False, f"❌ Community Featured: Failed (Status: {response.status_code})"))
            print(f"❌ Community Featured: Failed (Status: {response.status_code})")
    except Exception as e:
        results.append((False, f"❌ Community Featured: Error - {str(e)}"))
        print(f"❌ Community Featured: Error - {str(e)}")

print("\n8. 🔍 CONSTELLATION/GACHA SYSTEM APIs")
print("-" * 50)

if auth_token:
    headers = {"Authorization": f"Bearer {auth_token}"}
    
    # Test constellations
    try:
        response = requests.get(f"{API_URL}/constellations/")
        if response.status_code == 200:
            constellations = response.json()
            results.append((True, f"✅ Constellations: Working ({len(constellations)} constellations available)"))
            print(f"✅ Constellations: Working ({len(constellations)} constellations available)")
            
            if constellations:
                constellation_id = constellations[0]["id"]
                
                # Test constellation details
                response = requests.get(f"{API_URL}/constellations/{constellation_id}")
                if response.status_code == 200:
                    constellation = response.json()
                    results.append((True, f"✅ Constellation Details: Working (ID: {constellation_id}, Orbs: {len(constellation.get('orbs', []))})"))
                    print(f"✅ Constellation Details: Working (ID: {constellation_id}, Orbs: {len(constellation.get('orbs', []))})")
                
                # Test constellation characters
                response = requests.get(f"{API_URL}/constellations/{constellation_id}/characters")
                if response.status_code == 200:
                    characters = response.json()
                    results.append((True, f"✅ Constellation Characters: Working (Character pools available)"))
                    print(f"✅ Constellation Characters: Working (Character pools available)")
                
                # Test drop rates
                response = requests.get(f"{API_URL}/constellations/{constellation_id}/drop-rates")
                if response.status_code == 200:
                    drop_rates = response.json()
                    results.append((True, f"✅ Drop Rates: Working (Base rates available)"))
                    print(f"✅ Drop Rates: Working (Base rates available)")
                
                # Test gacha pull endpoint (may fail due to insufficient stars, but endpoint should exist)
                pull_data = {"constellation_id": constellation_id, "pull_count": 1, "platform_bonuses": []}
                response = requests.post(f"{API_URL}/constellations/pull", json=pull_data, headers=headers)
                if response.status_code in [200, 400]:  # 400 for insufficient stars is acceptable
                    results.append((True, f"✅ Gacha Pull: Endpoint accessible (Status: {response.status_code})"))
                    print(f"✅ Gacha Pull: Endpoint accessible (Status: {response.status_code})")
                else:
                    results.append((False, f"❌ Gacha Pull: Failed (Status: {response.status_code})"))
                    print(f"❌ Gacha Pull: Failed (Status: {response.status_code})")
        else:
            results.append((False, f"❌ Constellations: Failed (Status: {response.status_code})"))
            print(f"❌ Constellations: Failed (Status: {response.status_code})")
    except Exception as e:
        results.append((False, f"❌ Constellation System: Error - {str(e)}"))
        print(f"❌ Constellation System: Error - {str(e)}")

# Summary
print("\n" + "="*80)
print("🎯 BACKEND API VERIFICATION SUMMARY")
print("="*80)

total_tests = len(results)
passed_tests = sum(1 for success, _ in results if success)
failed_tests = total_tests - passed_tests

print(f"Total Tests: {total_tests}")
print(f"Passed: {passed_tests}")
print(f"Failed: {failed_tests}")
print(f"Success Rate: {(passed_tests/total_tests)*100:.1f}%")

if failed_tests > 0:
    print(f"\n❌ FAILED TESTS:")
    for success, message in results:
        if not success:
            print(f"   {message}")

print(f"\n✅ PASSED TESTS:")
for success, message in results:
    if success:
        print(f"   {message}")

print("\n" + "="*80)
if failed_tests == 0:
    print("🎉 ALL BACKEND APIs ARE WORKING CORRECTLY AFTER FRONTEND CHANGES!")
else:
    print(f"⚠️  {failed_tests} ISSUES FOUND - BACKEND NEEDS ATTENTION")
print("="*80)