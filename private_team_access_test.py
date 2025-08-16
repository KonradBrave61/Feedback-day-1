#!/usr/bin/env python3
"""
Private Team Access Testing
Testing private team loading for owner vs non-owner access
"""

import requests
import json
import uuid
from datetime import datetime

# Get backend URL from environment
BACKEND_URL = "https://chat-bubble-2.preview.emergentagent.com/api"

def test_private_team_access():
    """Test private team loading for owner works via GET /api/teams/{team_id}/details after toggling to private"""
    
    print("🎯 PRIVATE TEAM ACCESS TESTING")
    print("=" * 60)
    
    # Step 1: Register user A and login
    print("\n1️⃣ STEP 1: Register User A and Login")
    user_a_data = {
        "username": f"testowner_{uuid.uuid4().hex[:8]}",
        "email": f"owner_{uuid.uuid4().hex[:8]}@test.com",
        "password": "testpass123",
        "coach_level": 1,
        "favorite_position": "MF",
        "favorite_element": "Fire",
        "favourite_team": "Raimon",
        "profile_picture": "",
        "bio": "Test owner user",
        "kizuna_stars": 50
    }
    
    try:
        response = requests.post(f"{BACKEND_URL}/auth/register", json=user_a_data)
        if response.status_code != 200:
            print(f"❌ User A registration failed: {response.status_code} - {response.text}")
            return False
        
        user_a_token = response.json()["access_token"]
        user_a_id = response.json()["user"]["id"]
        print(f"✅ User A registered successfully - ID: {user_a_id}")
        
    except Exception as e:
        print(f"❌ User A registration error: {e}")
        return False
    
    # Step 2: Create a public team
    print("\n2️⃣ STEP 2: Create Public Team")
    team_data = {
        "name": f"Test Team {uuid.uuid4().hex[:8]}",
        "formation": "4-4-2",
        "players": [
            {
                "character_id": "char_1",
                "position_id": "GK",
                "user_level": 50,
                "user_rarity": "Epic",
                "user_equipment": {
                    "boots": {"id": "boots_1", "name": "Speed Boots", "stats": {"speed": 10}},
                    "bracelets": None,
                    "pendants": None
                },
                "user_hissatsu": [
                    {"id": "tech_1", "name": "God Hand", "type": "Catch", "element": "Wind", "power": 120}
                ]
            }
        ],
        "bench_players": [],
        "tactics": [],
        "coach": {
            "id": "coach_1",
            "name": "Mark Evans Sr.",
            "title": "Legendary Coach"
        },
        "description": "Test team for privacy testing",
        "is_public": True,
        "tags": ["test"],
        "save_slot": 1,
        "save_slot_name": "Test Slot"
    }
    
    try:
        headers = {"Authorization": f"Bearer {user_a_token}"}
        response = requests.post(f"{BACKEND_URL}/teams", json=team_data, headers=headers)
        if response.status_code != 200:
            print(f"❌ Team creation failed: {response.status_code} - {response.text}")
            return False
        
        team_id = response.json()["id"]
        print(f"✅ Public team created successfully - ID: {team_id}")
        
    except Exception as e:
        print(f"❌ Team creation error: {e}")
        return False
    
    # Step 3: Test GET /api/teams/{team_id}/details with user A token (public team)
    print("\n3️⃣ STEP 3: Test Team Details Access (Public Team - Owner)")
    try:
        headers = {"Authorization": f"Bearer {user_a_token}"}
        response = requests.get(f"{BACKEND_URL}/teams/{team_id}/details", headers=headers)
        if response.status_code != 200:
            print(f"❌ Team details access failed: {response.status_code} - {response.text}")
            return False
        
        team_details = response.json()
        print(f"✅ Owner can access public team details - Team: {team_details['team']['name']}")
        
    except Exception as e:
        print(f"❌ Team details access error: {e}")
        return False
    
    # Step 4: Toggle privacy to private
    print("\n4️⃣ STEP 4: Toggle Team Privacy to Private")
    try:
        headers = {"Authorization": f"Bearer {user_a_token}"}
        privacy_update = {"is_public": False}
        response = requests.put(f"{BACKEND_URL}/teams/{team_id}", json=privacy_update, headers=headers)
        if response.status_code != 200:
            print(f"❌ Privacy toggle failed: {response.status_code} - {response.text}")
            return False
        
        updated_team = response.json()
        if updated_team["is_public"]:
            print(f"❌ Team is still public after privacy toggle")
            return False
        
        print(f"✅ Team privacy toggled to private successfully")
        
    except Exception as e:
        print(f"❌ Privacy toggle error: {e}")
        return False
    
    # Step 5: Test GET /api/teams/{team_id}/details with user A token (private team - owner)
    print("\n5️⃣ STEP 5: Test Team Details Access (Private Team - Owner)")
    try:
        headers = {"Authorization": f"Bearer {user_a_token}"}
        response = requests.get(f"{BACKEND_URL}/teams/{team_id}/details", headers=headers)
        if response.status_code != 200:
            print(f"❌ Owner cannot access private team details: {response.status_code} - {response.text}")
            return False
        
        team_details = response.json()
        if team_details['team']['is_public']:
            print(f"❌ Team details show public but should be private")
            return False
        
        print(f"✅ Owner can access private team details - Team: {team_details['team']['name']}")
        
    except Exception as e:
        print(f"❌ Private team details access error: {e}")
        return False
    
    # Step 6: Register user B and test access
    print("\n6️⃣ STEP 6: Register User B and Test Access to Private Team")
    user_b_data = {
        "username": f"testuser_{uuid.uuid4().hex[:8]}",
        "email": f"user_{uuid.uuid4().hex[:8]}@test.com",
        "password": "testpass123",
        "coach_level": 1,
        "favorite_position": "FW",
        "favorite_element": "Fire",
        "favourite_team": "Raimon",
        "profile_picture": "",
        "bio": "Test non-owner user",
        "kizuna_stars": 50
    }
    
    try:
        response = requests.post(f"{BACKEND_URL}/auth/register", json=user_b_data)
        if response.status_code != 200:
            print(f"❌ User B registration failed: {response.status_code} - {response.text}")
            return False
        
        user_b_token = response.json()["access_token"]
        user_b_id = response.json()["user"]["id"]
        print(f"✅ User B registered successfully - ID: {user_b_id}")
        
    except Exception as e:
        print(f"❌ User B registration error: {e}")
        return False
    
    # Test User B access to private team (should get 404)
    print("\n🔒 Testing User B Access to Private Team (Expect 404)")
    try:
        headers = {"Authorization": f"Bearer {user_b_token}"}
        response = requests.get(f"{BACKEND_URL}/teams/{team_id}/details", headers=headers)
        if response.status_code == 404:
            print(f"✅ Non-owner correctly denied access to private team (404)")
        else:
            print(f"❌ Non-owner should get 404 but got: {response.status_code} - {response.text}")
            return False
        
    except Exception as e:
        print(f"❌ User B access test error: {e}")
        return False
    
    # Step 7: Test existing endpoints behavior
    print("\n7️⃣ STEP 7: Test Existing Endpoints with Private Team")
    
    # Test GET /api/teams (user teams endpoint)
    print("\n📋 Testing GET /api/teams (User A - should see private team)")
    try:
        headers = {"Authorization": f"Bearer {user_a_token}"}
        response = requests.get(f"{BACKEND_URL}/teams", headers=headers)
        if response.status_code != 200:
            print(f"❌ GET /api/teams failed: {response.status_code} - {response.text}")
            return False
        
        user_teams = response.json()
        private_team_found = any(team["id"] == team_id and not team["is_public"] for team in user_teams)
        if not private_team_found:
            print(f"❌ Private team not found in user's teams list")
            return False
        
        print(f"✅ Owner can see private team in their teams list")
        
    except Exception as e:
        print(f"❌ GET /api/teams error: {e}")
        return False
    
    # Test GET /api/teams/{id}/public (should 404 for private team)
    print("\n🌐 Testing GET /api/teams/{team_id}/public (Expect 404 for private team)")
    try:
        response = requests.get(f"{BACKEND_URL}/teams/{team_id}/public")
        if response.status_code == 404:
            print(f"✅ Public endpoint correctly returns 404 for private team")
        else:
            print(f"❌ Public endpoint should return 404 but got: {response.status_code} - {response.text}")
            return False
        
    except Exception as e:
        print(f"❌ Public endpoint test error: {e}")
        return False
    
    print("\n" + "=" * 60)
    print("🎉 ALL PRIVATE TEAM ACCESS TESTS PASSED!")
    print("✅ Owner can access private team via GET /api/teams/{team_id}/details")
    print("✅ Non-owner gets 404 when accessing private team")
    print("✅ Privacy toggle works correctly")
    print("✅ Public endpoint returns 404 for private teams")
    print("✅ User teams endpoint shows private teams to owner")
    
    return True

if __name__ == "__main__":
    success = test_private_team_access()
    if not success:
        print("\n❌ PRIVATE TEAM ACCESS TESTS FAILED")
        exit(1)
    else:
        print("\n✅ PRIVATE TEAM ACCESS TESTS COMPLETED SUCCESSFULLY")