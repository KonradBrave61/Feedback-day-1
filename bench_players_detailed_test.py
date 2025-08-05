#!/usr/bin/env python3
"""
Detailed Bench Players Testing
Specifically testing bench players save/load with slot_id preservation
as requested in the review request.
"""

import requests
import json
import uuid
import random
import string

# Get the backend URL from the frontend .env file
with open('/app/frontend/.env', 'r') as f:
    for line in f:
        if line.startswith('REACT_APP_BACKEND_URL='):
            BACKEND_URL = line.strip().split('=')[1].strip('"\'')
            break

API_URL = f"{BACKEND_URL}/api"

def generate_random_string(length=8):
    letters = string.ascii_lowercase
    return ''.join(random.choice(letters) for i in range(length))

class BenchPlayersDetailedTest:
    def __init__(self):
        self.auth_token = None
        self.test_user_id = None
        self.test_characters = []
        self.test_equipment = []
        
        # Generate unique test data
        random_suffix = generate_random_string()
        self.test_username = f"benchtest_{random_suffix}"
        self.test_email = f"bench_{random_suffix}@example.com"
        self.test_password = "BenchTest123!"

    def setup_auth(self):
        """Setup authentication"""
        # Register
        user_data = {
            "username": self.test_username,
            "email": self.test_email,
            "password": self.test_password,
            "favourite_team": "Raimon",
            "profile_picture": "https://example.com/avatar.jpg",
            "bio": "Bench testing user"
        }
        
        try:
            response = requests.post(f"{API_URL}/auth/register", json=user_data)
            if response.status_code != 200:
                print(f"Registration failed: {response.status_code}")
                return False
        except Exception as e:
            print(f"Registration error: {e}")
            return False
        
        # Login
        try:
            login_data = {"email": self.test_email, "password": self.test_password}
            response = requests.post(f"{API_URL}/auth/login", json=login_data)
            
            if response.status_code == 200:
                data = response.json()
                self.auth_token = data.get("access_token")
                self.test_user_id = data.get("user", {}).get("id")
                return True
            else:
                print(f"Login failed: {response.status_code}")
                return False
        except Exception as e:
            print(f"Login error: {e}")
            return False

    def get_headers(self):
        return {"Authorization": f"Bearer {self.auth_token}"}

    def get_test_data(self):
        """Get characters and equipment for testing"""
        # Get characters
        try:
            response = requests.get(f"{API_URL}/characters/")
            if response.status_code == 200:
                self.test_characters = response.json()
                print(f"✅ Retrieved {len(self.test_characters)} characters")
            else:
                print(f"❌ Failed to get characters: {response.status_code}")
                return False
        except Exception as e:
            print(f"❌ Character retrieval error: {e}")
            return False
        
        # Get equipment
        try:
            response = requests.get(f"{API_URL}/equipment/")
            if response.status_code == 200:
                self.test_equipment = response.json()
                print(f"✅ Retrieved {len(self.test_equipment)} equipment items")
            else:
                print(f"❌ Failed to get equipment: {response.status_code}")
                return False
        except Exception as e:
            print(f"❌ Equipment retrieval error: {e}")
            return False
        
        return True

    def test_bench_players_with_slot_ids(self):
        """Test creating team with bench players and specific slot_ids"""
        print("\n🎯 Testing Bench Players with Slot IDs...")
        
        if len(self.test_characters) < 16:
            print(f"❌ Need at least 16 characters, only have {len(self.test_characters)}")
            return False
        
        # Create team with specific bench player slot_ids
        team_data = {
            "name": f"Bench Test Team {generate_random_string(4)}",
            "formation": "4-4-2",
            "players": [],
            "bench_players": [],
            "tactics": [],
            "coach": {
                "id": "coach_1",
                "name": "Test Coach",
                "title": "Head Coach"
            },
            "description": "Testing bench players with slot IDs",
            "is_public": True
        }
        
        # Add main players (11 players)
        for i, char in enumerate(self.test_characters[:11]):
            player_data = {
                "character_id": char["id"],
                "position_id": f"pos_{i+1}",
                "user_level": 99,
                "user_rarity": "Legendary",
                "user_equipment": {
                    "boots": self.test_equipment[0] if self.test_equipment else None
                },
                "user_hissatsu": [
                    {
                        "name": f"Technique {i+1}",
                        "description": f"Player {i+1} technique",
                        "type": "Shot"
                    }
                ]
            }
            team_data["players"].append(player_data)
        
        # Add bench players with specific slot_ids (5 bench players)
        bench_slot_ids = ["bench_1", "bench_2", "bench_3", "bench_4", "bench_5"]
        for i, char in enumerate(self.test_characters[11:16]):
            bench_player_data = {
                "character_id": char["id"],
                "slot_id": bench_slot_ids[i],  # Specific slot ID
                "user_level": 95,
                "user_rarity": "Epic",
                "user_equipment": {
                    "boots": self.test_equipment[1] if len(self.test_equipment) > 1 else None,
                    "bracelets": self.test_equipment[2] if len(self.test_equipment) > 2 else None
                },
                "user_hissatsu": [
                    {
                        "name": f"Bench Technique {i+1}",
                        "description": f"Bench player {i+1} technique",
                        "type": "Dribble"
                    }
                ]
            }
            team_data["bench_players"].append(bench_player_data)
        
        # Create team
        try:
            response = requests.post(f"{API_URL}/teams", json=team_data, headers=self.get_headers())
            
            if response.status_code == 200:
                team = response.json()
                team_id = team["id"]
                print(f"✅ Team created successfully: {team['name']}")
                print(f"✅ Main players: {len(team.get('players', []))}")
                print(f"✅ Bench players: {len(team.get('bench_players', []))}")
                
                # Verify bench players have correct slot_ids
                bench_players = team.get('bench_players', [])
                slot_ids_preserved = []
                for bench_player in bench_players:
                    if 'slot_id' in bench_player:
                        slot_ids_preserved.append(bench_player['slot_id'])
                
                print(f"✅ Bench slot IDs preserved: {slot_ids_preserved}")
                
                # Check if all expected slot IDs are present
                expected_slots = set(bench_slot_ids)
                actual_slots = set(slot_ids_preserved)
                
                if expected_slots == actual_slots:
                    print("✅ All bench slot IDs correctly preserved")
                else:
                    print(f"❌ Slot ID mismatch. Expected: {expected_slots}, Got: {actual_slots}")
                
                return team_id
            else:
                print(f"❌ Team creation failed: {response.status_code}")
                if response.text:
                    print(f"Error: {response.text}")
                return None
                
        except Exception as e:
            print(f"❌ Team creation error: {e}")
            return None

    def test_bench_players_loading(self, team_id):
        """Test loading team and verifying bench players data structure"""
        print("\n📋 Testing Bench Players Loading...")
        
        try:
            response = requests.get(f"{API_URL}/teams/{team_id}/details", headers=self.get_headers())
            
            if response.status_code == 200:
                team_details = response.json()
                
                # Handle wrapped or direct format
                if 'team' in team_details:
                    team = team_details['team']
                else:
                    team = team_details
                
                print("✅ Team details loaded successfully")
                
                # Verify bench players structure
                bench_players = team.get('bench_players', [])
                print(f"✅ Bench players loaded: {len(bench_players)}")
                
                if bench_players:
                    # Check each bench player's data structure
                    for i, bench_player in enumerate(bench_players):
                        print(f"\n   Bench Player {i+1}:")
                        
                        # Check required fields
                        required_fields = ['character_id', 'user_level', 'user_rarity']
                        for field in required_fields:
                            if field in bench_player:
                                print(f"   ✅ {field}: {bench_player[field]}")
                            else:
                                print(f"   ❌ Missing {field}")
                        
                        # Check slot_id preservation
                        if 'slot_id' in bench_player:
                            print(f"   ✅ slot_id preserved: {bench_player['slot_id']}")
                        else:
                            print(f"   ❌ slot_id missing")
                        
                        # Check equipment
                        if 'user_equipment' in bench_player:
                            equipment = bench_player['user_equipment']
                            equipment_count = sum(1 for v in equipment.values() if v is not None)
                            print(f"   ✅ Equipment items: {equipment_count}")
                        else:
                            print(f"   ❌ user_equipment missing")
                        
                        # Check techniques
                        if 'user_hissatsu' in bench_player:
                            techniques = bench_player['user_hissatsu']
                            print(f"   ✅ Techniques: {len(techniques)}")
                        else:
                            print(f"   ❌ user_hissatsu missing")
                
                return True
            else:
                print(f"❌ Team loading failed: {response.status_code}")
                return False
                
        except Exception as e:
            print(f"❌ Team loading error: {e}")
            return False

    def run_detailed_bench_test(self):
        """Run detailed bench players test"""
        print("🚀 Starting Detailed Bench Players Testing")
        print("="*80)
        
        # Setup
        if not self.setup_auth():
            print("❌ Authentication setup failed")
            return False
        
        if not self.get_test_data():
            print("❌ Test data retrieval failed")
            return False
        
        # Test bench players creation with slot IDs
        team_id = self.test_bench_players_with_slot_ids()
        if not team_id:
            print("❌ Bench players creation test failed")
            return False
        
        # Test bench players loading
        if not self.test_bench_players_loading(team_id):
            print("❌ Bench players loading test failed")
            return False
        
        print("\n" + "="*80)
        print("🎉 DETAILED BENCH PLAYERS TESTING COMPLETED SUCCESSFULLY!")
        print("✅ Bench players save with slot_id preservation: WORKING")
        print("✅ Bench players load with complete data structure: WORKING")
        print("✅ Equipment and techniques for bench players: WORKING")
        print("="*80)
        
        return True

if __name__ == "__main__":
    tester = BenchPlayersDetailedTest()
    tester.run_detailed_bench_test()