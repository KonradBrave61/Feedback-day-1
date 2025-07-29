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

print(f"Testing Constellation API at: {API_URL}")

def generate_random_string(length=8):
    """Generate a random string of fixed length"""
    letters = string.ascii_lowercase
    return ''.join(random.choice(letters) for i in range(length))

class ConstellationAPITest(unittest.TestCase):
    """Test suite for Constellation/Gacha System API"""
    
    def setUp(self):
        """Set up test data"""
        # Generate unique username and email for testing
        random_suffix = generate_random_string()
        self.test_username = f"gachauser_{random_suffix}"
        self.test_email = f"gacha_{random_suffix}@example.com"
        self.test_password = "Password123!"
        
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
            "bio": "Gacha enthusiast and constellation explorer"
        }
        
        # Store auth token and user info
        self.auth_token = None
        self.user_id = None
        self.constellation_id = None
        self.initial_kizuna_stars = 50
    
    def test_01_register_user_for_gacha(self):
        """Test user registration for gacha testing"""
        response = requests.post(f"{API_URL}/auth/register", json=self.user_data)
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIn("access_token", data)
        self.assertIn("user", data)
        self.assertEqual(data["user"]["username"], self.test_username)
        self.assertEqual(data["user"]["kizuna_stars"], self.initial_kizuna_stars)
        
        # Store token for subsequent tests
        self.auth_token = data["access_token"]
        self.user_id = data["user"]["id"]
        print(f"✅ User registered with {self.initial_kizuna_stars} Kizuna Stars")
    
    def test_02_get_all_constellations(self):
        """Test GET /api/constellations/ to list all constellations"""
        response = requests.get(f"{API_URL}/constellations/")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIsInstance(data, list)
        self.assertGreater(len(data), 0, "Should have sample constellations initialized")
        
        # Check constellation structure
        constellation = data[0]
        self.assertIn("id", constellation)
        self.assertIn("name", constellation)
        self.assertIn("element", constellation)
        self.assertIn("description", constellation)
        self.assertIn("orbs", constellation)
        self.assertIn("character_pool", constellation)
        self.assertIn("base_drop_rates", constellation)
        self.assertIn("background_color", constellation)
        self.assertIn("orb_color", constellation)
        self.assertIn("connections", constellation)
        
        # Store constellation ID for later tests
        self.constellation_id = constellation["id"]
        print(f"✅ Found {len(data)} constellations, using {constellation['name']} for testing")
    
    def test_03_get_specific_constellation(self):
        """Test GET /api/constellations/{id} to get specific constellation details"""
        if not self.constellation_id:
            self.skipTest("No constellation ID available")
        
        response = requests.get(f"{API_URL}/constellations/{self.constellation_id}")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        
        # Verify constellation details
        self.assertEqual(data["id"], self.constellation_id)
        self.assertIn("name", data)
        self.assertIn("element", data)
        self.assertIn("orbs", data)
        self.assertIsInstance(data["orbs"], list)
        self.assertGreater(len(data["orbs"]), 0, "Constellation should have orbs")
        
        # Check orb structure
        orb = data["orbs"][0]
        self.assertIn("id", orb)
        self.assertIn("x", orb)
        self.assertIn("y", orb)
        self.assertIn("z", orb)
        self.assertIn("is_active", orb)
        self.assertIn("glow_intensity", orb)
        
        # Check character pool structure
        pool = data["character_pool"]
        self.assertIn("legendary", pool)
        self.assertIn("epic", pool)
        self.assertIn("rare", pool)
        self.assertIn("normal", pool)
        
        # Check drop rates structure
        rates = data["base_drop_rates"]
        self.assertIn("legendary", rates)
        self.assertIn("epic", rates)
        self.assertIn("rare", rates)
        self.assertIn("normal", rates)
        
        print(f"✅ Constellation {data['name']} details retrieved successfully")
    
    def test_04_get_constellation_characters(self):
        """Test GET /api/constellations/{id}/characters to get character pools"""
        if not self.constellation_id:
            self.skipTest("No constellation ID available")
        
        response = requests.get(f"{API_URL}/constellations/{self.constellation_id}/characters")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        
        # Check response structure
        self.assertIn("legendary", data)
        self.assertIn("epic", data)
        self.assertIn("rare", data)
        self.assertIn("normal", data)
        
        # All should be lists
        self.assertIsInstance(data["legendary"], list)
        self.assertIsInstance(data["epic"], list)
        self.assertIsInstance(data["rare"], list)
        self.assertIsInstance(data["normal"], list)
        
        # Count total characters available
        total_chars = len(data["legendary"]) + len(data["epic"]) + len(data["rare"]) + len(data["normal"])
        print(f"✅ Character pool: {len(data['legendary'])} legendary, {len(data['epic'])} epic, {len(data['rare'])} rare, {len(data['normal'])} normal (Total: {total_chars})")
        
        # Verify character structure if any characters exist
        for rarity, chars in data.items():
            if chars:
                char = chars[0]
                self.assertIn("id", char)
                self.assertIn("name", char)
                self.assertIn("base_rarity", char)
                break
    
    def test_05_get_drop_rates_no_bonuses(self):
        """Test GET /api/constellations/{id}/drop-rates with no platform bonuses"""
        if not self.constellation_id:
            self.skipTest("No constellation ID available")
        
        response = requests.get(f"{API_URL}/constellations/{self.constellation_id}/drop-rates")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        
        # Check response structure
        self.assertIn("base_rates", data)
        self.assertIn("final_rates", data)
        self.assertIn("platform_bonuses", data)
        
        # Check base rates
        base_rates = data["base_rates"]
        self.assertIn("legendary", base_rates)
        self.assertIn("epic", base_rates)
        self.assertIn("rare", base_rates)
        self.assertIn("normal", base_rates)
        
        # Check final rates (should be same as base with no bonuses)
        final_rates = data["final_rates"]
        self.assertEqual(base_rates["legendary"], final_rates["legendary"])
        self.assertEqual(base_rates["epic"], final_rates["epic"])
        self.assertEqual(base_rates["rare"], final_rates["rare"])
        self.assertEqual(base_rates["normal"], final_rates["normal"])
        
        # Check platform bonuses (should all be false)
        bonuses = data["platform_bonuses"]
        self.assertFalse(bonuses["nintendo"])
        self.assertFalse(bonuses["playstation"])
        self.assertFalse(bonuses["pc"])
        
        print(f"✅ Base drop rates: {base_rates['legendary']}% legendary, {base_rates['epic']}% epic, {base_rates['rare']}% rare, {base_rates['normal']}% normal")
    
    def test_06_get_drop_rates_with_bonuses(self):
        """Test GET /api/constellations/{id}/drop-rates with platform bonuses"""
        if not self.constellation_id:
            self.skipTest("No constellation ID available")
        
        # Test with all platform bonuses active (111)
        response = requests.get(f"{API_URL}/constellations/{self.constellation_id}/drop-rates?platform_bonuses=111")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        
        base_rates = data["base_rates"]
        final_rates = data["final_rates"]
        bonuses = data["platform_bonuses"]
        
        # Check that bonuses are applied
        self.assertTrue(bonuses["nintendo"])
        self.assertTrue(bonuses["playstation"])
        self.assertTrue(bonuses["pc"])
        
        # Check that legendary rate increased (3 bonuses * 0.2% = 0.6% increase)
        expected_legendary_increase = 0.6
        self.assertAlmostEqual(final_rates["legendary"], base_rates["legendary"] + expected_legendary_increase, places=1)
        
        # Check that normal rate decreased to compensate
        self.assertAlmostEqual(final_rates["normal"], base_rates["normal"] - expected_legendary_increase, places=1)
        
        print(f"✅ With platform bonuses: {final_rates['legendary']}% legendary (increased by {expected_legendary_increase}%)")
        
        # Test with partial bonuses (110 - Nintendo + PlayStation only)
        response = requests.get(f"{API_URL}/constellations/{self.constellation_id}/drop-rates?platform_bonuses=110")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        
        bonuses = data["platform_bonuses"]
        final_rates = data["final_rates"]
        
        self.assertTrue(bonuses["nintendo"])
        self.assertTrue(bonuses["playstation"])
        self.assertFalse(bonuses["pc"])
        
        # Should have 0.4% increase (2 bonuses * 0.2%)
        expected_increase = 0.4
        self.assertAlmostEqual(final_rates["legendary"], base_rates["legendary"] + expected_increase, places=1)
        
        print(f"✅ With partial bonuses: {final_rates['legendary']}% legendary (increased by {expected_increase}%)")
    
    def test_07_gacha_pull_insufficient_stars(self):
        """Test gacha pull with insufficient Kizuna Stars"""
        if not self.auth_token or not self.constellation_id:
            self.skipTest("No auth token or constellation ID available")
        
        headers = {"Authorization": f"Bearer {self.auth_token}"}
        
        # Try to pull more than user can afford (user has 50 stars, try 11 pulls = 55 stars)
        pull_data = {
            "constellation_id": self.constellation_id,
            "pull_count": 11,
            "platform_bonuses": {
                "nintendo": False,
                "playstation": False,
                "pc": False
            }
        }
        
        response = requests.post(f"{API_URL}/constellations/pull", json=pull_data, headers=headers)
        self.assertEqual(response.status_code, 400)
        data = response.json()
        self.assertIn("detail", data)
        self.assertIn("Insufficient Kizuna Stars", data["detail"])
        
        print("✅ Insufficient Kizuna Stars properly rejected")
    
    def test_08_gacha_single_pull(self):
        """Test single gacha pull"""
        if not self.auth_token or not self.constellation_id:
            self.skipTest("No auth token or constellation ID available")
        
        headers = {"Authorization": f"Bearer {self.auth_token}"}
        
        # Get current user's Kizuna Stars
        user_response = requests.get(f"{API_URL}/auth/me", headers=headers)
        current_stars = user_response.json()["kizuna_stars"]
        
        # Perform single pull
        pull_data = {
            "constellation_id": self.constellation_id,
            "pull_count": 1,
            "platform_bonuses": {
                "nintendo": False,
                "playstation": False,
                "pc": False
            }
        }
        
        response = requests.post(f"{API_URL}/constellations/pull", json=pull_data, headers=headers)
        self.assertEqual(response.status_code, 200)
        data = response.json()
        
        # Check response structure
        self.assertIn("success", data)
        self.assertIn("characters_obtained", data)
        self.assertIn("kizuna_stars_spent", data)
        self.assertIn("kizuna_stars_remaining", data)
        self.assertIn("platform_bonuses_applied", data)
        self.assertIn("pull_details", data)
        
        # Verify pull results
        self.assertTrue(data["success"])
        self.assertEqual(data["kizuna_stars_spent"], 5)  # 5 stars per pull
        self.assertEqual(data["kizuna_stars_remaining"], current_stars - 5)
        self.assertEqual(len(data["characters_obtained"]), 1)
        self.assertEqual(len(data["pull_details"]), 1)
        
        # Check character obtained
        character = data["characters_obtained"][0]
        self.assertIn("id", character)
        self.assertIn("name", character)
        self.assertIn("base_rarity", character)
        
        # Check pull details
        pull_detail = data["pull_details"][0]
        self.assertIn("user_id", pull_detail)
        self.assertIn("constellation_id", pull_detail)
        self.assertIn("character_id", pull_detail)
        self.assertIn("character_rarity", pull_detail)
        self.assertEqual(pull_detail["kizuna_stars_spent"], 5)
        
        print(f"✅ Single pull successful: Got {character['name']} ({pull_detail['character_rarity']}), {data['kizuna_stars_remaining']} stars remaining")
    
    def test_09_gacha_multi_pull(self):
        """Test multiple gacha pulls (10-pull)"""
        if not self.auth_token or not self.constellation_id:
            self.skipTest("No auth token or constellation ID available")
        
        headers = {"Authorization": f"Bearer {self.auth_token}"}
        
        # Get current user's Kizuna Stars
        user_response = requests.get(f"{API_URL}/auth/me", headers=headers)
        current_stars = user_response.json()["kizuna_stars"]
        
        # Skip if not enough stars for 10-pull
        if current_stars < 50:
            self.skipTest(f"Not enough stars for 10-pull (have {current_stars}, need 50)")
        
        # Perform 10-pull
        pull_data = {
            "constellation_id": self.constellation_id,
            "pull_count": 10,
            "platform_bonuses": {
                "nintendo": False,
                "playstation": False,
                "pc": False
            }
        }
        
        response = requests.post(f"{API_URL}/constellations/pull", json=pull_data, headers=headers)
        self.assertEqual(response.status_code, 200)
        data = response.json()
        
        # Verify pull results
        self.assertTrue(data["success"])
        self.assertEqual(data["kizuna_stars_spent"], 50)  # 10 pulls * 5 stars
        self.assertEqual(data["kizuna_stars_remaining"], current_stars - 50)
        self.assertEqual(len(data["characters_obtained"]), 10)
        self.assertEqual(len(data["pull_details"]), 10)
        
        # Count rarities obtained
        rarity_counts = {"legendary": 0, "epic": 0, "rare": 0, "normal": 0}
        for pull_detail in data["pull_details"]:
            rarity = pull_detail["character_rarity"]
            rarity_counts[rarity] += 1
        
        print(f"✅ 10-pull successful: {rarity_counts['legendary']} legendary, {rarity_counts['epic']} epic, {rarity_counts['rare']} rare, {rarity_counts['normal']} normal")
        print(f"   {data['kizuna_stars_remaining']} Kizuna Stars remaining")
    
    def test_10_gacha_pull_with_platform_bonuses(self):
        """Test gacha pull with platform bonuses affecting drop rates"""
        if not self.auth_token or not self.constellation_id:
            self.skipTest("No auth token or constellation ID available")
        
        headers = {"Authorization": f"Bearer {self.auth_token}"}
        
        # Get current user's Kizuna Stars
        user_response = requests.get(f"{API_URL}/auth/me", headers=headers)
        current_stars = user_response.json()["kizuna_stars"]
        
        # Skip if not enough stars
        if current_stars < 5:
            self.skipTest(f"Not enough stars for pull (have {current_stars}, need 5)")
        
        # Perform pull with all platform bonuses
        pull_data = {
            "constellation_id": self.constellation_id,
            "pull_count": 1,
            "platform_bonuses": {
                "nintendo": True,
                "playstation": True,
                "pc": True
            }
        }
        
        response = requests.post(f"{API_URL}/constellations/pull", json=pull_data, headers=headers)
        self.assertEqual(response.status_code, 200)
        data = response.json()
        
        # Verify platform bonuses were applied
        bonuses = data["platform_bonuses_applied"]
        self.assertTrue(bonuses["nintendo"])
        self.assertTrue(bonuses["playstation"])
        self.assertTrue(bonuses["pc"])
        
        # Check that pull was successful
        self.assertTrue(data["success"])
        self.assertEqual(len(data["characters_obtained"]), 1)
        
        character = data["characters_obtained"][0]
        pull_detail = data["pull_details"][0]
        
        print(f"✅ Pull with platform bonuses successful: Got {character['name']} ({pull_detail['character_rarity']})")
    
    def test_11_verify_user_kizuna_stars_deduction(self):
        """Test that user's Kizuna Stars are properly deducted after pulls"""
        if not self.auth_token:
            self.skipTest("No auth token available")
        
        headers = {"Authorization": f"Bearer {self.auth_token}"}
        
        # Get current user info
        response = requests.get(f"{API_URL}/auth/me", headers=headers)
        self.assertEqual(response.status_code, 200)
        data = response.json()
        
        # Verify Kizuna Stars field exists and is a number
        self.assertIn("kizuna_stars", data)
        self.assertIsInstance(data["kizuna_stars"], int)
        
        # Should be less than initial 50 if pulls were made
        current_stars = data["kizuna_stars"]
        print(f"✅ User has {current_stars} Kizuna Stars remaining (started with {self.initial_kizuna_stars})")
        
        # Verify stars were deducted if any pulls were made in previous tests
        if current_stars < self.initial_kizuna_stars:
            stars_spent = self.initial_kizuna_stars - current_stars
            pulls_made = stars_spent // 5
            print(f"   Total stars spent: {stars_spent}, Total pulls made: {pulls_made}")
    
    def test_12_constellation_not_found(self):
        """Test error handling for non-existent constellation"""
        fake_constellation_id = str(uuid.uuid4())
        
        # Test get constellation
        response = requests.get(f"{API_URL}/constellations/{fake_constellation_id}")
        self.assertEqual(response.status_code, 404)
        data = response.json()
        self.assertIn("detail", data)
        self.assertEqual(data["detail"], "Constellation not found")
        
        # Test get characters
        response = requests.get(f"{API_URL}/constellations/{fake_constellation_id}/characters")
        self.assertEqual(response.status_code, 404)
        
        # Test get drop rates
        response = requests.get(f"{API_URL}/constellations/{fake_constellation_id}/drop-rates")
        self.assertEqual(response.status_code, 404)
        
        print("✅ Non-existent constellation properly returns 404")
    
    def test_13_unauthorized_gacha_pull(self):
        """Test gacha pull without authentication"""
        if not self.constellation_id:
            self.skipTest("No constellation ID available")
        
        pull_data = {
            "constellation_id": self.constellation_id,
            "pull_count": 1,
            "platform_bonuses": {
                "nintendo": False,
                "playstation": False,
                "pc": False
            }
        }
        
        # Try to pull without auth token
        response = requests.post(f"{API_URL}/constellations/pull", json=pull_data)
        self.assertEqual(response.status_code, 403)
        
        print("✅ Unauthorized gacha pull properly rejected")
    
    def test_14_sample_data_initialization(self):
        """Test that sample constellations are properly initialized"""
        response = requests.get(f"{API_URL}/constellations/")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        
        # Should have at least the 3 sample constellations
        self.assertGreaterEqual(len(data), 3)
        
        # Check that we have the expected sample constellations
        constellation_names = [c["name"] for c in data]
        expected_names = ["Lightning Constellation", "Flame Constellation", "Wind Constellation"]
        
        for expected_name in expected_names:
            self.assertIn(expected_name, constellation_names, f"Missing sample constellation: {expected_name}")
        
        # Check that each constellation has proper structure
        for constellation in data:
            # Should have orbs with positions
            self.assertGreater(len(constellation["orbs"]), 0, f"{constellation['name']} should have orbs")
            
            # Check orb positions are valid (0-100 range)
            for orb in constellation["orbs"]:
                self.assertGreaterEqual(orb["x"], 0)
                self.assertLessEqual(orb["x"], 100)
                self.assertGreaterEqual(orb["y"], 0)
                self.assertLessEqual(orb["y"], 100)
            
            # Should have connections between orbs
            self.assertGreater(len(constellation["connections"]), 0, f"{constellation['name']} should have orb connections")
            
            # Should have character pools (may be empty if no characters in DB)
            pool = constellation["character_pool"]
            self.assertIsInstance(pool["legendary"], list)
            self.assertIsInstance(pool["epic"], list)
            self.assertIsInstance(pool["rare"], list)
            self.assertIsInstance(pool["normal"], list)
            
            # Should have proper drop rates
            rates = constellation["base_drop_rates"]
            total_rate = rates["legendary"] + rates["epic"] + rates["rare"] + rates["normal"]
            self.assertAlmostEqual(total_rate, 100.0, places=1, msg=f"{constellation['name']} drop rates should sum to 100%")
        
        print(f"✅ Sample data initialization verified: {len(data)} constellations with proper orb positions and drop rates")

if __name__ == "__main__":
    # Run the constellation tests
    unittest.main(argv=['first-arg-is-ignored'], exit=False)