#!/usr/bin/env python3
"""
Focused test for Load Team Modal functionality APIs
Testing specific endpoints mentioned in the review request:
1. GET /api/teams/{team_id}/details - crucial for Load Team functionality
2. GET /api/save-slots - for loading saved teams
3. GET /api/community/teams - for loading community teams
4. Basic team CRUD operations for new load functionality
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

print(f"Testing Load Team APIs at: {API_URL}")

def generate_random_string(length=8):
    """Generate a random string of fixed length"""
    letters = string.ascii_lowercase
    return ''.join(random.choice(letters) for i in range(length))

class LoadTeamAPITest(unittest.TestCase):
    """Test suite for Load Team Modal functionality APIs"""
    
    def setUp(self):
        """Set up test data"""
        # Generate unique username and email for testing
        random_suffix = generate_random_string()
        self.test_username = f"loadteam_{random_suffix}"
        self.test_email = f"loadteam_{random_suffix}@example.com"
        self.test_password = "LoadTeam123!"
        
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
            "bio": "Load Team functionality tester"
        }
        
        # Team creation data
        self.team_data = {
            "name": f"Load Test Team {random_suffix}",
            "formation": "4-3-3",
            "players": [],
            "bench_players": [],
            "tactics": [],
            "coach": None,
            "description": "A test team for Load Team Modal functionality testing",
            "is_public": True,
            "tags": ["loadtest", "modal", "functionality"]
        }
        
        # Store auth token and IDs
        self.auth_token = None
        self.user_id = None
        self.team_id = None
    
    def test_01_setup_authentication(self):
        """Set up authentication for Load Team tests"""
        # Register user
        response = requests.post(f"{API_URL}/auth/register", json=self.user_data)
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.auth_token = data["access_token"]
        self.user_id = data["user"]["id"]
        print(f"✅ Load Team user registered with ID: {self.user_id}")
    
    def test_02_create_test_team(self):
        """Create a test team for Load Team functionality testing"""
        if not self.auth_token:
            self.skipTest("No auth token available")
        
        headers = {"Authorization": f"Bearer {self.auth_token}"}
        response = requests.post(f"{API_URL}/teams", json=self.team_data, headers=headers)
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIn("id", data)
        self.assertEqual(data["name"], self.team_data["name"])
        
        # Store team ID for subsequent tests
        self.team_id = data["id"]
        print(f"✅ Test team created for Load Team functionality with ID: {self.team_id}")
    
    def test_03_team_details_endpoint(self):
        """Test GET /api/teams/{team_id}/details - CRUCIAL for Load Team functionality"""
        if not self.auth_token or not self.team_id:
            self.skipTest("No auth token or team ID available")
        
        headers = {"Authorization": f"Bearer {self.auth_token}"}
        response = requests.get(f"{API_URL}/teams/{self.team_id}/details", headers=headers)
        self.assertEqual(response.status_code, 200)
        data = response.json()
        
        # Check response structure for Load Team Modal
        self.assertIn("team", data)
        self.assertIn("is_liked", data)
        self.assertIn("is_following", data)
        self.assertIn("can_rate", data)
        
        # Check team structure has all required fields for loading
        team = data["team"]
        self.assertIn("id", team)
        self.assertIn("name", team)
        self.assertIn("formation", team)
        self.assertIn("players", team)
        self.assertIn("bench_players", team)
        self.assertIn("tactics", team)
        self.assertIn("coach", team)
        self.assertIn("description", team)
        self.assertIn("is_public", team)
        self.assertIn("tags", team)
        self.assertIn("likes", team)
        self.assertIn("views", team)
        self.assertIn("rating", team)
        self.assertIn("username", team)
        self.assertIn("user_avatar", team)
        
        # Check boolean fields for Load Team Modal interaction
        self.assertIsInstance(data["is_liked"], bool)
        self.assertIsInstance(data["is_following"], bool)
        self.assertIsInstance(data["can_rate"], bool)
        
        # Owner can't rate their own team
        self.assertFalse(data["can_rate"])
        
        print("✅ GET /api/teams/{team_id}/details endpoint working - CRUCIAL for Load Team functionality")
    
    def test_04_save_slots_endpoint(self):
        """Test GET /api/save-slots - for loading saved teams"""
        if not self.auth_token:
            self.skipTest("No auth token available")
        
        headers = {"Authorization": f"Bearer {self.auth_token}"}
        response = requests.get(f"{API_URL}/save-slots", headers=headers)
        self.assertEqual(response.status_code, 200)
        data = response.json()
        
        # Check response structure for Load Team Modal
        self.assertIn("save_slots", data)
        self.assertIsInstance(data["save_slots"], list)
        
        # Check that we have 5 slots as expected
        self.assertEqual(len(data["save_slots"]), 5)
        
        # Check slot structure for Load Team Modal
        for slot in data["save_slots"]:
            self.assertIn("slot_number", slot)
            self.assertIn("slot_name", slot)
            self.assertIn("is_occupied", slot)
            self.assertIn("team_id", slot)
            self.assertIn("team_name", slot)
            
            # Verify slot number is valid
            self.assertIn(slot["slot_number"], [1, 2, 3, 4, 5])
            
            # Verify boolean field
            self.assertIsInstance(slot["is_occupied"], bool)
        
        print("✅ GET /api/save-slots endpoint working - for loading saved teams in Load Team Modal")
    
    def test_05_save_team_to_slot(self):
        """Test saving team to slot for Load Team functionality"""
        if not self.auth_token or not self.team_id:
            self.skipTest("No auth token or team ID available")
        
        headers = {"Authorization": f"Bearer {self.auth_token}"}
        
        # Save team to slot 1
        slot_data = {
            "slot_number": 1,
            "slot_name": "Load Test Slot",
            "overwrite": True
        }
        
        response = requests.post(f"{API_URL}/teams/{self.team_id}/save-to-slot", json=slot_data, headers=headers)
        self.assertEqual(response.status_code, 200)
        data = response.json()
        
        # Check response
        self.assertIn("message", data)
        self.assertEqual(data["message"], "Team saved to slot successfully")
        
        # Verify the team is now in the slot by checking save-slots endpoint
        slots_response = requests.get(f"{API_URL}/save-slots", headers=headers)
        slots_data = slots_response.json()
        
        slot_1 = next((slot for slot in slots_data["save_slots"] if slot["slot_number"] == 1), None)
        self.assertIsNotNone(slot_1)
        self.assertTrue(slot_1["is_occupied"])
        self.assertEqual(slot_1["team_id"], self.team_id)
        self.assertEqual(slot_1["slot_name"], "Load Test Slot")
        
        print("✅ Save team to slot functionality working - enables Load Team from saved slots")
    
    def test_06_community_teams_endpoint(self):
        """Test GET /api/community/teams - for loading community teams"""
        if not self.auth_token:
            self.skipTest("No auth token available")
        
        headers = {"Authorization": f"Bearer {self.auth_token}"}
        
        # Test basic community teams endpoint
        response = requests.get(f"{API_URL}/community/teams", headers=headers)
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIsInstance(data, list)
        
        # Check that our test team appears in community teams (since it's public)
        team_found = False
        for team in data:
            if team["id"] == self.team_id:
                team_found = True
                # Verify team structure for Load Team Modal
                self.assertIn("id", team)
                self.assertIn("name", team)
                self.assertIn("formation", team)
                self.assertIn("description", team)
                self.assertIn("is_public", team)
                self.assertIn("tags", team)
                self.assertIn("likes", team)
                self.assertIn("views", team)
                self.assertIn("rating", team)
                self.assertIn("username", team)
                self.assertIn("user_avatar", team)
                break
        
        self.assertTrue(team_found, "Test team should appear in community teams")
        
        # Test with search parameter for Load Team Modal filtering
        response = requests.get(f"{API_URL}/community/teams?search=Load", headers=headers)
        self.assertEqual(response.status_code, 200)
        search_data = response.json()
        self.assertIsInstance(search_data, list)
        
        # Test with formation filter for Load Team Modal filtering
        response = requests.get(f"{API_URL}/community/teams?formation=4-3-3", headers=headers)
        self.assertEqual(response.status_code, 200)
        formation_data = response.json()
        self.assertIsInstance(formation_data, list)
        
        # Test with sort_by parameter for Load Team Modal sorting
        response = requests.get(f"{API_URL}/community/teams?sort_by=likes", headers=headers)
        self.assertEqual(response.status_code, 200)
        sorted_data = response.json()
        self.assertIsInstance(sorted_data, list)
        
        # Test with limit and offset for Load Team Modal pagination
        response = requests.get(f"{API_URL}/community/teams?limit=5&offset=0", headers=headers)
        self.assertEqual(response.status_code, 200)
        paginated_data = response.json()
        self.assertIsInstance(paginated_data, list)
        self.assertLessEqual(len(paginated_data), 5)
        
        print("✅ GET /api/community/teams endpoint working - for loading community teams in Load Team Modal")
    
    def test_07_basic_team_crud_for_load_functionality(self):
        """Test basic team CRUD operations for new load functionality"""
        if not self.auth_token:
            self.skipTest("No auth token available")
        
        headers = {"Authorization": f"Bearer {self.auth_token}"}
        
        # Test GET /api/teams - loading user's teams
        response = requests.get(f"{API_URL}/teams", headers=headers)
        self.assertEqual(response.status_code, 200)
        teams = response.json()
        self.assertIsInstance(teams, list)
        
        # Verify our test team is in the list
        team_found = False
        for team in teams:
            if team["id"] == self.team_id:
                team_found = True
                # Verify team structure for Load Team functionality
                self.assertIn("id", team)
                self.assertIn("name", team)
                self.assertIn("formation", team)
                self.assertIn("description", team)
                self.assertIn("is_public", team)
                self.assertIn("tags", team)
                self.assertIn("likes", team)
                self.assertIn("views", team)
                self.assertIn("rating", team)
                break
        
        self.assertTrue(team_found, "Test team should appear in user's teams")
        
        # Test GET /api/teams/{team_id} - loading specific team
        response = requests.get(f"{API_URL}/teams/{self.team_id}", headers=headers)
        self.assertEqual(response.status_code, 200)
        team = response.json()
        self.assertEqual(team["id"], self.team_id)
        self.assertEqual(team["name"], self.team_data["name"])
        
        # Verify all fields needed for Load Team functionality
        self.assertIn("formation", team)
        self.assertIn("players", team)
        self.assertIn("bench_players", team)
        self.assertIn("tactics", team)
        self.assertIn("coach", team)
        self.assertIn("description", team)
        self.assertIn("is_public", team)
        self.assertIn("tags", team)
        
        # Test PUT /api/teams/{team_id} - updating team after loading
        update_data = {
            "name": f"Updated Load Test Team {generate_random_string()}",
            "description": "Updated description for Load Team functionality",
            "is_public": False  # Test privacy toggle
        }
        
        response = requests.put(f"{API_URL}/teams/{self.team_id}", json=update_data, headers=headers)
        self.assertEqual(response.status_code, 200)
        updated_team = response.json()
        self.assertEqual(updated_team["id"], self.team_id)
        self.assertEqual(updated_team["name"], update_data["name"])
        self.assertEqual(updated_team["description"], update_data["description"])
        self.assertEqual(updated_team["is_public"], update_data["is_public"])
        
        print("✅ Basic team CRUD operations working - supports Load Team functionality")
    
    def test_08_team_view_increment(self):
        """Test team view increment for Load Team Modal"""
        if not self.auth_token or not self.team_id:
            self.skipTest("No auth token or team ID available")
        
        headers = {"Authorization": f"Bearer {self.auth_token}"}
        
        # Get initial view count
        team_response = requests.get(f"{API_URL}/teams/{self.team_id}", headers=headers)
        initial_views = team_response.json()["views"]
        
        # View the team (simulating Load Team Modal view)
        response = requests.get(f"{API_URL}/teams/{self.team_id}/view", headers=headers)
        self.assertEqual(response.status_code, 200)
        data = response.json()
        
        # Check that view count increased
        self.assertEqual(data["views"], initial_views + 1)
        
        print("✅ Team view increment working - tracks Load Team Modal usage")
    
    def test_09_team_interaction_endpoints(self):
        """Test team interaction endpoints for Load Team Modal"""
        if not self.auth_token or not self.team_id:
            self.skipTest("No auth token or team ID available")
        
        headers = {"Authorization": f"Bearer {self.auth_token}"}
        
        # Test team like functionality (for Load Team Modal interactions)
        response = requests.post(f"{API_URL}/teams/{self.team_id}/like", headers=headers)
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIn("message", data)
        self.assertIn("liked", data)
        self.assertTrue(data["liked"])
        
        # Test team comment functionality (for Load Team Modal interactions)
        comment_data = {
            "content": "Great team for Load Team Modal testing!"
        }
        
        response = requests.post(f"{API_URL}/teams/{self.team_id}/comment", json=comment_data, headers=headers)
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIn("message", data)
        self.assertIn("comment", data)
        
        comment = data["comment"]
        self.assertEqual(comment["user_id"], self.user_id)
        self.assertEqual(comment["username"], self.test_username)
        self.assertEqual(comment["content"], comment_data["content"])
        
        print("✅ Team interaction endpoints working - supports Load Team Modal social features")
    
    def test_10_load_team_api_contract_verification(self):
        """Verify API contracts match frontend expectations for Load Team Modal"""
        if not self.auth_token or not self.team_id:
            self.skipTest("No auth token or team ID available")
        
        headers = {"Authorization": f"Bearer {self.auth_token}"}
        
        # Test team details endpoint contract
        response = requests.get(f"{API_URL}/teams/{self.team_id}/details", headers=headers)
        self.assertEqual(response.status_code, 200)
        details_data = response.json()
        
        # Verify contract matches frontend expectations
        required_fields = ["team", "is_liked", "is_following", "can_rate"]
        for field in required_fields:
            self.assertIn(field, details_data, f"Missing required field: {field}")
        
        # Verify team object has all required fields
        team = details_data["team"]
        team_required_fields = [
            "id", "name", "formation", "players", "bench_players", 
            "tactics", "coach", "description", "is_public", "tags",
            "likes", "views", "rating", "username", "user_avatar"
        ]
        for field in team_required_fields:
            self.assertIn(field, team, f"Missing required team field: {field}")
        
        # Test save slots endpoint contract
        response = requests.get(f"{API_URL}/save-slots", headers=headers)
        self.assertEqual(response.status_code, 200)
        slots_data = response.json()
        
        self.assertIn("save_slots", slots_data)
        self.assertEqual(len(slots_data["save_slots"]), 5)
        
        # Verify slot object contract
        slot_required_fields = ["slot_number", "slot_name", "is_occupied", "team_id", "team_name"]
        for slot in slots_data["save_slots"]:
            for field in slot_required_fields:
                self.assertIn(field, slot, f"Missing required slot field: {field}")
        
        # Test community teams endpoint contract
        response = requests.get(f"{API_URL}/community/teams", headers=headers)
        self.assertEqual(response.status_code, 200)
        community_data = response.json()
        
        self.assertIsInstance(community_data, list)
        if community_data:
            # Verify community team object contract
            community_team_required_fields = [
                "id", "name", "formation", "description", "is_public", 
                "tags", "likes", "views", "rating", "username", "user_avatar"
            ]
            for field in community_team_required_fields:
                self.assertIn(field, community_data[0], f"Missing required community team field: {field}")
        
        print("✅ Load Team API contracts verified - match frontend expectations")

def run_load_team_tests():
    """Run the Load Team API tests"""
    print("=" * 80)
    print("LOAD TEAM MODAL API TESTING")
    print("=" * 80)
    
    # Create test suite
    suite = unittest.TestLoader().loadTestsFromTestCase(LoadTeamAPITest)
    
    # Run tests
    runner = unittest.TextTestRunner(verbosity=2)
    result = runner.run(suite)
    
    # Print summary
    print("\n" + "=" * 80)
    print("LOAD TEAM API TEST SUMMARY")
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
    
    if success_rate >= 90:
        print("🎉 LOAD TEAM API TESTING: EXCELLENT RESULTS!")
    elif success_rate >= 75:
        print("✅ LOAD TEAM API TESTING: GOOD RESULTS!")
    elif success_rate >= 50:
        print("⚠️ LOAD TEAM API TESTING: NEEDS IMPROVEMENT")
    else:
        print("❌ LOAD TEAM API TESTING: CRITICAL ISSUES FOUND")
    
    return success_rate >= 90

if __name__ == "__main__":
    run_load_team_tests()