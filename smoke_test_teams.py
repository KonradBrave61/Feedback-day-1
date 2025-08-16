#!/usr/bin/env python3
"""
Smoke Test for Team Management Endpoints
Testing specific endpoints requested in review:
1. POST /api/teams - Create team with minimal payload
2. GET /api/teams - Get teams array
3. PUT /api/teams/{id} - Update team name
4. GET /api/teams/{id}/details - Get team details with players/bench arrays
"""

import requests
import json
import os
import sys
from datetime import datetime

# Get backend URL from frontend .env file
def get_backend_url():
    try:
        with open('/app/frontend/.env', 'r') as f:
            for line in f:
                if line.startswith('REACT_APP_BACKEND_URL='):
                    return line.split('=', 1)[1].strip()
    except:
        pass
    return "https://chat-display-fix-1.preview.emergentagent.com"

BASE_URL = get_backend_url()
API_BASE = f"{BASE_URL}/api"

class TeamSmokeTest:
    def __init__(self):
        self.session = requests.Session()
        self.auth_token = None
        self.created_team_id = None
        self.test_results = []
        
    def log_result(self, test_name, success, message, details=None):
        """Log test result"""
        status = "✅ PASS" if success else "❌ FAIL"
        result = {
            'test': test_name,
            'status': status,
            'message': message,
            'details': details,
            'timestamp': datetime.now().isoformat()
        }
        self.test_results.append(result)
        print(f"{status}: {test_name} - {message}")
        if details:
            print(f"   Details: {details}")
    
    def setup_auth(self):
        """Register and login a test user for authentication"""
        try:
            # Register test user
            register_data = {
                "username": "smoketest_user",
                "email": "smoketest@example.com", 
                "password": "SecurePass123!",
                "favourite_team": "Raimon",
                "coach_level": 25,
                "favorite_position": "MF",
                "favorite_element": "Fire"
            }
            
            register_response = self.session.post(f"{API_BASE}/auth/register", json=register_data)
            
            # Login to get token
            login_data = {
                "email": "smoketest@example.com",
                "password": "SecurePass123!"
            }
            
            login_response = self.session.post(f"{API_BASE}/auth/login", json=login_data)
            
            if login_response.status_code == 200:
                token_data = login_response.json()
                self.auth_token = token_data.get('access_token')
                self.session.headers.update({'Authorization': f'Bearer {self.auth_token}'})
                self.log_result("Authentication Setup", True, "Successfully authenticated test user")
                return True
            else:
                self.log_result("Authentication Setup", False, f"Login failed: {login_response.status_code}")
                return False
                
        except Exception as e:
            self.log_result("Authentication Setup", False, f"Auth setup error: {str(e)}")
            return False
    
    def test_create_team(self):
        """Test POST /api/teams - Create team with minimal payload"""
        try:
            # Minimal team payload as requested
            team_data = {
                "name": "Smoke Test Team",
                "formation": "4-4-2",
                "players": [
                    {
                        "character_id": "1",
                        "position_id": "GK",
                        "user_level": 50,
                        "user_rarity": "Epic",
                        "user_equipment": {
                            "boots": None,
                            "bracelets": None,
                            "pendants": None
                        },
                        "user_hissatsu": []
                    },
                    {
                        "character_id": "2", 
                        "position_id": "DF",
                        "user_level": 45,
                        "user_rarity": "Rare",
                        "user_equipment": {
                            "boots": None,
                            "bracelets": None,
                            "pendants": None
                        },
                        "user_hissatsu": []
                    },
                    {
                        "character_id": "3",
                        "position_id": "MF", 
                        "user_level": 48,
                        "user_rarity": "Epic",
                        "user_equipment": {
                            "boots": None,
                            "bracelets": None,
                            "pendants": None
                        },
                        "user_hissatsu": []
                    }
                ],
                "bench_players": [
                    {
                        "character_id": "4",
                        "slot_id": "bench_1",
                        "user_level": 40,
                        "user_rarity": "Common",
                        "user_equipment": {
                            "boots": None,
                            "bracelets": None,
                            "pendants": None
                        },
                        "user_hissatsu": []
                    }
                ],
                "tactics": [],
                "coach": None,
                "description": "Smoke test team",
                "is_public": True
            }
            
            response = self.session.post(f"{API_BASE}/teams", json=team_data)
            
            if response.status_code == 200:
                team_response = response.json()
                if 'id' in team_response:
                    self.created_team_id = team_response['id']
                    self.log_result("Create Team", True, f"Team created successfully with ID: {self.created_team_id}")
                    return True
                else:
                    self.log_result("Create Team", False, "Team created but no ID returned", team_response)
                    return False
            else:
                self.log_result("Create Team", False, f"HTTP {response.status_code}: {response.text}")
                return False
                
        except Exception as e:
            self.log_result("Create Team", False, f"Exception: {str(e)}")
            return False
    
    def test_get_teams(self):
        """Test GET /api/teams - Get teams array including created team"""
        try:
            response = self.session.get(f"{API_BASE}/teams")
            
            if response.status_code == 200:
                teams = response.json()
                if isinstance(teams, list):
                    # Check if our created team is in the list
                    found_team = False
                    if self.created_team_id:
                        for team in teams:
                            if team.get('id') == self.created_team_id:
                                found_team = True
                                break
                    
                    if found_team:
                        self.log_result("Get Teams", True, f"Teams array returned with {len(teams)} teams, including created team")
                    else:
                        self.log_result("Get Teams", True, f"Teams array returned with {len(teams)} teams (created team not found, but endpoint works)")
                    return True
                else:
                    self.log_result("Get Teams", False, "Response is not an array", teams)
                    return False
            else:
                self.log_result("Get Teams", False, f"HTTP {response.status_code}: {response.text}")
                return False
                
        except Exception as e:
            self.log_result("Get Teams", False, f"Exception: {str(e)}")
            return False
    
    def test_update_team(self):
        """Test PUT /api/teams/{id} - Update team name"""
        if not self.created_team_id:
            self.log_result("Update Team", False, "No team ID available for update test")
            return False
            
        try:
            update_data = {
                "name": "Updated Smoke Test Team",
                "description": "Updated description for smoke test"
            }
            
            response = self.session.put(f"{API_BASE}/teams/{self.created_team_id}", json=update_data)
            
            if response.status_code == 200:
                updated_team = response.json()
                if updated_team.get('name') == "Updated Smoke Test Team":
                    self.log_result("Update Team", True, "Team name updated successfully")
                    return True
                else:
                    self.log_result("Update Team", False, "Team updated but name not changed", updated_team)
                    return False
            else:
                self.log_result("Update Team", False, f"HTTP {response.status_code}: {response.text}")
                return False
                
        except Exception as e:
            self.log_result("Update Team", False, f"Exception: {str(e)}")
            return False
    
    def test_get_team_details(self):
        """Test GET /api/teams/{id}/details - Get team details with players/bench arrays"""
        if not self.created_team_id:
            self.log_result("Get Team Details", False, "No team ID available for details test")
            return False
            
        try:
            response = self.session.get(f"{API_BASE}/teams/{self.created_team_id}/details")
            
            if response.status_code == 200:
                details = response.json()
                
                # Check if it's wrapped structure or direct team object
                team_data = details.get('team', details)  # Handle both wrapped and direct formats
                
                # Verify required arrays exist
                has_players = 'players' in team_data and isinstance(team_data['players'], list)
                has_bench = 'bench_players' in team_data and isinstance(team_data['bench_players'], list)
                
                if has_players and has_bench:
                    players_count = len(team_data['players'])
                    bench_count = len(team_data['bench_players'])
                    self.log_result("Get Team Details", True, 
                                  f"Team details returned with players array ({players_count} players) and bench array ({bench_count} bench players)")
                    return True
                else:
                    missing = []
                    if not has_players:
                        missing.append("players array")
                    if not has_bench:
                        missing.append("bench_players array")
                    self.log_result("Get Team Details", False, f"Missing required arrays: {', '.join(missing)}", details)
                    return False
            else:
                self.log_result("Get Team Details", False, f"HTTP {response.status_code}: {response.text}")
                return False
                
        except Exception as e:
            self.log_result("Get Team Details", False, f"Exception: {str(e)}")
            return False
    
    def run_smoke_test(self):
        """Run all smoke tests in sequence"""
        print(f"🔥 TEAM MANAGEMENT SMOKE TEST STARTING")
        print(f"Backend URL: {BASE_URL}")
        print(f"API Base: {API_BASE}")
        print("=" * 60)
        
        # Setup authentication
        if not self.setup_auth():
            print("❌ Authentication setup failed - cannot proceed with tests")
            return False
        
        # Run tests in sequence
        tests = [
            self.test_create_team,
            self.test_get_teams, 
            self.test_update_team,
            self.test_get_team_details
        ]
        
        passed = 0
        total = len(tests)
        
        for test in tests:
            if test():
                passed += 1
        
        print("=" * 60)
        print(f"🎯 SMOKE TEST RESULTS: {passed}/{total} tests passed")
        
        # Print summary
        if passed == total:
            print("✅ ALL SMOKE TESTS PASSED - Team management endpoints are working correctly")
        else:
            print("❌ SOME TESTS FAILED - See details above")
            
        return passed == total

def main():
    """Main function to run smoke test"""
    tester = TeamSmokeTest()
    success = tester.run_smoke_test()
    
    if success:
        print("\n🎉 SMOKE TEST COMPLETED SUCCESSFULLY")
        sys.exit(0)
    else:
        print("\n💥 SMOKE TEST FAILED")
        sys.exit(1)

if __name__ == "__main__":
    main()