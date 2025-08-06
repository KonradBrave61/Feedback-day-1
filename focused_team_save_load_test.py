#!/usr/bin/env python3
"""
Focused Team Saving and Loading Functionality Test
This test specifically focuses on the team saving and loading flow as requested in the review.
"""
import requests
import json
import uuid
import random
import string
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

print(f"🎯 FOCUSED TEAM SAVE/LOAD TESTING")
print(f"Testing API at: {API_URL}")
print("=" * 80)

def generate_random_string(length=8):
    """Generate a random string of fixed length"""
    letters = string.ascii_lowercase
    return ''.join(random.choice(letters) for i in range(length))

class FocusedTeamSaveLoadTest:
    """Focused test for team saving and loading functionality"""
    
    def __init__(self):
        # Generate unique test data
        random_suffix = generate_random_string()
        self.test_username = f"coach_{random_suffix}"
        self.test_email = f"coach_{random_suffix}@raimon.com"
        self.test_password = "RaimonEleven123!"
        
        # User registration data with realistic football coach data
        self.user_data = {
            "username": self.test_username,
            "email": self.test_email,
            "password": self.test_password,
            "coach_level": 15,
            "favorite_position": "FW",
            "favorite_element": "Fire",
            "favourite_team": "Raimon Eleven",
            "profile_picture": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==",
            "bio": "Passionate football coach specializing in offensive tactics and player development"
        }
        
        # Store authentication and test data
        self.auth_token = None
        self.user_id = None
        self.team_id = None
        self.character_ids = []
        self.equipment_ids = []
        self.formation_id = None
        self.tactic_ids = []
        self.coach_id = None
        
        # Test results tracking
        self.test_results = {
            "total_tests": 0,
            "passed_tests": 0,
            "failed_tests": 0,
            "errors": []
        }
    
    def log_test(self, test_name, success, message="", error_details=""):
        """Log test results"""
        self.test_results["total_tests"] += 1
        if success:
            self.test_results["passed_tests"] += 1
            print(f"✅ {test_name}: {message}")
        else:
            self.test_results["failed_tests"] += 1
            error_info = f"{test_name}: {message}"
            if error_details:
                error_info += f" - {error_details}"
            self.test_results["errors"].append(error_info)
            print(f"❌ {test_name}: {message}")
            if error_details:
                print(f"   Error Details: {error_details}")
    
    def setup_authentication(self):
        """Set up authentication for testing"""
        print("\n🔐 AUTHENTICATION SETUP")
        print("-" * 40)
        
        try:
            # Register user
            response = requests.post(f"{API_URL}/auth/register", json=self.user_data)
            if response.status_code == 200:
                data = response.json()
                self.auth_token = data["access_token"]
                self.user_id = data["user"]["id"]
                self.log_test("User Registration", True, f"Registered coach {self.test_username} with ID: {self.user_id}")
                
                # Verify token works
                headers = {"Authorization": f"Bearer {self.auth_token}"}
                me_response = requests.get(f"{API_URL}/auth/me", headers=headers)
                if me_response.status_code == 200:
                    self.log_test("Token Validation", True, "Bearer token authentication working correctly")
                    return True
                else:
                    self.log_test("Token Validation", False, f"Token validation failed with status {me_response.status_code}")
                    return False
            else:
                self.log_test("User Registration", False, f"Registration failed with status {response.status_code}", response.text)
                return False
        except Exception as e:
            self.log_test("Authentication Setup", False, "Exception during authentication setup", str(e))
            return False
    
    def test_team_creation_flow(self):
        """Test 1: Team Creation/Saving Flow"""
        print("\n🏗️ TEAM CREATION/SAVING FLOW")
        print("-" * 40)
        
        if not self.auth_token:
            self.log_test("Team Creation Flow", False, "No authentication token available")
            return False
        
        headers = {"Authorization": f"Bearer {self.auth_token}"}
        
        try:
            # Get available characters for team building
            char_response = requests.get(f"{API_URL}/characters/")
            if char_response.status_code == 200:
                characters = char_response.json()
                if len(characters) >= 3:
                    self.character_ids = [char["id"] for char in characters[:3]]
                    self.log_test("Character Data Retrieval", True, f"Retrieved {len(characters)} characters for team building")
                else:
                    self.log_test("Character Data Retrieval", False, f"Insufficient characters available: {len(characters)}")
                    return False
            else:
                self.log_test("Character Data Retrieval", False, f"Failed to get characters: {char_response.status_code}")
                return False
            
            # Get formations
            form_response = requests.get(f"{API_URL}/teams/formations/")
            if form_response.status_code == 200:
                formations = form_response.json()
                if formations:
                    self.formation_id = formations[0]["id"]
                    self.log_test("Formation Data Retrieval", True, f"Retrieved {len(formations)} formations")
                else:
                    self.log_test("Formation Data Retrieval", False, "No formations available")
                    return False
            else:
                self.log_test("Formation Data Retrieval", False, f"Failed to get formations: {form_response.status_code}")
                return False
            
            # Get tactics
            tactic_response = requests.get(f"{API_URL}/teams/tactics/")
            if tactic_response.status_code == 200:
                tactics = tactic_response.json()
                if tactics:
                    self.tactic_ids = [tactic["id"] for tactic in tactics[:2]]
                    self.log_test("Tactics Data Retrieval", True, f"Retrieved {len(tactics)} tactics")
                else:
                    self.log_test("Tactics Data Retrieval", False, "No tactics available")
            else:
                self.log_test("Tactics Data Retrieval", False, f"Failed to get tactics: {tactic_response.status_code}")
            
            # Get coaches
            coach_response = requests.get(f"{API_URL}/teams/coaches/")
            if coach_response.status_code == 200:
                coaches = coach_response.json()
                if coaches:
                    self.coach_id = coaches[0]["id"]
                    self.log_test("Coach Data Retrieval", True, f"Retrieved {len(coaches)} coaches")
                else:
                    self.log_test("Coach Data Retrieval", False, "No coaches available")
            else:
                self.log_test("Coach Data Retrieval", False, f"Failed to get coaches: {coach_response.status_code}")
            
            # Create comprehensive team with realistic data
            team_data = {
                "name": f"Raimon Eleven {generate_random_string()}",
                "formation": self.formation_id,
                "players": [
                    {
                        "character_id": self.character_ids[0],
                        "position_id": "gk",
                        "user_level": 45,
                        "user_rarity": "Epic",
                        "user_equipment": {
                            "boots": None,
                            "bracelets": None,
                            "pendants": None
                        },
                        "user_hissatsu": [
                            {
                                "id": str(uuid.uuid4()),
                                "name": "God Hand",
                                "type": "Catch",
                                "element": "Earth",
                                "power": 85,
                                "description": "A powerful goalkeeping technique"
                            }
                        ]
                    },
                    {
                        "character_id": self.character_ids[1],
                        "position_id": "cf",
                        "user_level": 50,
                        "user_rarity": "Legendary",
                        "user_equipment": {
                            "boots": None,
                            "bracelets": None,
                            "pendants": None
                        },
                        "user_hissatsu": [
                            {
                                "id": str(uuid.uuid4()),
                                "name": "Fire Tornado",
                                "type": "Shot",
                                "element": "Fire",
                                "power": 95,
                                "description": "A blazing shot technique"
                            }
                        ]
                    },
                    {
                        "character_id": self.character_ids[2],
                        "position_id": "lmf",
                        "user_level": 42,
                        "user_rarity": "Rare",
                        "user_equipment": {
                            "boots": None,
                            "bracelets": None,
                            "pendants": None
                        },
                        "user_hissatsu": [
                            {
                                "id": str(uuid.uuid4()),
                                "name": "Lightning Dash",
                                "type": "Dribble",
                                "element": "Lightning",
                                "power": 70,
                                "description": "A quick dribbling move"
                            }
                        ]
                    }
                ],
                "bench_players": [
                    {
                        "character_id": self.character_ids[0],
                        "slot_id": "bench_1",
                        "user_level": 40,
                        "user_rarity": "Rare",
                        "user_equipment": {
                            "boots": None,
                            "bracelets": None,
                            "pendants": None
                        },
                        "user_hissatsu": []
                    },
                    {
                        "character_id": self.character_ids[1],
                        "slot_id": "bench_2",
                        "user_level": 38,
                        "user_rarity": "Common",
                        "user_equipment": {
                            "boots": None,
                            "bracelets": None,
                            "pendants": None
                        },
                        "user_hissatsu": []
                    },
                    {
                        "character_id": self.character_ids[2],
                        "slot_id": "bench_3",
                        "user_level": 35,
                        "user_rarity": "Common",
                        "user_equipment": {
                            "boots": None,
                            "bracelets": None,
                            "pendants": None
                        },
                        "user_hissatsu": []
                    }
                ],
                "tactics": self.tactic_ids,
                "coach": self.coach_id,
                "description": "A powerful team built for testing the save/load functionality with complete player data structure",
                "is_public": True,
                "tags": ["test", "save-load", "comprehensive"]
            }
            
            # Create team via POST /api/teams
            response = requests.post(f"{API_URL}/teams", json=team_data, headers=headers)
            if response.status_code == 200:
                team = response.json()
                self.team_id = team["id"]
                self.log_test("Team Creation (POST /api/teams)", True, f"Created team '{team['name']}' with ID: {self.team_id}")
                
                # Verify team has proper structure
                required_fields = ["id", "name", "formation", "players", "bench_players", "tactics", "coach"]
                missing_fields = [field for field in required_fields if field not in team]
                if not missing_fields:
                    self.log_test("Team Structure Validation", True, "Team created with all required fields")
                else:
                    self.log_test("Team Structure Validation", False, f"Missing fields: {missing_fields}")
                
                return True
            else:
                self.log_test("Team Creation (POST /api/teams)", False, f"Failed with status {response.status_code}", response.text)
                return False
                
        except Exception as e:
            self.log_test("Team Creation Flow", False, "Exception during team creation", str(e))
            return False
    
    def test_immediate_team_retrieval(self):
        """Test immediate retrieval of created team"""
        print("\n🔍 IMMEDIATE TEAM RETRIEVAL")
        print("-" * 40)
        
        if not self.auth_token or not self.team_id:
            self.log_test("Immediate Team Retrieval", False, "No auth token or team ID available")
            return False
        
        headers = {"Authorization": f"Bearer {self.auth_token}"}
        
        try:
            # Test GET /api/teams/{id}
            response = requests.get(f"{API_URL}/teams/{self.team_id}", headers=headers)
            if response.status_code == 200:
                team = response.json()
                self.log_test("Team Retrieval (GET /api/teams/{id})", True, f"Successfully retrieved team: {team['name']}")
                
                # Verify team data integrity
                if team["id"] == self.team_id:
                    self.log_test("Team ID Consistency", True, "Team ID matches created team")
                else:
                    self.log_test("Team ID Consistency", False, f"ID mismatch: expected {self.team_id}, got {team['id']}")
                
                # Check players array
                if "players" in team and len(team["players"]) == 3:
                    self.log_test("Players Data Integrity", True, f"Team has {len(team['players'])} players as expected")
                else:
                    self.log_test("Players Data Integrity", False, f"Expected 3 players, got {len(team.get('players', []))}")
                
                # Check bench players array
                if "bench_players" in team and len(team["bench_players"]) == 3:
                    self.log_test("Bench Players Data Integrity", True, f"Team has {len(team['bench_players'])} bench players as expected")
                else:
                    self.log_test("Bench Players Data Integrity", False, f"Expected 3 bench players, got {len(team.get('bench_players', []))}")
                
                return True
            else:
                self.log_test("Team Retrieval (GET /api/teams/{id})", False, f"Failed with status {response.status_code}", response.text)
                return False
                
        except Exception as e:
            self.log_test("Immediate Team Retrieval", False, "Exception during team retrieval", str(e))
            return False
    
    def test_save_slots_management(self):
        """Test 2: Save Slots Management"""
        print("\n💾 SAVE SLOTS MANAGEMENT")
        print("-" * 40)
        
        if not self.auth_token:
            self.log_test("Save Slots Management", False, "No authentication token available")
            return False
        
        headers = {"Authorization": f"Bearer {self.auth_token}"}
        
        try:
            # Test GET /api/save-slots
            response = requests.get(f"{API_URL}/save-slots", headers=headers)
            if response.status_code == 200:
                slots_data = response.json()
                self.log_test("Save Slots Retrieval (GET /api/save-slots)", True, "Successfully retrieved save slots")
                
                # Verify slots structure
                if "save_slots" in slots_data and len(slots_data["save_slots"]) == 5:
                    self.log_test("Save Slots Structure", True, f"Found {len(slots_data['save_slots'])} save slots as expected")
                    
                    # Check slot structure
                    slot = slots_data["save_slots"][0]
                    required_slot_fields = ["slot_number", "slot_name", "is_occupied", "team_id", "team_name"]
                    missing_fields = [field for field in required_slot_fields if field not in slot]
                    if not missing_fields:
                        self.log_test("Slot Data Structure", True, "Save slots have all required fields")
                    else:
                        self.log_test("Slot Data Structure", False, f"Missing slot fields: {missing_fields}")
                else:
                    self.log_test("Save Slots Structure", False, f"Expected 5 slots, got {len(slots_data.get('save_slots', []))}")
                
                # Test POST /api/teams/{team_id}/save-to-slot
                if self.team_id:
                    slot_data = {
                        "slot_number": 1,
                        "slot_name": "Test Team Slot",
                        "overwrite": True
                    }
                    
                    save_response = requests.post(f"{API_URL}/teams/{self.team_id}/save-to-slot", json=slot_data, headers=headers)
                    if save_response.status_code == 200:
                        self.log_test("Team Save to Slot (POST /api/teams/{id}/save-to-slot)", True, "Successfully saved team to slot 1")
                        
                        # Verify slot is now occupied
                        verify_response = requests.get(f"{API_URL}/save-slots", headers=headers)
                        if verify_response.status_code == 200:
                            updated_slots = verify_response.json()
                            slot_1 = next((slot for slot in updated_slots["save_slots"] if slot["slot_number"] == 1), None)
                            if slot_1 and slot_1["is_occupied"] and slot_1["team_id"] == self.team_id:
                                self.log_test("Slot Occupation Verification", True, "Slot 1 is now occupied with correct team ID")
                            else:
                                self.log_test("Slot Occupation Verification", False, "Slot 1 not properly occupied after save")
                        else:
                            self.log_test("Slot Occupation Verification", False, "Failed to verify slot occupation")
                    else:
                        self.log_test("Team Save to Slot (POST /api/teams/{id}/save-to-slot)", False, f"Failed with status {save_response.status_code}", save_response.text)
                else:
                    self.log_test("Team Save to Slot", False, "No team ID available for saving")
                
                return True
            else:
                self.log_test("Save Slots Retrieval (GET /api/save-slots)", False, f"Failed with status {response.status_code}", response.text)
                return False
                
        except Exception as e:
            self.log_test("Save Slots Management", False, "Exception during save slots testing", str(e))
            return False
    
    def test_team_loading_functionality(self):
        """Test 3: Team Loading Functionality"""
        print("\n📂 TEAM LOADING FUNCTIONALITY")
        print("-" * 40)
        
        if not self.auth_token:
            self.log_test("Team Loading Functionality", False, "No authentication token available")
            return False
        
        headers = {"Authorization": f"Bearer {self.auth_token}"}
        
        try:
            # Test GET /api/teams (load user's teams)
            response = requests.get(f"{API_URL}/teams", headers=headers)
            if response.status_code == 200:
                teams = response.json()
                self.log_test("User Teams Loading (GET /api/teams)", True, f"Successfully loaded {len(teams)} user teams")
                
                # Verify our created team appears in the list
                our_team = next((team for team in teams if team["id"] == self.team_id), None)
                if our_team:
                    self.log_test("Created Team in User List", True, "Created team appears in user's team list")
                else:
                    self.log_test("Created Team in User List", False, "Created team not found in user's team list")
            else:
                self.log_test("User Teams Loading (GET /api/teams)", False, f"Failed with status {response.status_code}", response.text)
            
            # Test GET /api/teams/{team_id}/details (complete team data structure)
            if self.team_id:
                response = requests.get(f"{API_URL}/teams/{self.team_id}/details", headers=headers)
                if response.status_code == 200:
                    team_details = response.json()
                    self.log_test("Team Details Loading (GET /api/teams/{id}/details)", True, "Successfully loaded complete team details")
                    
                    # Verify response structure
                    if "team" in team_details:
                        team = team_details["team"]
                        
                        # Check players array with complete data
                        if "players" in team and len(team["players"]) > 0:
                            player = team["players"][0]
                            required_player_fields = ["character_id", "position_id", "user_level", "user_rarity", "user_equipment", "user_hissatsu"]
                            missing_fields = [field for field in required_player_fields if field not in player]
                            if not missing_fields:
                                self.log_test("Player Data Structure", True, "Players have complete data structure including equipment and techniques")
                            else:
                                self.log_test("Player Data Structure", False, f"Missing player fields: {missing_fields}")
                        else:
                            self.log_test("Player Data Structure", False, "No players found in team details")
                        
                        # Check bench_players array with slot_id preservation
                        if "bench_players" in team and len(team["bench_players"]) > 0:
                            bench_player = team["bench_players"][0]
                            required_bench_fields = ["character_id", "slot_id", "user_level", "user_rarity", "user_equipment", "user_hissatsu"]
                            missing_fields = [field for field in required_bench_fields if field not in bench_player]
                            if not missing_fields:
                                self.log_test("Bench Player Data Structure", True, "Bench players have complete data structure with slot_id preservation")
                                
                                # Verify slot_id format
                                if bench_player["slot_id"].startswith("bench_"):
                                    self.log_test("Bench Slot ID Format", True, f"Bench slot ID format correct: {bench_player['slot_id']}")
                                else:
                                    self.log_test("Bench Slot ID Format", False, f"Invalid bench slot ID format: {bench_player['slot_id']}")
                            else:
                                self.log_test("Bench Player Data Structure", False, f"Missing bench player fields: {missing_fields}")
                        else:
                            self.log_test("Bench Player Data Structure", False, "No bench players found in team details")
                        
                        # Check tactics array
                        if "tactics" in team and isinstance(team["tactics"], list):
                            self.log_test("Tactics Data Structure", True, f"Team has {len(team['tactics'])} tactics")
                        else:
                            self.log_test("Tactics Data Structure", False, "Tactics data missing or invalid")
                        
                        # Check coach object
                        if "coach" in team and team["coach"]:
                            self.log_test("Coach Data Structure", True, "Team has coach data")
                        else:
                            self.log_test("Coach Data Structure", False, "Coach data missing")
                        
                        # Check formation
                        if "formation" in team:
                            self.log_test("Formation Data Structure", True, "Team has formation data")
                        else:
                            self.log_test("Formation Data Structure", False, "Formation data missing")
                    else:
                        self.log_test("Team Details Response Structure", False, "Team details response missing 'team' key")
                else:
                    self.log_test("Team Details Loading (GET /api/teams/{id}/details)", False, f"Failed with status {response.status_code}", response.text)
            else:
                self.log_test("Team Details Loading", False, "No team ID available for details loading")
            
            return True
            
        except Exception as e:
            self.log_test("Team Loading Functionality", False, "Exception during team loading testing", str(e))
            return False
    
    def test_authentication_consistency(self):
        """Test 4: Authentication Consistency"""
        print("\n🔐 AUTHENTICATION CONSISTENCY")
        print("-" * 40)
        
        if not self.auth_token:
            self.log_test("Authentication Consistency", False, "No authentication token available")
            return False
        
        try:
            # Test Bearer token consistency across endpoints
            headers = {"Authorization": f"Bearer {self.auth_token}"}
            
            endpoints_to_test = [
                ("GET /api/teams", f"{API_URL}/teams"),
                ("GET /api/save-slots", f"{API_URL}/save-slots"),
                ("GET /api/auth/me", f"{API_URL}/auth/me"),
                ("GET /api/characters/", f"{API_URL}/characters/"),
                ("GET /api/equipment/", f"{API_URL}/equipment/")
            ]
            
            successful_endpoints = 0
            for endpoint_name, endpoint_url in endpoints_to_test:
                response = requests.get(endpoint_url, headers=headers)
                if response.status_code == 200:
                    successful_endpoints += 1
                    self.log_test(f"Bearer Token - {endpoint_name}", True, "Token accepted")
                else:
                    self.log_test(f"Bearer Token - {endpoint_name}", False, f"Token rejected with status {response.status_code}")
            
            if successful_endpoints == len(endpoints_to_test):
                self.log_test("Bearer Token Consistency", True, f"Token works across all {len(endpoints_to_test)} tested endpoints")
            else:
                self.log_test("Bearer Token Consistency", False, f"Token failed on {len(endpoints_to_test) - successful_endpoints} endpoints")
            
            # Test unauthorized access (no token)
            response = requests.get(f"{API_URL}/teams")
            if response.status_code in [401, 403]:
                self.log_test("Unauthorized Access Rejection", True, f"Properly rejected unauthorized access with status {response.status_code}")
            else:
                self.log_test("Unauthorized Access Rejection", False, f"Should reject unauthorized access, got status {response.status_code}")
            
            # Test invalid token
            invalid_headers = {"Authorization": "Bearer invalid_token_12345"}
            response = requests.get(f"{API_URL}/teams", headers=invalid_headers)
            if response.status_code in [401, 403]:
                self.log_test("Invalid Token Rejection", True, f"Properly rejected invalid token with status {response.status_code}")
            else:
                self.log_test("Invalid Token Rejection", False, f"Should reject invalid token, got status {response.status_code}")
            
            return True
            
        except Exception as e:
            self.log_test("Authentication Consistency", False, "Exception during authentication testing", str(e))
            return False
    
    def test_error_scenarios(self):
        """Test 5: Error Scenarios"""
        print("\n⚠️ ERROR SCENARIOS")
        print("-" * 40)
        
        if not self.auth_token:
            self.log_test("Error Scenarios", False, "No authentication token available")
            return False
        
        headers = {"Authorization": f"Bearer {self.auth_token}"}
        
        try:
            # Test malformed team creation request
            malformed_team = {
                "name": "",  # Empty name
                "formation": "invalid_formation_id",
                "players": "not_an_array",  # Should be array
                "invalid_field": "should_not_exist"
            }
            
            response = requests.post(f"{API_URL}/teams", json=malformed_team, headers=headers)
            if response.status_code >= 400:
                self.log_test("Malformed Team Creation", True, f"Properly rejected malformed request with status {response.status_code}")
            else:
                self.log_test("Malformed Team Creation", False, f"Should reject malformed request, got status {response.status_code}")
            
            # Test saving team with missing required fields
            incomplete_team = {
                "name": "Incomplete Team"
                # Missing formation, players, etc.
            }
            
            response = requests.post(f"{API_URL}/teams", json=incomplete_team, headers=headers)
            if response.status_code >= 400:
                self.log_test("Incomplete Team Creation", True, f"Properly rejected incomplete request with status {response.status_code}")
            else:
                self.log_test("Incomplete Team Creation", False, f"Should reject incomplete request, got status {response.status_code}")
            
            # Test accessing non-existent team ID
            fake_team_id = str(uuid.uuid4())
            response = requests.get(f"{API_URL}/teams/{fake_team_id}", headers=headers)
            if response.status_code == 404:
                self.log_test("Non-existent Team Access", True, "Properly returned 404 for non-existent team")
            else:
                self.log_test("Non-existent Team Access", False, f"Should return 404 for non-existent team, got status {response.status_code}")
            
            # Test accessing non-existent team details
            response = requests.get(f"{API_URL}/teams/{fake_team_id}/details", headers=headers)
            if response.status_code == 404:
                self.log_test("Non-existent Team Details Access", True, "Properly returned 404 for non-existent team details")
            else:
                self.log_test("Non-existent Team Details Access", False, f"Should return 404 for non-existent team details, got status {response.status_code}")
            
            # Test saving to invalid slot
            if self.team_id:
                invalid_slot_data = {
                    "slot_number": 99,  # Invalid slot number
                    "slot_name": "Invalid Slot",
                    "overwrite": True
                }
                
                response = requests.post(f"{API_URL}/teams/{self.team_id}/save-to-slot", json=invalid_slot_data, headers=headers)
                if response.status_code >= 400:
                    self.log_test("Invalid Slot Save", True, f"Properly rejected invalid slot with status {response.status_code}")
                else:
                    self.log_test("Invalid Slot Save", False, f"Should reject invalid slot, got status {response.status_code}")
            
            return True
            
        except Exception as e:
            self.log_test("Error Scenarios", False, "Exception during error scenario testing", str(e))
            return False
    
    def run_all_tests(self):
        """Run all focused team save/load tests"""
        print("🎯 STARTING FOCUSED TEAM SAVE/LOAD TESTING")
        print("=" * 80)
        
        # Setup authentication
        if not self.setup_authentication():
            print("\n❌ AUTHENTICATION SETUP FAILED - ABORTING TESTS")
            return False
        
        # Run all test phases
        test_phases = [
            ("Team Creation/Saving Flow", self.test_team_creation_flow),
            ("Immediate Team Retrieval", self.test_immediate_team_retrieval),
            ("Save Slots Management", self.test_save_slots_management),
            ("Team Loading Functionality", self.test_team_loading_functionality),
            ("Authentication Consistency", self.test_authentication_consistency),
            ("Error Scenarios", self.test_error_scenarios)
        ]
        
        for phase_name, test_method in test_phases:
            try:
                test_method()
            except Exception as e:
                self.log_test(phase_name, False, f"Unexpected exception in {phase_name}", str(e))
        
        # Print final results
        self.print_final_results()
        
        return self.test_results["failed_tests"] == 0
    
    def print_final_results(self):
        """Print comprehensive test results"""
        print("\n" + "=" * 80)
        print("🎯 FOCUSED TEAM SAVE/LOAD TEST RESULTS")
        print("=" * 80)
        
        total = self.test_results["total_tests"]
        passed = self.test_results["passed_tests"]
        failed = self.test_results["failed_tests"]
        success_rate = (passed / total * 100) if total > 0 else 0
        
        print(f"📊 SUMMARY:")
        print(f"   Total Tests: {total}")
        print(f"   Passed: {passed}")
        print(f"   Failed: {failed}")
        print(f"   Success Rate: {success_rate:.1f}%")
        
        if failed == 0:
            print(f"\n🎉 ALL TESTS PASSED! Team saving and loading functionality is working perfectly.")
            print(f"✅ Backend APIs are stable and ready for frontend integration.")
        else:
            print(f"\n⚠️ {failed} TEST(S) FAILED:")
            for i, error in enumerate(self.test_results["errors"], 1):
                print(f"   {i}. {error}")
        
        print("\n" + "=" * 80)

def main():
    """Main test execution"""
    test_suite = FocusedTeamSaveLoadTest()
    success = test_suite.run_all_tests()
    
    if success:
        print("🎯 FOCUSED TEAM SAVE/LOAD TESTING COMPLETED SUCCESSFULLY")
        exit(0)
    else:
        print("❌ FOCUSED TEAM SAVE/LOAD TESTING COMPLETED WITH FAILURES")
        exit(1)

if __name__ == "__main__":
    main()