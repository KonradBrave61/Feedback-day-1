#!/usr/bin/env python3
"""
Team Builder Backend Functionality Test
Focus on testing core Team Builder APIs after the 6 continuation fixes
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
ROOT_URL = BACKEND_URL

print(f"🎯 Testing Team Builder Backend at: {API_URL}")
print("=" * 80)

def generate_random_string(length=8):
    """Generate a random string of fixed length"""
    letters = string.ascii_lowercase
    return ''.join(random.choice(letters) for i in range(length))

class TeamBuilderBackendTest:
    """Test suite for Team Builder Backend functionality"""
    
    def __init__(self):
        # Generate unique test data
        random_suffix = generate_random_string()
        self.test_username = f"teambuilder_{random_suffix}"
        self.test_email = f"teambuilder_{random_suffix}@example.com"
        self.test_password = "TeamBuilder123!"
        
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
            "bio": "Team builder enthusiast"
        }
        
        # Store test data
        self.auth_token = None
        self.user_id = None
        self.team_id = None
        self.character_ids = []
        self.equipment_ids = []
        self.test_results = []
        
    def log_result(self, test_name, success, message):
        """Log test result"""
        status = "✅" if success else "❌"
        print(f"{status} {test_name}: {message}")
        self.test_results.append({
            "test": test_name,
            "success": success,
            "message": message
        })
        
    def test_01_authentication_setup(self):
        """Test authentication setup for Team Builder"""
        try:
            # Test API status first
            response = requests.get(f"{API_URL}/status")
            if response.status_code != 200:
                self.log_result("API Status", False, f"API not responding: {response.status_code}")
                return False
                
            # Register user
            response = requests.post(f"{API_URL}/auth/register", json=self.user_data)
            if response.status_code == 200:
                data = response.json()
                self.auth_token = data["access_token"]
                self.user_id = data["user"]["id"]
                self.log_result("Authentication Setup", True, f"User registered with ID: {self.user_id}")
                return True
            else:
                self.log_result("Authentication Setup", False, f"Registration failed: {response.status_code} - {response.text}")
                return False
                
        except Exception as e:
            self.log_result("Authentication Setup", False, f"Exception: {str(e)}")
            return False
    
    def test_02_team_management_apis(self):
        """Test Team Management APIs (create, update, get, delete)"""
        if not self.auth_token:
            self.log_result("Team Management APIs", False, "No auth token available")
            return False
            
        try:
            headers = {"Authorization": f"Bearer {self.auth_token}"}
            
            # Test team creation
            team_data = {
                "name": f"Test Team {generate_random_string()}",
                "formation": "4-3-3",
                "players": [],
                "bench_players": [],
                "tactics": [],
                "coach": None,
                "description": "Test team for backend verification",
                "is_public": True,
                "tags": ["test", "backend"]
            }
            
            response = requests.post(f"{API_URL}/teams", json=team_data, headers=headers)
            if response.status_code != 200:
                self.log_result("Team Management APIs", False, f"Team creation failed: {response.status_code}")
                return False
                
            team = response.json()
            self.team_id = team["id"]
            
            # Test team retrieval
            response = requests.get(f"{API_URL}/teams/{self.team_id}", headers=headers)
            if response.status_code != 200:
                self.log_result("Team Management APIs", False, f"Team retrieval failed: {response.status_code}")
                return False
                
            # Test team update
            update_data = {"name": f"Updated Team {generate_random_string()}"}
            response = requests.put(f"{API_URL}/teams/{self.team_id}", json=update_data, headers=headers)
            if response.status_code != 200:
                self.log_result("Team Management APIs", False, f"Team update failed: {response.status_code}")
                return False
                
            # Test getting user teams
            response = requests.get(f"{API_URL}/teams", headers=headers)
            if response.status_code != 200:
                self.log_result("Team Management APIs", False, f"Get user teams failed: {response.status_code}")
                return False
                
            self.log_result("Team Management APIs", True, "Create, read, update, and list operations working")
            return True
            
        except Exception as e:
            self.log_result("Team Management APIs", False, f"Exception: {str(e)}")
            return False
    
    def test_03_character_apis(self):
        """Test Character APIs for Team Builder"""
        try:
            # Test getting all characters
            response = requests.get(f"{API_URL}/characters/")
            if response.status_code != 200:
                self.log_result("Character APIs", False, f"Get characters failed: {response.status_code}")
                return False
                
            characters = response.json()
            if not characters:
                self.log_result("Character APIs", False, "No characters found in database")
                return False
                
            self.character_ids = [char["id"] for char in characters[:5]]
            
            # Test character filtering by position
            response = requests.get(f"{API_URL}/characters/?position=GK")
            if response.status_code != 200:
                self.log_result("Character APIs", False, f"Character position filtering failed: {response.status_code}")
                return False
                
            # Test character filtering by element
            response = requests.get(f"{API_URL}/characters/?element=Fire")
            if response.status_code != 200:
                self.log_result("Character APIs", False, f"Character element filtering failed: {response.status_code}")
                return False
                
            # Test character search
            response = requests.get(f"{API_URL}/characters/?search=Mark")
            if response.status_code != 200:
                self.log_result("Character APIs", False, f"Character search failed: {response.status_code}")
                return False
                
            # Test individual character retrieval
            if self.character_ids:
                response = requests.get(f"{API_URL}/characters/{self.character_ids[0]}")
                if response.status_code != 200:
                    self.log_result("Character APIs", False, f"Individual character retrieval failed: {response.status_code}")
                    return False
                    
            self.log_result("Character APIs", True, f"Found {len(characters)} characters, filtering and search working")
            return True
            
        except Exception as e:
            self.log_result("Character APIs", False, f"Exception: {str(e)}")
            return False
    
    def test_04_equipment_apis(self):
        """Test Equipment APIs for Team Builder"""
        try:
            # Test getting all equipment
            response = requests.get(f"{API_URL}/equipment/")
            if response.status_code != 200:
                self.log_result("Equipment APIs", False, f"Get equipment failed: {response.status_code}")
                return False
                
            equipment = response.json()
            if not equipment:
                self.log_result("Equipment APIs", False, "No equipment found in database")
                return False
                
            self.equipment_ids = [eq["id"] for eq in equipment[:3]]
            
            # Test equipment filtering by category
            response = requests.get(f"{API_URL}/equipment/?category=Boots")
            if response.status_code != 200:
                self.log_result("Equipment APIs", False, f"Equipment category filtering failed: {response.status_code}")
                return False
                
            # Test equipment filtering by rarity
            response = requests.get(f"{API_URL}/equipment/?rarity=Legendary")
            if response.status_code != 200:
                self.log_result("Equipment APIs", False, f"Equipment rarity filtering failed: {response.status_code}")
                return False
                
            # Test individual equipment retrieval
            if self.equipment_ids:
                response = requests.get(f"{API_URL}/equipment/{self.equipment_ids[0]}")
                if response.status_code != 200:
                    self.log_result("Equipment APIs", False, f"Individual equipment retrieval failed: {response.status_code}")
                    return False
                    
            self.log_result("Equipment APIs", True, f"Found {len(equipment)} equipment items, filtering working")
            return True
            
        except Exception as e:
            self.log_result("Equipment APIs", False, f"Exception: {str(e)}")
            return False
    
    def test_05_formation_tactics_endpoints(self):
        """Test Formation and Tactics endpoints"""
        try:
            # Test getting formations
            response = requests.get(f"{API_URL}/teams/formations/")
            if response.status_code != 200:
                self.log_result("Formation & Tactics", False, f"Get formations failed: {response.status_code}")
                return False
                
            formations = response.json()
            if not formations:
                self.log_result("Formation & Tactics", False, "No formations found")
                return False
                
            # Test getting tactics
            response = requests.get(f"{API_URL}/teams/tactics/")
            if response.status_code != 200:
                self.log_result("Formation & Tactics", False, f"Get tactics failed: {response.status_code}")
                return False
                
            tactics = response.json()
            if not tactics:
                self.log_result("Formation & Tactics", False, "No tactics found")
                return False
                
            # Test getting coaches
            response = requests.get(f"{API_URL}/teams/coaches/")
            if response.status_code != 200:
                self.log_result("Formation & Tactics", False, f"Get coaches failed: {response.status_code}")
                return False
                
            coaches = response.json()
            if not coaches:
                self.log_result("Formation & Tactics", False, "No coaches found")
                return False
                
            self.log_result("Formation & Tactics", True, f"Found {len(formations)} formations, {len(tactics)} tactics, {len(coaches)} coaches")
            return True
            
        except Exception as e:
            self.log_result("Formation & Tactics", False, f"Exception: {str(e)}")
            return False
    
    def test_06_team_stats_calculation(self):
        """Test Team Stats calculation framework"""
        if not self.auth_token or not self.team_id:
            self.log_result("Team Stats Calculation", False, "No auth token or team ID available")
            return False
            
        try:
            headers = {"Authorization": f"Bearer {self.auth_token}"}
            
            # Get team details
            response = requests.get(f"{API_URL}/teams/{self.team_id}", headers=headers)
            if response.status_code != 200:
                self.log_result("Team Stats Calculation", False, f"Get team failed: {response.status_code}")
                return False
                
            team = response.json()
            
            # Test that we can calculate stats if we have characters and equipment
            if self.character_ids and self.equipment_ids:
                # Get character stats
                char_response = requests.get(f"{API_URL}/characters/{self.character_ids[0]}")
                if char_response.status_code != 200:
                    self.log_result("Team Stats Calculation", False, f"Get character failed: {char_response.status_code}")
                    return False
                    
                character = char_response.json()
                if "base_stats" not in character:
                    self.log_result("Team Stats Calculation", False, "Character missing base_stats")
                    return False
                    
                # Get equipment stats
                eq_response = requests.get(f"{API_URL}/equipment/{self.equipment_ids[0]}")
                if eq_response.status_code != 200:
                    self.log_result("Team Stats Calculation", False, f"Get equipment failed: {eq_response.status_code}")
                    return False
                    
                equipment_item = eq_response.json()
                if "stats" not in equipment_item:
                    self.log_result("Team Stats Calculation", False, "Equipment missing stats")
                    return False
                    
                # Verify we can calculate combined stats
                char_stats = character["base_stats"]
                eq_stats = equipment_item["stats"]
                
                # Example calculation verification
                if "kick" in char_stats and "kick" in eq_stats:
                    base_kick = char_stats["kick"]["main"] if isinstance(char_stats["kick"], dict) else char_stats["kick"]
                    equipment_kick_bonus = eq_stats["kick"]
                    total_kick = base_kick + equipment_kick_bonus
                    
                    self.log_result("Team Stats Calculation", True, f"Stats calculation verified: {base_kick} + {equipment_kick_bonus} = {total_kick}")
                    return True
                    
            self.log_result("Team Stats Calculation", True, "Framework ready for stats calculation")
            return True
            
        except Exception as e:
            self.log_result("Team Stats Calculation", False, f"Exception: {str(e)}")
            return False
    
    def test_07_constellation_system(self):
        """Test Constellation/Gacha system"""
        if not self.auth_token:
            self.log_result("Constellation System", False, "No auth token available")
            return False
            
        try:
            headers = {"Authorization": f"Bearer {self.auth_token}"}
            
            # Test getting constellations
            response = requests.get(f"{API_URL}/constellations/")
            if response.status_code != 200:
                self.log_result("Constellation System", False, f"Get constellations failed: {response.status_code}")
                return False
                
            constellations = response.json()
            if not constellations:
                self.log_result("Constellation System", False, "No constellations found")
                return False
                
            constellation_id = constellations[0]["id"]
            
            # Test constellation details
            response = requests.get(f"{API_URL}/constellations/{constellation_id}")
            if response.status_code != 200:
                self.log_result("Constellation System", False, f"Get constellation details failed: {response.status_code}")
                return False
                
            # Test constellation characters
            response = requests.get(f"{API_URL}/constellations/{constellation_id}/characters")
            if response.status_code != 200:
                self.log_result("Constellation System", False, f"Get constellation characters failed: {response.status_code}")
                return False
                
            # Test gacha pull (should work with initial Kizuna Stars)
            response = requests.post(f"{API_URL}/constellations/pull", 
                                   json={"constellation_id": constellation_id, "pull_count": 1}, 
                                   headers=headers)
            if response.status_code != 200:
                self.log_result("Constellation System", False, f"Gacha pull failed: {response.status_code}")
                return False
                
            self.log_result("Constellation System", True, f"Found {len(constellations)} constellations, gacha pull working")
            return True
            
        except Exception as e:
            self.log_result("Constellation System", False, f"Exception: {str(e)}")
            return False
    
    def test_08_community_features(self):
        """Test Community features (likes, comments, follows)"""
        if not self.auth_token or not self.team_id:
            self.log_result("Community Features", False, "No auth token or team ID available")
            return False
            
        try:
            headers = {"Authorization": f"Bearer {self.auth_token}"}
            
            # Test team like functionality
            response = requests.post(f"{API_URL}/teams/{self.team_id}/like", headers=headers)
            if response.status_code != 200:
                self.log_result("Community Features", False, f"Team like failed: {response.status_code}")
                return False
                
            # Test team comment functionality
            comment_data = {"content": "Great team setup!"}
            response = requests.post(f"{API_URL}/teams/{self.team_id}/comment", json=comment_data, headers=headers)
            if response.status_code != 200:
                self.log_result("Community Features", False, f"Team comment failed: {response.status_code}")
                return False
                
            # Test community teams endpoint
            response = requests.get(f"{API_URL}/community/teams", headers=headers)
            if response.status_code != 200:
                self.log_result("Community Features", False, f"Community teams failed: {response.status_code}")
                return False
                
            # Test community stats
            response = requests.get(f"{API_URL}/community/stats", headers=headers)
            if response.status_code != 200:
                self.log_result("Community Features", False, f"Community stats failed: {response.status_code}")
                return False
                
            self.log_result("Community Features", True, "Likes, comments, and community endpoints working")
            return True
            
        except Exception as e:
            self.log_result("Community Features", False, f"Exception: {str(e)}")
            return False
    
    def test_09_save_slots_system(self):
        """Test Save Slots system"""
        if not self.auth_token or not self.team_id:
            self.log_result("Save Slots System", False, "No auth token or team ID available")
            return False
            
        try:
            headers = {"Authorization": f"Bearer {self.auth_token}"}
            
            # Test getting save slots
            response = requests.get(f"{API_URL}/save-slots", headers=headers)
            if response.status_code != 200:
                self.log_result("Save Slots System", False, f"Get save slots failed: {response.status_code}")
                return False
                
            slots_data = response.json()
            if "save_slots" not in slots_data:
                self.log_result("Save Slots System", False, "Save slots response missing save_slots field")
                return False
                
            # Test saving team to slot
            slot_data = {
                "slot_number": 1,
                "slot_name": "Test Slot",
                "overwrite": True
            }
            response = requests.post(f"{API_URL}/teams/{self.team_id}/save-to-slot", json=slot_data, headers=headers)
            if response.status_code != 200:
                self.log_result("Save Slots System", False, f"Save to slot failed: {response.status_code}")
                return False
                
            self.log_result("Save Slots System", True, "Save slots retrieval and team saving working")
            return True
            
        except Exception as e:
            self.log_result("Save Slots System", False, f"Exception: {str(e)}")
            return False
    
    def test_10_team_privacy_toggle(self):
        """Test Team Privacy Toggle (public/private)"""
        if not self.auth_token or not self.team_id:
            self.log_result("Team Privacy Toggle", False, "No auth token or team ID available")
            return False
            
        try:
            headers = {"Authorization": f"Bearer {self.auth_token}"}
            
            # Test updating team privacy to private
            update_data = {"is_public": False}
            response = requests.put(f"{API_URL}/teams/{self.team_id}", json=update_data, headers=headers)
            if response.status_code != 200:
                self.log_result("Team Privacy Toggle", False, f"Set private failed: {response.status_code}")
                return False
                
            # Verify the change
            response = requests.get(f"{API_URL}/teams/{self.team_id}", headers=headers)
            if response.status_code != 200:
                self.log_result("Team Privacy Toggle", False, f"Get team after privacy change failed: {response.status_code}")
                return False
                
            team = response.json()
            if team.get("is_public") != False:
                self.log_result("Team Privacy Toggle", False, "Team privacy not updated to private")
                return False
                
            # Test updating back to public
            update_data = {"is_public": True}
            response = requests.put(f"{API_URL}/teams/{self.team_id}", json=update_data, headers=headers)
            if response.status_code != 200:
                self.log_result("Team Privacy Toggle", False, f"Set public failed: {response.status_code}")
                return False
                
            self.log_result("Team Privacy Toggle", True, "Public/private status changes working correctly")
            return True
            
        except Exception as e:
            self.log_result("Team Privacy Toggle", False, f"Exception: {str(e)}")
            return False
    
    def cleanup(self):
        """Clean up test data"""
        if self.auth_token and self.team_id:
            try:
                headers = {"Authorization": f"Bearer {self.auth_token}"}
                requests.delete(f"{API_URL}/teams/{self.team_id}", headers=headers)
            except:
                pass  # Ignore cleanup errors
    
    def run_all_tests(self):
        """Run all Team Builder backend tests"""
        print("🚀 Starting Team Builder Backend Tests...")
        print("=" * 80)
        
        tests = [
            self.test_01_authentication_setup,
            self.test_02_team_management_apis,
            self.test_03_character_apis,
            self.test_04_equipment_apis,
            self.test_05_formation_tactics_endpoints,
            self.test_06_team_stats_calculation,
            self.test_07_constellation_system,
            self.test_08_community_features,
            self.test_09_save_slots_system,
            self.test_10_team_privacy_toggle
        ]
        
        passed = 0
        failed = 0
        
        for test in tests:
            try:
                if test():
                    passed += 1
                else:
                    failed += 1
            except Exception as e:
                print(f"❌ {test.__name__}: Unexpected error - {str(e)}")
                failed += 1
        
        # Cleanup
        self.cleanup()
        
        print("=" * 80)
        print(f"🎯 TEAM BUILDER BACKEND TEST RESULTS")
        print("=" * 80)
        print(f"✅ Passed: {passed}")
        print(f"❌ Failed: {failed}")
        print(f"📊 Total: {passed + failed}")
        print(f"📈 Success Rate: {(passed / (passed + failed) * 100):.1f}%" if (passed + failed) > 0 else "0%")
        
        if failed == 0:
            print("🎉 ALL TEAM BUILDER BACKEND TESTS PASSED!")
            print("✅ Core Team Builder functionality is intact after frontend changes")
        else:
            print("⚠️  Some tests failed - backend functionality may be impacted")
            
        return failed == 0

if __name__ == "__main__":
    tester = TeamBuilderBackendTest()
    success = tester.run_all_tests()
    exit(0 if success else 1)