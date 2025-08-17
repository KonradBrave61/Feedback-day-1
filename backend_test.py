#!/usr/bin/env python3
"""
Team Builder Backend API Testing Suite
Tests all team builder functionality after frontend UI changes
"""

import requests
import json
import uuid
from datetime import datetime

# Configuration
BACKEND_URL = "https://matchup-tool.preview.emergentagent.com/api"

class TeamBuilderAPITester:
    def __init__(self):
        self.auth_token = None
        self.user_id = None
        self.test_results = []
        
    def log_result(self, test_name, success, details=""):
        """Log test result"""
        status = "✅ PASS" if success else "❌ FAIL"
        self.test_results.append({
            "test": test_name,
            "status": status,
            "details": details
        })
        print(f"{status}: {test_name}")
        if details:
            print(f"   Details: {details}")
    
    def authenticate(self):
        """Authenticate user and get token"""
        print("\n🔐 AUTHENTICATION TESTING")
        
        # Register a test user
        register_data = {
            "username": f"teambuilder_test_{uuid.uuid4().hex[:8]}",
            "email": f"test_{uuid.uuid4().hex[:8]}@example.com",
            "password": "TestPassword123!",
            "favourite_team": "Raimon",
            "profile_picture": "https://example.com/avatar.jpg",
            "bio": "Team builder test user"
        }
        
        try:
            response = requests.post(f"{BACKEND_URL}/auth/register", json=register_data)
            if response.status_code == 200:
                data = response.json()
                self.auth_token = data.get("access_token")
                self.user_id = data.get("user", {}).get("id")
                self.log_result("User Registration", True, f"Token obtained, User ID: {self.user_id}")
                return True
            else:
                self.log_result("User Registration", False, f"Status: {response.status_code}, Response: {response.text}")
                return False
        except Exception as e:
            self.log_result("User Registration", False, f"Exception: {str(e)}")
            return False
    
    def get_headers(self):
        """Get authorization headers"""
        return {"Authorization": f"Bearer {self.auth_token}"}
    
    def test_formations_api(self):
        """Test formation endpoints"""
        print("\n🏟️ FORMATION API TESTING")
        
        try:
            # Test get all formations
            response = requests.get(f"{BACKEND_URL}/teams/formations/")
            if response.status_code == 200:
                formations = response.json()
                self.log_result("GET /teams/formations/", True, f"Retrieved {len(formations)} formations")
                
                # Test specific formation if available
                if formations:
                    formation_id = formations[0].get("id")
                    response = requests.get(f"{BACKEND_URL}/teams/formations/{formation_id}")
                    if response.status_code == 200:
                        formation = response.json()
                        self.log_result("GET /teams/formations/{id}", True, f"Formation: {formation.get('name')}")
                    else:
                        self.log_result("GET /teams/formations/{id}", False, f"Status: {response.status_code}")
                else:
                    self.log_result("Formation Data Check", False, "No formations available")
            else:
                self.log_result("GET /teams/formations/", False, f"Status: {response.status_code}")
        except Exception as e:
            self.log_result("Formation API Test", False, f"Exception: {str(e)}")
    
    def test_tactics_api(self):
        """Test tactics endpoints"""
        print("\n⚡ TACTICS API TESTING")
        
        try:
            # Test get all tactics
            response = requests.get(f"{BACKEND_URL}/teams/tactics/")
            if response.status_code == 200:
                tactics = response.json()
                self.log_result("GET /teams/tactics/", True, f"Retrieved {len(tactics)} tactics")
                
                # Test specific tactic if available
                if tactics:
                    tactic_id = tactics[0].get("id")
                    response = requests.get(f"{BACKEND_URL}/teams/tactics/{tactic_id}")
                    if response.status_code == 200:
                        tactic = response.json()
                        self.log_result("GET /teams/tactics/{id}", True, f"Tactic: {tactic.get('name')}")
                    else:
                        self.log_result("GET /teams/tactics/{id}", False, f"Status: {response.status_code}")
                else:
                    self.log_result("Tactics Data Check", False, "No tactics available")
            else:
                self.log_result("GET /teams/tactics/", False, f"Status: {response.status_code}")
        except Exception as e:
            self.log_result("Tactics API Test", False, f"Exception: {str(e)}")
    
    def test_coaches_api(self):
        """Test coach selection endpoints"""
        print("\n👨‍💼 COACH SELECTION API TESTING")
        
        try:
            # Test get all coaches
            response = requests.get(f"{BACKEND_URL}/teams/coaches/")
            if response.status_code == 200:
                coaches = response.json()
                self.log_result("GET /teams/coaches/", True, f"Retrieved {len(coaches)} coaches")
                
                # Test specific coach if available
                if coaches:
                    coach_id = coaches[0].get("id")
                    response = requests.get(f"{BACKEND_URL}/teams/coaches/{coach_id}")
                    if response.status_code == 200:
                        coach = response.json()
                        self.log_result("GET /teams/coaches/{id}", True, f"Coach: {coach.get('name')}")
                    else:
                        self.log_result("GET /teams/coaches/{id}", False, f"Status: {response.status_code}")
                else:
                    self.log_result("Coach Data Check", False, "No coaches available")
            else:
                self.log_result("GET /teams/coaches/", False, f"Status: {response.status_code}")
        except Exception as e:
            self.log_result("Coach API Test", False, f"Exception: {str(e)}")
    
    def test_characters_api(self):
        """Test character management endpoints"""
        print("\n👥 CHARACTER MANAGEMENT API TESTING")
        
        try:
            # Test get all characters
            response = requests.get(f"{BACKEND_URL}/characters/")
            if response.status_code == 200:
                characters = response.json()
                self.log_result("GET /characters/", True, f"Retrieved {len(characters)} characters")
                
                # Test character filtering by position
                response = requests.get(f"{BACKEND_URL}/characters/?position=GK")
                if response.status_code == 200:
                    gk_characters = response.json()
                    self.log_result("Character Position Filter (GK)", True, f"Found {len(gk_characters)} goalkeepers")
                else:
                    self.log_result("Character Position Filter", False, f"Status: {response.status_code}")
                
                # Test character filtering by element
                response = requests.get(f"{BACKEND_URL}/characters/?element=Fire")
                if response.status_code == 200:
                    fire_characters = response.json()
                    self.log_result("Character Element Filter (Fire)", True, f"Found {len(fire_characters)} fire characters")
                else:
                    self.log_result("Character Element Filter", False, f"Status: {response.status_code}")
                
                # Test specific character if available
                if characters:
                    character_id = characters[0].get("id")
                    response = requests.get(f"{BACKEND_URL}/characters/{character_id}")
                    if response.status_code == 200:
                        character = response.json()
                        self.log_result("GET /characters/{id}", True, f"Character: {character.get('name')}")
                    else:
                        self.log_result("GET /characters/{id}", False, f"Status: {response.status_code}")
            else:
                self.log_result("GET /characters/", False, f"Status: {response.status_code}")
        except Exception as e:
            self.log_result("Character API Test", False, f"Exception: {str(e)}")
    
    def test_equipment_api(self):
        """Test equipment management endpoints"""
        print("\n⚽ EQUIPMENT MANAGEMENT API TESTING")
        
        try:
            # Test get all equipment
            response = requests.get(f"{BACKEND_URL}/equipment/")
            if response.status_code == 200:
                equipment = response.json()
                self.log_result("GET /equipment/", True, f"Retrieved {len(equipment)} equipment items")
                
                # Test equipment filtering by category
                response = requests.get(f"{BACKEND_URL}/equipment/?category=Boots")
                if response.status_code == 200:
                    boots = response.json()
                    self.log_result("Equipment Category Filter (Boots)", True, f"Found {len(boots)} boots")
                else:
                    self.log_result("Equipment Category Filter", False, f"Status: {response.status_code}")
                
                # Test equipment filtering by rarity
                response = requests.get(f"{BACKEND_URL}/equipment/?rarity=Legendary")
                if response.status_code == 200:
                    legendary_equipment = response.json()
                    self.log_result("Equipment Rarity Filter (Legendary)", True, f"Found {len(legendary_equipment)} legendary items")
                else:
                    self.log_result("Equipment Rarity Filter", False, f"Status: {response.status_code}")
                
                # Test specific equipment if available
                if equipment:
                    equipment_id = equipment[0].get("id")
                    response = requests.get(f"{BACKEND_URL}/equipment/{equipment_id}")
                    if response.status_code == 200:
                        item = response.json()
                        self.log_result("GET /equipment/{id}", True, f"Equipment: {item.get('name')}")
                    else:
                        self.log_result("GET /equipment/{id}", False, f"Status: {response.status_code}")
            else:
                self.log_result("GET /equipment/", False, f"Status: {response.status_code}")
        except Exception as e:
            self.log_result("Equipment API Test", False, f"Exception: {str(e)}")
    
    def test_team_management_api(self):
        """Test team management endpoints"""
        print("\n🏆 TEAM MANAGEMENT API TESTING")
        
        if not self.auth_token:
            self.log_result("Team Management Test", False, "No authentication token available")
            return
        
        try:
            # Test get user teams (should be empty initially)
            response = requests.get(f"{BACKEND_URL}/teams", headers=self.get_headers())
            if response.status_code == 200:
                teams = response.json()
                self.log_result("GET /teams (user teams)", True, f"User has {len(teams)} teams")
            else:
                self.log_result("GET /teams", False, f"Status: {response.status_code}")
            
            # Test save slots
            response = requests.get(f"{BACKEND_URL}/save-slots", headers=self.get_headers())
            if response.status_code == 200:
                slots_data = response.json()
                save_slots = slots_data.get("save_slots", [])
                self.log_result("GET /save-slots", True, f"Retrieved {len(save_slots)} save slots")
            else:
                self.log_result("GET /save-slots", False, f"Status: {response.status_code}")
            
            # Test community teams
            response = requests.get(f"{BACKEND_URL}/community/teams", headers=self.get_headers())
            if response.status_code == 200:
                community_teams = response.json()
                self.log_result("GET /community/teams", True, f"Retrieved {len(community_teams)} community teams")
            else:
                self.log_result("GET /community/teams", False, f"Status: {response.status_code}")
                
        except Exception as e:
            self.log_result("Team Management API Test", False, f"Exception: {str(e)}")
    
    def test_team_creation_and_saving(self):
        """Test team creation and saving functionality"""
        print("\n💾 TEAM CREATION & SAVING API TESTING")
        
        if not self.auth_token:
            self.log_result("Team Creation Test", False, "No authentication token available")
            return
        
        try:
            # Create a test team
            team_data = {
                "name": f"Test Team {uuid.uuid4().hex[:8]}",
                "formation": "4-4-2",
                "players": [
                    {
                        "character_id": "test_char_1",
                        "position_id": "GK",
                        "user_level": 50,
                        "user_rarity": "Epic",
                        "user_equipment": {
                            "boots": {"id": "boots_1", "name": "Speed Boots", "stats": {"agility": 10}},
                            "bracelets": {"id": "bracelet_1", "name": "Power Bracelet", "stats": {"kick": 15}},
                            "pendants": {"id": "pendant_1", "name": "Focus Pendant", "stats": {"technique": 12}}
                        },
                        "user_hissatsu": [
                            {"id": "hissatsu_1", "name": "Fire Shot", "type": "Shot", "element": "Fire", "power": 120}
                        ]
                    },
                    {
                        "character_id": "test_char_2",
                        "position_id": "DF",
                        "user_level": 45,
                        "user_rarity": "Rare",
                        "user_equipment": {
                            "boots": {"id": "boots_2", "name": "Defense Boots", "stats": {"pressure": 8}},
                            "bracelets": {"id": "bracelet_2", "name": "Guard Bracelet", "stats": {"physical": 10}},
                            "pendants": {"id": "pendant_2", "name": "Shield Pendant", "stats": {"pressure": 7}}
                        },
                        "user_hissatsu": [
                            {"id": "hissatsu_2", "name": "Block", "type": "Defense", "element": "Earth", "power": 90}
                        ]
                    },
                    {
                        "character_id": "test_char_3",
                        "position_id": "MF",
                        "user_level": 48,
                        "user_rarity": "Epic",
                        "user_equipment": {
                            "boots": {"id": "boots_3", "name": "Control Boots", "stats": {"control": 12}},
                            "bracelets": {"id": "bracelet_3", "name": "Pass Bracelet", "stats": {"intelligence": 9}},
                            "pendants": {"id": "pendant_3", "name": "Vision Pendant", "stats": {"intelligence": 11}}
                        },
                        "user_hissatsu": [
                            {"id": "hissatsu_3", "name": "Lightning Pass", "type": "Pass", "element": "Lightning", "power": 100}
                        ]
                    }
                ],
                "bench_players": [
                    {
                        "character_id": "bench_char_1",
                        "slot_id": "bench_1",
                        "user_level": 40,
                        "user_rarity": "Common",
                        "user_equipment": {
                            "boots": {"id": "boots_4", "name": "Basic Boots", "stats": {"agility": 5}},
                            "bracelets": None,
                            "pendants": None
                        },
                        "user_hissatsu": [
                            {"id": "hissatsu_4", "name": "Basic Shot", "type": "Shot", "element": "Wind", "power": 70}
                        ]
                    },
                    {
                        "character_id": "bench_char_2",
                        "slot_id": "bench_2",
                        "user_level": 42,
                        "user_rarity": "Rare",
                        "user_equipment": {
                            "boots": {"id": "boots_5", "name": "Speed Boots", "stats": {"agility": 8}},
                            "bracelets": {"id": "bracelet_5", "name": "Sub Bracelet", "stats": {"kick": 6}},
                            "pendants": None
                        },
                        "user_hissatsu": [
                            {"id": "hissatsu_5", "name": "Wind Dribble", "type": "Dribble", "element": "Wind", "power": 85}
                        ]
                    },
                    {
                        "character_id": "bench_char_3",
                        "slot_id": "bench_3",
                        "user_level": 38,
                        "user_rarity": "Common",
                        "user_equipment": {
                            "boots": None,
                            "bracelets": None,
                            "pendants": {"id": "pendant_6", "name": "Basic Pendant", "stats": {"technique": 4}}
                        },
                        "user_hissatsu": [
                            {"id": "hissatsu_6", "name": "Earth Block", "type": "Defense", "element": "Earth", "power": 75}
                        ]
                    }
                ],
                "tactics": [
                    {"id": "tactic_1", "name": "Offensive", "description": "Focus on attacking", "effect": "+10% attack"},
                    {"id": "tactic_2", "name": "Defensive", "description": "Focus on defense", "effect": "+10% defense"}
                ],
                "coach": {
                    "id": "coach_1",
                    "name": "Test Coach",
                    "title": "Master Tactician",
                    "portrait": "coach_portrait.jpg",
                    "bonuses": {"kick": 5, "control": 3, "technique": 4},
                    "specialties": ["Formation", "Motivation"]
                },
                "description": "A test team for API validation",
                "is_public": True,
                "tags": ["test", "api", "validation"],
                "save_slot": 1,
                "save_slot_name": "Test Slot 1"
            }
            
            # Create team
            response = requests.post(f"{BACKEND_URL}/teams", json=team_data, headers=self.get_headers())
            if response.status_code == 200:
                created_team = response.json()
                team_id = created_team.get("id")
                self.log_result("POST /teams (team creation)", True, f"Team created with ID: {team_id}")
                
                # Test team details retrieval
                if team_id:
                    response = requests.get(f"{BACKEND_URL}/teams/{team_id}/details", headers=self.get_headers())
                    if response.status_code == 200:
                        team_details = response.json()
                        team_data = team_details.get("team", {})
                        
                        # Verify team structure
                        players = team_data.get("players", [])
                        bench_players = team_data.get("bench_players", [])
                        tactics = team_data.get("tactics", [])
                        coach = team_data.get("coach", {})
                        
                        self.log_result("GET /teams/{id}/details", True, 
                                      f"Team details retrieved - Players: {len(players)}, Bench: {len(bench_players)}, Tactics: {len(tactics)}, Coach: {coach.get('name', 'N/A')}")
                        
                        # Verify bench players have slot_id preservation
                        bench_with_slots = [p for p in bench_players if p.get("slot_id")]
                        self.log_result("Bench Players Slot ID Preservation", len(bench_with_slots) == len(bench_players), 
                                      f"Bench players with slot_id: {len(bench_with_slots)}/{len(bench_players)}")
                        
                        # Verify player equipment and techniques
                        players_with_equipment = [p for p in players if p.get("user_equipment")]
                        players_with_techniques = [p for p in players if p.get("user_hissatsu")]
                        
                        self.log_result("Player Equipment Data", len(players_with_equipment) > 0, 
                                      f"Players with equipment: {len(players_with_equipment)}/{len(players)}")
                        self.log_result("Player Techniques Data", len(players_with_techniques) > 0, 
                                      f"Players with techniques: {len(players_with_techniques)}/{len(players)}")
                        
                    else:
                        self.log_result("GET /teams/{id}/details", False, f"Status: {response.status_code}")
                
            else:
                self.log_result("POST /teams", False, f"Status: {response.status_code}, Response: {response.text}")
                
        except Exception as e:
            self.log_result("Team Creation & Saving Test", False, f"Exception: {str(e)}")
    
    def test_team_privacy_toggle(self):
        """Test team privacy toggle functionality"""
        print("\n🔒 TEAM PRIVACY TOGGLE API TESTING")
        
        if not self.auth_token:
            self.log_result("Team Privacy Test", False, "No authentication token available")
            return
        
        try:
            # Get user teams first
            response = requests.get(f"{BACKEND_URL}/teams", headers=self.get_headers())
            if response.status_code == 200:
                teams = response.json()
                if teams:
                    team_id = teams[0].get("id")
                    current_privacy = teams[0].get("is_public", False)
                    
                    # Toggle privacy
                    update_data = {"is_public": not current_privacy}
                    response = requests.put(f"{BACKEND_URL}/teams/{team_id}", json=update_data, headers=self.get_headers())
                    
                    if response.status_code == 200:
                        updated_team = response.json()
                        new_privacy = updated_team.get("is_public")
                        self.log_result("PUT /teams/{id} (privacy toggle)", True, 
                                      f"Privacy changed from {current_privacy} to {new_privacy}")
                    else:
                        self.log_result("PUT /teams/{id} (privacy toggle)", False, f"Status: {response.status_code}")
                else:
                    self.log_result("Team Privacy Test", False, "No teams available for privacy testing")
            else:
                self.log_result("Team Privacy Test", False, f"Failed to get user teams: {response.status_code}")
                
        except Exception as e:
            self.log_result("Team Privacy Toggle Test", False, f"Exception: {str(e)}")
    
    def run_all_tests(self):
        """Run all team builder API tests"""
        print("🚀 STARTING TEAM BUILDER BACKEND API TESTING")
        print("=" * 60)
        
        # Authentication
        if not self.authenticate():
            print("❌ Authentication failed. Skipping authenticated tests.")
            return
        
        # Test all endpoints
        self.test_formations_api()
        self.test_tactics_api()
        self.test_coaches_api()
        self.test_characters_api()
        self.test_equipment_api()
        self.test_team_management_api()
        self.test_team_creation_and_saving()
        self.test_team_privacy_toggle()
        
        # Summary
        print("\n" + "=" * 60)
        print("📊 TEST RESULTS SUMMARY")
        print("=" * 60)
        
        passed = sum(1 for result in self.test_results if "✅ PASS" in result["status"])
        failed = sum(1 for result in self.test_results if "❌ FAIL" in result["status"])
        total = len(self.test_results)
        
        print(f"Total Tests: {total}")
        print(f"Passed: {passed}")
        print(f"Failed: {failed}")
        print(f"Success Rate: {(passed/total*100):.1f}%" if total > 0 else "0%")
        
        if failed > 0:
            print("\n❌ FAILED TESTS:")
            for result in self.test_results:
                if "❌ FAIL" in result["status"]:
                    print(f"  - {result['test']}: {result['details']}")
        
        print("\n✅ TESTING COMPLETED")
        return passed, failed, total

if __name__ == "__main__":
    tester = TeamBuilderAPITester()
    tester.run_all_tests()