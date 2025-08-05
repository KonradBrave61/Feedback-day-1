#!/usr/bin/env python3
"""
Focused test suite for Save Team Slots Fix and Team Loading from Profile functionality
Testing the specific fixes mentioned in the review request:
1. Save Team Slots Fix - 5 default slots with "Create New Save Slot" button below
2. Team Loading from Profile - "Edit in Builder" loads team data properly
3. Backend API Verification for save slots and team loading APIs
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

print(f"Testing Save Slots & Team Loading APIs at: {API_URL}")

def generate_random_string(length=8):
    """Generate a random string of fixed length"""
    letters = string.ascii_lowercase
    return ''.join(random.choice(letters) for i in range(length))

class SaveSlotsTeamLoadingTest(unittest.TestCase):
    """Test suite for Save Slots and Team Loading functionality"""
    
    def setUp(self):
        """Set up test data"""
        # Generate unique username and email for testing
        random_suffix = generate_random_string()
        self.test_username = f"saveslots_{random_suffix}"
        self.test_email = f"saveslots_{random_suffix}@example.com"
        self.test_password = "SaveSlots123!"
        
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
            "bio": "Testing save slots and team loading"
        }
        
        # Store auth token and IDs
        self.auth_token = None
        self.user_id = None
        self.team_ids = []
        
        # Register user and get auth token
        self._setup_authentication()
    
    def _setup_authentication(self):
        """Set up authentication for tests"""
        # Register user
        response = requests.post(f"{API_URL}/auth/register", json=self.user_data)
        if response.status_code == 200:
            data = response.json()
            self.auth_token = data["access_token"]
            self.user_id = data["user"]["id"]
            print(f"✅ Authentication setup complete - User ID: {self.user_id}")
        else:
            print(f"❌ Authentication setup failed: {response.status_code} - {response.text}")
    
    def test_01_get_save_slots_endpoint(self):
        """Test GET /api/save-slots endpoint returns 5 default slots properly"""
        if not self.auth_token:
            self.skipTest("No auth token available")
        
        headers = {"Authorization": f"Bearer {self.auth_token}"}
        response = requests.get(f"{API_URL}/save-slots", headers=headers)
        
        print(f"GET /api/save-slots response: {response.status_code}")
        if response.status_code != 200:
            print(f"Response text: {response.text}")
        
        self.assertEqual(response.status_code, 200)
        data = response.json()
        
        # Check response structure
        self.assertIn("save_slots", data)
        self.assertIsInstance(data["save_slots"], list)
        
        # Check that we have exactly 5 slots
        self.assertEqual(len(data["save_slots"]), 5, "Should have exactly 5 save slots")
        
        # Check slot structure for each slot
        for i, slot in enumerate(data["save_slots"], 1):
            self.assertIn("slot_number", slot)
            self.assertIn("slot_name", slot)
            self.assertIn("is_occupied", slot)
            self.assertIn("team_id", slot)
            self.assertIn("team_name", slot)
            
            # Verify slot number is correct
            self.assertEqual(slot["slot_number"], i)
            
            # Initially all slots should be unoccupied
            self.assertFalse(slot["is_occupied"], f"Slot {i} should initially be unoccupied")
            self.assertIsNone(slot["team_id"], f"Slot {i} should have no team_id initially")
            self.assertIsNone(slot["team_name"], f"Slot {i} should have no team_name initially")
        
        print("✅ GET /api/save-slots endpoint working correctly - 5 default slots returned")
        return data["save_slots"]
    
    def test_02_create_team_for_testing(self):
        """Create a test team for save slot testing"""
        if not self.auth_token:
            self.skipTest("No auth token available")
        
        headers = {"Authorization": f"Bearer {self.auth_token}"}
        
        # Get formations, tactics, and coaches for team creation
        formations_response = requests.get(f"{API_URL}/teams/formations/")
        tactics_response = requests.get(f"{API_URL}/teams/tactics/")
        coaches_response = requests.get(f"{API_URL}/teams/coaches/")
        
        if formations_response.status_code != 200 or tactics_response.status_code != 200 or coaches_response.status_code != 200:
            self.skipTest("Cannot get formations, tactics, or coaches data")
        
        formations = formations_response.json()
        tactics = tactics_response.json()
        coaches = coaches_response.json()
        
        if not formations or not tactics or not coaches:
            self.skipTest("No formations, tactics, or coaches available")
        
        # Create comprehensive team data with correct structure (full objects, not IDs)
        team_data = {
            "name": f"Save Slot Test Team {generate_random_string()}",
            "formation": formations[0]["id"],
            "players": [
                {
                    "character_id": "char_001",  # Mock character ID
                    "position_id": "gk",
                    "user_level": 50,
                    "user_rarity": "Epic",
                    "user_equipment": {
                        "boots": "eq_001",
                        "bracelets": "eq_002",
                        "pendants": "eq_003"
                    },
                    "user_hissatsu": [
                        {
                            "id": "tech_001",
                            "name": "God Hand",
                            "type": "Save",
                            "element": "Earth"
                        }
                    ]
                }
            ],
            "bench_players": [
                {
                    "character_id": "char_002",
                    "position_id": "fw",
                    "user_level": 45,
                    "user_rarity": "Rare",
                    "user_equipment": {
                        "boots": "eq_004",
                        "bracelets": None,
                        "pendants": "eq_005"
                    },
                    "user_hissatsu": [
                        {
                            "id": "tech_002",
                            "name": "Fire Tornado",
                            "type": "Shot",
                            "element": "Fire"
                        }
                    ]
                }
            ],
            "tactics": [tactics[0], tactics[1] if len(tactics) > 1 else tactics[0]],  # Full objects
            "coach": coaches[0],  # Full object
            "description": "Comprehensive test team with all data types",
            "is_public": True,
            "tags": ["test", "saveslots", "comprehensive"]
        }
        
        # Create team
        response = requests.post(f"{API_URL}/teams", json=team_data, headers=headers)
        
        print(f"POST /api/teams response: {response.status_code}")
        if response.status_code != 200:
            print(f"Response text: {response.text}")
        
        self.assertEqual(response.status_code, 200)
        team = response.json()
        self.assertIn("id", team)
        self.team_ids.append(team["id"])
        
        print(f"✅ Test team created successfully with ID: {team['id']}")
        return team["id"]
    
    def test_03_save_team_to_slot(self):
        """Test POST /api/teams endpoint for saving teams to slots"""
        if not self.auth_token:
            self.skipTest("No auth token available")
        
        # Create a team first
        team_id = self.test_02_create_team_for_testing()
        
        headers = {"Authorization": f"Bearer {self.auth_token}"}
        
        # Save team to slot 1
        slot_data = {
            "slot_number": 1,
            "slot_name": "My Awesome Team",
            "overwrite": True
        }
        
        response = requests.post(f"{API_URL}/teams/{team_id}/save-to-slot", json=slot_data, headers=headers)
        
        print(f"POST /api/teams/{team_id}/save-to-slot response: {response.status_code}")
        if response.status_code != 200:
            print(f"Response text: {response.text}")
        
        self.assertEqual(response.status_code, 200)
        data = response.json()
        
        # Check response
        self.assertIn("message", data)
        self.assertEqual(data["message"], "Team saved to slot successfully")
        
        # Verify the team is now in the slot by checking save-slots endpoint
        slots_response = requests.get(f"{API_URL}/save-slots", headers=headers)
        self.assertEqual(slots_response.status_code, 200)
        slots_data = slots_response.json()
        
        slot_1 = next((slot for slot in slots_data["save_slots"] if slot["slot_number"] == 1), None)
        self.assertIsNotNone(slot_1, "Slot 1 should exist")
        self.assertTrue(slot_1["is_occupied"], "Slot 1 should now be occupied")
        self.assertEqual(slot_1["team_id"], team_id, "Slot 1 should contain the correct team ID")
        self.assertEqual(slot_1["slot_name"], "My Awesome Team", "Slot 1 should have the correct custom name")
        
        print("✅ Team saving to slot working correctly")
        return team_id
    
    def test_04_get_team_details_endpoint(self):
        """Test GET /api/teams/{team_id}/details endpoint for loading team details"""
        if not self.auth_token:
            self.skipTest("No auth token available")
        
        # Use the team created in previous test
        if not self.team_ids:
            team_id = self.test_03_save_team_to_slot()
        else:
            team_id = self.team_ids[0]
        
        headers = {"Authorization": f"Bearer {self.auth_token}"}
        response = requests.get(f"{API_URL}/teams/{team_id}/details", headers=headers)
        
        print(f"GET /api/teams/{team_id}/details response: {response.status_code}")
        if response.status_code != 200:
            print(f"Response text: {response.text}")
        
        self.assertEqual(response.status_code, 200)
        data = response.json()
        
        # Check response structure for team loading
        self.assertIn("team", data)
        team = data["team"]
        
        # Verify all essential team data is present for Team Builder loading
        self.assertIn("id", team)
        self.assertIn("name", team)
        self.assertIn("formation", team)
        self.assertIn("players", team)
        self.assertIn("bench_players", team)
        self.assertIn("tactics", team)
        self.assertIn("coach", team)
        
        # Verify players array structure
        if team["players"]:
            player = team["players"][0]
            self.assertIn("character_id", player)
            self.assertIn("position_id", player)
            self.assertIn("user_level", player)
            self.assertIn("user_rarity", player)
            self.assertIn("user_equipment", player)
            self.assertIn("user_hissatsu", player)
            
            # Verify equipment structure
            equipment = player["user_equipment"]
            self.assertIsInstance(equipment, dict)
            self.assertIn("boots", equipment)
            self.assertIn("bracelets", equipment)
            self.assertIn("pendants", equipment)
            
            # Verify techniques structure
            techniques = player["user_hissatsu"]
            self.assertIsInstance(techniques, list)
            if techniques:
                technique = techniques[0]
                self.assertIn("id", technique)
                self.assertIn("name", technique)
                self.assertIn("type", technique)
        
        # Verify bench players array structure
        if team["bench_players"]:
            bench_player = team["bench_players"][0]
            self.assertIn("character_id", bench_player)
            self.assertIn("user_equipment", bench_player)
            self.assertIn("user_hissatsu", bench_player)
        
        # Verify tactics array structure
        self.assertIsInstance(team["tactics"], list)
        if team["tactics"]:
            # Tactics should be full objects or IDs
            tactic = team["tactics"][0]
            self.assertTrue(isinstance(tactic, (str, dict)))
        
        # Verify coach structure
        if team["coach"]:
            # Coach should be full object or ID
            self.assertTrue(isinstance(team["coach"], (str, dict)))
        
        print("✅ GET /api/teams/{team_id}/details endpoint working correctly - all team data present")
        return data
    
    def test_05_team_saving_workflow_end_to_end(self):
        """Test complete team saving workflow from start to finish"""
        if not self.auth_token:
            self.skipTest("No auth token available")
        
        headers = {"Authorization": f"Bearer {self.auth_token}"}
        
        print("🔄 Testing complete team saving workflow...")
        
        # Step 1: Get initial save slots state
        slots_response = requests.get(f"{API_URL}/save-slots", headers=headers)
        self.assertEqual(slots_response.status_code, 200)
        initial_slots = slots_response.json()["save_slots"]
        
        # Verify all slots are initially empty
        for slot in initial_slots:
            self.assertFalse(slot["is_occupied"], f"Slot {slot['slot_number']} should be initially empty")
        
        print("✅ Step 1: Initial save slots verified (all empty)")
        
        # Step 2: Create multiple teams
        team_ids = []
        for i in range(3):
            team_data = {
                "name": f"Workflow Test Team {i+1}",
                "formation": "1",  # Assuming formation ID 1 exists
                "players": [],
                "bench_players": [],
                "tactics": [],
                "coach": None,
                "description": f"Workflow test team number {i+1}",
                "is_public": False,
                "tags": ["workflow", "test"]
            }
            
            response = requests.post(f"{API_URL}/teams", json=team_data, headers=headers)
            if response.status_code == 200:
                team = response.json()
                team_ids.append(team["id"])
        
        self.assertGreater(len(team_ids), 0, "Should have created at least one team")
        print(f"✅ Step 2: Created {len(team_ids)} test teams")
        
        # Step 3: Save teams to different slots
        for i, team_id in enumerate(team_ids[:3]):  # Save up to 3 teams
            slot_data = {
                "slot_number": i + 1,
                "slot_name": f"Workflow Slot {i + 1}",
                "overwrite": True
            }
            
            response = requests.post(f"{API_URL}/teams/{team_id}/save-to-slot", json=slot_data, headers=headers)
            self.assertEqual(response.status_code, 200, f"Should save team to slot {i + 1}")
        
        print("✅ Step 3: Teams saved to slots successfully")
        
        # Step 4: Verify save slots are now occupied
        slots_response = requests.get(f"{API_URL}/save-slots", headers=headers)
        self.assertEqual(slots_response.status_code, 200)
        updated_slots = slots_response.json()["save_slots"]
        
        # Check first 3 slots are occupied, last 2 are empty
        for i in range(5):
            slot = updated_slots[i]
            if i < len(team_ids):
                self.assertTrue(slot["is_occupied"], f"Slot {i+1} should be occupied")
                self.assertIsNotNone(slot["team_id"], f"Slot {i+1} should have team_id")
                self.assertEqual(slot["slot_name"], f"Workflow Slot {i+1}", f"Slot {i+1} should have correct name")
            else:
                self.assertFalse(slot["is_occupied"], f"Slot {i+1} should remain empty")
        
        print("✅ Step 4: Save slots state verified after saving")
        
        # Step 5: Test overwriting a slot
        if len(team_ids) > 1:
            overwrite_data = {
                "slot_number": 1,
                "slot_name": "Overwritten Slot",
                "overwrite": True
            }
            
            response = requests.post(f"{API_URL}/teams/{team_ids[1]}/save-to-slot", json=overwrite_data, headers=headers)
            self.assertEqual(response.status_code, 200, "Should overwrite slot 1")
            
            # Verify slot 1 now contains the second team
            slots_response = requests.get(f"{API_URL}/save-slots", headers=headers)
            updated_slots = slots_response.json()["save_slots"]
            slot_1 = updated_slots[0]
            
            self.assertEqual(slot_1["team_id"], team_ids[1], "Slot 1 should contain second team after overwrite")
            self.assertEqual(slot_1["slot_name"], "Overwritten Slot", "Slot 1 should have new name")
        
        print("✅ Step 5: Slot overwriting working correctly")
        print("✅ Complete team saving workflow verified successfully")
    
    def test_06_team_loading_workflow_from_profile(self):
        """Test team loading workflow from Profile to Team Builder"""
        if not self.auth_token:
            self.skipTest("No auth token available")
        
        headers = {"Authorization": f"Bearer {self.auth_token}"}
        
        print("🔄 Testing team loading workflow from Profile to Team Builder...")
        
        # Step 1: Get user's teams (simulating Profile Page)
        response = requests.get(f"{API_URL}/teams", headers=headers)
        self.assertEqual(response.status_code, 200)
        user_teams = response.json()
        
        if not user_teams:
            # Create a team if none exists
            team_id = self.test_02_create_team_for_testing()
            user_teams = [{"id": team_id}]
        
        self.assertGreater(len(user_teams), 0, "User should have at least one team")
        print(f"✅ Step 1: Found {len(user_teams)} user teams")
        
        # Step 2: Get team details for "Edit in Builder" functionality
        team_id = user_teams[0]["id"]
        response = requests.get(f"{API_URL}/teams/{team_id}/details", headers=headers)
        self.assertEqual(response.status_code, 200)
        team_details = response.json()
        
        # Verify all data needed for Team Builder is present
        team = team_details["team"]
        required_fields = ["id", "name", "formation", "players", "bench_players", "tactics", "coach"]
        
        for field in required_fields:
            self.assertIn(field, team, f"Team details should include {field}")
        
        print("✅ Step 2: Team details retrieved with all required fields")
        
        # Step 3: Verify player data integrity for Team Builder loading
        if team["players"]:
            player = team["players"][0]
            player_required_fields = ["character_id", "position_id", "user_level", "user_rarity", "user_equipment", "user_hissatsu"]
            
            for field in player_required_fields:
                self.assertIn(field, player, f"Player data should include {field}")
            
            # Verify equipment data structure
            equipment = player["user_equipment"]
            self.assertIsInstance(equipment, dict, "Equipment should be a dictionary")
            equipment_slots = ["boots", "bracelets", "pendants"]
            for slot in equipment_slots:
                self.assertIn(slot, equipment, f"Equipment should have {slot} slot")
            
            # Verify techniques data structure
            techniques = player["user_hissatsu"]
            self.assertIsInstance(techniques, list, "Techniques should be a list")
            
            print("✅ Step 3: Player data integrity verified for Team Builder")
        
        # Step 4: Verify bench player data integrity
        if team["bench_players"]:
            bench_player = team["bench_players"][0]
            bench_required_fields = ["character_id", "user_equipment", "user_hissatsu"]
            
            for field in bench_required_fields:
                self.assertIn(field, bench_player, f"Bench player data should include {field}")
            
            print("✅ Step 4: Bench player data integrity verified")
        
        # Step 5: Verify tactics and coach data
        self.assertIsInstance(team["tactics"], list, "Tactics should be a list")
        if team["coach"]:
            self.assertTrue(isinstance(team["coach"], (str, dict)), "Coach should be ID or object")
        
        print("✅ Step 5: Tactics and coach data verified")
        print("✅ Team loading workflow from Profile to Team Builder verified successfully")
    
    def test_07_save_slots_api_comprehensive_verification(self):
        """Comprehensive verification of save slots APIs"""
        if not self.auth_token:
            self.skipTest("No auth token available")
        
        headers = {"Authorization": f"Bearer {self.auth_token}"}
        
        print("🔄 Comprehensive save slots API verification...")
        
        # Test 1: GET /api/save-slots structure and data
        response = requests.get(f"{API_URL}/save-slots", headers=headers)
        self.assertEqual(response.status_code, 200)
        data = response.json()
        
        # Verify response structure
        self.assertIn("save_slots", data)
        slots = data["save_slots"]
        self.assertEqual(len(slots), 5, "Should have exactly 5 save slots")
        
        # Verify each slot structure
        for i, slot in enumerate(slots, 1):
            required_fields = ["slot_number", "slot_name", "is_occupied", "team_id", "team_name"]
            for field in required_fields:
                self.assertIn(field, slot, f"Slot {i} should have {field}")
            
            self.assertEqual(slot["slot_number"], i, f"Slot should have correct number {i}")
            self.assertIsInstance(slot["is_occupied"], bool, f"Slot {i} is_occupied should be boolean")
        
        print("✅ Save slots structure verification passed")
        
        # Test 2: Authentication enforcement
        response = requests.get(f"{API_URL}/save-slots")  # No auth header
        self.assertEqual(response.status_code, 403, "Should reject unauthenticated requests")
        
        print("✅ Save slots authentication enforcement verified")
        
        # Test 3: Invalid token handling
        invalid_headers = {"Authorization": "Bearer invalid_token"}
        response = requests.get(f"{API_URL}/save-slots", headers=invalid_headers)
        self.assertIn(response.status_code, [401, 403], "Should reject invalid tokens")
        
        print("✅ Save slots invalid token handling verified")
        print("✅ Comprehensive save slots API verification completed")
    
    def test_08_team_loading_api_comprehensive_verification(self):
        """Comprehensive verification of team loading APIs"""
        if not self.auth_token:
            self.skipTest("No auth token available")
        
        headers = {"Authorization": f"Bearer {self.auth_token}"}
        
        print("🔄 Comprehensive team loading API verification...")
        
        # Ensure we have a team to test with
        if not self.team_ids:
            team_id = self.test_02_create_team_for_testing()
        else:
            team_id = self.team_ids[0]
        
        # Test 1: GET /api/teams/{team_id}/details response structure
        response = requests.get(f"{API_URL}/teams/{team_id}/details", headers=headers)
        self.assertEqual(response.status_code, 200)
        data = response.json()
        
        # Verify top-level structure
        required_top_level = ["team", "is_liked", "is_following", "can_rate"]
        for field in required_top_level:
            self.assertIn(field, data, f"Response should include {field}")
        
        # Verify team object structure
        team = data["team"]
        required_team_fields = ["id", "name", "formation", "players", "bench_players", "tactics", "coach"]
        for field in required_team_fields:
            self.assertIn(field, team, f"Team object should include {field}")
        
        print("✅ Team details response structure verified")
        
        # Test 2: Authentication enforcement for team details
        response = requests.get(f"{API_URL}/teams/{team_id}/details")  # No auth
        self.assertEqual(response.status_code, 403, "Should reject unauthenticated requests")
        
        print("✅ Team details authentication enforcement verified")
        
        # Test 3: Non-existent team handling
        fake_team_id = "non_existent_team_id"
        response = requests.get(f"{API_URL}/teams/{fake_team_id}/details", headers=headers)
        self.assertEqual(response.status_code, 404, "Should return 404 for non-existent team")
        
        print("✅ Non-existent team handling verified")
        
        # Test 4: GET /api/teams (user teams) functionality
        response = requests.get(f"{API_URL}/teams", headers=headers)
        self.assertEqual(response.status_code, 200)
        user_teams = response.json()
        self.assertIsInstance(user_teams, list, "User teams should be a list")
        
        if user_teams:
            team = user_teams[0]
            basic_fields = ["id", "name", "user_id"]
            for field in basic_fields:
                self.assertIn(field, team, f"User team should include {field}")
        
        print("✅ User teams endpoint verified")
        print("✅ Comprehensive team loading API verification completed")

def run_save_slots_team_loading_tests():
    """Run the save slots and team loading tests"""
    print("=" * 80)
    print("SAVE SLOTS & TEAM LOADING API TESTING")
    print("=" * 80)
    
    # Create test suite
    suite = unittest.TestLoader().loadTestsFromTestCase(SaveSlotsTeamLoadingTest)
    
    # Run tests
    runner = unittest.TextTestRunner(verbosity=2)
    result = runner.run(suite)
    
    # Print summary
    print("\n" + "=" * 80)
    print("SAVE SLOTS & TEAM LOADING TEST SUMMARY")
    print("=" * 80)
    
    total_tests = result.testsRun
    failures = len(result.failures)
    errors = len(result.errors)
    success_count = total_tests - failures - errors
    
    print(f"Total Tests: {total_tests}")
    print(f"Successful: {success_count}")
    print(f"Failures: {failures}")
    print(f"Errors: {errors}")
    
    if failures > 0:
        print("\nFAILURES:")
        for test, traceback in result.failures:
            print(f"- {test}: {traceback}")
    
    if errors > 0:
        print("\nERRORS:")
        for test, traceback in result.errors:
            print(f"- {test}: {traceback}")
    
    success_rate = (success_count / total_tests) * 100 if total_tests > 0 else 0
    print(f"\nSuccess Rate: {success_rate:.1f}%")
    
    if success_rate == 100:
        print("🎉 ALL SAVE SLOTS & TEAM LOADING TESTS PASSED!")
    elif success_rate >= 80:
        print("⚠️  Most tests passed, but some issues found")
    else:
        print("❌ Significant issues found in save slots or team loading functionality")
    
    return result

if __name__ == "__main__":
    run_save_slots_team_loading_tests()