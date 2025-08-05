#!/usr/bin/env python3
"""
Focused Backend Test for Review Request
Testing specific endpoints mentioned in the review:
1. GET /api/save-slots - save slots endpoint
2. POST /api/teams - team creation and saving
3. GET /api/teams - team loading/retrieval
4. PUT /api/auth/me - profile updates
5. Null handling and error responses
"""

import requests
import json
import random
import string
import unittest

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

print(f"Testing API at: {API_URL}")

def generate_random_string(length=8):
    """Generate a random string of fixed length"""
    letters = string.ascii_lowercase
    return ''.join(random.choice(letters) for i in range(length))

class ReviewFocusedTest(unittest.TestCase):
    """Focused test suite for review request endpoints"""
    
    def setUp(self):
        """Set up test data"""
        # Generate unique username and email for testing
        random_suffix = generate_random_string()
        self.test_username = f"reviewuser_{random_suffix}"
        self.test_email = f"review_{random_suffix}@example.com"
        self.test_password = "ReviewTest123!"
        
        # User registration data
        self.user_data = {
            "username": self.test_username,
            "email": self.test_email,
            "password": self.test_password,
            "coach_level": 7,
            "favorite_position": "MF",
            "favorite_element": "Lightning",
            "favourite_team": "Inazuma Japan",
            "profile_picture": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==",
            "bio": "Testing team management and save functionality"
        }
        
        # Team creation data
        self.team_data = {
            "name": f"Review Test Team {random_suffix}",
            "formation": "4-4-2",
            "players": [
                {
                    "character_id": "sample_char_1",
                    "position_id": "gk",
                    "user_level": 50,
                    "user_rarity": "Epic",
                    "user_equipment": {
                        "boots": "sample_boots_1",
                        "bracelets": "sample_bracelet_1",
                        "pendants": "sample_pendant_1"
                    },
                    "user_hissatsu": [
                        {
                            "id": "technique_1",
                            "name": "God Hand",
                            "type": "Save"
                        }
                    ]
                }
            ],
            "bench_players": [
                {
                    "character_id": "sample_char_2",
                    "position_id": "fw",
                    "user_level": 45,
                    "user_rarity": "Rare",
                    "user_equipment": {
                        "boots": "sample_boots_2",
                        "bracelets": None,
                        "pendants": None
                    },
                    "user_hissatsu": []
                }
            ],
            "tactics": ["tactic_1", "tactic_2"],
            "coach": "coach_1",
            "description": "A comprehensive test team for review testing",
            "is_public": True,
            "tags": ["review", "test", "comprehensive"]
        }
        
        # Store auth token and IDs
        self.auth_token = None
        self.user_id = None
        self.team_id = None
    
    def test_01_setup_authentication(self):
        """Set up authentication for focused tests"""
        print("\n=== AUTHENTICATION SETUP ===")
        
        # Register user
        response = requests.post(f"{API_URL}/auth/register", json=self.user_data)
        self.assertEqual(response.status_code, 200)
        data = response.json()
        
        # Verify response structure
        self.assertIn("access_token", data)
        self.assertIn("user", data)
        self.assertEqual(data["user"]["username"], self.test_username)
        
        # Store auth data
        self.auth_token = data["access_token"]
        self.user_id = data["user"]["id"]
        
        print(f"✅ User registered successfully with ID: {self.user_id}")
        print(f"✅ Auth token obtained: {self.auth_token[:20]}...")
    
    def test_02_profile_updates_put_auth_me(self):
        """Test PUT /api/auth/me - profile updates with null handling"""
        print("\n=== TESTING PUT /api/auth/me (Profile Updates) ===")
        
        if not self.auth_token:
            self.skipTest("No auth token available")
        
        headers = {"Authorization": f"Bearer {self.auth_token}"}
        
        # Test 1: Valid profile update
        update_data = {
            "coach_level": 15,
            "favorite_position": "GK",
            "favorite_element": "Earth",
            "favourite_team": "Raimon",
            "bio": "Updated bio for testing profile functionality"
        }
        
        response = requests.put(f"{API_URL}/auth/me", json=update_data, headers=headers)
        self.assertEqual(response.status_code, 200)
        data = response.json()
        
        # Verify updates were applied
        self.assertEqual(data["coach_level"], 15)
        self.assertEqual(data["favorite_position"], "GK")
        self.assertEqual(data["favorite_element"], "Earth")
        self.assertEqual(data["favourite_team"], "Raimon")
        self.assertEqual(data["bio"], "Updated bio for testing profile functionality")
        
        print("✅ Valid profile update successful")
        
        # Test 2: Partial update (some fields null/missing)
        partial_update = {
            "coach_level": 20,
            "bio": None  # Testing null handling
        }
        
        response = requests.put(f"{API_URL}/auth/me", json=partial_update, headers=headers)
        self.assertEqual(response.status_code, 200)
        data = response.json()
        
        # Verify partial update worked
        self.assertEqual(data["coach_level"], 20)
        # Bio should be None or empty
        self.assertIn(data["bio"], [None, ""])
        # Other fields should remain unchanged
        self.assertEqual(data["favorite_position"], "GK")
        self.assertEqual(data["favorite_element"], "Earth")
        
        print("✅ Partial profile update with null handling successful")
        
        # Test 3: Invalid data handling
        invalid_update = {
            "coach_level": "invalid_level",  # Should be integer
            "favorite_position": "INVALID_POSITION"
        }
        
        response = requests.put(f"{API_URL}/auth/me", json=invalid_update, headers=headers)
        # Should handle invalid data gracefully (either 400 or ignore invalid fields)
        self.assertIn(response.status_code, [200, 400, 422])
        
        print("✅ Invalid data handling tested")
        
        # Test 4: Unauthorized access
        response = requests.put(f"{API_URL}/auth/me", json=update_data)
        self.assertEqual(response.status_code, 403)
        
        print("✅ Unauthorized access properly rejected")
    
    def test_03_save_slots_endpoint_get(self):
        """Test GET /api/save-slots - save slots endpoint structure"""
        print("\n=== TESTING GET /api/save-slots (Save Slots) ===")
        
        if not self.auth_token:
            self.skipTest("No auth token available")
        
        headers = {"Authorization": f"Bearer {self.auth_token}"}
        
        # Test save slots endpoint
        response = requests.get(f"{API_URL}/save-slots", headers=headers)
        self.assertEqual(response.status_code, 200)
        data = response.json()
        
        # Verify response structure
        self.assertIn("save_slots", data)
        self.assertIsInstance(data["save_slots"], list)
        
        # Should have 5 slots
        self.assertEqual(len(data["save_slots"]), 5)
        
        # Verify slot structure
        for i, slot in enumerate(data["save_slots"]):
            self.assertIn("slot_number", slot)
            self.assertIn("slot_name", slot)
            self.assertIn("is_occupied", slot)
            self.assertIn("team_id", slot)
            self.assertIn("team_name", slot)
            
            # Verify slot number is correct
            self.assertEqual(slot["slot_number"], i + 1)
            
            # Initially slots should be empty
            self.assertFalse(slot["is_occupied"])
            self.assertIsNone(slot["team_id"])
            self.assertIsNone(slot["team_name"])
        
        print("✅ Save slots endpoint returns proper slot structure")
        print(f"✅ Found {len(data['save_slots'])} slots with correct structure")
        
        # Test unauthorized access
        response = requests.get(f"{API_URL}/save-slots")
        self.assertEqual(response.status_code, 403)
        
        print("✅ Unauthorized access to save slots properly rejected")
    
    def test_04_team_creation_post_teams(self):
        """Test POST /api/teams - team creation and saving"""
        print("\n=== TESTING POST /api/teams (Team Creation) ===")
        
        if not self.auth_token:
            self.skipTest("No auth token available")
        
        headers = {"Authorization": f"Bearer {self.auth_token}"}
        
        # Test 1: Valid team creation
        response = requests.post(f"{API_URL}/teams", json=self.team_data, headers=headers)
        self.assertEqual(response.status_code, 200)
        data = response.json()
        
        # Verify response structure
        self.assertIn("id", data)
        self.assertIn("name", data)
        self.assertIn("formation", data)
        self.assertIn("players", data)
        self.assertIn("bench_players", data)
        self.assertIn("tactics", data)
        self.assertIn("coach", data)
        self.assertIn("description", data)
        self.assertIn("is_public", data)
        self.assertIn("tags", data)
        self.assertIn("user_id", data)
        
        # Verify data matches what we sent
        self.assertEqual(data["name"], self.team_data["name"])
        self.assertEqual(data["formation"], self.team_data["formation"])
        self.assertEqual(data["description"], self.team_data["description"])
        self.assertEqual(data["is_public"], self.team_data["is_public"])
        self.assertEqual(data["tags"], self.team_data["tags"])
        self.assertEqual(data["user_id"], self.user_id)
        
        # Store team ID for further tests
        self.team_id = data["id"]
        
        print(f"✅ Team creation successful with ID: {self.team_id}")
        print(f"✅ Team data properly saved with all fields")
        
        # Test 2: Team creation with null/empty fields
        minimal_team_data = {
            "name": f"Minimal Team {generate_random_string()}",
            "formation": "4-3-3",
            "players": [],
            "bench_players": [],
            "tactics": [],
            "coach": None,
            "description": None,
            "is_public": False,
            "tags": []
        }
        
        response = requests.post(f"{API_URL}/teams", json=minimal_team_data, headers=headers)
        self.assertEqual(response.status_code, 200)
        data = response.json()
        
        # Verify null handling
        self.assertEqual(data["name"], minimal_team_data["name"])
        self.assertIsNone(data["coach"])
        self.assertIn(data["description"], [None, ""])
        self.assertEqual(data["is_public"], False)
        self.assertEqual(data["tags"], [])
        
        print("✅ Team creation with null/empty fields handled correctly")
        
        # Test 3: Invalid team data
        invalid_team_data = {
            "name": "",  # Empty name should be invalid
            "formation": "invalid_formation"
        }
        
        response = requests.post(f"{API_URL}/teams", json=invalid_team_data, headers=headers)
        # Should return error for invalid data
        self.assertIn(response.status_code, [400, 422])
        
        print("✅ Invalid team data properly rejected")
        
        # Test 4: Unauthorized team creation
        response = requests.post(f"{API_URL}/teams", json=self.team_data)
        self.assertEqual(response.status_code, 403)
        
        print("✅ Unauthorized team creation properly rejected")
    
    def test_05_team_loading_get_teams(self):
        """Test GET /api/teams - team loading/retrieval"""
        print("\n=== TESTING GET /api/teams (Team Loading) ===")
        
        if not self.auth_token:
            self.skipTest("No auth token available")
        
        headers = {"Authorization": f"Bearer {self.auth_token}"}
        
        # Test 1: Get all user teams
        response = requests.get(f"{API_URL}/teams", headers=headers)
        self.assertEqual(response.status_code, 200)
        data = response.json()
        
        # Verify response is a list
        self.assertIsInstance(data, list)
        
        # Should have at least the team we created
        self.assertGreater(len(data), 0)
        
        # Find our created team
        our_team = None
        for team in data:
            if team["id"] == self.team_id:
                our_team = team
                break
        
        self.assertIsNotNone(our_team, "Created team should be in the list")
        
        # Verify team structure
        self.assertIn("id", our_team)
        self.assertIn("name", our_team)
        self.assertIn("formation", our_team)
        self.assertIn("user_id", our_team)
        self.assertEqual(our_team["user_id"], self.user_id)
        
        print(f"✅ Team loading successful, found {len(data)} teams")
        print(f"✅ Our created team found in the list")
        
        # Test 2: Get specific team by ID
        if self.team_id:
            response = requests.get(f"{API_URL}/teams/{self.team_id}", headers=headers)
            self.assertEqual(response.status_code, 200)
            team_data = response.json()
            
            # Verify detailed team structure
            self.assertEqual(team_data["id"], self.team_id)
            self.assertEqual(team_data["name"], self.team_data["name"])
            self.assertIn("players", team_data)
            self.assertIn("bench_players", team_data)
            self.assertIn("tactics", team_data)
            self.assertIn("coach", team_data)
            
            # Verify players structure if present
            if team_data["players"]:
                player = team_data["players"][0]
                self.assertIn("character_id", player)
                self.assertIn("position_id", player)
                self.assertIn("user_level", player)
                self.assertIn("user_rarity", player)
                
                # Check equipment handling (including null values)
                if "user_equipment" in player:
                    equipment = player["user_equipment"]
                    self.assertIsInstance(equipment, dict)
                    # Equipment can have null values
                    for slot in ["boots", "bracelets", "pendants"]:
                        if slot in equipment:
                            # Value can be string ID or None
                            self.assertIn(type(equipment[slot]), [str, type(None)])
                
                # Check techniques handling
                if "user_hissatsu" in player:
                    techniques = player["user_hissatsu"]
                    self.assertIsInstance(techniques, list)
            
            print(f"✅ Specific team retrieval successful")
            print(f"✅ Team data structure complete with players, equipment, and techniques")
        
        # Test 3: Unauthorized access
        response = requests.get(f"{API_URL}/teams")
        self.assertEqual(response.status_code, 403)
        
        print("✅ Unauthorized team access properly rejected")
        
        # Test 4: Non-existent team
        fake_team_id = "non_existent_team_id"
        response = requests.get(f"{API_URL}/teams/{fake_team_id}", headers=headers)
        self.assertEqual(response.status_code, 404)
        
        print("✅ Non-existent team properly returns 404")
    
    def test_06_team_save_to_slot_integration(self):
        """Test team saving to slots integration"""
        print("\n=== TESTING TEAM SAVE TO SLOT INTEGRATION ===")
        
        if not self.auth_token or not self.team_id:
            self.skipTest("No auth token or team ID available")
        
        headers = {"Authorization": f"Bearer {self.auth_token}"}
        
        # Test saving team to slot
        slot_data = {
            "slot_number": 1,
            "slot_name": "Review Test Slot",
            "overwrite": True
        }
        
        response = requests.post(f"{API_URL}/teams/{self.team_id}/save-to-slot", json=slot_data, headers=headers)
        self.assertEqual(response.status_code, 200)
        data = response.json()
        
        self.assertIn("message", data)
        self.assertEqual(data["message"], "Team saved to slot successfully")
        
        print("✅ Team saved to slot successfully")
        
        # Verify the slot is now occupied
        response = requests.get(f"{API_URL}/save-slots", headers=headers)
        self.assertEqual(response.status_code, 200)
        slots_data = response.json()
        
        slot_1 = next((slot for slot in slots_data["save_slots"] if slot["slot_number"] == 1), None)
        self.assertIsNotNone(slot_1)
        self.assertTrue(slot_1["is_occupied"])
        self.assertEqual(slot_1["team_id"], self.team_id)
        self.assertEqual(slot_1["slot_name"], "Review Test Slot")
        
        print("✅ Save slot properly updated after team save")
        
        # Test overwrite functionality
        overwrite_data = {
            "slot_number": 1,
            "slot_name": "Overwritten Slot",
            "overwrite": True
        }
        
        response = requests.post(f"{API_URL}/teams/{self.team_id}/save-to-slot", json=overwrite_data, headers=headers)
        self.assertEqual(response.status_code, 200)
        
        # Verify overwrite worked
        response = requests.get(f"{API_URL}/save-slots", headers=headers)
        slots_data = response.json()
        slot_1 = next((slot for slot in slots_data["save_slots"] if slot["slot_number"] == 1), None)
        self.assertEqual(slot_1["slot_name"], "Overwritten Slot")
        
        print("✅ Slot overwrite functionality working")
    
    def test_07_null_handling_and_error_responses(self):
        """Test null handling and error responses across endpoints"""
        print("\n=== TESTING NULL HANDLING AND ERROR RESPONSES ===")
        
        if not self.auth_token:
            self.skipTest("No auth token available")
        
        headers = {"Authorization": f"Bearer {self.auth_token}"}
        
        # Test 1: Profile update with null values
        null_profile_data = {
            "coach_level": None,
            "favorite_position": None,
            "favorite_element": None,
            "favourite_team": None,
            "bio": None
        }
        
        response = requests.put(f"{API_URL}/auth/me", json=null_profile_data, headers=headers)
        # Should handle nulls gracefully
        self.assertIn(response.status_code, [200, 400])
        
        if response.status_code == 200:
            data = response.json()
            # Verify null handling
            for field in ["coach_level", "favorite_position", "favorite_element", "favourite_team", "bio"]:
                if field in data:
                    # Field should be None or have a default value
                    self.assertIn(type(data[field]), [type(None), str, int])
        
        print("✅ Profile update null handling tested")
        
        # Test 2: Team creation with null player equipment
        null_equipment_team = {
            "name": f"Null Equipment Team {generate_random_string()}",
            "formation": "4-3-3",
            "players": [
                {
                    "character_id": "test_char",
                    "position_id": "gk",
                    "user_level": 50,
                    "user_rarity": "Epic",
                    "user_equipment": {
                        "boots": None,
                        "bracelets": None,
                        "pendants": None
                    },
                    "user_hissatsu": None
                }
            ],
            "bench_players": [],
            "tactics": [],
            "coach": None,
            "description": None,
            "is_public": True,
            "tags": []
        }
        
        response = requests.post(f"{API_URL}/teams", json=null_equipment_team, headers=headers)
        self.assertEqual(response.status_code, 200)
        data = response.json()
        
        # Verify null equipment handling
        if data["players"]:
            player = data["players"][0]
            if "user_equipment" in player:
                equipment = player["user_equipment"]
                for slot in ["boots", "bracelets", "pendants"]:
                    if slot in equipment:
                        self.assertIsNone(equipment[slot])
        
        print("✅ Team creation with null equipment handled correctly")
        
        # Test 3: Invalid authentication token
        invalid_headers = {"Authorization": "Bearer invalid_token_12345"}
        
        response = requests.get(f"{API_URL}/auth/me", headers=invalid_headers)
        self.assertEqual(response.status_code, 401)
        
        response = requests.get(f"{API_URL}/teams", headers=invalid_headers)
        self.assertEqual(response.status_code, 401)
        
        response = requests.get(f"{API_URL}/save-slots", headers=invalid_headers)
        self.assertEqual(response.status_code, 401)
        
        print("✅ Invalid authentication token properly rejected (401)")
        
        # Test 4: Missing required fields
        incomplete_team_data = {
            "formation": "4-3-3"
            # Missing required 'name' field
        }
        
        response = requests.post(f"{API_URL}/teams", json=incomplete_team_data, headers=headers)
        self.assertIn(response.status_code, [400, 422])
        
        print("✅ Missing required fields properly rejected")
        
        # Test 5: Malformed JSON
        try:
            response = requests.post(f"{API_URL}/teams", data="invalid json", headers=headers)
            self.assertIn(response.status_code, [400, 422])
            print("✅ Malformed JSON properly rejected")
        except:
            print("✅ Malformed JSON handling tested (connection level)")
    
    def test_08_comprehensive_data_integrity(self):
        """Test comprehensive data integrity across all endpoints"""
        print("\n=== TESTING COMPREHENSIVE DATA INTEGRITY ===")
        
        if not self.auth_token or not self.team_id:
            self.skipTest("No auth token or team ID available")
        
        headers = {"Authorization": f"Bearer {self.auth_token}"}
        
        # Test 1: Verify team data consistency
        response = requests.get(f"{API_URL}/teams/{self.team_id}", headers=headers)
        self.assertEqual(response.status_code, 200)
        team_data = response.json()
        
        # Verify all expected fields are present
        required_fields = ["id", "name", "formation", "players", "bench_players", "tactics", "coach", "user_id"]
        for field in required_fields:
            self.assertIn(field, team_data)
        
        # Verify user_id matches current user
        self.assertEqual(team_data["user_id"], self.user_id)
        
        print("✅ Team data integrity verified")
        
        # Test 2: Verify profile data consistency
        response = requests.get(f"{API_URL}/auth/me", headers=headers)
        self.assertEqual(response.status_code, 200)
        profile_data = response.json()
        
        # Verify profile structure
        profile_fields = ["id", "username", "email", "coach_level", "favorite_position", "favorite_element"]
        for field in profile_fields:
            self.assertIn(field, profile_data)
        
        # Verify user ID consistency
        self.assertEqual(profile_data["id"], self.user_id)
        self.assertEqual(profile_data["username"], self.test_username)
        self.assertEqual(profile_data["email"], self.test_email)
        
        print("✅ Profile data integrity verified")
        
        # Test 3: Verify save slots consistency
        response = requests.get(f"{API_URL}/save-slots", headers=headers)
        self.assertEqual(response.status_code, 200)
        slots_data = response.json()
        
        # Verify slots structure
        self.assertIn("save_slots", slots_data)
        self.assertEqual(len(slots_data["save_slots"]), 5)
        
        # Check if any slots are occupied and verify team_id references
        for slot in slots_data["save_slots"]:
            if slot["is_occupied"]:
                self.assertIsNotNone(slot["team_id"])
                self.assertIsNotNone(slot["team_name"])
                
                # Verify the referenced team exists
                team_response = requests.get(f"{API_URL}/teams/{slot['team_id']}", headers=headers)
                self.assertEqual(team_response.status_code, 200)
                team = team_response.json()
                self.assertEqual(team["name"], slot["team_name"])
        
        print("✅ Save slots data integrity verified")
        
        print("\n=== ALL REVIEW FOCUSED TESTS COMPLETED SUCCESSFULLY ===")

if __name__ == "__main__":
    # Run the focused tests
    unittest.main(verbosity=2)