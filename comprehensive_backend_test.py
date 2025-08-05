#!/usr/bin/env python3
import requests
import json
import os
import unittest
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

print(f"Testing API at: {API_URL}")
print(f"Testing Root at: {ROOT_URL}")

def generate_random_string(length=8):
    """Generate a random string of fixed length"""
    letters = string.ascii_lowercase
    return ''.join(random.choice(letters) for i in range(length))

class ComprehensiveBackendTest(unittest.TestCase):
    """Comprehensive Backend API Test Suite for Review Request"""
    
    def setUp(self):
        """Set up test data"""
        # Generate unique username and email for testing
        random_suffix = generate_random_string()
        self.test_username = f"reviewuser_{random_suffix}"
        self.test_email = f"review_{random_suffix}@example.com"
        self.test_password = "ReviewTest123!"
        
        # User registration data with enhanced fields
        self.user_data = {
            "username": self.test_username,
            "email": self.test_email,
            "password": self.test_password,
            "coach_level": 5,
            "favorite_position": "FW",
            "favorite_element": "Fire",
            "favourite_team": "Raimon",
            "profile_picture": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==",
            "bio": "Backend API review tester"
        }
        
        # Store auth token and IDs
        self.auth_token = None
        self.user_id = None
        self.team_id = None
    
    def test_01_core_api_health_and_status(self):
        """Test Core API health and status endpoints"""
        print("\n🔍 TESTING: Core API Health and Status")
        
        # Test API status endpoint
        response = requests.get(f"{API_URL}/status")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIn("status", data)
        self.assertEqual(data["status"], "healthy")
        print("✅ API status endpoint working")
        
        # Test root endpoint
        response = requests.get(f"{ROOT_URL}/")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIn("message", data)
        print("✅ Root endpoint working")
    
    def test_02_authentication_endpoints(self):
        """Test Authentication endpoints (registration, login, token validation)"""
        print("\n🔍 TESTING: Authentication System")
        
        # Test user registration
        response = requests.post(f"{API_URL}/auth/register", json=self.user_data)
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIn("access_token", data)
        self.assertIn("token_type", data)
        self.assertIn("user", data)
        self.assertEqual(data["user"]["username"], self.test_username)
        self.assertEqual(data["user"]["email"], self.test_email)
        
        # Store token for subsequent tests
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
        self.assertIn("token_type", data)
        self.assertIn("user", data)
        print("✅ User login successful")
        
        # Test token validation
        headers = {"Authorization": f"Bearer {self.auth_token}"}
        response = requests.get(f"{API_URL}/auth/me", headers=headers)
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data["username"], self.test_username)
        self.assertEqual(data["email"], self.test_email)
        print("✅ Token validation successful")
        
        # Test unauthorized access
        response = requests.get(f"{API_URL}/auth/me")
        self.assertEqual(response.status_code, 403)
        print("✅ Unauthorized access properly rejected")
    
    def test_03_character_management_apis(self):
        """Test Character management APIs (character retrieval, filtering, search)"""
        print("\n🔍 TESTING: Character Management APIs")
        
        # Test getting all characters
        response = requests.get(f"{API_URL}/characters/")
        self.assertEqual(response.status_code, 200)
        characters = response.json()
        self.assertIsInstance(characters, list)
        print(f"✅ Character retrieval working - Found {len(characters)} characters")
        
        if characters:
            # Test position filtering
            response = requests.get(f"{API_URL}/characters/?position=GK")
            self.assertEqual(response.status_code, 200)
            gk_characters = response.json()
            self.assertIsInstance(gk_characters, list)
            if gk_characters:
                self.assertEqual(gk_characters[0]["position"], "GK")
            print(f"✅ Position filtering working - Found {len(gk_characters)} GK characters")
            
            # Test element filtering
            response = requests.get(f"{API_URL}/characters/?element=Fire")
            self.assertEqual(response.status_code, 200)
            fire_characters = response.json()
            self.assertIsInstance(fire_characters, list)
            if fire_characters:
                self.assertEqual(fire_characters[0]["element"], "Fire")
            print(f"✅ Element filtering working - Found {len(fire_characters)} Fire characters")
            
            # Test character search
            response = requests.get(f"{API_URL}/characters/?search=Mark")
            self.assertEqual(response.status_code, 200)
            search_results = response.json()
            self.assertIsInstance(search_results, list)
            print(f"✅ Character search working - Found {len(search_results)} results for 'Mark'")
            
            # Test individual character retrieval
            character_id = characters[0]["id"]
            response = requests.get(f"{API_URL}/characters/{character_id}")
            self.assertEqual(response.status_code, 200)
            character = response.json()
            self.assertIn("id", character)
            self.assertIn("name", character)
            self.assertIn("base_stats", character)
            print(f"✅ Individual character retrieval working for ID: {character_id}")
            
            # Test character statistics summary
            response = requests.get(f"{API_URL}/characters/stats/summary")
            self.assertEqual(response.status_code, 200)
            stats = response.json()
            self.assertIn("total_characters", stats)
            self.assertIn("by_position", stats)
            self.assertIn("by_element", stats)
            print("✅ Character statistics summary working")
    
    def test_04_equipment_system_apis(self):
        """Test Equipment system APIs (equipment retrieval, filtering by category/rarity)"""
        print("\n🔍 TESTING: Equipment System APIs")
        
        # Test getting all equipment
        response = requests.get(f"{API_URL}/equipment/")
        self.assertEqual(response.status_code, 200)
        equipment = response.json()
        self.assertIsInstance(equipment, list)
        print(f"✅ Equipment retrieval working - Found {len(equipment)} equipment items")
        
        if equipment:
            # Test category filtering
            response = requests.get(f"{API_URL}/equipment/?category=Boots")
            self.assertEqual(response.status_code, 200)
            boots = response.json()
            self.assertIsInstance(boots, list)
            if boots:
                self.assertEqual(boots[0]["category"], "Boots")
            print(f"✅ Category filtering working - Found {len(boots)} Boots")
            
            # Test rarity filtering
            response = requests.get(f"{API_URL}/equipment/?rarity=Legendary")
            self.assertEqual(response.status_code, 200)
            legendary_equipment = response.json()
            self.assertIsInstance(legendary_equipment, list)
            if legendary_equipment:
                self.assertEqual(legendary_equipment[0]["rarity"], "Legendary")
            print(f"✅ Rarity filtering working - Found {len(legendary_equipment)} Legendary equipment")
            
            # Test individual equipment retrieval
            equipment_id = equipment[0]["id"]
            response = requests.get(f"{API_URL}/equipment/{equipment_id}")
            self.assertEqual(response.status_code, 200)
            equipment_item = response.json()
            self.assertIn("id", equipment_item)
            self.assertIn("name", equipment_item)
            self.assertIn("stats", equipment_item)
            print(f"✅ Individual equipment retrieval working for ID: {equipment_id}")
    
    def test_05_team_management_apis(self):
        """Test Team management APIs (CRUD operations, save slots, team updates)"""
        print("\n🔍 TESTING: Team Management APIs")
        
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
            "description": "A test team created for backend API review",
            "is_public": True,
            "tags": ["review", "test", "backend"]
        }
        
        response = requests.post(f"{API_URL}/teams", json=team_data, headers=headers)
        self.assertEqual(response.status_code, 200)
        team = response.json()
        self.assertIn("id", team)
        self.assertEqual(team["name"], team_data["name"])
        self.team_id = team["id"]
        print(f"✅ Team creation successful with ID: {self.team_id}")
        
        # Test team retrieval
        response = requests.get(f"{API_URL}/teams", headers=headers)
        self.assertEqual(response.status_code, 200)
        teams = response.json()
        self.assertIsInstance(teams, list)
        print(f"✅ Team retrieval working - Found {len(teams)} teams")
        
        # Test specific team retrieval
        response = requests.get(f"{API_URL}/teams/{self.team_id}", headers=headers)
        self.assertEqual(response.status_code, 200)
        retrieved_team = response.json()
        self.assertEqual(retrieved_team["id"], self.team_id)
        print(f"✅ Specific team retrieval working")
        
        # Test team update
        update_data = {
            "name": f"Updated Review Team {generate_random_string()}",
            "is_public": False  # Test privacy toggle
        }
        response = requests.put(f"{API_URL}/teams/{self.team_id}", json=update_data, headers=headers)
        self.assertEqual(response.status_code, 200)
        updated_team = response.json()
        self.assertEqual(updated_team["name"], update_data["name"])
        self.assertEqual(updated_team["is_public"], update_data["is_public"])
        print("✅ Team update and privacy toggle working")
        
        # Test save slots
        response = requests.get(f"{API_URL}/save-slots", headers=headers)
        self.assertEqual(response.status_code, 200)
        slots_data = response.json()
        self.assertIn("save_slots", slots_data)
        self.assertEqual(len(slots_data["save_slots"]), 5)
        print("✅ Save slots retrieval working - 5 slots available")
        
        # Test save team to slot
        slot_data = {
            "slot_number": 1,
            "slot_name": "Review Test Slot",
            "overwrite": True
        }
        response = requests.post(f"{API_URL}/teams/{self.team_id}/save-to-slot", json=slot_data, headers=headers)
        self.assertEqual(response.status_code, 200)
        print("✅ Save team to slot working")
        
        # Test team deletion
        response = requests.delete(f"{API_URL}/teams/{self.team_id}", headers=headers)
        self.assertEqual(response.status_code, 200)
        print("✅ Team deletion working")
    
    def test_06_formation_and_tactics_endpoints(self):
        """Test Formation and tactics endpoints"""
        print("\n🔍 TESTING: Formation and Tactics Endpoints")
        
        # Test formations
        response = requests.get(f"{API_URL}/teams/formations/")
        self.assertEqual(response.status_code, 200)
        formations = response.json()
        self.assertIsInstance(formations, list)
        self.assertGreater(len(formations), 0)
        print(f"✅ Formations endpoint working - Found {len(formations)} formations")
        
        # Test tactics
        response = requests.get(f"{API_URL}/teams/tactics/")
        self.assertEqual(response.status_code, 200)
        tactics = response.json()
        self.assertIsInstance(tactics, list)
        self.assertGreater(len(tactics), 0)
        print(f"✅ Tactics endpoint working - Found {len(tactics)} tactics")
        
        # Test coaches
        response = requests.get(f"{API_URL}/teams/coaches/")
        self.assertEqual(response.status_code, 200)
        coaches = response.json()
        self.assertIsInstance(coaches, list)
        self.assertGreater(len(coaches), 0)
        print(f"✅ Coaches endpoint working - Found {len(coaches)} coaches")
    
    def test_07_community_features(self):
        """Test Community features (likes, comments, team sharing)"""
        print("\n🔍 TESTING: Community Features")
        
        if not self.auth_token:
            self.skipTest("No auth token available")
        
        headers = {"Authorization": f"Bearer {self.auth_token}"}
        
        # Test community teams endpoint
        response = requests.get(f"{API_URL}/community/teams", headers=headers)
        self.assertEqual(response.status_code, 200)
        community_teams = response.json()
        self.assertIsInstance(community_teams, list)
        print(f"✅ Community teams endpoint working - Found {len(community_teams)} public teams")
        
        # Test community stats
        response = requests.get(f"{API_URL}/community/stats", headers=headers)
        self.assertEqual(response.status_code, 200)
        stats = response.json()
        self.assertIn("total_users", stats)
        self.assertIn("total_teams", stats)
        self.assertIn("total_public_teams", stats)
        print("✅ Community stats endpoint working")
        
        # Test community featured
        response = requests.get(f"{API_URL}/community/featured", headers=headers)
        self.assertEqual(response.status_code, 200)
        featured = response.json()
        self.assertIn("teams_of_week", featured)
        self.assertIn("popular_formations", featured)
        print("✅ Community featured endpoint working")
    
    def test_08_constellation_gacha_system_apis(self):
        """Test Constellation/gacha system APIs"""
        print("\n🔍 TESTING: Constellation/Gacha System APIs")
        
        if not self.auth_token:
            self.skipTest("No auth token available")
        
        headers = {"Authorization": f"Bearer {self.auth_token}"}
        
        # Test getting constellations
        response = requests.get(f"{API_URL}/constellations/")
        self.assertEqual(response.status_code, 200)
        constellations = response.json()
        self.assertIsInstance(constellations, list)
        print(f"✅ Constellations endpoint working - Found {len(constellations)} constellations")
        
        if constellations:
            constellation_id = constellations[0]["id"]
            
            # Test constellation details
            response = requests.get(f"{API_URL}/constellations/{constellation_id}")
            self.assertEqual(response.status_code, 200)
            constellation = response.json()
            self.assertIn("id", constellation)
            self.assertIn("name", constellation)
            self.assertIn("orbs", constellation)
            print(f"✅ Constellation details working for ID: {constellation_id}")
            
            # Test constellation characters
            response = requests.get(f"{API_URL}/constellations/{constellation_id}/characters")
            self.assertEqual(response.status_code, 200)
            characters = response.json()
            self.assertIsInstance(characters, dict)
            print("✅ Constellation characters endpoint working")
            
            # Test drop rates
            response = requests.get(f"{API_URL}/constellations/{constellation_id}/drop-rates")
            self.assertEqual(response.status_code, 200)
            drop_rates = response.json()
            self.assertIn("base_rates", drop_rates)
            self.assertIn("final_rates", drop_rates)
            print("✅ Constellation drop rates endpoint working")
            
            # Test gacha pull (if user has enough Kizuna Stars)
            pull_data = {
                "constellation_id": constellation_id,
                "pull_count": 1,
                "platform_bonuses": ["Nintendo"]
            }
            response = requests.post(f"{API_URL}/constellations/pull", json=pull_data, headers=headers)
            # This might fail if user doesn't have enough stars, but endpoint should exist
            self.assertIn(response.status_code, [200, 400])  # 400 for insufficient stars is acceptable
            print("✅ Gacha pull endpoint accessible")

if __name__ == "__main__":
    print("="*80)
    print("COMPREHENSIVE BACKEND API TESTING FOR REVIEW REQUEST")
    print("="*80)
    
    # Run the comprehensive test suite
    unittest.main(verbosity=2)