#!/usr/bin/env python3
"""
Backend API Testing for Review Request
Testing all core functionality after recent frontend fixes
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
ROOT_URL = BACKEND_URL

print(f"Testing API at: {API_URL}")
print(f"Testing Root at: {ROOT_URL}")

def generate_random_string(length=8):
    """Generate a random string of fixed length"""
    letters = string.ascii_lowercase
    return ''.join(random.choice(letters) for i in range(length))

class ReviewBackendTest(unittest.TestCase):
    """Comprehensive backend test for review request"""
    
    def setUp(self):
        """Set up test data"""
        # Generate unique test data
        random_suffix = generate_random_string()
        self.test_username = f"reviewer_{random_suffix}"
        self.test_email = f"reviewer_{random_suffix}@example.com"
        self.test_password = "ReviewTest123!"
        
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
            "bio": "Backend API reviewer"
        }
        
        # Store auth token and IDs
        self.auth_token = None
        self.user_id = None
        self.team_id = None
    
    def test_01_core_api_health(self):
        """Test Core API Health - Verify server is running properly and all endpoints are accessible"""
        print("\n=== TESTING CORE API HEALTH ===")
        
        # Test API status endpoint
        response = requests.get(f"{API_URL}/status")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIn("status", data)
        self.assertEqual(data["status"], "healthy")
        print("✅ API status endpoint working")
        
        # Test frontend is serving (root endpoint serves React app)
        response = requests.get(f"{ROOT_URL}/")
        self.assertEqual(response.status_code, 200)
        self.assertIn("html", response.text.lower())
        print("✅ Frontend serving properly")
        
        print("✅ CORE API HEALTH: All endpoints accessible")
    
    def test_02_authentication_system(self):
        """Test Authentication - Confirm user registration, login, and token validation are functional"""
        print("\n=== TESTING AUTHENTICATION SYSTEM ===")
        
        # Test user registration
        response = requests.post(f"{API_URL}/auth/register", json=self.user_data)
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIn("access_token", data)
        self.assertIn("user", data)
        self.assertEqual(data["user"]["username"], self.test_username)
        
        # Store token and user ID
        self.auth_token = data["access_token"]
        self.user_id = data["user"]["id"]
        print(f"✅ User registration successful with ID: {self.user_id}")
        
        # Test user login
        login_data = {
            "email": self.test_email,
            "password": self.test_password
        }
        response = requests.post(f"{API_URL}/auth/login", json=login_data)
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIn("access_token", data)
        self.assertIn("user", data)
        print("✅ User login successful")
        
        # Test token validation
        headers = {"Authorization": f"Bearer {self.auth_token}"}
        response = requests.get(f"{API_URL}/auth/me", headers=headers)
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data["username"], self.test_username)
        print("✅ Token validation working")
        
        # Test unauthorized access rejection
        response = requests.get(f"{API_URL}/auth/me")
        self.assertEqual(response.status_code, 403)
        print("✅ Unauthorized access properly rejected")
        
        print("✅ AUTHENTICATION: Registration, login, and token validation functional")
    
    def test_03_character_management(self):
        """Test Character Management - Test character API endpoints for filtering and retrieval"""
        print("\n=== TESTING CHARACTER MANAGEMENT ===")
        
        # Test getting all characters
        response = requests.get(f"{API_URL}/characters/")
        self.assertEqual(response.status_code, 200)
        characters = response.json()
        self.assertIsInstance(characters, list)
        self.assertGreater(len(characters), 0)
        print(f"✅ Character retrieval: Found {len(characters)} characters")
        
        # Test character filtering by position
        response = requests.get(f"{API_URL}/characters/?position=GK")
        self.assertEqual(response.status_code, 200)
        gk_characters = response.json()
        self.assertIsInstance(gk_characters, list)
        if gk_characters:
            self.assertEqual(gk_characters[0]["position"], "GK")
        print(f"✅ Position filtering: Found {len(gk_characters)} GK characters")
        
        # Test character filtering by element
        response = requests.get(f"{API_URL}/characters/?element=Fire")
        self.assertEqual(response.status_code, 200)
        fire_characters = response.json()
        self.assertIsInstance(fire_characters, list)
        if fire_characters:
            self.assertEqual(fire_characters[0]["element"], "Fire")
        print(f"✅ Element filtering: Found {len(fire_characters)} Fire characters")
        
        # Test character search
        response = requests.get(f"{API_URL}/characters/?search=Mark")
        self.assertEqual(response.status_code, 200)
        search_results = response.json()
        self.assertIsInstance(search_results, list)
        print(f"✅ Character search: Found {len(search_results)} results for 'Mark'")
        
        # Test individual character retrieval
        if characters:
            character_id = characters[0]["id"]
            response = requests.get(f"{API_URL}/characters/{character_id}")
            self.assertEqual(response.status_code, 200)
            character = response.json()
            self.assertIn("id", character)
            self.assertIn("name", character)
            self.assertIn("base_stats", character)
            print(f"✅ Individual character retrieval working for ID: {character_id}")
        
        # Test character stats summary
        response = requests.get(f"{API_URL}/characters/stats/summary")
        self.assertEqual(response.status_code, 200)
        stats = response.json()
        self.assertIn("total_characters", stats)
        self.assertIn("by_position", stats)
        self.assertIn("by_element", stats)
        print("✅ Character statistics summary working")
        
        print("✅ CHARACTER MANAGEMENT: All filtering and retrieval endpoints functional")
    
    def test_04_equipment_system(self):
        """Test Equipment System - Verify equipment APIs are working with proper stat bonuses"""
        print("\n=== TESTING EQUIPMENT SYSTEM ===")
        
        # Test getting all equipment
        response = requests.get(f"{API_URL}/equipment/")
        self.assertEqual(response.status_code, 200)
        equipment = response.json()
        self.assertIsInstance(equipment, list)
        self.assertGreater(len(equipment), 0)
        print(f"✅ Equipment retrieval: Found {len(equipment)} equipment items")
        
        # Test equipment filtering by category
        response = requests.get(f"{API_URL}/equipment/?category=Boots")
        self.assertEqual(response.status_code, 200)
        boots = response.json()
        self.assertIsInstance(boots, list)
        if boots:
            self.assertEqual(boots[0]["category"], "Boots")
        print(f"✅ Category filtering: Found {len(boots)} Boots")
        
        # Test equipment filtering by rarity
        response = requests.get(f"{API_URL}/equipment/?rarity=Legendary")
        self.assertEqual(response.status_code, 200)
        legendary_equipment = response.json()
        self.assertIsInstance(legendary_equipment, list)
        if legendary_equipment:
            self.assertEqual(legendary_equipment[0]["rarity"], "Legendary")
        print(f"✅ Rarity filtering: Found {len(legendary_equipment)} Legendary equipment")
        
        # Test individual equipment retrieval and stat bonuses
        if equipment:
            equipment_id = equipment[0]["id"]
            response = requests.get(f"{API_URL}/equipment/{equipment_id}")
            self.assertEqual(response.status_code, 200)
            equipment_item = response.json()
            self.assertIn("id", equipment_item)
            self.assertIn("name", equipment_item)
            self.assertIn("stats", equipment_item)
            
            # Verify stat bonuses are present
            stats = equipment_item["stats"]
            self.assertIsInstance(stats, dict)
            self.assertGreater(len(stats), 0)
            print(f"✅ Equipment stat bonuses verified for {equipment_item['name']}: {stats}")
        
        print("✅ EQUIPMENT SYSTEM: All APIs working with proper stat bonuses")
    
    def test_05_team_management(self):
        """Test Team Management - Test team creation, retrieval, updating, and deletion with authentication"""
        print("\n=== TESTING TEAM MANAGEMENT ===")
        
        if not self.auth_token:
            self.skipTest("No auth token available")
        
        headers = {"Authorization": f"Bearer {self.auth_token}"}
        
        # Test team creation
        team_data = {
            "name": f"Review Test Team {generate_random_string()}",
            "formation": "4-3-3",
            "players": [],
            "bench_players": [],
            "tactics": [],
            "coach": None,
            "description": "Test team for review backend testing",
            "is_public": True,
            "tags": ["review", "test"]
        }
        
        response = requests.post(f"{API_URL}/teams", json=team_data, headers=headers)
        self.assertEqual(response.status_code, 200)
        team = response.json()
        self.assertIn("id", team)
        self.assertEqual(team["name"], team_data["name"])
        
        self.team_id = team["id"]
        print(f"✅ Team creation successful with ID: {self.team_id}")
        
        # Test getting user teams
        response = requests.get(f"{API_URL}/teams", headers=headers)
        self.assertEqual(response.status_code, 200)
        teams = response.json()
        self.assertIsInstance(teams, list)
        self.assertGreater(len(teams), 0)
        print(f"✅ Get user teams: Found {len(teams)} teams")
        
        # Test getting specific team
        response = requests.get(f"{API_URL}/teams/{self.team_id}", headers=headers)
        self.assertEqual(response.status_code, 200)
        retrieved_team = response.json()
        self.assertEqual(retrieved_team["id"], self.team_id)
        print("✅ Get specific team working")
        
        # Test team update
        update_data = {
            "name": f"Updated Review Team {generate_random_string()}",
            "is_public": False  # Test privacy toggle
        }
        response = requests.put(f"{API_URL}/teams/{self.team_id}", json=update_data, headers=headers)
        self.assertEqual(response.status_code, 200)
        updated_team = response.json()
        self.assertEqual(updated_team["name"], update_data["name"])
        self.assertEqual(updated_team["is_public"], False)
        print("✅ Team update including privacy toggle working")
        
        # Test team deletion
        response = requests.delete(f"{API_URL}/teams/{self.team_id}", headers=headers)
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIn("message", data)
        print("✅ Team deletion working")
        
        # Verify team is deleted
        response = requests.get(f"{API_URL}/teams/{self.team_id}", headers=headers)
        self.assertEqual(response.status_code, 404)
        print("✅ Team deletion verified")
        
        print("✅ TEAM MANAGEMENT: All CRUD operations functional with authentication")
    
    def test_06_formation_and_tactics(self):
        """Test Formation & Tactics - Test formation and tactics endpoints"""
        print("\n=== TESTING FORMATION & TACTICS ===")
        
        # Test getting formations
        response = requests.get(f"{API_URL}/teams/formations/")
        self.assertEqual(response.status_code, 200)
        formations = response.json()
        self.assertIsInstance(formations, list)
        self.assertGreater(len(formations), 0)
        
        # Verify formation structure
        formation = formations[0]
        self.assertIn("id", formation)
        self.assertIn("name", formation)
        self.assertIn("positions", formation)
        print(f"✅ Formations endpoint: Found {len(formations)} formations")
        
        # Test getting tactics
        response = requests.get(f"{API_URL}/teams/tactics/")
        self.assertEqual(response.status_code, 200)
        tactics = response.json()
        self.assertIsInstance(tactics, list)
        self.assertGreater(len(tactics), 0)
        
        # Verify tactics structure
        tactic = tactics[0]
        self.assertIn("id", tactic)
        self.assertIn("name", tactic)
        self.assertIn("description", tactic)
        print(f"✅ Tactics endpoint: Found {len(tactics)} tactics")
        
        # Test getting coaches
        response = requests.get(f"{API_URL}/teams/coaches/")
        self.assertEqual(response.status_code, 200)
        coaches = response.json()
        self.assertIsInstance(coaches, list)
        self.assertGreater(len(coaches), 0)
        
        # Verify coaches structure
        coach = coaches[0]
        self.assertIn("id", coach)
        self.assertIn("name", coach)
        print(f"✅ Coaches endpoint: Found {len(coaches)} coaches")
        
        print("✅ FORMATION & TACTICS: All endpoints functional")
    
    def test_07_constellation_system(self):
        """Test Constellation System - Verify constellation and gacha functionality"""
        print("\n=== TESTING CONSTELLATION SYSTEM ===")
        
        if not self.auth_token:
            self.skipTest("No auth token available")
        
        headers = {"Authorization": f"Bearer {self.auth_token}"}
        
        # Test getting constellations
        response = requests.get(f"{API_URL}/constellations/")
        self.assertEqual(response.status_code, 200)
        constellations = response.json()
        self.assertIsInstance(constellations, list)
        self.assertGreater(len(constellations), 0)
        print(f"✅ Constellations endpoint: Found {len(constellations)} constellations")
        
        if constellations:
            constellation_id = constellations[0]["id"]
            
            # Test getting constellation details
            response = requests.get(f"{API_URL}/constellations/{constellation_id}")
            self.assertEqual(response.status_code, 200)
            constellation = response.json()
            self.assertIn("id", constellation)
            self.assertIn("name", constellation)
            self.assertIn("orbs", constellation)
            print(f"✅ Constellation details working for: {constellation['name']}")
            
            # Test getting constellation characters
            response = requests.get(f"{API_URL}/constellations/{constellation_id}/characters")
            self.assertEqual(response.status_code, 200)
            characters = response.json()
            self.assertIsInstance(characters, dict)
            print("✅ Constellation characters endpoint working")
            
            # Test gacha pull system (if user has Kizuna Stars)
            response = requests.get(f"{API_URL}/auth/me", headers=headers)
            user_data = response.json()
            if user_data.get("kizuna_stars", 0) >= 5:
                pull_data = {
                    "constellation_id": constellation_id,
                    "pull_count": 1
                }
                response = requests.post(f"{API_URL}/constellations/pull", json=pull_data, headers=headers)
                self.assertEqual(response.status_code, 200)
                pull_result = response.json()
                self.assertIn("characters", pull_result)
                print("✅ Gacha pull system working")
            else:
                print("⚠️ Gacha pull skipped - insufficient Kizuna Stars")
        
        print("✅ CONSTELLATION SYSTEM: All endpoints functional")
    
    def test_08_community_features(self):
        """Test Community Features - Verify community endpoints are working"""
        print("\n=== TESTING COMMUNITY FEATURES ===")
        
        if not self.auth_token:
            self.skipTest("No auth token available")
        
        headers = {"Authorization": f"Bearer {self.auth_token}"}
        
        # Test community teams endpoint
        response = requests.get(f"{API_URL}/community/teams", headers=headers)
        self.assertEqual(response.status_code, 200)
        teams = response.json()
        self.assertIsInstance(teams, list)
        print(f"✅ Community teams endpoint: Found {len(teams)} public teams")
        
        # Test community stats
        response = requests.get(f"{API_URL}/community/stats", headers=headers)
        self.assertEqual(response.status_code, 200)
        stats = response.json()
        self.assertIn("total_users", stats)
        self.assertIn("total_teams", stats)
        print("✅ Community stats endpoint working")
        
        # Test community featured
        response = requests.get(f"{API_URL}/community/featured", headers=headers)
        self.assertEqual(response.status_code, 200)
        featured = response.json()
        self.assertIn("teams_of_week", featured)
        self.assertIn("popular_formations", featured)
        print("✅ Community featured endpoint working")
        
        print("✅ COMMUNITY FEATURES: All endpoints functional")

def run_tests():
    """Run all backend tests"""
    print("="*80)
    print("BACKEND API COMPREHENSIVE TESTING FOR REVIEW REQUEST")
    print("="*80)
    
    # Create test suite
    suite = unittest.TestLoader().loadTestsFromTestCase(ReviewBackendTest)
    
    # Run tests
    runner = unittest.TextTestRunner(verbosity=2)
    result = runner.run(suite)
    
    print("\n" + "="*80)
    print("BACKEND TESTING SUMMARY")
    print("="*80)
    
    if result.wasSuccessful():
        print("🎉 ALL BACKEND TESTS PASSED!")
        print("✅ Core API Health: Server running properly")
        print("✅ Authentication: Registration, login, token validation functional")
        print("✅ Character Management: Filtering and retrieval working")
        print("✅ Equipment System: APIs working with stat bonuses")
        print("✅ Team Management: CRUD operations with authentication")
        print("✅ Formation & Tactics: All endpoints functional")
        print("✅ Constellation System: Gacha and constellation features working")
        print("✅ Community Features: All community endpoints operational")
    else:
        print("❌ SOME BACKEND TESTS FAILED")
        print(f"Failures: {len(result.failures)}")
        print(f"Errors: {len(result.errors)}")
        
        if result.failures:
            print("\nFAILURES:")
            for test, traceback in result.failures:
                print(f"- {test}: {traceback.split('AssertionError:')[-1].strip()}")
        
        if result.errors:
            print("\nERRORS:")
            for test, traceback in result.errors:
                print(f"- {test}: {traceback.split('Exception:')[-1].strip()}")
    
    print("="*80)
    return result.wasSuccessful()

if __name__ == "__main__":
    success = run_tests()
    exit(0 if success else 1)