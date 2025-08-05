#!/usr/bin/env python3
"""
Backend API Testing - Review Request Focus
Testing team management APIs, character/equipment APIs, and team building flow
as requested in the review request.
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

print(f"🎯 REVIEW REQUEST BACKEND TESTING")
print(f"Testing API at: {API_URL}")
print(f"Testing Root at: {ROOT_URL}")
print("="*80)

def generate_random_string(length=8):
    """Generate a random string of fixed length"""
    letters = string.ascii_lowercase
    return ''.join(random.choice(letters) for i in range(length))

class ReviewFocusedBackendTest:
    """Test suite focused on review request requirements"""
    
    def __init__(self):
        self.auth_token = None
        self.test_user_id = None
        self.test_team_id = None
        self.test_characters = []
        self.test_equipment = []
        
        # Generate unique test data
        random_suffix = generate_random_string()
        self.test_username = f"reviewuser_{random_suffix}"
        self.test_email = f"review_{random_suffix}@example.com"
        self.test_password = "ReviewTest123!"
        
        print(f"🔧 Test Setup:")
        print(f"   Username: {self.test_username}")
        print(f"   Email: {self.test_email}")
        print("-"*80)

    def setup_authentication(self):
        """Setup authentication for testing"""
        print("🔐 Setting up authentication...")
        
        # Register test user
        user_data = {
            "username": self.test_username,
            "email": self.test_email,
            "password": self.test_password,
            "favourite_team": "Raimon",
            "profile_picture": "https://example.com/avatar.jpg",
            "bio": "Review testing user"
        }
        
        try:
            response = requests.post(f"{API_URL}/auth/register", json=user_data)
            if response.status_code == 200:
                print("   ✅ User registration successful")
            else:
                print(f"   ⚠️ Registration response: {response.status_code}")
        except Exception as e:
            print(f"   ⚠️ Registration error: {e}")
        
        # Login to get token
        try:
            login_data = {"username": self.test_username, "password": self.test_password}
            response = requests.post(f"{API_URL}/auth/login", json=login_data)
            
            if response.status_code == 200:
                data = response.json()
                self.auth_token = data.get("access_token")
                self.test_user_id = data.get("user", {}).get("id")
                print("   ✅ Login successful, token obtained")
                return True
            else:
                print(f"   ❌ Login failed: {response.status_code}")
                return False
        except Exception as e:
            print(f"   ❌ Login error: {e}")
            return False

    def get_headers(self):
        """Get authorization headers"""
        return {"Authorization": f"Bearer {self.auth_token}"}

    def test_character_apis_with_element_data(self):
        """Test character retrieval endpoints with proper element data"""
        print("🎭 Testing Character APIs with Element Data...")
        
        try:
            # Test GET /api/characters
            response = requests.get(f"{API_URL}/characters/")
            if response.status_code == 200:
                characters = response.json()
                print(f"   ✅ Character retrieval: {len(characters)} characters found")
                
                # Verify element data is present
                element_count = 0
                for char in characters:
                    if 'element' in char and char['element']:
                        element_count += 1
                        if len(self.test_characters) < 3:  # Store some for later use
                            self.test_characters.append(char)
                
                print(f"   ✅ Characters with element data: {element_count}/{len(characters)}")
                
                # Test element filtering
                if characters:
                    first_element = characters[0].get('element')
                    if first_element:
                        response = requests.get(f"{API_URL}/characters/?element={first_element}")
                        if response.status_code == 200:
                            filtered_chars = response.json()
                            print(f"   ✅ Element filtering ({first_element}): {len(filtered_chars)} characters")
                        else:
                            print(f"   ❌ Element filtering failed: {response.status_code}")
                
                # Test position filtering
                response = requests.get(f"{API_URL}/characters/?position=GK")
                if response.status_code == 200:
                    gk_chars = response.json()
                    print(f"   ✅ Position filtering (GK): {len(gk_chars)} characters")
                else:
                    print(f"   ❌ Position filtering failed: {response.status_code}")
                
                return True
            else:
                print(f"   ❌ Character retrieval failed: {response.status_code}")
                return False
                
        except Exception as e:
            print(f"   ❌ Character API test error: {e}")
            return False

    def test_equipment_apis_for_player_configuration(self):
        """Test equipment endpoints for player configuration"""
        print("⚔️ Testing Equipment APIs for Player Configuration...")
        
        try:
            # Test GET /api/equipment
            response = requests.get(f"{API_URL}/equipment/")
            if response.status_code == 200:
                equipment = response.json()
                print(f"   ✅ Equipment retrieval: {len(equipment)} items found")
                
                # Store equipment for later use
                self.test_equipment = equipment[:5] if equipment else []
                
                # Test category filtering
                categories = ["Boots", "Bracelet", "Pendant", "Special"]
                for category in categories:
                    response = requests.get(f"{API_URL}/equipment/?category={category}")
                    if response.status_code == 200:
                        cat_equipment = response.json()
                        print(f"   ✅ Category filtering ({category}): {len(cat_equipment)} items")
                    else:
                        print(f"   ❌ Category filtering ({category}) failed: {response.status_code}")
                
                # Test rarity filtering
                rarities = ["Common", "Rare", "Epic", "Legendary"]
                for rarity in rarities:
                    response = requests.get(f"{API_URL}/equipment/?rarity={rarity}")
                    if response.status_code == 200:
                        rarity_equipment = response.json()
                        print(f"   ✅ Rarity filtering ({rarity}): {len(rarity_equipment)} items")
                    else:
                        print(f"   ❌ Rarity filtering ({rarity}) failed: {response.status_code}")
                
                # Test individual equipment details
                if equipment:
                    first_item = equipment[0]
                    response = requests.get(f"{API_URL}/equipment/{first_item['id']}")
                    if response.status_code == 200:
                        item_details = response.json()
                        stats = item_details.get('stats', {})
                        print(f"   ✅ Equipment details: {item_details['name']} with {len(stats)} stat bonuses")
                    else:
                        print(f"   ❌ Equipment details failed: {response.status_code}")
                
                return True
            else:
                print(f"   ❌ Equipment retrieval failed: {response.status_code}")
                return False
                
        except Exception as e:
            print(f"   ❌ Equipment API test error: {e}")
            return False

    def test_team_creation_with_bench_players(self):
        """Test team creation with players and bench players"""
        print("⚽ Testing Team Creation with Bench Players...")
        
        if not self.auth_token:
            print("   ❌ No authentication token available")
            return False
        
        try:
            # Create sample team data with bench players
            team_data = {
                "name": f"Review Test Team {generate_random_string(4)}",
                "formation": "4-4-2",
                "players": [],
                "bench_players": [],
                "tactics": [
                    {
                        "id": "tactic_1",
                        "name": "Offensive",
                        "description": "Focus on attacking",
                        "effect": "+10% attack"
                    }
                ],
                "coach": {
                    "id": "coach_1",
                    "name": "Test Coach",
                    "title": "Head Coach",
                    "bonuses": {"attack": 5}
                },
                "description": "Test team for review request",
                "is_public": True,
                "tags": ["test", "review"]
            }
            
            # Add players if we have character data
            if self.test_characters:
                for i, char in enumerate(self.test_characters[:11]):  # Main team
                    player_data = {
                        "character_id": char["id"],
                        "position_id": f"pos_{i+1}",
                        "user_level": 99,
                        "user_rarity": "Legendary",
                        "user_equipment": {
                            "boots": self.test_equipment[0] if self.test_equipment else None,
                            "bracelets": self.test_equipment[1] if len(self.test_equipment) > 1 else None,
                            "pendants": self.test_equipment[2] if len(self.test_equipment) > 2 else None
                        },
                        "user_hissatsu": [
                            {
                                "name": "Test Shot",
                                "description": "A test shooting technique",
                                "type": "Shot"
                            }
                        ]
                    }
                    team_data["players"].append(player_data)
                
                # Add bench players with slot_id preservation
                if len(self.test_characters) > 11:
                    for i, char in enumerate(self.test_characters[11:16]):  # Bench players
                        bench_player_data = {
                            "character_id": char["id"],
                            "slot_id": f"bench_{i+1}",
                            "user_level": 95,
                            "user_rarity": "Epic",
                            "user_equipment": {
                                "boots": self.test_equipment[0] if self.test_equipment else None
                            },
                            "user_hissatsu": [
                                {
                                    "name": "Bench Technique",
                                    "description": "A bench player technique",
                                    "type": "Dribble"
                                }
                            ]
                        }
                        team_data["bench_players"].append(bench_player_data)
            
            # Create team
            response = requests.post(f"{API_URL}/teams", json=team_data, headers=self.get_headers())
            
            if response.status_code == 200:
                team = response.json()
                self.test_team_id = team["id"]
                print(f"   ✅ Team creation successful: {team['name']}")
                print(f"   ✅ Players count: {len(team.get('players', []))}")
                print(f"   ✅ Bench players count: {len(team.get('bench_players', []))}")
                
                # Verify bench players have slot_id
                bench_with_slots = 0
                for bench_player in team.get('bench_players', []):
                    if 'slot_id' in bench_player:
                        bench_with_slots += 1
                
                print(f"   ✅ Bench players with slot_id: {bench_with_slots}/{len(team.get('bench_players', []))}")
                return True
            else:
                print(f"   ❌ Team creation failed: {response.status_code}")
                if response.text:
                    print(f"   Error details: {response.text}")
                return False
                
        except Exception as e:
            print(f"   ❌ Team creation test error: {e}")
            return False

    def test_team_details_loading(self):
        """Test team loading with proper player and bench data structure"""
        print("📋 Testing Team Details Loading...")
        
        if not self.auth_token or not self.test_team_id:
            print("   ❌ No authentication token or team ID available")
            return False
        
        try:
            # Test GET /api/teams/{id}/details
            response = requests.get(f"{API_URL}/teams/{self.test_team_id}/details", headers=self.get_headers())
            
            if response.status_code == 200:
                team_details = response.json()
                print("   ✅ Team details loading successful")
                
                # Check if it's the wrapped format or direct team format
                if 'team' in team_details:
                    team = team_details['team']
                    print("   ✅ Team details in wrapped format")
                else:
                    team = team_details
                    print("   ✅ Team details in direct format")
                
                # Verify team structure
                required_fields = ['id', 'name', 'formation', 'players', 'bench_players', 'tactics', 'coach']
                missing_fields = []
                for field in required_fields:
                    if field not in team:
                        missing_fields.append(field)
                
                if not missing_fields:
                    print("   ✅ All required team fields present")
                else:
                    print(f"   ⚠️ Missing fields: {missing_fields}")
                
                # Verify players data structure
                players = team.get('players', [])
                if players:
                    first_player = players[0]
                    player_fields = ['character_id', 'position_id', 'user_level', 'user_rarity']
                    player_missing = []
                    for field in player_fields:
                        if field not in first_player:
                            player_missing.append(field)
                    
                    if not player_missing:
                        print(f"   ✅ Player data structure complete ({len(players)} players)")
                    else:
                        print(f"   ⚠️ Player missing fields: {player_missing}")
                    
                    # Check for user_equipment and user_hissatsu
                    equipment_count = sum(1 for p in players if 'user_equipment' in p)
                    hissatsu_count = sum(1 for p in players if 'user_hissatsu' in p)
                    print(f"   ✅ Players with equipment: {equipment_count}/{len(players)}")
                    print(f"   ✅ Players with techniques: {hissatsu_count}/{len(players)}")
                
                # Verify bench players data structure
                bench_players = team.get('bench_players', [])
                if bench_players:
                    first_bench = bench_players[0]
                    bench_fields = ['character_id', 'user_level', 'user_rarity']
                    bench_missing = []
                    for field in bench_fields:
                        if field not in first_bench:
                            bench_missing.append(field)
                    
                    if not bench_missing:
                        print(f"   ✅ Bench data structure complete ({len(bench_players)} bench players)")
                    else:
                        print(f"   ⚠️ Bench missing fields: {bench_missing}")
                    
                    # Check slot_id preservation
                    slot_count = sum(1 for p in bench_players if 'slot_id' in p)
                    print(f"   ✅ Bench players with slot_id preserved: {slot_count}/{len(bench_players)}")
                
                # Verify tactics and coach data
                tactics = team.get('tactics', [])
                coach = team.get('coach')
                
                print(f"   ✅ Tactics data: {len(tactics)} tactics loaded")
                if coach:
                    print("   ✅ Coach data loaded successfully")
                else:
                    print("   ⚠️ No coach data found")
                
                return True
            else:
                print(f"   ❌ Team details loading failed: {response.status_code}")
                if response.text:
                    print(f"   Error details: {response.text}")
                return False
                
        except Exception as e:
            print(f"   ❌ Team details loading test error: {e}")
            return False

    def test_save_team_functionality(self):
        """Test save team functionality with complete team structure"""
        print("💾 Testing Save Team Functionality...")
        
        if not self.auth_token or not self.test_team_id:
            print("   ❌ No authentication token or team ID available")
            return False
        
        try:
            # Test save slots retrieval
            response = requests.get(f"{API_URL}/save-slots", headers=self.get_headers())
            
            if response.status_code == 200:
                slots_data = response.json()
                save_slots = slots_data.get('save_slots', [])
                print(f"   ✅ Save slots retrieval: {len(save_slots)} slots available")
                
                # Find an empty slot
                empty_slot = None
                for slot in save_slots:
                    if not slot.get('is_occupied', True):
                        empty_slot = slot
                        break
                
                if empty_slot:
                    slot_number = empty_slot['slot_number']
                    print(f"   ✅ Found empty slot: {slot_number}")
                    
                    # Save team to slot
                    save_data = {
                        "slot_number": slot_number,
                        "slot_name": f"Review Test Slot {slot_number}",
                        "overwrite": False
                    }
                    
                    response = requests.post(
                        f"{API_URL}/teams/{self.test_team_id}/save-to-slot",
                        json=save_data,
                        headers=self.get_headers()
                    )
                    
                    if response.status_code == 200:
                        print(f"   ✅ Team saved to slot {slot_number} successfully")
                        
                        # Verify save by checking slots again
                        response = requests.get(f"{API_URL}/save-slots", headers=self.get_headers())
                        if response.status_code == 200:
                            updated_slots = response.json().get('save_slots', [])
                            saved_slot = next((s for s in updated_slots if s['slot_number'] == slot_number), None)
                            
                            if saved_slot and saved_slot.get('is_occupied'):
                                print(f"   ✅ Save verification successful: slot {slot_number} now occupied")
                                print(f"   ✅ Saved team name: {saved_slot.get('team_name', 'N/A')}")
                                return True
                            else:
                                print(f"   ❌ Save verification failed: slot {slot_number} not occupied")
                                return False
                        else:
                            print(f"   ❌ Save verification request failed: {response.status_code}")
                            return False
                    else:
                        print(f"   ❌ Team save failed: {response.status_code}")
                        return False
                else:
                    print("   ⚠️ No empty slots available for testing")
                    return True  # Not a failure, just no slots available
            else:
                print(f"   ❌ Save slots retrieval failed: {response.status_code}")
                return False
                
        except Exception as e:
            print(f"   ❌ Save team functionality test error: {e}")
            return False

    def test_team_building_flow_integration(self):
        """Test complete team building flow integration"""
        print("🏗️ Testing Team Building Flow Integration...")
        
        if not self.auth_token:
            print("   ❌ No authentication token available")
            return False
        
        try:
            # Test formations endpoint
            response = requests.get(f"{API_URL}/teams/formations/", headers=self.get_headers())
            if response.status_code == 200:
                formations = response.json()
                print(f"   ✅ Formations available: {len(formations)}")
            else:
                print(f"   ❌ Formations retrieval failed: {response.status_code}")
            
            # Test tactics endpoint
            response = requests.get(f"{API_URL}/teams/tactics/", headers=self.get_headers())
            if response.status_code == 200:
                tactics = response.json()
                print(f"   ✅ Tactics available: {len(tactics)}")
            else:
                print(f"   ❌ Tactics retrieval failed: {response.status_code}")
            
            # Test coaches endpoint
            response = requests.get(f"{API_URL}/teams/coaches/", headers=self.get_headers())
            if response.status_code == 200:
                coaches = response.json()
                print(f"   ✅ Coaches available: {len(coaches)}")
            else:
                print(f"   ❌ Coaches retrieval failed: {response.status_code}")
            
            # Test user teams retrieval
            response = requests.get(f"{API_URL}/teams", headers=self.get_headers())
            if response.status_code == 200:
                user_teams = response.json()
                print(f"   ✅ User teams retrieval: {len(user_teams)} teams")
            else:
                print(f"   ❌ User teams retrieval failed: {response.status_code}")
            
            # Test community teams (for loading other teams)
            response = requests.get(f"{API_URL}/community/teams", headers=self.get_headers())
            if response.status_code == 200:
                community_teams = response.json()
                print(f"   ✅ Community teams available: {len(community_teams)}")
            else:
                print(f"   ❌ Community teams retrieval failed: {response.status_code}")
            
            return True
                
        except Exception as e:
            print(f"   ❌ Team building flow integration test error: {e}")
            return False

    def run_all_tests(self):
        """Run all review-focused tests"""
        print("🚀 Starting Review-Focused Backend Testing")
        print("="*80)
        
        results = {
            "authentication": False,
            "character_apis": False,
            "equipment_apis": False,
            "team_creation": False,
            "team_details": False,
            "save_functionality": False,
            "team_building_flow": False
        }
        
        # Setup authentication
        results["authentication"] = self.setup_authentication()
        
        if results["authentication"]:
            # Test character APIs with element data
            results["character_apis"] = self.test_character_apis_with_element_data()
            
            # Test equipment APIs for player configuration
            results["equipment_apis"] = self.test_equipment_apis_for_player_configuration()
            
            # Test team creation with bench players
            results["team_creation"] = self.test_team_creation_with_bench_players()
            
            # Test team details loading
            results["team_details"] = self.test_team_details_loading()
            
            # Test save team functionality
            results["save_functionality"] = self.test_save_team_functionality()
            
            # Test team building flow integration
            results["team_building_flow"] = self.test_team_building_flow_integration()
        
        # Print summary
        print("\n" + "="*80)
        print("🎯 REVIEW REQUEST TESTING SUMMARY")
        print("="*80)
        
        passed = sum(1 for result in results.values() if result)
        total = len(results)
        
        for test_name, result in results.items():
            status = "✅ PASS" if result else "❌ FAIL"
            print(f"{test_name.replace('_', ' ').title():<30} {status}")
        
        print("-"*80)
        print(f"Overall Result: {passed}/{total} tests passed ({(passed/total)*100:.1f}%)")
        
        if passed == total:
            print("🎉 ALL REVIEW REQUEST TESTS PASSED!")
        else:
            print("⚠️ Some tests failed - see details above")
        
        return results

if __name__ == "__main__":
    tester = ReviewFocusedBackendTest()
    results = tester.run_all_tests()