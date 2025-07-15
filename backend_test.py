#!/usr/bin/env python3
import requests
import json
import os
import pandas as pd
import io
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

class AuthAndTeamsAPITest(unittest.TestCase):
    """Test suite for Authentication and User Teams API"""
    
    def setUp(self):
        """Set up test data"""
        # Generate unique username and email for testing
        random_suffix = generate_random_string()
        self.test_username = f"testuser_{random_suffix}"
        self.test_email = f"test_{random_suffix}@example.com"
        self.test_password = "Password123!"
        
        # User registration data with enhanced fields
        self.user_data = {
            "username": self.test_username,
            "email": self.test_email,
            "password": self.test_password,
            "coach_level": 5,
            "favorite_position": "FW",
            "favorite_element": "Fire",
            "favorite_formation": "4-3-3",
            "profile_picture": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==",
            "bio": "Passionate football coach and strategist"
        }
        
        # Team creation data
        self.team_data = {
            "name": f"Test Team {random_suffix}",
            "formation": "1",  # Using default formation ID
            "players": [],
            "bench_players": [],
            "tactics": [],
            "coach": None
        }
        
        # Store auth token
        self.auth_token = None
        self.user_id = None
        self.team_id = None
    
    def test_01_api_root(self):
        """Test API root endpoint"""
        response = requests.get(ROOT_URL)
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIn("message", data)
        print("✅ API root endpoint working")
    
    def test_02_register_user(self):
        """Test user registration"""
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
    
    def test_03_register_duplicate_email(self):
        """Test registering with an existing email"""
        # Skip if no user was registered
        if not hasattr(self, 'test_email'):
            self.skipTest("No user registered yet")
        
        # Try to register with the same email
        response = requests.post(f"{API_URL}/auth/register", json=self.user_data)
        self.assertEqual(response.status_code, 400)
        data = response.json()
        self.assertIn("detail", data)
        print("✅ Duplicate email registration properly rejected")
    
    def test_04_login_user(self):
        """Test user login"""
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
        self.assertEqual(data["user"]["username"], self.test_username)
        self.assertEqual(data["user"]["email"], self.test_email)
        
        # Update token
        self.auth_token = data["access_token"]
        print("✅ User login successful")
    
    def test_05_login_invalid_credentials(self):
        """Test login with invalid credentials"""
        login_data = {
            "email": self.test_email,
            "password": "WrongPassword123!"
        }
        response = requests.post(f"{API_URL}/auth/login", json=login_data)
        self.assertEqual(response.status_code, 401)
        data = response.json()
        self.assertIn("detail", data)
        print("✅ Invalid login credentials properly rejected")
    
    def test_06_get_current_user(self):
        """Test getting current user info"""
        # Skip if no token
        if not self.auth_token:
            self.skipTest("No auth token available")
        
        headers = {"Authorization": f"Bearer {self.auth_token}"}
        response = requests.get(f"{API_URL}/auth/me", headers=headers)
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data["username"], self.test_username)
        self.assertEqual(data["email"], self.test_email)
        print("✅ Get current user info successful")
    
    def test_07_update_user_profile(self):
        """Test updating user profile"""
        # Skip if no token
        if not self.auth_token:
            self.skipTest("No auth token available")
        
        update_data = {
            "coach_level": 10,
            "favorite_position": "GK",
            "favorite_element": "Wind"
        }
        
        headers = {"Authorization": f"Bearer {self.auth_token}"}
        response = requests.put(f"{API_URL}/auth/me", json=update_data, headers=headers)
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data["coach_level"], 10)
        self.assertEqual(data["favorite_position"], "GK")
        self.assertEqual(data["favorite_element"], "Wind")
        print("✅ Update user profile successful")
    
    def test_08_create_team(self):
        """Test creating a team"""
        # Skip if no token
        if not self.auth_token:
            self.skipTest("No auth token available")
        
        headers = {"Authorization": f"Bearer {self.auth_token}"}
        response = requests.post(f"{API_URL}/teams", json=self.team_data, headers=headers)
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIn("id", data)
        self.assertEqual(data["name"], self.team_data["name"])
        self.assertEqual(data["formation"], self.team_data["formation"])
        
        # Store team ID for subsequent tests
        self.team_id = data["id"]
        print(f"✅ Team creation successful with ID: {self.team_id}")
    
    def test_09_get_user_teams(self):
        """Test getting all teams for the current user"""
        # Skip if no token
        if not self.auth_token:
            self.skipTest("No auth token available")
        
        headers = {"Authorization": f"Bearer {self.auth_token}"}
        response = requests.get(f"{API_URL}/teams", headers=headers)
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIsInstance(data, list)
        if len(data) > 0:
            self.assertEqual(data[0]["user_id"], self.user_id)
        print(f"✅ Get user teams successful, found {len(data)} teams")
    
    def test_10_get_team_by_id(self):
        """Test getting a specific team by ID"""
        # Skip if no token or team ID
        if not self.auth_token or not self.team_id:
            self.skipTest("No auth token or team ID available")
        
        headers = {"Authorization": f"Bearer {self.auth_token}"}
        response = requests.get(f"{API_URL}/teams/{self.team_id}", headers=headers)
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data["id"], self.team_id)
        self.assertEqual(data["name"], self.team_data["name"])
        print(f"✅ Get team by ID successful")
    
    def test_11_update_team(self):
        """Test updating a team"""
        # Skip if no token or team ID
        if not self.auth_token or not self.team_id:
            self.skipTest("No auth token or team ID available")
        
        update_data = {
            "name": f"Updated Team {generate_random_string()}",
            "formation": "2"  # Using another formation ID
        }
        
        headers = {"Authorization": f"Bearer {self.auth_token}"}
        response = requests.put(f"{API_URL}/teams/{self.team_id}", json=update_data, headers=headers)
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data["id"], self.team_id)
        self.assertEqual(data["name"], update_data["name"])
        self.assertEqual(data["formation"], update_data["formation"])
        print(f"✅ Update team successful")
    
    def test_12_delete_team(self):
        """Test deleting a team"""
        # Skip if no token or team ID
        if not self.auth_token or not self.team_id:
            self.skipTest("No auth token or team ID available")
        
        headers = {"Authorization": f"Bearer {self.auth_token}"}
        response = requests.delete(f"{API_URL}/teams/{self.team_id}", headers=headers)
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIn("message", data)
        print(f"✅ Delete team successful")
    
    def test_13_unauthorized_access(self):
        """Test accessing protected endpoints without authentication"""
        # Test accessing /api/auth/me without token
        response = requests.get(f"{API_URL}/auth/me")
        self.assertEqual(response.status_code, 403)
        
        # Test accessing /api/teams without token
        response = requests.get(f"{API_URL}/teams")
        self.assertEqual(response.status_code, 403)
        
        print("✅ Unauthorized access properly rejected")

class InazumaElevenAPITest(unittest.TestCase):
    """Test suite for Inazuma Eleven Victory Road API"""
    
    def setUp(self):
        """Set up test data"""
        # Sample character data for testing
        self.sample_character = {
            "name": "Axel Blaze",
            "nickname": "Fire Striker",
            "title": "Ace Striker",
            "base_level": 99,
            "base_rarity": "Legendary",
            "position": "FW",
            "element": "Fire",
            "jersey_number": 10,
            "description": "A legendary striker with powerful fire shots",
            "base_stats": {
                "kick": {"main": 95, "secondary": 100},
                "control": {"main": 85, "secondary": 90},
                "technique": {"main": 90, "secondary": 95},
                "intelligence": {"main": 80, "secondary": 85},
                "pressure": {"main": 75, "secondary": 80},
                "agility": {"main": 85, "secondary": 90},
                "physical": {"main": 80, "secondary": 85}
            },
            "hissatsu": [
                {
                    "name": "Fire Tornado",
                    "description": "A powerful shot that creates a tornado of fire",
                    "type": "Shot"
                },
                {
                    "name": "Flame Dance",
                    "description": "A dribbling technique that leaves a trail of fire",
                    "type": "Dribble"
                }
            ],
            "team_passives": [
                {
                    "name": "Fire Spirit",
                    "description": "Boosts team's fire element attacks"
                },
                {
                    "name": "Striker's Instinct",
                    "description": "Increases shot power for all forwards"
                }
            ]
        }
        
        # Sample team data for testing
        self.sample_team = {
            "name": "Raimon Eleven",
            "formation_id": "1",  # Will be updated after getting formations
            "tactics": [],  # Will be updated after getting tactics
            "coach_id": None,  # Will be updated after getting coaches
            "players": []  # Will be populated after creating characters
        }
        
        # Sample equipment data for testing
        self.sample_equipment = {
            "name": "Lightning Boots",
            "rarity": "Legendary",
            "category": "Boots",
            "stats": {
                "kick": 20,
                "agility": 15
            },
            "description": "Boots that enhance kicking power and agility"
        }
        
        # Store created resources for cleanup
        self.created_resources = {
            "characters": [],
            "teams": [],
            "equipment": []
        }
    
    def test_01_api_root(self):
        """Test API root endpoint"""
        response = requests.get(f"{API_URL}/")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIn("message", data)
        print("✅ API root endpoint working")
    
    def test_02_status_endpoint(self):
        """Test status endpoint"""
        # Create status check
        status_data = {"client_name": "Test Client"}
        response = requests.post(f"{API_URL}/status", json=status_data)
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIn("id", data)
        self.assertEqual(data["client_name"], "Test Client")
        
        # Get status checks
        response = requests.get(f"{API_URL}/status")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIsInstance(data, list)
        print("✅ Status endpoints working")
    
    # Characters API Tests
    
    def test_03_get_characters_empty(self):
        """Test getting characters (initially empty)"""
        response = requests.get(f"{API_URL}/characters/")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIsInstance(data, list)
        print(f"✅ GET /characters/ returned {len(data)} characters")
    
    def test_04_create_character(self):
        """Test creating a character"""
        response = requests.post(f"{API_URL}/characters/", json=self.sample_character)
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIn("id", data)
        self.assertEqual(data["name"], self.sample_character["name"])
        self.assertEqual(data["position"], self.sample_character["position"])
        self.assertEqual(data["element"], self.sample_character["element"])
        
        # Store character ID for later tests
        self.created_resources["characters"].append(data["id"])
        self.character_id = data["id"]
        print(f"✅ Created character with ID: {self.character_id}")
    
    def test_05_get_character_by_id(self):
        """Test getting a specific character by ID"""
        if not hasattr(self, 'character_id'):
            self.skipTest("No character created yet")
        
        response = requests.get(f"{API_URL}/characters/{self.character_id}")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data["id"], self.character_id)
        self.assertEqual(data["name"], self.sample_character["name"])
        print(f"✅ GET /characters/{self.character_id} working")
    
    def test_06_get_characters_with_filters(self):
        """Test getting characters with filters"""
        if not hasattr(self, 'character_id'):
            self.skipTest("No character created yet")
        
        # Test position filter
        response = requests.get(f"{API_URL}/characters/?position=FW")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIsInstance(data, list)
        if data:
            self.assertEqual(data[0]["position"], "FW")
        
        # Test element filter
        response = requests.get(f"{API_URL}/characters/?element=Fire")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIsInstance(data, list)
        if data:
            self.assertEqual(data[0]["element"], "Fire")
        
        # Test search
        response = requests.get(f"{API_URL}/characters/?search=Blaze")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIsInstance(data, list)
        if data:
            self.assertIn("Blaze", data[0]["name"])
        
        print("✅ Character filtering working")
    
    def test_07_character_stats_summary(self):
        """Test character statistics summary"""
        response = requests.get(f"{API_URL}/characters/stats/summary")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIn("total_characters", data)
        self.assertIn("by_position", data)
        self.assertIn("by_element", data)
        self.assertIn("by_rarity", data)
        print("✅ Character statistics summary working")
    
    def test_08_import_characters_excel(self):
        """Test importing characters from Excel"""
        # Create a simple Excel file with character data
        df = pd.DataFrame([
            {
                "name": "Mark Evans",
                "nickname": "Goalkeeper",
                "title": "Captain",
                "level": 95,
                "rarity": "Legendary",
                "position": "GK",
                "element": "Earth",
                "jersey_number": 1,
                "description": "Legendary goalkeeper and captain",
                "kick": 60,
                "control": 70,
                "technique": 85,
                "intelligence": 90,
                "pressure": 95,
                "agility": 85,
                "physical": 80,
                "hissatsu_1": "God Hand",
                "hissatsu_1_desc": "A powerful goalkeeping technique",
                "hissatsu_2": "Majin The Hand",
                "hissatsu_2_desc": "An even more powerful goalkeeping technique",
                "hissatsu_3": "Fist of Justice",
                "hissatsu_3_desc": "A punch that clears the ball with justice"
            },
            {
                "name": "Jude Sharp",
                "nickname": "Strategist",
                "title": "Playmaker",
                "level": 95,
                "rarity": "Legendary",
                "position": "MF",
                "element": "Wind",
                "jersey_number": 8,
                "description": "Brilliant strategist and playmaker",
                "kick": 80,
                "control": 95,
                "technique": 90,
                "intelligence": 98,
                "pressure": 85,
                "agility": 80,
                "physical": 75,
                "hissatsu_1": "Illusion Ball",
                "hissatsu_1_desc": "Creates illusions of the ball",
                "hissatsu_2": "Emperor Penguin",
                "hissatsu_2_desc": "A powerful shot with penguin spirits",
                "hissatsu_3": "Prime Legend",
                "hissatsu_3_desc": "A legendary passing technique"
            }
        ])
        
        # Save to BytesIO
        excel_buffer = io.BytesIO()
        df.to_excel(excel_buffer, index=False)
        excel_buffer.seek(0)
        
        # Upload the Excel file
        files = {'file': ('characters.xlsx', excel_buffer, 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')}
        response = requests.post(f"{API_URL}/characters/import-excel", files=files)
        
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIn("imported_count", data)
        self.assertGreaterEqual(data["imported_count"], 1)
        print(f"✅ Imported {data['imported_count']} characters from Excel")
    
    # Teams API Tests
    
    def test_09_get_formations(self):
        """Test getting formations"""
        response = requests.get(f"{API_URL}/teams/formations/")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIsInstance(data, list)
        self.assertGreater(len(data), 0)
        
        # Store formation ID for team creation
        self.formation_id = data[0]["id"]
        print(f"✅ GET /teams/formations/ returned {len(data)} formations")
    
    def test_10_get_tactics(self):
        """Test getting tactics"""
        response = requests.get(f"{API_URL}/teams/tactics/")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIsInstance(data, list)
        self.assertGreater(len(data), 0)
        
        # Store tactic IDs for team creation
        self.tactic_ids = [tactic["id"] for tactic in data[:2]]
        print(f"✅ GET /teams/tactics/ returned {len(data)} tactics")
    
    def test_11_get_coaches(self):
        """Test getting coaches"""
        response = requests.get(f"{API_URL}/teams/coaches/")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIsInstance(data, list)
        self.assertGreater(len(data), 0)
        
        # Store coach ID for team creation
        self.coach_id = data[0]["id"]
        print(f"✅ GET /teams/coaches/ returned {len(data)} coaches")
    
    def test_12_create_team(self):
        """Test creating a team"""
        if not hasattr(self, 'formation_id') or not hasattr(self, 'tactic_ids') or not hasattr(self, 'coach_id'):
            self.skipTest("Missing formation, tactics, or coach data")
        
        # Update sample team with real IDs
        self.sample_team["formation_id"] = self.formation_id
        self.sample_team["tactics"] = self.tactic_ids
        self.sample_team["coach_id"] = self.coach_id
        
        # Add player if we have a character
        if hasattr(self, 'character_id'):
            self.sample_team["players"] = [
                {
                    "character_id": self.character_id,
                    "position_id": "lf",  # Left forward position from formation
                    "user_level": 99,
                    "user_rarity": "Legendary"
                }
            ]
        
        response = requests.post(f"{API_URL}/teams/", json=self.sample_team)
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIn("id", data)
        self.assertEqual(data["name"], self.sample_team["name"])
        
        # Store team ID for later tests
        self.created_resources["teams"].append(data["id"])
        self.team_id = data["id"]
        print(f"✅ Created team with ID: {self.team_id}")
    
    def test_13_get_teams(self):
        """Test getting teams"""
        response = requests.get(f"{API_URL}/teams/")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIsInstance(data, list)
        print(f"✅ GET /teams/ returned {len(data)} teams")
    
    def test_14_get_team_by_id(self):
        """Test getting a specific team by ID"""
        if not hasattr(self, 'team_id'):
            self.skipTest("No team created yet")
        
        response = requests.get(f"{API_URL}/teams/{self.team_id}")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data["id"], self.team_id)
        self.assertEqual(data["name"], self.sample_team["name"])
        print(f"✅ GET /teams/{self.team_id} working")
    
    # Equipment API Tests
    
    def test_15_get_equipment(self):
        """Test getting equipment"""
        response = requests.get(f"{API_URL}/equipment/")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIsInstance(data, list)
        self.assertGreater(len(data), 0)
        print(f"✅ GET /equipment/ returned {len(data)} equipment items")
    
    def test_16_get_equipment_by_category(self):
        """Test getting equipment by category"""
        response = requests.get(f"{API_URL}/equipment/category/Boots")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIsInstance(data, list)
        if data:
            self.assertEqual(data[0]["category"], "Boots")
        print(f"✅ GET /equipment/category/Boots returned {len(data)} items")
    
    def test_17_create_equipment(self):
        """Test creating equipment"""
        response = requests.post(f"{API_URL}/equipment/", json=self.sample_equipment)
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIn("id", data)
        self.assertEqual(data["name"], self.sample_equipment["name"])
        self.assertEqual(data["category"], self.sample_equipment["category"])
        
        # Store equipment ID for later tests
        self.created_resources["equipment"].append(data["id"])
        self.equipment_id = data["id"]
        print(f"✅ Created equipment with ID: {self.equipment_id}")
    
    def test_18_get_equipment_by_id(self):
        """Test getting a specific equipment by ID"""
        if not hasattr(self, 'equipment_id'):
            self.skipTest("No equipment created yet")
        
        response = requests.get(f"{API_URL}/equipment/{self.equipment_id}")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data["id"], self.equipment_id)
        self.assertEqual(data["name"], self.sample_equipment["name"])
        print(f"✅ GET /equipment/{self.equipment_id} working")
    
    def test_19_equipment_filtering(self):
        """Test equipment filtering"""
        # Test category filter
        response = requests.get(f"{API_URL}/equipment/?category=Boots")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIsInstance(data, list)
        if data:
            self.assertEqual(data[0]["category"], "Boots")
        
        # Test rarity filter
        response = requests.get(f"{API_URL}/equipment/?rarity=Legendary")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIsInstance(data, list)
        if data:
            self.assertEqual(data[0]["rarity"], "Legendary")
        
        print("✅ Equipment filtering working")
    
    def tearDown(self):
        """Clean up created resources"""
        # We'll leave the created resources in the database for now
        # In a real test environment, we might want to delete them
        pass

if __name__ == "__main__":
    # Run the tests
    unittest.main(argv=['first-arg-is-ignored'], exit=False)