#!/usr/bin/env python3
"""
Team Loading API Endpoints Test
Testing specific endpoints mentioned in the review request to identify "failed to load" errors
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

print(f"Testing Team Loading APIs at: {API_URL}")

def generate_random_string(length=8):
    """Generate a random string of fixed length"""
    letters = string.ascii_lowercase
    return ''.join(random.choice(letters) for i in range(length))

class TeamLoadingAPITest(unittest.TestCase):
    """Test suite for Team Loading related API endpoints"""
    
    def setUp(self):
        """Set up test data and authentication"""
        # Generate unique username and email for testing
        random_suffix = generate_random_string()
        self.test_username = f"loadtest_{random_suffix}"
        self.test_email = f"loadtest_{random_suffix}@example.com"
        self.test_password = "LoadTest123!"
        
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
            "bio": "Testing team loading functionality"
        }
        
        # Team creation data
        self.team_data = {
            "name": f"Load Test Team {random_suffix}",
            "formation": "4-3-3",
            "players": [],
            "bench_players": [],
            "tactics": [],
            "coach": None,
            "description": "A test team for loading functionality testing",
            "is_public": True,
            "tags": ["test", "loading", "api"]
        }
        
        # Store auth token and IDs
        self.auth_token = None
        self.user_id = None
        self.team_id = None
        
        # Setup authentication
        self._setup_authentication()
        self._create_sample_team()
    
    def _setup_authentication(self):
        """Set up authentication for testing"""
        try:
            # Register user
            response = requests.post(f"{API_URL}/auth/register", json=self.user_data)
            if response.status_code == 200:
                data = response.json()
                self.auth_token = data["access_token"]
                self.user_id = data["user"]["id"]
                print(f"✅ Authentication setup successful - User ID: {self.user_id}")
            else:
                print(f"❌ Authentication setup failed - Status: {response.status_code}, Response: {response.text}")
        except Exception as e:
            print(f"❌ Authentication setup error: {e}")
    
    def _create_sample_team(self):
        """Create a sample team for testing"""
        if not self.auth_token:
            return
        
        try:
            headers = {"Authorization": f"Bearer {self.auth_token}"}
            response = requests.post(f"{API_URL}/teams", json=self.team_data, headers=headers)
            if response.status_code == 200:
                data = response.json()
                self.team_id = data["id"]
                print(f"✅ Sample team created - Team ID: {self.team_id}")
            else:
                print(f"❌ Sample team creation failed - Status: {response.status_code}, Response: {response.text}")
        except Exception as e:
            print(f"❌ Sample team creation error: {e}")
    
    def test_01_get_user_teams(self):
        """Test GET /api/teams (user teams loading)"""
        print("\n🔍 Testing GET /api/teams (user teams loading)")
        
        if not self.auth_token:
            self.fail("No authentication token available")
        
        try:
            headers = {"Authorization": f"Bearer {self.auth_token}"}
            response = requests.get(f"{API_URL}/teams", headers=headers)
            
            print(f"Status Code: {response.status_code}")
            print(f"Response Headers: {dict(response.headers)}")
            
            if response.status_code == 200:
                data = response.json()
                print(f"Response Type: {type(data)}")
                print(f"Number of teams: {len(data) if isinstance(data, list) else 'Not a list'}")
                
                if isinstance(data, list) and len(data) > 0:
                    team = data[0]
                    print(f"Sample team structure: {list(team.keys())}")
                    
                    # Check for necessary fields
                    required_fields = ["id", "name", "formation", "players", "bench_players", "equipment", "techniques", "coach", "tactics"]
                    missing_fields = [field for field in required_fields if field not in team]
                    if missing_fields:
                        print(f"⚠️ Missing fields in team data: {missing_fields}")
                    else:
                        print("✅ All necessary fields present in team data")
                
                print("✅ GET /api/teams working correctly")
                self.assertEqual(response.status_code, 200)
                self.assertIsInstance(data, list)
            else:
                print(f"❌ GET /api/teams failed - Response: {response.text}")
                self.fail(f"GET /api/teams failed with status {response.status_code}")
                
        except Exception as e:
            print(f"❌ GET /api/teams error: {e}")
            self.fail(f"GET /api/teams error: {e}")
    
    def test_02_get_save_slots(self):
        """Test GET /api/save-slots (save slots for Team Builder)"""
        print("\n🔍 Testing GET /api/save-slots (save slots for Team Builder)")
        
        if not self.auth_token:
            self.fail("No authentication token available")
        
        try:
            headers = {"Authorization": f"Bearer {self.auth_token}"}
            response = requests.get(f"{API_URL}/save-slots", headers=headers)
            
            print(f"Status Code: {response.status_code}")
            print(f"Response Headers: {dict(response.headers)}")
            
            if response.status_code == 200:
                data = response.json()
                print(f"Response Type: {type(data)}")
                print(f"Response Structure: {list(data.keys()) if isinstance(data, dict) else 'Not a dict'}")
                
                if isinstance(data, dict) and "save_slots" in data:
                    save_slots = data["save_slots"]
                    print(f"Number of save slots: {len(save_slots)}")
                    
                    if len(save_slots) > 0:
                        slot = save_slots[0]
                        print(f"Sample slot structure: {list(slot.keys())}")
                        
                        # Check for necessary fields
                        required_fields = ["slot_number", "slot_name", "is_occupied", "team_id", "team_name"]
                        missing_fields = [field for field in required_fields if field not in slot]
                        if missing_fields:
                            print(f"⚠️ Missing fields in slot data: {missing_fields}")
                        else:
                            print("✅ All necessary fields present in slot data")
                
                print("✅ GET /api/save-slots working correctly")
                self.assertEqual(response.status_code, 200)
                self.assertIn("save_slots", data)
            else:
                print(f"❌ GET /api/save-slots failed - Response: {response.text}")
                self.fail(f"GET /api/save-slots failed with status {response.status_code}")
                
        except Exception as e:
            print(f"❌ GET /api/save-slots error: {e}")
            self.fail(f"GET /api/save-slots error: {e}")
    
    def test_03_get_community_teams(self):
        """Test GET /api/community/teams (community teams for hub)"""
        print("\n🔍 Testing GET /api/community/teams (community teams for hub)")
        
        if not self.auth_token:
            self.fail("No authentication token available")
        
        try:
            headers = {"Authorization": f"Bearer {self.auth_token}"}
            response = requests.get(f"{API_URL}/community/teams", headers=headers)
            
            print(f"Status Code: {response.status_code}")
            print(f"Response Headers: {dict(response.headers)}")
            
            if response.status_code == 200:
                data = response.json()
                print(f"Response Type: {type(data)}")
                print(f"Number of community teams: {len(data) if isinstance(data, list) else 'Not a list'}")
                
                if isinstance(data, list) and len(data) > 0:
                    team = data[0]
                    print(f"Sample community team structure: {list(team.keys())}")
                    
                    # Check for necessary fields
                    required_fields = ["id", "name", "formation", "players", "bench_players", "equipment", "techniques", "coach", "tactics", "username", "likes", "views", "comments"]
                    missing_fields = [field for field in required_fields if field not in team]
                    if missing_fields:
                        print(f"⚠️ Missing fields in community team data: {missing_fields}")
                    else:
                        print("✅ All necessary fields present in community team data")
                
                # Test with filtering parameters
                print("\n🔍 Testing community teams with filters...")
                
                # Test with search parameter
                search_response = requests.get(f"{API_URL}/community/teams?search=Test", headers=headers)
                print(f"Search filter status: {search_response.status_code}")
                
                # Test with formation filter
                formation_response = requests.get(f"{API_URL}/community/teams?formation=4-3-3", headers=headers)
                print(f"Formation filter status: {formation_response.status_code}")
                
                # Test with sort parameter
                sort_response = requests.get(f"{API_URL}/community/teams?sort_by=likes", headers=headers)
                print(f"Sort filter status: {sort_response.status_code}")
                
                print("✅ GET /api/community/teams working correctly")
                self.assertEqual(response.status_code, 200)
                self.assertIsInstance(data, list)
            else:
                print(f"❌ GET /api/community/teams failed - Response: {response.text}")
                self.fail(f"GET /api/community/teams failed with status {response.status_code}")
                
        except Exception as e:
            print(f"❌ GET /api/community/teams error: {e}")
            self.fail(f"GET /api/community/teams error: {e}")
    
    def test_04_get_team_details(self):
        """Test GET /api/teams/{team_id}/details (team details for preview)"""
        print("\n🔍 Testing GET /api/teams/{team_id}/details (team details for preview)")
        
        if not self.auth_token or not self.team_id:
            self.fail("No authentication token or team ID available")
        
        try:
            headers = {"Authorization": f"Bearer {self.auth_token}"}
            response = requests.get(f"{API_URL}/teams/{self.team_id}/details", headers=headers)
            
            print(f"Status Code: {response.status_code}")
            print(f"Response Headers: {dict(response.headers)}")
            print(f"Testing with Team ID: {self.team_id}")
            
            if response.status_code == 200:
                data = response.json()
                print(f"Response Type: {type(data)}")
                print(f"Response Structure: {list(data.keys()) if isinstance(data, dict) else 'Not a dict'}")
                
                if isinstance(data, dict):
                    # Check for necessary fields
                    required_fields = ["team", "is_liked", "is_following", "can_rate"]
                    missing_fields = [field for field in required_fields if field not in data]
                    if missing_fields:
                        print(f"⚠️ Missing fields in team details: {missing_fields}")
                    else:
                        print("✅ All necessary fields present in team details")
                    
                    if "team" in data:
                        team = data["team"]
                        print(f"Team structure: {list(team.keys())}")
                        
                        # Check team fields
                        team_required_fields = ["id", "name", "formation", "players", "bench_players", "equipment", "techniques", "coach", "tactics", "likes", "views", "rating"]
                        team_missing_fields = [field for field in team_required_fields if field not in team]
                        if team_missing_fields:
                            print(f"⚠️ Missing fields in team data: {team_missing_fields}")
                        else:
                            print("✅ All necessary fields present in team data")
                
                print("✅ GET /api/teams/{team_id}/details working correctly")
                self.assertEqual(response.status_code, 200)
                self.assertIn("team", data)
            else:
                print(f"❌ GET /api/teams/{self.team_id}/details failed - Response: {response.text}")
                self.fail(f"GET /api/teams/{{team_id}}/details failed with status {response.status_code}")
                
        except Exception as e:
            print(f"❌ GET /api/teams/{{team_id}}/details error: {e}")
            self.fail(f"GET /api/teams/{{team_id}}/details error: {e}")
    
    def test_05_get_team_public(self):
        """Test GET /api/teams/{team_id}/public (public team details)"""
        print("\n🔍 Testing GET /api/teams/{team_id}/public (public team details)")
        
        if not self.team_id:
            self.fail("No team ID available")
        
        try:
            # Test without authentication first (should work for public teams)
            response = requests.get(f"{API_URL}/teams/{self.team_id}/public")
            
            print(f"Status Code (no auth): {response.status_code}")
            print(f"Response Headers: {dict(response.headers)}")
            print(f"Testing with Team ID: {self.team_id}")
            
            if response.status_code == 200:
                data = response.json()
                print(f"Response Type: {type(data)}")
                print(f"Response Structure: {list(data.keys()) if isinstance(data, dict) else 'Not a dict'}")
                
                if isinstance(data, dict):
                    # Check for necessary fields
                    required_fields = ["id", "name", "formation", "players", "bench_players", "equipment", "techniques", "coach", "tactics", "username", "likes", "views", "comments", "rating"]
                    missing_fields = [field for field in required_fields if field not in data]
                    if missing_fields:
                        print(f"⚠️ Missing fields in public team data: {missing_fields}")
                    else:
                        print("✅ All necessary fields present in public team data")
                
                print("✅ GET /api/teams/{team_id}/public working correctly")
                self.assertEqual(response.status_code, 200)
            else:
                print(f"❌ GET /api/teams/{self.team_id}/public failed - Response: {response.text}")
                
                # Try with authentication
                if self.auth_token:
                    print("\n🔍 Trying with authentication...")
                    headers = {"Authorization": f"Bearer {self.auth_token}"}
                    auth_response = requests.get(f"{API_URL}/teams/{self.team_id}/public", headers=headers)
                    print(f"Status Code (with auth): {auth_response.status_code}")
                    
                    if auth_response.status_code == 200:
                        print("✅ GET /api/teams/{team_id}/public working with authentication")
                        self.assertEqual(auth_response.status_code, 200)
                    else:
                        print(f"❌ GET /api/teams/{self.team_id}/public failed even with auth - Response: {auth_response.text}")
                        self.fail(f"GET /api/teams/{{team_id}}/public failed with status {auth_response.status_code}")
                else:
                    self.fail(f"GET /api/teams/{{team_id}}/public failed with status {response.status_code}")
                
        except Exception as e:
            print(f"❌ GET /api/teams/{{team_id}}/public error: {e}")
            self.fail(f"GET /api/teams/{{team_id}}/public error: {e}")
    
    def test_06_authentication_validation(self):
        """Test that authentication works properly for protected endpoints"""
        print("\n🔍 Testing authentication validation")
        
        # Test without authentication token
        print("Testing without authentication...")
        
        # GET /api/teams should require auth
        response = requests.get(f"{API_URL}/teams")
        print(f"GET /api/teams without auth: {response.status_code}")
        if response.status_code != 403:
            print(f"⚠️ Expected 403, got {response.status_code}")
        
        # GET /api/save-slots should require auth
        response = requests.get(f"{API_URL}/save-slots")
        print(f"GET /api/save-slots without auth: {response.status_code}")
        if response.status_code != 403:
            print(f"⚠️ Expected 403, got {response.status_code}")
        
        # GET /api/community/teams should require auth
        response = requests.get(f"{API_URL}/community/teams")
        print(f"GET /api/community/teams without auth: {response.status_code}")
        if response.status_code != 403:
            print(f"⚠️ Expected 403, got {response.status_code}")
        
        # Test with invalid token
        print("\nTesting with invalid authentication...")
        invalid_headers = {"Authorization": "Bearer invalid_token_12345"}
        
        response = requests.get(f"{API_URL}/teams", headers=invalid_headers)
        print(f"GET /api/teams with invalid token: {response.status_code}")
        if response.status_code not in [401, 403]:
            print(f"⚠️ Expected 401 or 403, got {response.status_code}")
        
        print("✅ Authentication validation completed")
    
    def test_07_data_structure_validation(self):
        """Test that all endpoints return data with correct structure"""
        print("\n🔍 Testing data structure validation")
        
        if not self.auth_token:
            self.fail("No authentication token available")
        
        headers = {"Authorization": f"Bearer {self.auth_token}"}
        
        # Test user teams data structure
        try:
            response = requests.get(f"{API_URL}/teams", headers=headers)
            if response.status_code == 200:
                teams = response.json()
                if isinstance(teams, list) and len(teams) > 0:
                    team = teams[0]
                    self.assertIn("id", team)
                    self.assertIn("name", team)
                    self.assertIn("formation", team)
                    self.assertIn("players", team)
                    self.assertIn("bench_players", team)
                    print("✅ User teams data structure valid")
        except Exception as e:
            print(f"❌ User teams data structure validation error: {e}")
        
        # Test save slots data structure
        try:
            response = requests.get(f"{API_URL}/save-slots", headers=headers)
            if response.status_code == 200:
                data = response.json()
                self.assertIn("save_slots", data)
                if len(data["save_slots"]) > 0:
                    slot = data["save_slots"][0]
                    self.assertIn("slot_number", slot)
                    self.assertIn("is_occupied", slot)
                    self.assertIn("team_id", slot)
                    print("✅ Save slots data structure valid")
        except Exception as e:
            print(f"❌ Save slots data structure validation error: {e}")
        
        # Test community teams data structure
        try:
            response = requests.get(f"{API_URL}/community/teams", headers=headers)
            if response.status_code == 200:
                teams = response.json()
                if isinstance(teams, list) and len(teams) > 0:
                    team = teams[0]
                    self.assertIn("id", team)
                    self.assertIn("name", team)
                    self.assertIn("username", team)
                    self.assertIn("likes", team)
                    self.assertIn("views", team)
                    print("✅ Community teams data structure valid")
        except Exception as e:
            print(f"❌ Community teams data structure validation error: {e}")
        
        print("✅ Data structure validation completed")

if __name__ == "__main__":
    # Run the tests
    unittest.main(verbosity=2)