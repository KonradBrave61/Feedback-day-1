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

class TeamBuilderBackendTest(unittest.TestCase):
    """Focused test suite for Team Builder backend functionality"""
    
    def setUp(self):
        """Set up test data"""
        # Generate unique username and email for testing
        random_suffix = generate_random_string()
        self.test_username = f"coach_{random_suffix}"
        self.test_email = f"coach_{random_suffix}@raimon.com"
        self.test_password = "RaimonEleven123!"
        
        # User registration data
        self.user_data = {
            "username": self.test_username,
            "email": self.test_email,
            "password": self.test_password,
            "coach_level": 15,
            "favorite_position": "FW",
            "favorite_element": "Fire",
            "favourite_team": "Raimon Eleven",
            "profile_picture": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==",
            "bio": "Passionate football coach leading Raimon to victory"
        }
        
        # Store auth token and IDs
        self.auth_token = None
        self.user_id = None
        self.team_id = None
        self.character_id = None
        self.equipment_id = None
    
    def test_01_register_and_login(self):
        """Test user registration and login"""
        # Register user
        response = requests.post(f"{API_URL}/auth/register", json=self.user_data)
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIn("access_token", data)
        self.assertIn("user", data)
        self.assertEqual(data["user"]["username"], self.test_username)
        
        # Store token and user ID
        self.auth_token = data["access_token"]
        self.user_id = data["user"]["id"]
        
        # Verify user has initial Kizuna Stars
        self.assertEqual(data["user"]["kizuna_stars"], 50)
        print(f"✅ User registered with ID: {self.user_id} and 50 Kizuna Stars")
    
    def test_02_character_api_endpoints(self):
        """Test character API endpoints functionality"""
        # Test getting all characters
        response = requests.get(f"{API_URL}/characters/")
        self.assertEqual(response.status_code, 200)
        characters = response.json()
        self.assertIsInstance(characters, list)
        print(f"✅ GET /characters/ returned {len(characters)} characters")
        
        # Test character filtering by position
        response = requests.get(f"{API_URL}/characters/?position=FW")
        self.assertEqual(response.status_code, 200)
        fw_characters = response.json()
        self.assertIsInstance(fw_characters, list)
        if fw_characters:
            self.assertEqual(fw_characters[0]["position"], "FW")
        print(f"✅ Character position filtering returned {len(fw_characters)} forwards")
        
        # Test character filtering by element
        response = requests.get(f"{API_URL}/characters/?element=Fire")
        self.assertEqual(response.status_code, 200)
        fire_characters = response.json()
        self.assertIsInstance(fire_characters, list)
        if fire_characters:
            self.assertEqual(fire_characters[0]["element"], "Fire")
        print(f"✅ Character element filtering returned {len(fire_characters)} fire characters")
        
        # Test character search
        response = requests.get(f"{API_URL}/characters/?search=Axel")
        self.assertEqual(response.status_code, 200)
        search_results = response.json()
        self.assertIsInstance(search_results, list)
        print(f"✅ Character search returned {len(search_results)} results")
        
        # Test character stats summary
        response = requests.get(f"{API_URL}/characters/stats/summary")
        self.assertEqual(response.status_code, 200)
        stats = response.json()
        self.assertIn("total_characters", stats)
        self.assertIn("by_position", stats)
        self.assertIn("by_element", stats)
        self.assertIn("by_rarity", stats)
        print(f"✅ Character stats summary: {stats['total_characters']} total characters")
        
        # Get a character for team testing
        if characters:
            self.character_id = characters[0]["id"]
            
            # Test getting specific character
            response = requests.get(f"{API_URL}/characters/{self.character_id}")
            self.assertEqual(response.status_code, 200)
            character = response.json()
            self.assertEqual(character["id"], self.character_id)
            print(f"✅ GET /characters/{self.character_id} working")
    
    def test_03_equipment_api_endpoints(self):
        """Test equipment API endpoints functionality"""
        # Test getting all equipment
        response = requests.get(f"{API_URL}/equipment/")
        self.assertEqual(response.status_code, 200)
        equipment = response.json()
        self.assertIsInstance(equipment, list)
        self.assertGreater(len(equipment), 0)
        print(f"✅ GET /equipment/ returned {len(equipment)} equipment items")
        
        # Test equipment filtering by category
        response = requests.get(f"{API_URL}/equipment/?category=Boots")
        self.assertEqual(response.status_code, 200)
        boots = response.json()
        self.assertIsInstance(boots, list)
        if boots:
            self.assertEqual(boots[0]["category"], "Boots")
        print(f"✅ Equipment category filtering returned {len(boots)} boots")
        
        # Test equipment filtering by rarity
        response = requests.get(f"{API_URL}/equipment/?rarity=Legendary")
        self.assertEqual(response.status_code, 200)
        legendary_equipment = response.json()
        self.assertIsInstance(legendary_equipment, list)
        if legendary_equipment:
            self.assertEqual(legendary_equipment[0]["rarity"], "Legendary")
        print(f"✅ Equipment rarity filtering returned {len(legendary_equipment)} legendary items")
        
        # Test getting equipment by category endpoint
        response = requests.get(f"{API_URL}/equipment/category/Boots")
        self.assertEqual(response.status_code, 200)
        boots_by_category = response.json()
        self.assertIsInstance(boots_by_category, list)
        print(f"✅ GET /equipment/category/Boots returned {len(boots_by_category)} items")
        
        # Get an equipment item for testing
        if equipment:
            self.equipment_id = equipment[0]["id"]
            
            # Test getting specific equipment
            response = requests.get(f"{API_URL}/equipment/{self.equipment_id}")
            self.assertEqual(response.status_code, 200)
            equipment_item = response.json()
            self.assertEqual(equipment_item["id"], self.equipment_id)
            print(f"✅ GET /equipment/{self.equipment_id} working")
            
            # Verify equipment has stats for bonus calculation
            self.assertIn("stats", equipment_item)
            self.assertIsInstance(equipment_item["stats"], dict)
            print(f"✅ Equipment has stats for bonus calculation: {list(equipment_item['stats'].keys())}")
    
    def test_04_team_saving_loading_with_equipment(self):
        """Test team saving/loading works correctly with equipment data"""
        if not self.auth_token:
            self.skipTest("No auth token available")
        
        headers = {"Authorization": f"Bearer {self.auth_token}"}
        
        # Create a team with equipment data
        team_data = {
            "name": f"Raimon Eleven {generate_random_string()}",
            "formation": "4-3-3",
            "players": [],
            "bench_players": [],
            "tactics": [],
            "coach": None,
            "description": "A powerful team with enhanced equipment",
            "is_public": True,
            "tags": ["test", "equipment", "raimon"]
        }
        
        # Add a player with equipment if we have both
        if self.character_id and self.equipment_id:
            team_data["players"] = [
                {
                    "character_id": self.character_id,
                    "position_id": "cf",
                    "user_level": 99,
                    "user_rarity": "Legendary",
                    "equipment": {
                        "boots": self.equipment_id,
                        "gloves": None,
                        "uniform": None,
                        "accessory": None
                    }
                }
            ]
        
        # Create team
        response = requests.post(f"{API_URL}/teams", json=team_data, headers=headers)
        self.assertEqual(response.status_code, 200)
        created_team = response.json()
        self.assertIn("id", created_team)
        self.assertEqual(created_team["name"], team_data["name"])
        self.team_id = created_team["id"]
        print(f"✅ Team created with ID: {self.team_id}")
        
        # Test loading the team
        response = requests.get(f"{API_URL}/teams/{self.team_id}", headers=headers)
        self.assertEqual(response.status_code, 200)
        loaded_team = response.json()
        self.assertEqual(loaded_team["id"], self.team_id)
        self.assertEqual(loaded_team["name"], team_data["name"])
        
        # Verify equipment data is preserved
        if team_data["players"]:
            self.assertEqual(len(loaded_team["players"]), 1)
            player = loaded_team["players"][0]
            self.assertIn("equipment", player)
            if self.equipment_id:
                self.assertEqual(player["equipment"]["boots"], self.equipment_id)
        print(f"✅ Team loaded successfully with equipment data preserved")
        
        # Test updating team with new equipment
        update_data = {
            "name": f"Updated Raimon {generate_random_string()}",
            "description": "Updated team with new equipment setup"
        }
        
        response = requests.put(f"{API_URL}/teams/{self.team_id}", json=update_data, headers=headers)
        self.assertEqual(response.status_code, 200)
        updated_team = response.json()
        self.assertEqual(updated_team["name"], update_data["name"])
        self.assertEqual(updated_team["description"], update_data["description"])
        print(f"✅ Team updated successfully")
    
    def test_05_team_stats_calculation_with_equipment_bonuses(self):
        """Test that team stats calculation would work with equipment bonuses"""
        if not self.auth_token or not self.character_id or not self.equipment_id:
            self.skipTest("Missing required data for stats calculation test")
        
        headers = {"Authorization": f"Bearer {self.auth_token}"}
        
        # Get character base stats
        response = requests.get(f"{API_URL}/characters/{self.character_id}")
        self.assertEqual(response.status_code, 200)
        character = response.json()
        base_stats = character["base_stats"]
        print(f"✅ Character base stats retrieved: {list(base_stats.keys())}")
        
        # Get equipment stats bonuses
        response = requests.get(f"{API_URL}/equipment/{self.equipment_id}")
        self.assertEqual(response.status_code, 200)
        equipment = response.json()
        equipment_stats = equipment["stats"]
        print(f"✅ Equipment stats bonuses retrieved: {equipment_stats}")
        
        # Verify we can calculate combined stats
        combined_stats = {}
        for stat_name in base_stats.keys():
            base_value = base_stats[stat_name]["main"]
            equipment_bonus = equipment_stats.get(stat_name.lower(), 0)
            combined_stats[stat_name] = base_value + equipment_bonus
        
        print(f"✅ Combined stats calculation successful:")
        for stat, value in combined_stats.items():
            base_val = base_stats[stat]["main"]
            bonus = equipment_stats.get(stat.lower(), 0)
            print(f"   {stat}: {base_val} + {bonus} = {value}")
        
        # Verify the calculation makes sense
        self.assertIsInstance(combined_stats, dict)
        self.assertGreater(len(combined_stats), 0)
        
        # Test that equipment bonuses actually increase stats
        has_bonus = any(equipment_stats.get(stat.lower(), 0) > 0 for stat in base_stats.keys())
        if has_bonus:
            print(f"✅ Equipment provides stat bonuses - team stats calculation ready")
        else:
            print(f"⚠️ Equipment has no stat bonuses, but calculation framework works")
    
    def test_06_authentication_and_user_management(self):
        """Verify all authentication and user management features still work"""
        if not self.auth_token:
            self.skipTest("No auth token available")
        
        headers = {"Authorization": f"Bearer {self.auth_token}"}
        
        # Test getting current user info
        response = requests.get(f"{API_URL}/auth/me", headers=headers)
        self.assertEqual(response.status_code, 200)
        user_data = response.json()
        self.assertEqual(user_data["username"], self.test_username)
        self.assertEqual(user_data["email"], self.test_email)
        self.assertIn("kizuna_stars", user_data)
        print(f"✅ Get current user info working")
        
        # Test updating user profile
        update_data = {
            "coach_level": 20,
            "favorite_position": "GK",
            "favorite_element": "Earth",
            "bio": "Updated bio for testing"
        }
        
        response = requests.put(f"{API_URL}/auth/me", json=update_data, headers=headers)
        self.assertEqual(response.status_code, 200)
        updated_user = response.json()
        self.assertEqual(updated_user["coach_level"], 20)
        self.assertEqual(updated_user["favorite_position"], "GK")
        self.assertEqual(updated_user["favorite_element"], "Earth")
        self.assertEqual(updated_user["bio"], "Updated bio for testing")
        print(f"✅ Update user profile working")
        
        # Test unauthorized access is properly rejected
        response = requests.get(f"{API_URL}/auth/me")
        self.assertEqual(response.status_code, 403)
        print(f"✅ Unauthorized access properly rejected")
        
        # Test invalid token is rejected
        invalid_headers = {"Authorization": "Bearer invalid_token_12345"}
        response = requests.get(f"{API_URL}/auth/me", headers=invalid_headers)
        self.assertEqual(response.status_code, 403)
        print(f"✅ Invalid token properly rejected")
    
    def test_07_constellation_and_gacha_system(self):
        """Test constellation API endpoints and gacha system"""
        if not self.auth_token:
            self.skipTest("No auth token available")
        
        headers = {"Authorization": f"Bearer {self.auth_token}"}
        
        # Test getting all constellations
        response = requests.get(f"{API_URL}/constellations/")
        self.assertEqual(response.status_code, 200)
        constellations = response.json()
        self.assertIsInstance(constellations, list)
        self.assertGreater(len(constellations), 0)
        print(f"✅ GET /constellations/ returned {len(constellations)} constellations")
        
        # Test getting specific constellation
        constellation_id = constellations[0]["id"]
        response = requests.get(f"{API_URL}/constellations/{constellation_id}")
        self.assertEqual(response.status_code, 200)
        constellation = response.json()
        self.assertEqual(constellation["id"], constellation_id)
        self.assertIn("orbs", constellation)
        self.assertIn("character_pool", constellation)
        print(f"✅ GET /constellations/{constellation_id} working")
        
        # Test getting constellation characters
        response = requests.get(f"{API_URL}/constellations/{constellation_id}/characters")
        self.assertEqual(response.status_code, 200)
        characters = response.json()
        self.assertIn("legendary", characters)
        self.assertIn("epic", characters)
        self.assertIn("rare", characters)
        self.assertIn("normal", characters)
        print(f"✅ Constellation character pools working")
        
        # Test getting drop rates with platform bonuses
        response = requests.get(f"{API_URL}/constellations/{constellation_id}/drop-rates?platform_bonuses=111")
        self.assertEqual(response.status_code, 200)
        drop_rates = response.json()
        self.assertIn("base_rates", drop_rates)
        self.assertIn("final_rates", drop_rates)
        self.assertIn("platform_bonuses", drop_rates)
        
        # Verify platform bonuses affect rates
        base_legendary = drop_rates["base_rates"]["legendary"]
        final_legendary = drop_rates["final_rates"]["legendary"]
        self.assertGreater(final_legendary, base_legendary)
        print(f"✅ Platform bonuses increase legendary rate: {base_legendary}% → {final_legendary}%")
        
        # Test gacha pull (if user has enough stars)
        current_user_response = requests.get(f"{API_URL}/auth/me", headers=headers)
        current_user = current_user_response.json()
        
        if current_user["kizuna_stars"] >= 5:
            pull_data = {
                "constellation_id": constellation_id,
                "pull_count": 1,
                "platform_bonuses": {
                    "nintendo": True,
                    "playstation": False,
                    "pc": False
                }
            }
            
            response = requests.post(f"{API_URL}/constellations/pull", json=pull_data, headers=headers)
            self.assertEqual(response.status_code, 200)
            pull_result = response.json()
            self.assertIn("success", pull_result)
            self.assertIn("characters_obtained", pull_result)
            self.assertIn("kizuna_stars_spent", pull_result)
            self.assertIn("kizuna_stars_remaining", pull_result)
            self.assertEqual(pull_result["kizuna_stars_spent"], 5)
            print(f"✅ Gacha pull successful, {len(pull_result['characters_obtained'])} character(s) obtained")
        else:
            print(f"⚠️ Insufficient Kizuna Stars for gacha pull test")
    
    def test_08_team_community_features(self):
        """Test team community features like likes, comments, views"""
        if not self.auth_token or not self.team_id:
            self.skipTest("No auth token or team available")
        
        headers = {"Authorization": f"Bearer {self.auth_token}"}
        
        # Test getting community teams
        response = requests.get(f"{API_URL}/community/teams", headers=headers)
        self.assertEqual(response.status_code, 200)
        community_teams = response.json()
        self.assertIsInstance(community_teams, list)
        print(f"✅ GET /community/teams returned {len(community_teams)} public teams")
        
        # Test team view increment
        response = requests.get(f"{API_URL}/teams/{self.team_id}/view", headers=headers)
        self.assertEqual(response.status_code, 200)
        viewed_team = response.json()
        self.assertIn("views", viewed_team)
        initial_views = viewed_team["views"]
        print(f"✅ Team view count: {initial_views}")
        
        # Test team like functionality
        response = requests.post(f"{API_URL}/teams/{self.team_id}/like", headers=headers)
        self.assertEqual(response.status_code, 200)
        like_result = response.json()
        self.assertIn("liked", like_result)
        print(f"✅ Team like functionality working: {like_result['message']}")
        
        # Test team comment functionality
        comment_data = {"content": "Great team composition! Love the formation choice."}
        response = requests.post(f"{API_URL}/teams/{self.team_id}/comment", json=comment_data, headers=headers)
        self.assertEqual(response.status_code, 200)
        comment_result = response.json()
        self.assertIn("comment", comment_result)
        self.assertEqual(comment_result["comment"]["content"], comment_data["content"])
        print(f"✅ Team comment functionality working")
        
        # Test team details with interaction status
        response = requests.get(f"{API_URL}/teams/{self.team_id}/details", headers=headers)
        self.assertEqual(response.status_code, 200)
        team_details = response.json()
        self.assertIn("team", team_details)
        self.assertIn("is_liked", team_details)
        self.assertIn("is_following", team_details)
        self.assertIn("can_rate", team_details)
        print(f"✅ Team details with interaction status working")
    
    def test_09_save_slots_management(self):
        """Test save slots management functionality"""
        if not self.auth_token or not self.team_id:
            self.skipTest("No auth token or team available")
        
        headers = {"Authorization": f"Bearer {self.auth_token}"}
        
        # Test getting save slots
        response = requests.get(f"{API_URL}/save-slots", headers=headers)
        self.assertEqual(response.status_code, 200)
        slots_data = response.json()
        self.assertIn("save_slots", slots_data)
        self.assertEqual(len(slots_data["save_slots"]), 5)
        print(f"✅ GET /save-slots returned 5 slots")
        
        # Test saving team to slot
        slot_data = {
            "slot_number": 1,
            "slot_name": "My Best Team",
            "overwrite": True
        }
        
        response = requests.post(f"{API_URL}/teams/{self.team_id}/save-to-slot", json=slot_data, headers=headers)
        self.assertEqual(response.status_code, 200)
        save_result = response.json()
        self.assertIn("message", save_result)
        print(f"✅ Team saved to slot successfully")
        
        # Verify slot is now occupied
        response = requests.get(f"{API_URL}/save-slots", headers=headers)
        slots_data = response.json()
        slot_1 = next((slot for slot in slots_data["save_slots"] if slot["slot_number"] == 1), None)
        self.assertIsNotNone(slot_1)
        self.assertTrue(slot_1["is_occupied"])
        self.assertEqual(slot_1["team_id"], self.team_id)
        print(f"✅ Save slot verification successful")

if __name__ == "__main__":
    # Run the focused tests
    unittest.main(argv=['first-arg-is-ignored'], exit=False)