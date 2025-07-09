#!/usr/bin/env python3
import requests
import json
import random
import string
import time

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

print(f"Testing API at: {API_URL}")
print(f"Testing Root at: {ROOT_URL}")

def generate_random_string(length=8):
    """Generate a random string of fixed length"""
    letters = string.ascii_lowercase
    return ''.join(random.choice(letters) for i in range(length))

def test_endpoint(url, method="GET", data=None, headers=None, expected_status=200):
    """Test an endpoint and return the response"""
    print(f"\nTesting {method} {url}")
    
    try:
        if method == "GET":
            response = requests.get(url, headers=headers)
        elif method == "POST":
            response = requests.post(url, json=data, headers=headers)
        elif method == "PUT":
            response = requests.put(url, json=data, headers=headers)
        elif method == "DELETE":
            response = requests.delete(url, headers=headers)
        
        status = "✅" if response.status_code == expected_status else "❌"
        print(f"{status} Status: {response.status_code}")
        
        try:
            json_data = response.json()
            print(f"Response: {json.dumps(json_data, indent=2)[:200]}...")
        except:
            print(f"Response: {response.text[:100]}...")
        
        return response, response.status_code == expected_status
    except Exception as e:
        print(f"❌ Error: {str(e)}")
        return None, False

def run_comprehensive_tests():
    """Run comprehensive tests on all API endpoints"""
    results = {}
    
    print("\n=== Testing API Root Endpoint ===")
    root_response, root_success = test_endpoint(ROOT_URL)
    results["API Root"] = root_success
    
    print("\n=== Testing Status Endpoint ===")
    status_response, status_success = test_endpoint(f"{API_URL}/status")
    results["Status Endpoint"] = status_success
    
    print("\n=== Testing Characters Endpoints ===")
    characters_response, characters_success = test_endpoint(f"{API_URL}/characters/")
    results["Characters Endpoint"] = characters_success
    
    characters_stats_response, characters_stats_success = test_endpoint(f"{API_URL}/characters/stats/summary")
    results["Characters Stats Endpoint"] = characters_stats_success
    
    # Create a character
    character_data = {
        "name": f"Test Character {generate_random_string()}",
        "nickname": "Test Nickname",
        "title": "Test Title",
        "base_level": 99,
        "base_rarity": "Legendary",
        "position": "FW",
        "element": "Fire",
        "jersey_number": 10,
        "description": "A test character",
        "base_stats": {
            "kick": {"main": 95, "secondary": 100},
            "control": {"main": 85, "secondary": 90},
            "technique": {"main": 90, "secondary": 95},
            "intelligence": {"main": 80, "secondary": 85},
            "pressure": {"main": 75, "secondary": 80},
            "agility": {"main": 85, "secondary": 90},
            "physical": {"main": 80, "secondary": 85}
        },
        "hissatsu": [
            {
                "name": "Test Shot",
                "description": "A test shot",
                "type": "Shot"
            }
        ],
        "team_passives": [
            {
                "name": "Test Passive",
                "description": "A test passive"
            }
        ]
    }
    create_character_response, create_character_success = test_endpoint(f"{API_URL}/characters/", method="POST", data=character_data)
    results["Create Character"] = create_character_success
    
    if create_character_success:
        character_id = create_character_response.json().get("id")
        get_character_response, get_character_success = test_endpoint(f"{API_URL}/characters/{character_id}")
        results["Get Character by ID"] = get_character_success
    
    print("\n=== Testing Teams Endpoints ===")
    teams_response, teams_success = test_endpoint(f"{API_URL}/teams/")
    results["Teams Endpoint"] = teams_success
    
    formations_response, formations_success = test_endpoint(f"{API_URL}/teams/formations/")
    results["Formations Endpoint"] = formations_success
    
    tactics_response, tactics_success = test_endpoint(f"{API_URL}/teams/tactics/")
    results["Tactics Endpoint"] = tactics_success
    
    coaches_response, coaches_success = test_endpoint(f"{API_URL}/teams/coaches/")
    results["Coaches Endpoint"] = coaches_success
    
    print("\n=== Testing Equipment Endpoints ===")
    equipment_response, equipment_success = test_endpoint(f"{API_URL}/equipment/")
    results["Equipment Endpoint"] = equipment_success
    
    equipment_category_response, equipment_category_success = test_endpoint(f"{API_URL}/equipment/category/Boots")
    results["Equipment Category Endpoint"] = equipment_category_success
    
    # Create equipment
    equipment_data = {
        "name": f"Test Equipment {generate_random_string()}",
        "rarity": "Legendary",
        "category": "Boots",
        "stats": {
            "kick": 20,
            "agility": 15
        },
        "description": "Test equipment"
    }
    create_equipment_response, create_equipment_success = test_endpoint(f"{API_URL}/equipment/", method="POST", data=equipment_data)
    results["Create Equipment"] = create_equipment_success
    
    if create_equipment_success:
        equipment_id = create_equipment_response.json().get("id")
        get_equipment_response, get_equipment_success = test_endpoint(f"{API_URL}/equipment/{equipment_id}")
        results["Get Equipment by ID"] = get_equipment_success
    
    print("\n=== Testing Authentication Endpoints ===")
    # Test unauthorized access
    auth_me_response, auth_me_success = test_endpoint(f"{API_URL}/auth/me", expected_status=403)
    results["Unauthorized Access"] = auth_me_success
    
    # Register a new user
    user_data = {
        "username": f"testuser_{generate_random_string()}",
        "email": f"test_{generate_random_string()}@example.com",
        "password": "Password123!",
        "coach_level": 5,
        "favorite_position": "FW",
        "favorite_element": "Fire"
    }
    register_response, register_success = test_endpoint(f"{API_URL}/auth/register", method="POST", data=user_data)
    results["User Registration"] = register_success
    
    # Extract token for authenticated requests
    if register_success:
        token = register_response.json().get("access_token")
        user_id = register_response.json().get("user", {}).get("id")
        auth_headers = {"Authorization": f"Bearer {token}"}
        
        # Test login
        login_data = {
            "email": user_data["email"],
            "password": user_data["password"]
        }
        login_response, login_success = test_endpoint(f"{API_URL}/auth/login", method="POST", data=login_data)
        results["User Login"] = login_success
        
        # Test authenticated endpoints
        auth_me_response, auth_me_success = test_endpoint(f"{API_URL}/auth/me", headers=auth_headers)
        results["Get Current User"] = auth_me_success
        
        # Update user profile
        update_data = {
            "coach_level": 10,
            "favorite_position": "GK",
            "favorite_element": "Wind"
        }
        update_response, update_success = test_endpoint(f"{API_URL}/auth/me", method="PUT", data=update_data, headers=auth_headers)
        results["Update User Profile"] = update_success
        
        print("\n=== Testing User Teams Endpoints ===")
        # Test user teams endpoints
        team_data = {
            "name": f"Test Team {generate_random_string()}",
            "formation": "1",
            "players": [],
            "bench_players": [],
            "tactics": [],
            "coach": None
        }
        create_team_response, create_team_success = test_endpoint(f"{API_URL}/teams", method="POST", data=team_data, headers=auth_headers)
        results["Create Team"] = create_team_success
        
        if create_team_success:
            team_id = create_team_response.json().get("id")
            get_teams_response, get_teams_success = test_endpoint(f"{API_URL}/teams", headers=auth_headers)
            results["Get User Teams"] = get_teams_success
            
            get_team_response, get_team_success = test_endpoint(f"{API_URL}/teams/{team_id}", headers=auth_headers)
            results["Get Team by ID"] = get_team_success
            
            # Update team
            update_data = {
                "name": f"Updated Team {generate_random_string()}",
                "formation": "2"
            }
            update_team_response, update_team_success = test_endpoint(f"{API_URL}/teams/{team_id}", method="PUT", data=update_data, headers=auth_headers)
            results["Update Team"] = update_team_success
            
            # Delete team
            delete_team_response, delete_team_success = test_endpoint(f"{API_URL}/teams/{team_id}", method="DELETE", headers=auth_headers)
            results["Delete Team"] = delete_team_success
    
    # Print summary
    print("\n=== Test Summary ===")
    all_passed = True
    for endpoint, success in results.items():
        status = "✅ PASSED" if success else "❌ FAILED"
        print(f"{endpoint}: {status}")
        if not success:
            all_passed = False
    
    print(f"\nOverall Test Result: {'✅ PASSED' if all_passed else '❌ FAILED'}")
    return all_passed

if __name__ == "__main__":
    run_comprehensive_tests()