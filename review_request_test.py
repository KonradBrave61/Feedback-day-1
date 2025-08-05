#!/usr/bin/env python3
"""
Review Request Specific Testing
Test the specific Team Builder backend functionality mentioned in the review request
"""
import requests
import json
import uuid
import random
import string

# Get the backend URL from the frontend .env file
with open('/app/frontend/.env', 'r') as f:
    for line in f:
        if line.startswith('REACT_APP_BACKEND_URL='):
            BACKEND_URL = line.strip().split('=')[1].strip('"\'')
            break

API_URL = f"{BACKEND_URL}/api"

def generate_random_string(length=8):
    letters = string.ascii_lowercase
    return ''.join(random.choice(letters) for i in range(length))

def test_review_request_endpoints():
    """Test specific endpoints mentioned in the review request"""
    print("🎯 REVIEW REQUEST SPECIFIC TESTING")
    print("=" * 60)
    
    # Setup authentication
    random_suffix = generate_random_string()
    user_data = {
        "username": f"reviewtest_{random_suffix}",
        "email": f"reviewtest_{random_suffix}@example.com",
        "password": "ReviewTest123!",
        "coach_level": 5,
        "favorite_position": "FW",
        "favorite_element": "Fire",
        "favourite_team": "Raimon",
        "bio": "Review test user"
    }
    
    # Register user
    response = requests.post(f"{API_URL}/auth/register", json=user_data)
    if response.status_code != 200:
        print(f"❌ Authentication setup failed: {response.status_code}")
        return False
        
    data = response.json()
    auth_token = data["access_token"]
    user_id = data["user"]["id"]
    headers = {"Authorization": f"Bearer {auth_token}"}
    
    print(f"✅ Authentication setup successful - User ID: {user_id}")
    
    # Test 1: Team management endpoints (create, update, get teams)
    print("\n1. Testing Team Management APIs...")
    
    # Create team
    team_data = {
        "name": f"Review Test Team {generate_random_string()}",
        "formation": "4-3-3",
        "players": [],
        "bench_players": [],
        "tactics": [],
        "coach": None,
        "description": "Review request test team",
        "is_public": True,
        "tags": ["review", "test"]
    }
    
    response = requests.post(f"{API_URL}/teams", json=team_data, headers=headers)
    if response.status_code != 200:
        print(f"❌ Team creation failed: {response.status_code}")
        return False
    
    team = response.json()
    team_id = team["id"]
    print(f"✅ Team creation successful - Team ID: {team_id}")
    
    # Get teams
    response = requests.get(f"{API_URL}/teams", headers=headers)
    if response.status_code != 200:
        print(f"❌ Get teams failed: {response.status_code}")
        return False
    print("✅ Get user teams working")
    
    # Update team
    update_data = {"name": f"Updated Review Team {generate_random_string()}"}
    response = requests.put(f"{API_URL}/teams/{team_id}", json=update_data, headers=headers)
    if response.status_code != 200:
        print(f"❌ Team update failed: {response.status_code}")
        return False
    print("✅ Team update working")
    
    # Test 2: Authentication endpoints
    print("\n2. Testing Authentication Endpoints...")
    
    # Get current user
    response = requests.get(f"{API_URL}/auth/me", headers=headers)
    if response.status_code != 200:
        print(f"❌ Get current user failed: {response.status_code}")
        return False
    print("✅ Get current user working")
    
    # Update user profile
    profile_update = {"coach_level": 10, "favorite_position": "GK"}
    response = requests.put(f"{API_URL}/auth/me", json=profile_update, headers=headers)
    if response.status_code != 200:
        print(f"❌ Update user profile failed: {response.status_code}")
        return False
    print("✅ Update user profile working")
    
    # Test 3: Character and equipment APIs
    print("\n3. Testing Character and Equipment APIs...")
    
    # Get characters
    response = requests.get(f"{API_URL}/characters/")
    if response.status_code != 200:
        print(f"❌ Get characters failed: {response.status_code}")
        return False
    characters = response.json()
    print(f"✅ Get characters working - Found {len(characters)} characters")
    
    # Get equipment
    response = requests.get(f"{API_URL}/equipment/")
    if response.status_code != 200:
        print(f"❌ Get equipment failed: {response.status_code}")
        return False
    equipment = response.json()
    print(f"✅ Get equipment working - Found {len(equipment)} equipment items")
    
    # Test 4: Formation and tactics endpoints
    print("\n4. Testing Formation and Tactics Endpoints...")
    
    # Get formations
    response = requests.get(f"{API_URL}/teams/formations/")
    if response.status_code != 200:
        print(f"❌ Get formations failed: {response.status_code}")
        return False
    formations = response.json()
    print(f"✅ Get formations working - Found {len(formations)} formations")
    
    # Get tactics
    response = requests.get(f"{API_URL}/teams/tactics/")
    if response.status_code != 200:
        print(f"❌ Get tactics failed: {response.status_code}")
        return False
    tactics = response.json()
    print(f"✅ Get tactics working - Found {len(tactics)} tactics")
    
    # Test 5: Core Team Builder functionality
    print("\n5. Testing Core Team Builder Functionality...")
    
    # Test save slots
    response = requests.get(f"{API_URL}/save-slots", headers=headers)
    if response.status_code != 200:
        print(f"❌ Get save slots failed: {response.status_code}")
        return False
    print("✅ Save slots working")
    
    # Test team privacy toggle
    privacy_update = {"is_public": False}
    response = requests.put(f"{API_URL}/teams/{team_id}", json=privacy_update, headers=headers)
    if response.status_code != 200:
        print(f"❌ Privacy toggle failed: {response.status_code}")
        return False
    print("✅ Team privacy toggle working")
    
    # Test community features
    response = requests.get(f"{API_URL}/community/teams", headers=headers)
    if response.status_code != 200:
        print(f"❌ Community teams failed: {response.status_code}")
        return False
    print("✅ Community features working")
    
    # Cleanup
    requests.delete(f"{API_URL}/teams/{team_id}", headers=headers)
    
    print("\n" + "=" * 60)
    print("🎉 ALL REVIEW REQUEST ENDPOINTS WORKING CORRECTLY!")
    print("✅ Team management APIs functional")
    print("✅ Authentication endpoints functional") 
    print("✅ Character and equipment APIs functional")
    print("✅ Formation and tactics endpoints functional")
    print("✅ Core Team Builder functionality intact")
    print("=" * 60)
    
    return True

if __name__ == "__main__":
    success = test_review_request_endpoints()
    exit(0 if success else 1)