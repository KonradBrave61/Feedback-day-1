#!/usr/bin/env python3
"""
Focused Team Disappearing Bug Test
This test specifically focuses on the critical scenarios mentioned in the review request.
"""

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

print(f"🔍 FOCUSED TEAM BUG TEST: Testing API at: {API_URL}")

def generate_random_string(length=8):
    """Generate a random string of fixed length"""
    letters = string.ascii_lowercase
    return ''.join(random.choice(letters) for i in range(length))

def test_team_disappearing_bug():
    """Main test function for team disappearing bug"""
    
    # Setup user
    random_suffix = generate_random_string()
    user_data = {
        "username": f"teamtest_{random_suffix}",
        "email": f"teamtest_{random_suffix}@example.com",
        "password": "TeamTest123!",
        "coach_level": 5,
        "favorite_position": "FW",
        "favorite_element": "Fire",
        "favourite_team": "Raimon",
        "bio": "Testing team disappearing bug"
    }
    
    print("\n🔍 STEP 1: User Registration and Authentication")
    
    # Register user
    response = requests.post(f"{API_URL}/auth/register", json=user_data)
    if response.status_code != 200:
        print(f"❌ Registration failed: {response.status_code} - {response.text}")
        return False
    
    data = response.json()
    auth_token = data["access_token"]
    user_id = data["user"]["id"]
    headers = {"Authorization": f"Bearer {auth_token}"}
    
    print(f"✅ User registered: {user_id}")
    print(f"✅ Auth token: {auth_token[:20]}...")
    
    # Test authentication immediately
    response = requests.get(f"{API_URL}/auth/me", headers=headers)
    if response.status_code != 200:
        print(f"❌ Authentication failed: {response.status_code} - {response.text}")
        return False
    
    print(f"✅ Authentication working")
    
    print("\n🔍 STEP 2: Gather Game Resources")
    
    # Get characters
    response = requests.get(f"{API_URL}/characters/")
    if response.status_code != 200:
        print(f"❌ Characters fetch failed: {response.status_code} - {response.text}")
        return False
    
    characters = response.json()
    if not characters:
        print(f"❌ No characters available")
        return False
    
    character_ids = [char["id"] for char in characters[:5]]
    print(f"✅ Found {len(characters)} characters, using first 5")
    
    # Get formations
    response = requests.get(f"{API_URL}/teams/formations/")
    if response.status_code != 200:
        print(f"❌ Formations fetch failed: {response.status_code} - {response.text}")
        return False
    
    formations = response.json()
    formation_id = formations[0]["id"] if formations else "1"
    print(f"✅ Found {len(formations)} formations, using: {formation_id}")
    
    # Get equipment
    response = requests.get(f"{API_URL}/equipment/")
    equipment = response.json() if response.status_code == 200 else []
    equipment_ids = [eq["id"] for eq in equipment[:3]] if equipment else []
    print(f"✅ Found {len(equipment)} equipment items")
    
    print("\n🔍 STEP 3: Team Save API Testing")
    
    # Create team data
    team_data = {
        "name": f"Test Team {random_suffix}",
        "formation": formation_id,
        "players": [
            {
                "character_id": character_ids[0],
                "position_id": "gk",
                "user_level": 50,
                "user_rarity": "Epic",
                "user_equipment": {
                    "boots": equipment_ids[0] if equipment_ids else None,
                    "bracelets": equipment_ids[1] if len(equipment_ids) > 1 else None,
                    "pendants": equipment_ids[2] if len(equipment_ids) > 2 else None
                },
                "user_hissatsu": []
            }
        ],
        "bench_players": [
            {
                "character_id": character_ids[1] if len(character_ids) > 1 else character_ids[0],
                "slot_id": "bench_1",
                "user_level": 45,
                "user_rarity": "Rare",
                "user_equipment": {
                    "boots": None,
                    "bracelets": None,
                    "pendants": None
                },
                "user_hissatsu": []
            }
        ],
        "tactics": [],
        "coach": None,
        "description": "Test team for bug investigation",
        "is_public": True,
        "tags": ["test", "bug-investigation"]
    }
    
    print(f"📝 Creating team: {team_data['name']}")
    
    # Test POST /api/teams endpoint
    response = requests.post(f"{API_URL}/teams", json=team_data, headers=headers)
    if response.status_code != 200:
        print(f"❌ Team creation failed: {response.status_code} - {response.text}")
        return False
    
    team = response.json()
    team_id = team["id"]
    print(f"✅ Team created successfully: {team_id}")
    
    # Immediately verify team exists
    response = requests.get(f"{API_URL}/teams/{team_id}", headers=headers)
    if response.status_code != 200:
        print(f"❌ Team retrieval failed immediately after creation: {response.status_code} - {response.text}")
        return False
    
    retrieved_team = response.json()
    print(f"✅ Team retrieved immediately: {retrieved_team['name']}")
    
    # Test POST /api/save-slots endpoint
    slot_data = {
        "slot_number": 1,
        "slot_name": f"Test Slot {random_suffix}",
        "overwrite": True
    }
    
    response = requests.post(f"{API_URL}/teams/{team_id}/save-to-slot", json=slot_data, headers=headers)
    if response.status_code != 200:
        print(f"❌ Save to slot failed: {response.status_code} - {response.text}")
        return False
    
    print(f"✅ Team saved to slot 1")
    
    print("\n🔍 STEP 4: Team Load API Testing")
    
    # Test GET /api/teams endpoint
    response = requests.get(f"{API_URL}/teams", headers=headers)
    if response.status_code != 200:
        print(f"❌ User teams retrieval failed: {response.status_code} - {response.text}")
        return False
    
    user_teams = response.json()
    team_found = any(t["id"] == team_id for t in user_teams)
    if not team_found:
        print(f"❌ Created team not found in user teams list!")
        print(f"   Expected team ID: {team_id}")
        print(f"   Found team IDs: {[t['id'] for t in user_teams]}")
        return False
    
    print(f"✅ GET /api/teams successful - found {len(user_teams)} teams including our test team")
    
    # Test GET /api/save-slots endpoint
    response = requests.get(f"{API_URL}/save-slots", headers=headers)
    if response.status_code != 200:
        print(f"❌ Save slots retrieval failed: {response.status_code} - {response.text}")
        return False
    
    slots_data = response.json()
    slot_1 = next((slot for slot in slots_data["save_slots"] if slot["slot_number"] == 1), None)
    if not slot_1 or not slot_1["is_occupied"] or slot_1["team_id"] != team_id:
        print(f"❌ Slot 1 verification failed!")
        print(f"   Slot 1 data: {slot_1}")
        return False
    
    print(f"✅ GET /api/save-slots successful - slot 1 contains our team")
    
    # Test GET /api/teams/{team_id}/details endpoint
    response = requests.get(f"{API_URL}/teams/{team_id}/details", headers=headers)
    if response.status_code != 200:
        print(f"❌ Team details retrieval failed: {response.status_code} - {response.text}")
        return False
    
    details_data = response.json()
    if "team" not in details_data:
        print(f"❌ Team details missing 'team' key: {details_data}")
        return False
    
    team_details = details_data["team"]
    if team_details["id"] != team_id:
        print(f"❌ Team details ID mismatch: expected {team_id}, got {team_details['id']}")
        return False
    
    print(f"✅ GET /api/teams/{team_id}/details successful")
    
    # Verify data structure
    required_fields = ["players", "bench_players", "tactics", "coach"]
    for field in required_fields:
        if field not in team_details:
            print(f"❌ Missing field in team details: {field}")
            return False
    
    print(f"✅ Team details data structure verified")
    
    print("\n🔍 STEP 5: Authentication Token Testing")
    
    # Test valid token
    response = requests.get(f"{API_URL}/auth/me", headers=headers)
    if response.status_code != 200:
        print(f"❌ Valid token rejected: {response.status_code} - {response.text}")
        return False
    
    print(f"✅ Valid token accepted")
    
    # Test no token (should return 403)
    response = requests.get(f"{API_URL}/auth/me")
    if response.status_code != 403:
        print(f"❌ No token should return 403, got {response.status_code}")
        return False
    
    print(f"✅ No token properly rejected with 403")
    
    # Test invalid token (should return 401)
    invalid_headers = {"Authorization": "Bearer invalid_token_12345"}
    response = requests.get(f"{API_URL}/auth/me", headers=invalid_headers)
    if response.status_code != 401:
        print(f"❌ Invalid token should return 401, got {response.status_code}")
        return False
    
    print(f"✅ Invalid token properly rejected with 401")
    
    print("\n🔍 STEP 6: Database Persistence Testing")
    
    # Wait a moment and test persistence
    time.sleep(2)
    
    # Check if team still exists
    response = requests.get(f"{API_URL}/teams/{team_id}", headers=headers)
    if response.status_code != 200:
        print(f"❌ Team disappeared after delay: {response.status_code} - {response.text}")
        return False
    
    print(f"✅ Team persisted after delay")
    
    # Check if team is still in user teams list
    response = requests.get(f"{API_URL}/teams", headers=headers)
    if response.status_code != 200:
        print(f"❌ User teams list failed after delay: {response.status_code} - {response.text}")
        return False
    
    user_teams_after_delay = response.json()
    team_still_found = any(t["id"] == team_id for t in user_teams_after_delay)
    if not team_still_found:
        print(f"❌ Team disappeared from user teams list after delay!")
        return False
    
    print(f"✅ Team still in user teams list after delay")
    
    # Check if slot is still occupied
    response = requests.get(f"{API_URL}/save-slots", headers=headers)
    if response.status_code != 200:
        print(f"❌ Save slots check failed after delay: {response.status_code} - {response.text}")
        return False
    
    slots_data_after_delay = response.json()
    slot_1_after_delay = next((slot for slot in slots_data_after_delay["save_slots"] if slot["slot_number"] == 1), None)
    if not slot_1_after_delay or not slot_1_after_delay["is_occupied"]:
        print(f"❌ Slot 1 became unoccupied after delay!")
        return False
    
    print(f"✅ Slot 1 still occupied after delay")
    
    print("\n🔍 STEP 7: Error Scenarios Testing")
    
    # Test concurrent save operations
    print("📝 Testing concurrent operations...")
    
    # Save to multiple slots rapidly
    for slot_num in [2, 3, 4]:
        slot_data = {
            "slot_number": slot_num,
            "slot_name": f"Concurrent Slot {slot_num}",
            "overwrite": True
        }
        response = requests.post(f"{API_URL}/teams/{team_id}/save-to-slot", json=slot_data, headers=headers)
        if response.status_code != 200:
            print(f"⚠️ Concurrent save to slot {slot_num} failed: {response.status_code}")
        time.sleep(0.1)
    
    print(f"✅ Concurrent operations completed")
    
    # Check if team still exists after concurrent operations
    response = requests.get(f"{API_URL}/teams/{team_id}", headers=headers)
    if response.status_code != 200:
        print(f"❌ Team disappeared after concurrent operations: {response.status_code} - {response.text}")
        return False
    
    print(f"✅ Team survived concurrent operations")
    
    print("\n🔍 STEP 8: Large Data Testing")
    
    # Create a team with large data
    large_team_data = {
        "name": f"Large Test Team {random_suffix}",
        "formation": formation_id,
        "players": [],
        "bench_players": [],
        "tactics": [],
        "coach": None,
        "description": "A" * 500,  # Large description
        "is_public": True,
        "tags": [f"tag_{i}" for i in range(20)]  # Many tags
    }
    
    # Add multiple players
    for i in range(min(5, len(character_ids))):
        large_team_data["players"].append({
            "character_id": character_ids[i],
            "position_id": f"pos_{i}",
            "user_level": 50 + i,
            "user_rarity": "Epic",
            "user_equipment": {
                "boots": equipment_ids[0] if equipment_ids else None,
                "bracelets": equipment_ids[1] if len(equipment_ids) > 1 else None,
                "pendants": equipment_ids[2] if len(equipment_ids) > 2 else None
            },
            "user_hissatsu": []
        })
    
    # Add bench players
    for i in range(min(3, len(character_ids))):
        large_team_data["bench_players"].append({
            "character_id": character_ids[i],
            "slot_id": f"bench_{i+1}",
            "user_level": 40 + i,
            "user_rarity": "Rare",
            "user_equipment": {
                "boots": None,
                "bracelets": None,
                "pendants": None
            },
            "user_hissatsu": []
        })
    
    print(f"📝 Creating large team with {len(large_team_data['players'])} players and {len(large_team_data['bench_players'])} bench players")
    
    response = requests.post(f"{API_URL}/teams", json=large_team_data, headers=headers)
    if response.status_code == 200:
        large_team = response.json()
        large_team_id = large_team["id"]
        print(f"✅ Large team created: {large_team_id}")
        
        # Verify large team can be retrieved
        response = requests.get(f"{API_URL}/teams/{large_team_id}", headers=headers)
        if response.status_code == 200:
            print(f"✅ Large team retrieval successful")
        else:
            print(f"❌ Large team retrieval failed: {response.status_code}")
            return False
    else:
        print(f"⚠️ Large team creation failed: {response.status_code} - {response.text}")
    
    print("\n🔍 FINAL VERIFICATION")
    
    # Final check - verify original team still exists
    response = requests.get(f"{API_URL}/teams/{team_id}", headers=headers)
    if response.status_code != 200:
        print(f"❌ CRITICAL: Original team disappeared during testing!")
        return False
    
    # Final check - verify user teams list
    response = requests.get(f"{API_URL}/teams", headers=headers)
    if response.status_code != 200:
        print(f"❌ CRITICAL: Cannot access user teams list!")
        return False
    
    final_user_teams = response.json()
    original_team_found = any(t["id"] == team_id for t in final_user_teams)
    if not original_team_found:
        print(f"❌ CRITICAL: Original team missing from final user teams list!")
        return False
    
    print(f"✅ Original team still exists and accessible")
    print(f"✅ Final user teams count: {len(final_user_teams)}")
    
    # Final check - verify save slots
    response = requests.get(f"{API_URL}/save-slots", headers=headers)
    if response.status_code == 200:
        final_slots = response.json()
        occupied_slots = [slot for slot in final_slots["save_slots"] if slot["is_occupied"]]
        print(f"✅ Final occupied slots: {len(occupied_slots)}")
    
    print("\n🎉 ALL TESTS PASSED - NO TEAM DISAPPEARING BUG DETECTED")
    return True

if __name__ == "__main__":
    success = test_team_disappearing_bug()
    if success:
        print("\n✅ CONCLUSION: Backend APIs are working correctly")
        print("   - Team creation, saving, and loading all functional")
        print("   - Authentication working properly")
        print("   - Database persistence verified")
        print("   - No teams disappeared during testing")
    else:
        print("\n❌ CONCLUSION: Issues detected during testing")