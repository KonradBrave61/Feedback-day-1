#!/usr/bin/env python3
"""
Critical Bug Investigation: Teams Disappearing Issue
This test specifically focuses on the reported bug where teams are disappearing 
from everywhere and users cannot save teams after this happens.
"""

import requests
import json
import os
import unittest
import uuid
import random
import string
import time
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
ROOT_URL = BACKEND_URL

print(f"🔍 CRITICAL BUG INVESTIGATION: Testing API at: {API_URL}")
print(f"🔍 Testing Root at: {ROOT_URL}")

def generate_random_string(length=8):
    """Generate a random string of fixed length"""
    letters = string.ascii_lowercase
    return ''.join(random.choice(letters) for i in range(length))

class TeamDisappearingBugTest(unittest.TestCase):
    """Critical test suite for investigating teams disappearing bug"""
    
    def setUp(self):
        """Set up test data for bug investigation"""
        # Generate unique username and email for testing
        random_suffix = generate_random_string()
        self.test_username = f"bugtest_{random_suffix}"
        self.test_email = f"bugtest_{random_suffix}@example.com"
        self.test_password = "BugTest123!"
        
        # User registration data
        self.user_data = {
            "username": self.test_username,
            "email": self.test_email,
            "password": self.test_password,
            "coach_level": 5,
            "favorite_position": "FW",
            "favorite_element": "Fire",
            "favourite_team": "Raimon",
            "profile_picture": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==",
            "bio": "Testing team disappearing bug"
        }
        
        # Team creation data with realistic data
        self.team_data = {
            "name": f"Raimon Eleven {random_suffix}",
            "formation": "1",  # Will be updated after getting formations
            "players": [
                {
                    "character_id": None,  # Will be populated with real character
                    "position_id": "gk",
                    "user_level": 50,
                    "user_rarity": "Epic",
                    "user_equipment": {
                        "boots": None,
                        "bracelets": None,
                        "pendants": None
                    },
                    "user_hissatsu": []
                }
            ],
            "bench_players": [
                {
                    "character_id": None,  # Will be populated with real character
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
            "tactics": [],  # Will be populated with real tactics
            "coach": None,  # Will be populated with real coach
            "description": "A test team to investigate the disappearing bug",
            "is_public": True,
            "tags": ["test", "bug-investigation", "raimon"]
        }
        
        # Store auth token and IDs
        self.auth_token = None
        self.user_id = None
        self.team_ids = []
        self.character_ids = []
        self.equipment_ids = []
        self.formation_ids = []
        self.tactic_ids = []
        self.coach_ids = []
    
    def test_01_authentication_setup(self):
        """Test 1: Set up authentication and verify token validity"""
        print("\n🔍 TEST 1: Authentication Setup and Token Validation")
        
        # Register user
        response = requests.post(f"{API_URL}/auth/register", json=self.user_data)
        self.assertEqual(response.status_code, 200, f"Registration failed: {response.text}")
        data = response.json()
        self.assertIn("access_token", data, "No access token in registration response")
        self.auth_token = data["access_token"]
        self.user_id = data["user"]["id"]
        
        print(f"✅ User registered successfully with ID: {self.user_id}")
        print(f"✅ Auth token received: {self.auth_token[:20]}...")
        
        # Verify token immediately
        headers = {"Authorization": f"Bearer {self.auth_token}"}
        response = requests.get(f"{API_URL}/auth/me", headers=headers)
        self.assertEqual(response.status_code, 200, f"Token validation failed: {response.text}")
        user_data = response.json()
        self.assertEqual(user_data["id"], self.user_id, "User ID mismatch in token validation")
        
        print(f"✅ Token validation successful")
        
        # Test token expiration scenarios
        time.sleep(1)  # Small delay to test token persistence
        response = requests.get(f"{API_URL}/auth/me", headers=headers)
        self.assertEqual(response.status_code, 200, "Token expired too quickly")
        
        print(f"✅ Token persistence verified")
    
    def test_02_gather_game_resources(self):
        """Test 2: Gather characters, equipment, formations, tactics, coaches"""
        print("\n🔍 TEST 2: Gathering Game Resources")
        
        if not self.auth_token:
            self.skipTest("No auth token available")
        
        headers = {"Authorization": f"Bearer {self.auth_token}"}
        
        # Get characters
        response = requests.get(f"{API_URL}/characters/")
        self.assertEqual(response.status_code, 200, f"Failed to get characters: {response.text}")
        characters = response.json()
        self.assertGreater(len(characters), 0, "No characters available")
        self.character_ids = [char["id"] for char in characters[:10]]
        print(f"✅ Found {len(characters)} characters, using first 10")
        
        # Get equipment
        response = requests.get(f"{API_URL}/equipment/")
        self.assertEqual(response.status_code, 200, f"Failed to get equipment: {response.text}")
        equipment = response.json()
        self.assertGreater(len(equipment), 0, "No equipment available")
        self.equipment_ids = [eq["id"] for eq in equipment[:5]]
        print(f"✅ Found {len(equipment)} equipment items, using first 5")
        
        # Get formations
        response = requests.get(f"{API_URL}/teams/formations/")
        self.assertEqual(response.status_code, 200, f"Failed to get formations: {response.text}")
        formations = response.json()
        self.assertGreater(len(formations), 0, "No formations available")
        self.formation_ids = [form["id"] for form in formations]
        print(f"✅ Found {len(formations)} formations")
        
        # Get tactics
        response = requests.get(f"{API_URL}/teams/tactics/")
        self.assertEqual(response.status_code, 200, f"Failed to get tactics: {response.text}")
        tactics = response.json()
        self.assertGreater(len(tactics), 0, "No tactics available")
        self.tactic_ids = [tactic["id"] for tactic in tactics[:3]]
        print(f"✅ Found {len(tactics)} tactics, using first 3")
        
        # Get coaches
        response = requests.get(f"{API_URL}/teams/coaches/")
        self.assertEqual(response.status_code, 200, f"Failed to get coaches: {response.text}")
        coaches = response.json()
        self.assertGreater(len(coaches), 0, "No coaches available")
        self.coach_ids = [coach["id"] for coach in coaches]
        print(f"✅ Found {len(coaches)} coaches")
    
    def test_03_team_save_api_testing(self):
        """Test 3: Team Save API Testing - POST /api/teams and POST /api/save-slots"""
        print("\n🔍 TEST 3: Team Save API Testing")
        
        if not self.auth_token or not self.character_ids:
            self.skipTest("No auth token or characters available")
        
        headers = {"Authorization": f"Bearer {self.auth_token}"}
        
        # Populate team data with real resources
        self.team_data["formation"] = self.formation_ids[0] if self.formation_ids else "1"
        self.team_data["tactics"] = self.tactic_ids[:2] if self.tactic_ids else []
        self.team_data["coach"] = self.coach_ids[0] if self.coach_ids else None
        
        # Add real characters to players
        if len(self.character_ids) >= 2:
            self.team_data["players"][0]["character_id"] = self.character_ids[0]
            self.team_data["bench_players"][0]["character_id"] = self.character_ids[1]
        
        # Add equipment if available
        if len(self.equipment_ids) >= 3:
            self.team_data["players"][0]["user_equipment"]["boots"] = self.equipment_ids[0]
            self.team_data["players"][0]["user_equipment"]["bracelets"] = self.equipment_ids[1]
            self.team_data["bench_players"][0]["user_equipment"]["pendants"] = self.equipment_ids[2]
        
        print(f"📝 Creating team with formation: {self.team_data['formation']}")
        print(f"📝 Team has {len(self.team_data['players'])} main players and {len(self.team_data['bench_players'])} bench players")
        
        # Test POST /api/teams endpoint
        response = requests.post(f"{API_URL}/teams", json=self.team_data, headers=headers)
        self.assertEqual(response.status_code, 200, f"Team creation failed: {response.text}")
        team = response.json()
        self.assertIn("id", team, "No team ID in response")
        team_id = team["id"]
        self.team_ids.append(team_id)
        
        print(f"✅ Team created successfully with ID: {team_id}")
        
        # Immediately verify team exists
        response = requests.get(f"{API_URL}/teams/{team_id}", headers=headers)
        self.assertEqual(response.status_code, 200, f"Team retrieval failed immediately after creation: {response.text}")
        retrieved_team = response.json()
        self.assertEqual(retrieved_team["id"], team_id, "Team ID mismatch")
        self.assertEqual(retrieved_team["name"], self.team_data["name"], "Team name mismatch")
        
        print(f"✅ Team retrieval verified immediately after creation")
        
        # Test POST /api/save-slots endpoint (save team to slot)
        slot_data = {
            "slot_number": 1,
            "slot_name": f"Bug Test Slot {generate_random_string()}",
            "overwrite": True
        }
        
        response = requests.post(f"{API_URL}/teams/{team_id}/save-to-slot", json=slot_data, headers=headers)
        self.assertEqual(response.status_code, 200, f"Save to slot failed: {response.text}")
        save_response = response.json()
        self.assertIn("message", save_response, "No message in save response")
        
        print(f"✅ Team saved to slot 1 successfully")
        
        # Verify slot is occupied
        response = requests.get(f"{API_URL}/save-slots", headers=headers)
        self.assertEqual(response.status_code, 200, f"Save slots retrieval failed: {response.text}")
        slots_data = response.json()
        self.assertIn("save_slots", slots_data, "No save_slots in response")
        
        slot_1 = next((slot for slot in slots_data["save_slots"] if slot["slot_number"] == 1), None)
        self.assertIsNotNone(slot_1, "Slot 1 not found")
        self.assertTrue(slot_1["is_occupied"], "Slot 1 not marked as occupied")
        self.assertEqual(slot_1["team_id"], team_id, "Wrong team ID in slot")
        
        print(f"✅ Save slot verification successful - Slot 1 occupied with team {team_id}")
    
    def test_04_team_load_api_testing(self):
        """Test 4: Team Load API Testing - GET /api/teams, GET /api/save-slots, GET /api/teams/{id}/details"""
        print("\n🔍 TEST 4: Team Load API Testing")
        
        if not self.auth_token or not self.team_ids:
            self.skipTest("No auth token or teams available")
        
        headers = {"Authorization": f"Bearer {self.auth_token}"}
        team_id = self.team_ids[0]
        
        # Test GET /api/teams endpoint (load user's teams)
        response = requests.get(f"{API_URL}/teams", headers=headers)
        self.assertEqual(response.status_code, 200, f"User teams retrieval failed: {response.text}")
        user_teams = response.json()
        self.assertIsInstance(user_teams, list, "Teams response is not a list")
        self.assertGreater(len(user_teams), 0, "No teams found for user")
        
        # Verify our created team is in the list
        team_found = any(team["id"] == team_id for team in user_teams)
        self.assertTrue(team_found, f"Created team {team_id} not found in user teams list")
        
        print(f"✅ GET /api/teams successful - Found {len(user_teams)} teams including our test team")
        
        # Test GET /api/save-slots endpoint (load save slots)
        response = requests.get(f"{API_URL}/save-slots", headers=headers)
        self.assertEqual(response.status_code, 200, f"Save slots retrieval failed: {response.text}")
        slots_data = response.json()
        self.assertIn("save_slots", slots_data, "No save_slots in response")
        self.assertEqual(len(slots_data["save_slots"]), 5, "Should have 5 save slots")
        
        # Verify slot 1 has our team
        slot_1 = next((slot for slot in slots_data["save_slots"] if slot["slot_number"] == 1), None)
        self.assertIsNotNone(slot_1, "Slot 1 not found")
        self.assertTrue(slot_1["is_occupied"], "Slot 1 should be occupied")
        self.assertEqual(slot_1["team_id"], team_id, "Wrong team in slot 1")
        
        print(f"✅ GET /api/save-slots successful - Slot 1 contains team {team_id}")
        
        # Test GET /api/teams/{team_id}/details endpoint (specific team details)
        response = requests.get(f"{API_URL}/teams/{team_id}/details", headers=headers)
        self.assertEqual(response.status_code, 200, f"Team details retrieval failed: {response.text}")
        details_data = response.json()
        
        # Verify response structure
        self.assertIn("team", details_data, "No team data in details response")
        self.assertIn("is_liked", details_data, "No is_liked field")
        self.assertIn("is_following", details_data, "No is_following field")
        self.assertIn("can_rate", details_data, "No can_rate field")
        
        team_details = details_data["team"]
        self.assertEqual(team_details["id"], team_id, "Team ID mismatch in details")
        self.assertIn("players", team_details, "No players array in team details")
        self.assertIn("bench_players", team_details, "No bench_players array in team details")
        self.assertIn("tactics", team_details, "No tactics array in team details")
        self.assertIn("coach", team_details, "No coach object in team details")
        
        print(f"✅ GET /api/teams/{team_id}/details successful - Complete team data structure verified")
        
        # Verify player data structure
        if team_details["players"]:
            player = team_details["players"][0]
            self.assertIn("character_id", player, "No character_id in player")
            self.assertIn("user_equipment", player, "No user_equipment in player")
            self.assertIn("user_hissatsu", player, "No user_hissatsu in player")
            print(f"✅ Player data structure verified - includes equipment and techniques")
        
        # Verify bench player data structure
        if team_details["bench_players"]:
            bench_player = team_details["bench_players"][0]
            self.assertIn("character_id", bench_player, "No character_id in bench player")
            self.assertIn("slot_id", bench_player, "No slot_id in bench player")
            self.assertIn("user_equipment", bench_player, "No user_equipment in bench player")
            self.assertIn("user_hissatsu", bench_player, "No user_hissatsu in bench player")
            print(f"✅ Bench player data structure verified - includes slot_id, equipment and techniques")
    
    def test_05_authentication_token_testing(self):
        """Test 5: Authentication Token Testing - validity, expiration, 401/403 responses"""
        print("\n🔍 TEST 5: Authentication Token Testing")
        
        if not self.auth_token:
            self.skipTest("No auth token available")
        
        # Test valid token
        headers = {"Authorization": f"Bearer {self.auth_token}"}
        response = requests.get(f"{API_URL}/auth/me", headers=headers)
        self.assertEqual(response.status_code, 200, f"Valid token rejected: {response.text}")
        print(f"✅ Valid token accepted")
        
        # Test no token (should return 403)
        response = requests.get(f"{API_URL}/auth/me")
        self.assertEqual(response.status_code, 403, f"No token should return 403, got {response.status_code}")
        print(f"✅ No token properly rejected with 403")
        
        # Test invalid token (should return 401)
        invalid_headers = {"Authorization": "Bearer invalid_token_12345"}
        response = requests.get(f"{API_URL}/auth/me", headers=invalid_headers)
        self.assertEqual(response.status_code, 401, f"Invalid token should return 401, got {response.status_code}")
        print(f"✅ Invalid token properly rejected with 401")
        
        # Test malformed token
        malformed_headers = {"Authorization": "InvalidFormat"}
        response = requests.get(f"{API_URL}/auth/me", headers=malformed_headers)
        self.assertIn(response.status_code, [401, 403], f"Malformed token should return 401 or 403, got {response.status_code}")
        print(f"✅ Malformed token properly rejected with {response.status_code}")
        
        # Test token with protected team endpoints
        if self.team_ids:
            team_id = self.team_ids[0]
            
            # Valid token
            response = requests.get(f"{API_URL}/teams/{team_id}", headers=headers)
            self.assertEqual(response.status_code, 200, f"Valid token rejected for team endpoint: {response.text}")
            
            # No token
            response = requests.get(f"{API_URL}/teams/{team_id}")
            self.assertEqual(response.status_code, 403, f"No token should return 403 for team endpoint, got {response.status_code}")
            
            # Invalid token
            response = requests.get(f"{API_URL}/teams/{team_id}", headers=invalid_headers)
            self.assertEqual(response.status_code, 401, f"Invalid token should return 401 for team endpoint, got {response.status_code}")
            
            print(f"✅ Team endpoint authentication working correctly")
    
    def test_06_database_persistence_testing(self):
        """Test 6: Database Persistence Testing - create, save, retrieve cycle"""
        print("\n🔍 TEST 6: Database Persistence Testing")
        
        if not self.auth_token or not self.character_ids:
            self.skipTest("No auth token or characters available")
        
        headers = {"Authorization": f"Bearer {self.auth_token}"}
        
        # Create a new team for persistence testing
        persistence_team_data = {
            "name": f"Persistence Test Team {generate_random_string()}",
            "formation": self.formation_ids[0] if self.formation_ids else "1",
            "players": [
                {
                    "character_id": self.character_ids[0],
                    "position_id": "gk",
                    "user_level": 75,
                    "user_rarity": "Legendary",
                    "user_equipment": {
                        "boots": self.equipment_ids[0] if self.equipment_ids else None,
                        "bracelets": self.equipment_ids[1] if len(self.equipment_ids) > 1 else None,
                        "pendants": self.equipment_ids[2] if len(self.equipment_ids) > 2 else None
                    },
                    "user_hissatsu": []
                },
                {
                    "character_id": self.character_ids[1] if len(self.character_ids) > 1 else self.character_ids[0],
                    "position_id": "cf",
                    "user_level": 80,
                    "user_rarity": "Epic",
                    "user_equipment": {
                        "boots": None,
                        "bracelets": None,
                        "pendants": None
                    },
                    "user_hissatsu": []
                }
            ],
            "bench_players": [
                {
                    "character_id": self.character_ids[2] if len(self.character_ids) > 2 else self.character_ids[0],
                    "slot_id": "bench_1",
                    "user_level": 60,
                    "user_rarity": "Rare",
                    "user_equipment": {
                        "boots": None,
                        "bracelets": None,
                        "pendants": None
                    },
                    "user_hissatsu": []
                },
                {
                    "character_id": self.character_ids[3] if len(self.character_ids) > 3 else self.character_ids[0],
                    "slot_id": "bench_2",
                    "user_level": 65,
                    "user_rarity": "Epic",
                    "user_equipment": {
                        "boots": None,
                        "bracelets": None,
                        "pendants": None
                    },
                    "user_hissatsu": []
                }
            ],
            "tactics": self.tactic_ids[:2] if self.tactic_ids else [],
            "coach": self.coach_ids[0] if self.coach_ids else None,
            "description": "Testing database persistence with multiple players and bench",
            "is_public": False,  # Test private team
            "tags": ["persistence", "test", "database"]
        }
        
        print(f"📝 Creating persistence test team with {len(persistence_team_data['players'])} players and {len(persistence_team_data['bench_players'])} bench players")
        
        # Step 1: Create team
        response = requests.post(f"{API_URL}/teams", json=persistence_team_data, headers=headers)
        self.assertEqual(response.status_code, 200, f"Persistence team creation failed: {response.text}")
        created_team = response.json()
        persistence_team_id = created_team["id"]
        self.team_ids.append(persistence_team_id)
        
        print(f"✅ Step 1: Team created with ID {persistence_team_id}")
        
        # Step 2: Immediately retrieve and verify
        response = requests.get(f"{API_URL}/teams/{persistence_team_id}", headers=headers)
        self.assertEqual(response.status_code, 200, f"Immediate retrieval failed: {response.text}")
        retrieved_team = response.json()
        
        # Verify all data persisted correctly
        self.assertEqual(retrieved_team["name"], persistence_team_data["name"], "Team name not persisted")
        self.assertEqual(retrieved_team["formation"], persistence_team_data["formation"], "Formation not persisted")
        self.assertEqual(len(retrieved_team["players"]), len(persistence_team_data["players"]), "Player count mismatch")
        self.assertEqual(len(retrieved_team["bench_players"]), len(persistence_team_data["bench_players"]), "Bench player count mismatch")
        self.assertEqual(retrieved_team["is_public"], persistence_team_data["is_public"], "Privacy setting not persisted")
        
        print(f"✅ Step 2: Immediate retrieval successful - all data persisted")
        
        # Step 3: Save to slot
        slot_data = {
            "slot_number": 2,
            "slot_name": "Persistence Test Slot",
            "overwrite": True
        }
        
        response = requests.post(f"{API_URL}/teams/{persistence_team_id}/save-to-slot", json=slot_data, headers=headers)
        self.assertEqual(response.status_code, 200, f"Save to slot failed: {response.text}")
        
        print(f"✅ Step 3: Team saved to slot 2")
        
        # Step 4: Wait a moment and retrieve again (test persistence over time)
        time.sleep(2)
        
        response = requests.get(f"{API_URL}/teams/{persistence_team_id}/details", headers=headers)
        self.assertEqual(response.status_code, 200, f"Delayed retrieval failed: {response.text}")
        details_data = response.json()
        
        team_details = details_data["team"]
        self.assertEqual(team_details["id"], persistence_team_id, "Team ID changed")
        self.assertEqual(team_details["name"], persistence_team_data["name"], "Team name changed")
        
        # Verify player details persisted
        self.assertEqual(len(team_details["players"]), 2, "Player count changed")
        self.assertEqual(len(team_details["bench_players"]), 2, "Bench player count changed")
        
        # Verify specific player data
        player_1 = team_details["players"][0]
        self.assertEqual(player_1["user_level"], 75, "Player 1 level not persisted")
        self.assertEqual(player_1["user_rarity"], "Legendary", "Player 1 rarity not persisted")
        
        bench_player_1 = team_details["bench_players"][0]
        self.assertEqual(bench_player_1["slot_id"], "bench_1", "Bench player slot_id not persisted")
        self.assertEqual(bench_player_1["user_level"], 60, "Bench player level not persisted")
        
        print(f"✅ Step 4: Delayed retrieval successful - data persisted over time")
        
        # Step 5: Verify slot persistence
        response = requests.get(f"{API_URL}/save-slots", headers=headers)
        self.assertEqual(response.status_code, 200, f"Save slots retrieval failed: {response.text}")
        slots_data = response.json()
        
        slot_2 = next((slot for slot in slots_data["save_slots"] if slot["slot_number"] == 2), None)
        self.assertIsNotNone(slot_2, "Slot 2 not found")
        self.assertTrue(slot_2["is_occupied"], "Slot 2 not occupied")
        self.assertEqual(slot_2["team_id"], persistence_team_id, "Wrong team in slot 2")
        
        print(f"✅ Step 5: Slot persistence verified - slot 2 contains correct team")
        
        # Step 6: Test multiple API calls in sequence (stress test)
        for i in range(5):
            response = requests.get(f"{API_URL}/teams/{persistence_team_id}", headers=headers)
            self.assertEqual(response.status_code, 200, f"Sequential call {i+1} failed: {response.text}")
            team_data = response.json()
            self.assertEqual(team_data["id"], persistence_team_id, f"Team ID inconsistent in call {i+1}")
        
        print(f"✅ Step 6: Sequential API calls successful - data consistent across multiple requests")
    
    def test_07_error_scenarios_testing(self):
        """Test 7: Error Scenarios - invalid data, concurrent operations, large payloads"""
        print("\n🔍 TEST 7: Error Scenarios Testing")
        
        if not self.auth_token:
            self.skipTest("No auth token available")
        
        headers = {"Authorization": f"Bearer {self.auth_token}"}
        
        # Test 1: Invalid team data
        print("📝 Testing invalid team data scenarios...")
        
        invalid_team_data = {
            "name": "",  # Empty name
            "formation": "invalid_formation_id",
            "players": [],
            "bench_players": [],
            "tactics": [],
            "coach": None
        }
        
        response = requests.post(f"{API_URL}/teams", json=invalid_team_data, headers=headers)
        # Should handle gracefully (either 400 or create with defaults)
        self.assertIn(response.status_code, [200, 400], f"Invalid data handling failed: {response.status_code}")
        print(f"✅ Invalid team data handled with status {response.status_code}")
        
        # Test 2: Non-existent character ID
        invalid_character_team = {
            "name": f"Invalid Character Test {generate_random_string()}",
            "formation": self.formation_ids[0] if self.formation_ids else "1",
            "players": [
                {
                    "character_id": "non_existent_character_id_12345",
                    "position_id": "gk",
                    "user_level": 50,
                    "user_rarity": "Epic"
                }
            ],
            "bench_players": [],
            "tactics": [],
            "coach": None
        }
        
        response = requests.post(f"{API_URL}/teams", json=invalid_character_team, headers=headers)
        # Should handle gracefully
        self.assertIn(response.status_code, [200, 400, 404], f"Invalid character ID handling failed: {response.status_code}")
        print(f"✅ Invalid character ID handled with status {response.status_code}")
        
        # Test 3: Large payload (stress test)
        print("📝 Testing large payload...")
        
        large_team_data = {
            "name": f"Large Team Test {generate_random_string()}",
            "formation": self.formation_ids[0] if self.formation_ids else "1",
            "players": [],
            "bench_players": [],
            "tactics": self.tactic_ids if self.tactic_ids else [],
            "coach": self.coach_ids[0] if self.coach_ids else None,
            "description": "A" * 1000,  # Large description
            "tags": [f"tag_{i}" for i in range(50)]  # Many tags
        }
        
        # Add many players (up to formation limit)
        for i in range(min(11, len(self.character_ids))):
            large_team_data["players"].append({
                "character_id": self.character_ids[i % len(self.character_ids)],
                "position_id": f"position_{i}",
                "user_level": 50 + i,
                "user_rarity": "Epic",
                "user_equipment": {
                    "boots": self.equipment_ids[0] if self.equipment_ids else None,
                    "bracelets": self.equipment_ids[1] if len(self.equipment_ids) > 1 else None,
                    "pendants": self.equipment_ids[2] if len(self.equipment_ids) > 2 else None
                },
                "user_hissatsu": []
            })
        
        # Add many bench players
        for i in range(min(7, len(self.character_ids))):
            large_team_data["bench_players"].append({
                "character_id": self.character_ids[i % len(self.character_ids)],
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
        
        response = requests.post(f"{API_URL}/teams", json=large_team_data, headers=headers)
        if response.status_code == 200:
            large_team = response.json()
            large_team_id = large_team["id"]
            self.team_ids.append(large_team_id)
            print(f"✅ Large payload handled successfully - team created with ID {large_team_id}")
            
            # Verify large team can be retrieved
            response = requests.get(f"{API_URL}/teams/{large_team_id}", headers=headers)
            self.assertEqual(response.status_code, 200, "Large team retrieval failed")
            print(f"✅ Large team retrieval successful")
        else:
            print(f"✅ Large payload rejected appropriately with status {response.status_code}")
        
        # Test 4: Concurrent save operations (simulate race condition)
        print("📝 Testing concurrent operations...")
        
        if self.team_ids:
            team_id = self.team_ids[0]
            
            # Simulate concurrent saves to different slots
            import threading
            import queue
            
            results = queue.Queue()
            
            def save_to_slot(slot_num):
                try:
                    slot_data = {
                        "slot_number": slot_num,
                        "slot_name": f"Concurrent Test Slot {slot_num}",
                        "overwrite": True
                    }
                    response = requests.post(f"{API_URL}/teams/{team_id}/save-to-slot", json=slot_data, headers=headers)
                    results.put((slot_num, response.status_code, response.text))
                except Exception as e:
                    results.put((slot_num, "ERROR", str(e)))
            
            # Start concurrent saves
            threads = []
            for slot_num in [3, 4, 5]:
                thread = threading.Thread(target=save_to_slot, args=(slot_num,))
                threads.append(thread)
                thread.start()
            
            # Wait for all threads
            for thread in threads:
                thread.join()
            
            # Check results
            concurrent_results = []
            while not results.empty():
                concurrent_results.append(results.get())
            
            success_count = sum(1 for _, status, _ in concurrent_results if status == 200)
            print(f"✅ Concurrent operations: {success_count}/{len(concurrent_results)} successful")
            
            # Verify slots were saved correctly
            response = requests.get(f"{API_URL}/save-slots", headers=headers)
            if response.status_code == 200:
                slots_data = response.json()
                occupied_slots = [slot for slot in slots_data["save_slots"] if slot["is_occupied"]]
                print(f"✅ Final state: {len(occupied_slots)} slots occupied")
    
    def test_08_comprehensive_bug_reproduction(self):
        """Test 8: Comprehensive Bug Reproduction - simulate user workflow that causes teams to disappear"""
        print("\n🔍 TEST 8: Comprehensive Bug Reproduction")
        
        if not self.auth_token or not self.character_ids:
            self.skipTest("No auth token or characters available")
        
        headers = {"Authorization": f"Bearer {self.auth_token}"}
        
        print("📝 Simulating user workflow that might cause teams to disappear...")
        
        # Step 1: Create multiple teams rapidly
        rapid_teams = []
        for i in range(3):
            team_data = {
                "name": f"Rapid Team {i+1} {generate_random_string()}",
                "formation": self.formation_ids[0] if self.formation_ids else "1",
                "players": [
                    {
                        "character_id": self.character_ids[i % len(self.character_ids)],
                        "position_id": "gk",
                        "user_level": 50 + i,
                        "user_rarity": "Epic",
                        "user_equipment": {
                            "boots": self.equipment_ids[0] if self.equipment_ids else None,
                            "bracelets": None,
                            "pendants": None
                        },
                        "user_hissatsu": []
                    }
                ],
                "bench_players": [
                    {
                        "character_id": self.character_ids[(i+1) % len(self.character_ids)],
                        "slot_id": "bench_1",
                        "user_level": 45 + i,
                        "user_rarity": "Rare",
                        "user_equipment": {
                            "boots": None,
                            "bracelets": None,
                            "pendants": None
                        },
                        "user_hissatsu": []
                    }
                ],
                "tactics": self.tactic_ids[:1] if self.tactic_ids else [],
                "coach": self.coach_ids[0] if self.coach_ids else None,
                "description": f"Rapid creation test team {i+1}",
                "is_public": i % 2 == 0,  # Alternate public/private
                "tags": [f"rapid", f"test{i+1}"]
            }
            
            response = requests.post(f"{API_URL}/teams", json=team_data, headers=headers)
            self.assertEqual(response.status_code, 200, f"Rapid team {i+1} creation failed: {response.text}")
            team = response.json()
            rapid_teams.append(team["id"])
            self.team_ids.append(team["id"])
            
            # Small delay between creations
            time.sleep(0.5)
        
        print(f"✅ Step 1: Created {len(rapid_teams)} teams rapidly")
        
        # Step 2: Verify all teams exist
        for i, team_id in enumerate(rapid_teams):
            response = requests.get(f"{API_URL}/teams/{team_id}", headers=headers)
            self.assertEqual(response.status_code, 200, f"Rapid team {i+1} disappeared after creation: {response.text}")
        
        print(f"✅ Step 2: All rapid teams still exist")
        
        # Step 3: Save teams to slots rapidly
        for i, team_id in enumerate(rapid_teams):
            slot_data = {
                "slot_number": (i % 5) + 1,  # Use slots 1-5
                "slot_name": f"Rapid Slot {i+1}",
                "overwrite": True
            }
            
            response = requests.post(f"{API_URL}/teams/{team_id}/save-to-slot", json=slot_data, headers=headers)
            # Allow some failures due to slot conflicts
            if response.status_code != 200:
                print(f"⚠️ Slot save failed for team {i+1}: {response.status_code}")
            
            time.sleep(0.3)
        
        print(f"✅ Step 3: Attempted to save all teams to slots")
        
        # Step 4: Check if teams still exist after slot operations
        disappeared_teams = []
        for i, team_id in enumerate(rapid_teams):
            response = requests.get(f"{API_URL}/teams/{team_id}", headers=headers)
            if response.status_code != 200:
                disappeared_teams.append((i+1, team_id, response.status_code))
        
        if disappeared_teams:
            print(f"🚨 BUG DETECTED: {len(disappeared_teams)} teams disappeared after slot operations!")
            for team_num, team_id, status_code in disappeared_teams:
                print(f"   - Team {team_num} (ID: {team_id}) returned status {status_code}")
        else:
            print(f"✅ Step 4: All teams still exist after slot operations")
        
        # Step 5: Check user teams list
        response = requests.get(f"{API_URL}/teams", headers=headers)
        self.assertEqual(response.status_code, 200, f"User teams list failed: {response.text}")
        user_teams = response.json()
        
        expected_team_count = len(self.team_ids)
        actual_team_count = len(user_teams)
        
        if actual_team_count < expected_team_count:
            print(f"🚨 BUG DETECTED: User teams list shows {actual_team_count} teams, expected {expected_team_count}")
            missing_teams = []
            user_team_ids = [team["id"] for team in user_teams]
            for team_id in self.team_ids:
                if team_id not in user_team_ids:
                    missing_teams.append(team_id)
            print(f"   - Missing team IDs: {missing_teams}")
        else:
            print(f"✅ Step 5: User teams list shows correct count ({actual_team_count} teams)")
        
        # Step 6: Check save slots
        response = requests.get(f"{API_URL}/save-slots", headers=headers)
        self.assertEqual(response.status_code, 200, f"Save slots check failed: {response.text}")
        slots_data = response.json()
        
        occupied_slots = [slot for slot in slots_data["save_slots"] if slot["is_occupied"]]
        print(f"✅ Step 6: Save slots check - {len(occupied_slots)} slots occupied")
        
        # Step 7: Try to create a new team after the workflow
        final_test_team = {
            "name": f"Final Test Team {generate_random_string()}",
            "formation": self.formation_ids[0] if self.formation_ids else "1",
            "players": [
                {
                    "character_id": self.character_ids[0],
                    "position_id": "gk",
                    "user_level": 99,
                    "user_rarity": "Legendary",
                    "user_equipment": {
                        "boots": self.equipment_ids[0] if self.equipment_ids else None,
                        "bracelets": self.equipment_ids[1] if len(self.equipment_ids) > 1 else None,
                        "pendants": self.equipment_ids[2] if len(self.equipment_ids) > 2 else None
                    },
                    "user_hissatsu": []
                }
            ],
            "bench_players": [],
            "tactics": self.tactic_ids[:1] if self.tactic_ids else [],
            "coach": self.coach_ids[0] if self.coach_ids else None,
            "description": "Final test to check if team creation still works",
            "is_public": True,
            "tags": ["final", "test"]
        }
        
        response = requests.post(f"{API_URL}/teams", json=final_test_team, headers=headers)
        if response.status_code == 200:
            final_team = response.json()
            final_team_id = final_team["id"]
            self.team_ids.append(final_team_id)
            print(f"✅ Step 7: Final team creation successful - ID {final_team_id}")
            
            # Immediately check if it exists
            response = requests.get(f"{API_URL}/teams/{final_team_id}", headers=headers)
            if response.status_code == 200:
                print(f"✅ Final team retrieval successful")
            else:
                print(f"🚨 BUG DETECTED: Final team disappeared immediately after creation!")
        else:
            print(f"🚨 BUG DETECTED: Cannot create new teams after workflow! Status: {response.status_code}")
            print(f"   Response: {response.text}")
        
        # Final summary
        print(f"\n📊 BUG INVESTIGATION SUMMARY:")
        print(f"   - Total teams created: {len(self.team_ids)}")
        print(f"   - Teams in user list: {len(user_teams) if 'user_teams' in locals() else 'Unknown'}")
        print(f"   - Occupied save slots: {len(occupied_slots) if 'occupied_slots' in locals() else 'Unknown'}")
        print(f"   - Disappeared teams: {len(disappeared_teams) if 'disappeared_teams' in locals() else 0}")
        
        if disappeared_teams or actual_team_count < expected_team_count:
            print(f"🚨 CRITICAL BUG CONFIRMED: Teams are disappearing!")
        else:
            print(f"✅ No team disappearing bug detected in this test run")

def run_team_disappearing_bug_test():
    """Run the team disappearing bug test suite"""
    print("🔍 STARTING CRITICAL BUG INVESTIGATION: Teams Disappearing Issue")
    print("=" * 80)
    
    # Create test suite
    suite = unittest.TestLoader().loadTestsFromTestCase(TeamDisappearingBugTest)
    
    # Run tests with detailed output
    runner = unittest.TextTestRunner(verbosity=2, stream=None)
    result = runner.run(suite)
    
    print("\n" + "=" * 80)
    print("🔍 BUG INVESTIGATION COMPLETE")
    print(f"Tests run: {result.testsRun}")
    print(f"Failures: {len(result.failures)}")
    print(f"Errors: {len(result.errors)}")
    
    if result.failures:
        print("\n🚨 FAILURES DETECTED:")
        for test, traceback in result.failures:
            print(f"   - {test}: {traceback}")
    
    if result.errors:
        print("\n🚨 ERRORS DETECTED:")
        for test, traceback in result.errors:
            print(f"   - {test}: {traceback}")
    
    if result.wasSuccessful():
        print("\n✅ All tests passed - No critical bugs detected in this run")
    else:
        print("\n🚨 Issues detected - Check failures and errors above")
    
    return result

if __name__ == "__main__":
    run_team_disappearing_bug_test()