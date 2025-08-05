#!/usr/bin/env python3
"""
Team Loading API Test - Focus on understanding exact data structure returned by backend
This test specifically addresses the review request to analyze team loading functionality.
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

print(f"Testing Team Loading APIs at: {API_URL}")
print("=" * 80)

def generate_random_string(length=8):
    """Generate a random string of fixed length"""
    letters = string.ascii_lowercase
    return ''.join(random.choice(letters) for i in range(length))

class TeamLoadingAPITest:
    """Test suite focused on Team Loading API endpoints"""
    
    def __init__(self):
        # Generate unique test data
        random_suffix = generate_random_string()
        self.test_username = f"teamloader_{random_suffix}"
        self.test_email = f"teamloader_{random_suffix}@example.com"
        self.test_password = "TeamLoader123!"
        
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
            "bio": "Team loading test user"
        }
        
        # Store auth token and IDs
        self.auth_token = None
        self.user_id = None
        self.team_id = None
        self.character_ids = []
        self.equipment_ids = []
        self.formation_id = None
        self.tactic_ids = []
        self.coach_id = None
    
    def setup_authentication(self):
        """Set up authentication for team loading tests"""
        print("🔐 Setting up authentication...")
        
        # Register user
        response = requests.post(f"{API_URL}/auth/register", json=self.user_data)
        if response.status_code != 200:
            print(f"❌ Registration failed: {response.status_code} - {response.text}")
            return False
        
        data = response.json()
        self.auth_token = data["access_token"]
        self.user_id = data["user"]["id"]
        print(f"✅ User registered with ID: {self.user_id}")
        return True
    
    def get_available_resources(self):
        """Get available characters, equipment, formations, tactics, and coaches"""
        print("\n📋 Getting available resources...")
        
        # Get characters
        response = requests.get(f"{API_URL}/characters/")
        if response.status_code == 200:
            characters = response.json()
            self.character_ids = [char["id"] for char in characters[:5]]
            print(f"✅ Found {len(characters)} characters, using first 5")
        else:
            print(f"❌ Failed to get characters: {response.status_code}")
        
        # Get equipment
        response = requests.get(f"{API_URL}/equipment/")
        if response.status_code == 200:
            equipment = response.json()
            self.equipment_ids = [eq["id"] for eq in equipment[:3]]
            print(f"✅ Found {len(equipment)} equipment items, using first 3")
        else:
            print(f"❌ Failed to get equipment: {response.status_code}")
        
        # Get formations
        response = requests.get(f"{API_URL}/teams/formations/")
        if response.status_code == 200:
            formations = response.json()
            if formations:
                self.formation_id = formations[0]["id"]
                print(f"✅ Found {len(formations)} formations, using: {formations[0]['name']}")
        else:
            print(f"❌ Failed to get formations: {response.status_code}")
        
        # Get tactics
        response = requests.get(f"{API_URL}/teams/tactics/")
        if response.status_code == 200:
            tactics = response.json()
            self.tactic_ids = [tactic["id"] for tactic in tactics[:2]]
            print(f"✅ Found {len(tactics)} tactics, using first 2")
        else:
            print(f"❌ Failed to get tactics: {response.status_code}")
        
        # Get coaches
        response = requests.get(f"{API_URL}/teams/coaches/")
        if response.status_code == 200:
            coaches = response.json()
            if coaches:
                self.coach_id = coaches[0]["id"]
                print(f"✅ Found {len(coaches)} coaches, using: {coaches[0]['name']}")
        else:
            print(f"❌ Failed to get coaches: {response.status_code}")
    
    def create_comprehensive_team(self):
        """Create a team with players, bench, tactics, coach, and equipment"""
        print("\n🏗️ Creating comprehensive team with all components...")
        
        if not self.auth_token:
            print("❌ No auth token available")
            return False
        
        headers = {"Authorization": f"Bearer {self.auth_token}"}
        
        # Create team data with all components
        team_data = {
            "name": f"Comprehensive Test Team {generate_random_string()}",
            "formation": self.formation_id,
            "players": [],
            "bench_players": [],
            "tactics": self.tactic_ids,
            "coach": {"id": self.coach_id, "name": "Test Coach"} if self.coach_id else None,
            "description": "A comprehensive test team with players, bench, tactics, coach, and equipment",
            "is_public": True,
            "tags": ["test", "comprehensive", "team-loading"]
        }
        
        # Add main players with equipment
        if self.character_ids and self.equipment_ids:
            for i, char_id in enumerate(self.character_ids[:3]):  # Add 3 main players
                player = {
                    "character_id": char_id,
                    "position_id": f"position_{i+1}",
                    "user_level": 50 + i * 10,
                    "user_rarity": ["Common", "Rare", "Epic"][i % 3],
                    "user_equipment": {
                        "boots": self.equipment_ids[0] if len(self.equipment_ids) > 0 else None,
                        "bracelets": self.equipment_ids[1] if len(self.equipment_ids) > 1 else None,
                        "pendants": self.equipment_ids[2] if len(self.equipment_ids) > 2 else None
                    },
                    "user_hissatsu": [
                        {"id": f"hissatsu_{i}_1", "name": f"Special Move {i+1}A", "level": 5},
                        {"id": f"hissatsu_{i}_2", "name": f"Special Move {i+1}B", "level": 3}
                    ]
                }
                team_data["players"].append(player)
            
            # Add bench players
            for i, char_id in enumerate(self.character_ids[3:5]):  # Add 2 bench players
                bench_player = {
                    "character_id": char_id,
                    "user_level": 40 + i * 5,
                    "user_rarity": ["Rare", "Epic"][i % 2],
                    "user_equipment": {
                        "boots": self.equipment_ids[i % len(self.equipment_ids)] if self.equipment_ids else None
                    },
                    "user_hissatsu": [
                        {"id": f"bench_hissatsu_{i}_1", "name": f"Bench Move {i+1}", "level": 4}
                    ]
                }
                team_data["bench_players"].append(bench_player)
        
        # Create team
        response = requests.post(f"{API_URL}/teams", json=team_data, headers=headers)
        if response.status_code != 200:
            print(f"❌ Team creation failed: {response.status_code} - {response.text}")
            return False
        
        team = response.json()
        self.team_id = team["id"]
        print(f"✅ Comprehensive team created with ID: {self.team_id}")
        print(f"   - Players: {len(team_data['players'])}")
        print(f"   - Bench: {len(team_data['bench_players'])}")
        print(f"   - Tactics: {len(team_data['tactics'])}")
        print(f"   - Coach: {'Yes' if team_data['coach'] else 'No'}")
        return True
    
    def test_team_details_endpoint(self):
        """Test GET /api/teams/{team_id}/details - Main focus of review request"""
        print("\n🎯 TESTING GET /api/teams/{team_id}/details")
        print("=" * 60)
        
        if not self.auth_token or not self.team_id:
            print("❌ No auth token or team ID available")
            return
        
        headers = {"Authorization": f"Bearer {self.auth_token}"}
        response = requests.get(f"{API_URL}/teams/{self.team_id}/details", headers=headers)
        
        print(f"Status Code: {response.status_code}")
        
        if response.status_code != 200:
            print(f"❌ Request failed: {response.text}")
            return
        
        data = response.json()
        print("✅ Request successful!")
        print("\n📊 RESPONSE STRUCTURE ANALYSIS:")
        print("-" * 40)
        
        # Analyze top-level structure
        print("Top-level keys:")
        for key in data.keys():
            print(f"  - {key}: {type(data[key])}")
        
        # Analyze team object structure
        if "team" in data:
            team = data["team"]
            print(f"\nTeam object keys ({len(team)} total):")
            for key, value in team.items():
                if isinstance(value, list):
                    print(f"  - {key}: list[{len(value)} items]")
                elif isinstance(value, dict):
                    print(f"  - {key}: dict[{len(value)} keys]")
                else:
                    print(f"  - {key}: {type(value).__name__}")
            
            # Analyze players array
            if "players" in team and team["players"]:
                print(f"\n👥 PLAYERS ARRAY ANALYSIS ({len(team['players'])} players):")
                print("-" * 40)
                player = team["players"][0]  # Analyze first player
                print("Player object structure:")
                for key, value in player.items():
                    if isinstance(value, dict):
                        print(f"  - {key}: dict {list(value.keys())}")
                    elif isinstance(value, list):
                        print(f"  - {key}: list[{len(value)} items]")
                    else:
                        print(f"  - {key}: {value}")
                
                # Check for user_equipment and user_hissatsu
                if "user_equipment" in player:
                    print(f"\n🎒 USER_EQUIPMENT found: {player['user_equipment']}")
                else:
                    print("\n❌ USER_EQUIPMENT not found in player object")
                
                if "user_hissatsu" in player:
                    print(f"\n⚡ USER_HISSATSU found: {player['user_hissatsu']}")
                else:
                    print("\n❌ USER_HISSATSU not found in player object")
            else:
                print("\n❌ No players found in team")
            
            # Analyze bench array
            if "bench_players" in team and team["bench_players"]:
                print(f"\n🪑 BENCH ARRAY ANALYSIS ({len(team['bench_players'])} players):")
                print("-" * 40)
                bench_player = team["bench_players"][0]
                print("Bench player object structure:")
                for key, value in bench_player.items():
                    if isinstance(value, dict):
                        print(f"  - {key}: dict {list(value.keys())}")
                    elif isinstance(value, list):
                        print(f"  - {key}: list[{len(value)} items]")
                    else:
                        print(f"  - {key}: {value}")
            else:
                print("\n❌ No bench players found in team")
            
            # Analyze tactics array
            if "tactics" in team and team["tactics"]:
                print(f"\n🎯 TACTICS ARRAY ANALYSIS ({len(team['tactics'])} tactics):")
                print("-" * 40)
                print(f"Tactics: {team['tactics']}")
            else:
                print("\n❌ No tactics found in team")
            
            # Analyze coach object
            if "coach" in team and team["coach"]:
                print(f"\n👨‍💼 COACH OBJECT ANALYSIS:")
                print("-" * 40)
                coach = team["coach"]
                if isinstance(coach, dict):
                    for key, value in coach.items():
                        print(f"  - {key}: {value}")
                else:
                    print(f"Coach: {coach}")
            else:
                print("\n❌ No coach found in team")
            
            # Analyze formation
            if "formation" in team:
                print(f"\n🏟️ FORMATION: {team['formation']}")
            else:
                print("\n❌ No formation found in team")
        
        print(f"\n📄 FULL RESPONSE (first 2000 chars):")
        print("-" * 40)
        response_text = json.dumps(data, indent=2)
        print(response_text[:2000])
        if len(response_text) > 2000:
            print("... (truncated)")
    
    def test_regular_team_endpoint(self):
        """Test GET /api/teams/{team_id} for comparison"""
        print("\n🔍 TESTING GET /api/teams/{team_id} (for comparison)")
        print("=" * 60)
        
        if not self.auth_token or not self.team_id:
            print("❌ No auth token or team ID available")
            return
        
        headers = {"Authorization": f"Bearer {self.auth_token}"}
        response = requests.get(f"{API_URL}/teams/{self.team_id}", headers=headers)
        
        print(f"Status Code: {response.status_code}")
        
        if response.status_code != 200:
            print(f"❌ Request failed: {response.text}")
            return
        
        data = response.json()
        print("✅ Request successful!")
        
        # Quick structure analysis
        print(f"\nTeam object keys ({len(data)} total):")
        for key, value in data.items():
            if isinstance(value, list):
                print(f"  - {key}: list[{len(value)} items]")
            elif isinstance(value, dict):
                print(f"  - {key}: dict[{len(value)} keys]")
            else:
                print(f"  - {key}: {type(value).__name__}")
        
        # Check players structure
        if "players" in data and data["players"]:
            player = data["players"][0]
            print(f"\nFirst player keys: {list(player.keys())}")
            
            # Check for specific fields
            has_equipment = "user_equipment" in player
            has_hissatsu = "user_hissatsu" in player
            print(f"Has user_equipment: {has_equipment}")
            print(f"Has user_hissatsu: {has_hissatsu}")
    
    def test_save_slots_endpoint(self):
        """Test GET /api/save-slots endpoint"""
        print("\n💾 TESTING GET /api/save-slots")
        print("=" * 60)
        
        if not self.auth_token:
            print("❌ No auth token available")
            return
        
        headers = {"Authorization": f"Bearer {self.auth_token}"}
        response = requests.get(f"{API_URL}/save-slots", headers=headers)
        
        print(f"Status Code: {response.status_code}")
        
        if response.status_code != 200:
            print(f"❌ Request failed: {response.text}")
            return
        
        data = response.json()
        print("✅ Request successful!")
        
        print(f"\nSave slots structure:")
        for key, value in data.items():
            if isinstance(value, list):
                print(f"  - {key}: list[{len(value)} items]")
                if value:  # If list has items, show structure of first item
                    first_item = value[0]
                    print(f"    First item keys: {list(first_item.keys())}")
            else:
                print(f"  - {key}: {type(value).__name__}")
    
    def test_community_teams_endpoint(self):
        """Test GET /api/community/teams endpoint"""
        print("\n🌍 TESTING GET /api/community/teams")
        print("=" * 60)
        
        if not self.auth_token:
            print("❌ No auth token available")
            return
        
        headers = {"Authorization": f"Bearer {self.auth_token}"}
        response = requests.get(f"{API_URL}/community/teams", headers=headers)
        
        print(f"Status Code: {response.status_code}")
        
        if response.status_code != 200:
            print(f"❌ Request failed: {response.text}")
            return
        
        data = response.json()
        print("✅ Request successful!")
        
        print(f"\nCommunity teams: {len(data)} teams found")
        if data:
            team = data[0]
            print(f"First team keys: {list(team.keys())}")
    
    def run_all_tests(self):
        """Run all team loading tests"""
        print("🚀 STARTING TEAM LOADING API TESTS")
        print("=" * 80)
        
        # Setup
        if not self.setup_authentication():
            return
        
        self.get_available_resources()
        
        if not self.create_comprehensive_team():
            return
        
        # Main tests
        self.test_team_details_endpoint()  # Main focus
        self.test_regular_team_endpoint()  # For comparison
        self.test_save_slots_endpoint()
        self.test_community_teams_endpoint()
        
        print("\n" + "=" * 80)
        print("🏁 TEAM LOADING API TESTS COMPLETED")
        print("=" * 80)

if __name__ == "__main__":
    test = TeamLoadingAPITest()
    test.run_all_tests()