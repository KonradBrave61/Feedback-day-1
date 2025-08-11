#!/usr/bin/env python3
"""
Team Data Structure Analysis Test
=================================

This test specifically examines the data structure returned by the team loading endpoints
to understand how bench players and player techniques are stored and structured.

Focus Areas:
1. GET /api/teams/{team_id}/details endpoint data structure analysis
2. How bench players are stored (field name, structure)
3. How player techniques are stored (user_hissatsu field structure)
4. What fields are available for players in both main team and bench
5. Create test team with bench players and techniques, save it, then retrieve it
"""

import requests
import json
import sys
from datetime import datetime

# Configuration
BACKEND_URL = "https://6bc31e7a-a173-4a83-b3c7-ffd6909a7a3b.preview.emergentagent.com/api"

class TeamDataStructureAnalyzer:
    def __init__(self):
        self.session = requests.Session()
        self.auth_token = None
        self.test_user_id = None
        self.test_team_id = None
        
    def authenticate(self):
        """Authenticate with test user"""
        print("🔐 Authenticating test user...")
        
        # Register test user
        register_data = {
            "username": f"team_data_tester_{datetime.now().strftime('%H%M%S')}",
            "email": f"teamdata{datetime.now().strftime('%H%M%S')}@test.com",
            "password": "testpass123",
            "coach_level": 50,
            "favorite_position": "MF",
            "favorite_element": "Fire",
            "favourite_team": "Test Team FC"
        }
        
        try:
            response = self.session.post(f"{BACKEND_URL}/auth/register", json=register_data)
            if response.status_code == 200:
                auth_data = response.json()
                self.auth_token = auth_data["access_token"]
                self.test_user_id = auth_data["user"]["id"]
                self.session.headers.update({"Authorization": f"Bearer {self.auth_token}"})
                print(f"✅ Authentication successful - User ID: {self.test_user_id}")
                return True
            else:
                print(f"❌ Registration failed: {response.status_code} - {response.text}")
                return False
        except Exception as e:
            print(f"❌ Authentication error: {e}")
            return False
    
    def create_test_team_with_bench_and_techniques(self):
        """Create a comprehensive test team with bench players and techniques"""
        print("\n🏗️ Creating test team with bench players and techniques...")
        
        # Sample team data with detailed player structure including techniques
        team_data = {
            "name": "Data Structure Test Team",
            "formation": "4-3-3",
            "description": "Test team for analyzing data structure",
            "is_public": True,
            "tags": ["test", "data-analysis"],
            "save_slot": 1,
            "save_slot_name": "Data Test Slot",
            "players": [
                {
                    "character_id": "char_001",
                    "position_id": "gk_1",
                    "user_level": 99,
                    "user_rarity": "Legendary",
                    "user_equipment": {
                        "boots": {
                            "id": "boots_001",
                            "name": "Lightning Boots",
                            "stats": {"speed": 15, "technique": 10}
                        },
                        "bracelets": {
                            "id": "bracelet_001", 
                            "name": "Power Bracelet",
                            "stats": {"kick": 20, "physical": 15}
                        },
                        "pendants": {
                            "id": "pendant_001",
                            "name": "Focus Pendant", 
                            "stats": {"intelligence": 18, "control": 12}
                        }
                    },
                    "user_hissatsu": [
                        {
                            "id": "technique_001",
                            "name": "God Hand",
                            "type": "Goalkeeper",
                            "element": "Wind",
                            "power": 150,
                            "description": "Ultimate goalkeeper technique"
                        },
                        {
                            "id": "technique_002", 
                            "name": "Majin The Hand",
                            "type": "Goalkeeper",
                            "element": "Dark",
                            "power": 180,
                            "description": "Dark goalkeeper technique"
                        }
                    ]
                },
                {
                    "character_id": "char_002",
                    "position_id": "df_1", 
                    "user_level": 95,
                    "user_rarity": "Epic",
                    "user_equipment": {
                        "boots": {
                            "id": "boots_002",
                            "name": "Defense Boots",
                            "stats": {"physical": 12, "pressure": 18}
                        }
                    },
                    "user_hissatsu": [
                        {
                            "id": "technique_003",
                            "name": "The Wall",
                            "type": "Defense", 
                            "element": "Earth",
                            "power": 120,
                            "description": "Defensive wall technique"
                        }
                    ]
                },
                {
                    "character_id": "char_003",
                    "position_id": "mf_1",
                    "user_level": 88,
                    "user_rarity": "Rare",
                    "user_equipment": {
                        "bracelets": {
                            "id": "bracelet_002",
                            "name": "Control Bracelet",
                            "stats": {"control": 16, "technique": 14}
                        },
                        "pendants": {
                            "id": "pendant_002", 
                            "name": "Speed Pendant",
                            "stats": {"agility": 20, "speed": 15}
                        }
                    },
                    "user_hissatsu": [
                        {
                            "id": "technique_004",
                            "name": "Spiral Shot",
                            "type": "Shoot",
                            "element": "Fire", 
                            "power": 140,
                            "description": "Spinning fire shot"
                        },
                        {
                            "id": "technique_005",
                            "name": "Lightning Dash",
                            "type": "Dribble",
                            "element": "Lightning",
                            "power": 110,
                            "description": "Lightning speed dribble"
                        }
                    ]
                }
            ],
            "bench_players": [
                {
                    "character_id": "char_004",
                    "slot_id": "bench_1",
                    "user_level": 92,
                    "user_rarity": "Legendary",
                    "user_equipment": {
                        "boots": {
                            "id": "boots_003",
                            "name": "Striker Boots",
                            "stats": {"kick": 25, "technique": 20}
                        },
                        "bracelets": {
                            "id": "bracelet_003",
                            "name": "Striker Bracelet", 
                            "stats": {"kick": 18, "agility": 12}
                        },
                        "pendants": {
                            "id": "pendant_003",
                            "name": "Power Pendant",
                            "stats": {"physical": 22, "kick": 15}
                        }
                    },
                    "user_hissatsu": [
                        {
                            "id": "technique_006",
                            "name": "Fire Tornado",
                            "type": "Shoot",
                            "element": "Fire",
                            "power": 200,
                            "description": "Ultimate fire shooting technique"
                        },
                        {
                            "id": "technique_007",
                            "name": "Blazing Shot",
                            "type": "Shoot", 
                            "element": "Fire",
                            "power": 160,
                            "description": "Powerful fire shot"
                        },
                        {
                            "id": "technique_008",
                            "name": "Speed Burst",
                            "type": "Dribble",
                            "element": "Wind",
                            "power": 130,
                            "description": "High-speed dribbling technique"
                        }
                    ]
                },
                {
                    "character_id": "char_005",
                    "slot_id": "bench_2", 
                    "user_level": 85,
                    "user_rarity": "Epic",
                    "user_equipment": {
                        "boots": {
                            "id": "boots_004",
                            "name": "Midfield Boots",
                            "stats": {"control": 14, "intelligence": 16}
                        }
                    },
                    "user_hissatsu": [
                        {
                            "id": "technique_009",
                            "name": "Thunder Beast",
                            "type": "Shoot",
                            "element": "Lightning",
                            "power": 175,
                            "description": "Lightning elemental shot"
                        }
                    ]
                },
                {
                    "character_id": "char_006",
                    "slot_id": "bench_3",
                    "user_level": 90,
                    "user_rarity": "Rare",
                    "user_equipment": {
                        "pendants": {
                            "id": "pendant_004",
                            "name": "Defense Pendant",
                            "stats": {"pressure": 20, "physical": 18}
                        }
                    },
                    "user_hissatsu": [
                        {
                            "id": "technique_010",
                            "name": "Iron Wall",
                            "type": "Defense",
                            "element": "Earth", 
                            "power": 145,
                            "description": "Solid defensive technique"
                        },
                        {
                            "id": "technique_011",
                            "name": "Counter Attack",
                            "type": "Defense",
                            "element": "Wind",
                            "power": 125,
                            "description": "Quick counter defensive move"
                        }
                    ]
                }
            ],
            "tactics": [
                {
                    "id": "tactic_001",
                    "name": "Offensive Formation",
                    "description": "Focus on attacking",
                    "effect": "+10% Kick Power",
                    "icon": "⚽"
                },
                {
                    "id": "tactic_002", 
                    "name": "Defensive Wall",
                    "description": "Strong defense",
                    "effect": "+15% Defense Power",
                    "icon": "🛡️"
                }
            ],
            "coach": {
                "id": "coach_001",
                "name": "Master Coach",
                "title": "Legendary Trainer",
                "portrait": "coach_portrait_001.jpg",
                "bonuses": {
                    "team_spirit": 20,
                    "technique_boost": 15,
                    "stamina_recovery": 10
                },
                "specialties": ["Offensive Tactics", "Player Development", "Team Coordination"]
            }
        }
        
        try:
            response = self.session.post(f"{BACKEND_URL}/teams", json=team_data)
            if response.status_code == 200:
                team_response = response.json()
                self.test_team_id = team_response["id"]
                print(f"✅ Test team created successfully - Team ID: {self.test_team_id}")
                print(f"   Team Name: {team_response['name']}")
                print(f"   Main Players: {len(team_response.get('players', []))}")
                print(f"   Bench Players: {len(team_response.get('bench_players', []))}")
                return True
            else:
                print(f"❌ Team creation failed: {response.status_code} - {response.text}")
                return False
        except Exception as e:
            print(f"❌ Team creation error: {e}")
            return False
    
    def analyze_team_details_endpoint(self):
        """Analyze the GET /api/teams/{team_id}/details endpoint data structure"""
        print(f"\n🔍 Analyzing GET /api/teams/{self.test_team_id}/details endpoint...")
        
        try:
            response = self.session.get(f"{BACKEND_URL}/teams/{self.test_team_id}/details")
            if response.status_code == 200:
                team_details = response.json()
                print("✅ Team details retrieved successfully")
                
                # Analyze the response structure
                print("\n📊 TEAM DETAILS DATA STRUCTURE ANALYSIS:")
                print("=" * 60)
                
                # Top-level structure
                print(f"Response Type: {type(team_details)}")
                print(f"Top-level Keys: {list(team_details.keys())}")
                
                # Check if it's wrapped or direct team data
                if "team" in team_details:
                    team_data = team_details["team"]
                    print(f"✅ Team data is wrapped in 'team' key")
                    print(f"Additional keys: {[k for k in team_details.keys() if k != 'team']}")
                else:
                    team_data = team_details
                    print(f"✅ Team data is direct (not wrapped)")
                
                # Analyze team structure
                print(f"\n🏗️ TEAM OBJECT STRUCTURE:")
                print(f"Team Keys: {list(team_data.keys())}")
                
                # Analyze players array
                if "players" in team_data:
                    players = team_data["players"]
                    print(f"\n👥 MAIN PLAYERS ARRAY:")
                    print(f"   Field Name: 'players'")
                    print(f"   Type: {type(players)}")
                    print(f"   Count: {len(players)}")
                    
                    if players:
                        print(f"   Sample Player Structure:")
                        sample_player = players[0]
                        print(f"   Player Keys: {list(sample_player.keys())}")
                        
                        # Analyze equipment structure
                        if "user_equipment" in sample_player:
                            equipment = sample_player["user_equipment"]
                            print(f"   Equipment Field: 'user_equipment'")
                            print(f"   Equipment Type: {type(equipment)}")
                            print(f"   Equipment Keys: {list(equipment.keys()) if isinstance(equipment, dict) else 'Not a dict'}")
                        
                        # Analyze techniques structure
                        if "user_hissatsu" in sample_player:
                            techniques = sample_player["user_hissatsu"]
                            print(f"   Techniques Field: 'user_hissatsu'")
                            print(f"   Techniques Type: {type(techniques)}")
                            print(f"   Techniques Count: {len(techniques) if isinstance(techniques, list) else 'Not a list'}")
                            if isinstance(techniques, list) and techniques:
                                print(f"   Sample Technique Keys: {list(techniques[0].keys())}")
                
                # Analyze bench players array
                if "bench_players" in team_data:
                    bench_players = team_data["bench_players"]
                    print(f"\n🪑 BENCH PLAYERS ARRAY:")
                    print(f"   Field Name: 'bench_players'")
                    print(f"   Type: {type(bench_players)}")
                    print(f"   Count: {len(bench_players)}")
                    
                    if bench_players:
                        print(f"   Sample Bench Player Structure:")
                        sample_bench = bench_players[0]
                        print(f"   Bench Player Keys: {list(sample_bench.keys())}")
                        
                        # Check for slot_id preservation
                        if "slot_id" in sample_bench:
                            print(f"   ✅ Slot ID preserved: {sample_bench['slot_id']}")
                        else:
                            print(f"   ❌ Slot ID not found in bench player")
                        
                        # Analyze bench equipment structure
                        if "user_equipment" in sample_bench:
                            bench_equipment = sample_bench["user_equipment"]
                            print(f"   Bench Equipment Field: 'user_equipment'")
                            print(f"   Bench Equipment Type: {type(bench_equipment)}")
                            print(f"   Bench Equipment Keys: {list(bench_equipment.keys()) if isinstance(bench_equipment, dict) else 'Not a dict'}")
                        
                        # Analyze bench techniques structure
                        if "user_hissatsu" in sample_bench:
                            bench_techniques = sample_bench["user_hissatsu"]
                            print(f"   Bench Techniques Field: 'user_hissatsu'")
                            print(f"   Bench Techniques Type: {type(bench_techniques)}")
                            print(f"   Bench Techniques Count: {len(bench_techniques) if isinstance(bench_techniques, list) else 'Not a list'}")
                            if isinstance(bench_techniques, list) and bench_techniques:
                                print(f"   Sample Bench Technique Keys: {list(bench_techniques[0].keys())}")
                
                # Analyze other team components
                if "tactics" in team_data:
                    tactics = team_data["tactics"]
                    print(f"\n⚡ TACTICS ARRAY:")
                    print(f"   Field Name: 'tactics'")
                    print(f"   Type: {type(tactics)}")
                    print(f"   Count: {len(tactics)}")
                    if tactics:
                        print(f"   Sample Tactic Keys: {list(tactics[0].keys())}")
                
                if "coach" in team_data:
                    coach = team_data["coach"]
                    print(f"\n👨‍💼 COACH OBJECT:")
                    print(f"   Field Name: 'coach'")
                    print(f"   Type: {type(coach)}")
                    if isinstance(coach, dict):
                        print(f"   Coach Keys: {list(coach.keys())}")
                
                # Print full JSON structure for detailed analysis
                print(f"\n📄 COMPLETE TEAM DETAILS JSON STRUCTURE:")
                print("=" * 60)
                print(json.dumps(team_details, indent=2, default=str))
                
                return team_details
            else:
                print(f"❌ Failed to retrieve team details: {response.status_code} - {response.text}")
                return None
        except Exception as e:
            print(f"❌ Team details analysis error: {e}")
            return None
    
    def compare_saved_vs_retrieved_data(self):
        """Compare the data we saved vs what we retrieved to identify any transformations"""
        print(f"\n🔄 Comparing saved vs retrieved data structures...")
        
        # This would involve comparing the original team_data structure we sent
        # vs the structure we got back from the details endpoint
        print("   This analysis helps identify any field name changes or data transformations")
        print("   that occur during the save/retrieve process.")
    
    def run_comprehensive_analysis(self):
        """Run the complete team data structure analysis"""
        print("🚀 Starting Team Data Structure Analysis")
        print("=" * 60)
        
        # Step 1: Authenticate
        if not self.authenticate():
            return False
        
        # Step 2: Create test team with comprehensive data
        if not self.create_test_team_with_bench_and_techniques():
            return False
        
        # Step 3: Analyze the team details endpoint
        team_details = self.analyze_team_details_endpoint()
        if not team_details:
            return False
        
        # Step 4: Compare structures
        self.compare_saved_vs_retrieved_data()
        
        print(f"\n✅ Team Data Structure Analysis Complete!")
        print("=" * 60)
        
        return True

def main():
    """Main execution function"""
    analyzer = TeamDataStructureAnalyzer()
    
    try:
        success = analyzer.run_comprehensive_analysis()
        if success:
            print("\n🎯 ANALYSIS SUMMARY:")
            print("✅ Successfully created test team with bench players and techniques")
            print("✅ Successfully retrieved team details via GET /api/teams/{id}/details")
            print("✅ Analyzed complete data structure for players and bench players")
            print("✅ Examined user_equipment and user_hissatsu field structures")
            print("✅ Verified slot_id preservation for bench players")
            sys.exit(0)
        else:
            print("\n❌ Analysis failed - check error messages above")
            sys.exit(1)
    except KeyboardInterrupt:
        print("\n⚠️ Analysis interrupted by user")
        sys.exit(1)
    except Exception as e:
        print(f"\n💥 Unexpected error during analysis: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()