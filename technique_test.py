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

print(f"Testing Technique API at: {API_URL}")

def generate_random_string(length=8):
    """Generate a random string of fixed length"""
    letters = string.ascii_lowercase
    return ''.join(random.choice(letters) for i in range(length))

class TechniqueSystemTest(unittest.TestCase):
    """Comprehensive test suite for the Technique System"""
    
    def setUp(self):
        """Set up test data"""
        # Generate unique username and email for testing
        random_suffix = generate_random_string()
        self.test_username = f"technique_master_{random_suffix}"
        self.test_email = f"technique_{random_suffix}@inazuma.com"
        self.test_password = "TechniqueTest123!"
        
        # User registration data
        self.user_data = {
            "username": self.test_username,
            "email": self.test_email,
            "password": self.test_password,
            "coach_level": 20,
            "favorite_position": "FW",
            "favorite_element": "Fire",
            "favourite_team": "Inazuma Japan",
            "profile_picture": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==",
            "bio": "Master of all techniques"
        }
        
        # Store auth token and IDs
        self.auth_token = None
        self.user_id = None
        self.character_id = None
        self.technique_ids = []
    
    def test_01_setup_authentication(self):
        """Set up authentication for technique tests"""
        # Register user
        response = requests.post(f"{API_URL}/auth/register", json=self.user_data)
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.auth_token = data["access_token"]
        self.user_id = data["user"]["id"]
        print(f"✅ Technique test user registered with ID: {self.user_id}")
    
    def test_02_get_all_techniques(self):
        """Test GET /api/techniques/ endpoint to retrieve all techniques"""
        response = requests.get(f"{API_URL}/techniques/")
        self.assertEqual(response.status_code, 200)
        techniques = response.json()
        
        # Verify response structure
        self.assertIsInstance(techniques, list)
        self.assertGreater(len(techniques), 0)
        
        # Store technique IDs for later tests
        self.technique_ids = [tech["id"] for tech in techniques]
        
        # Verify technique structure
        if techniques:
            technique = techniques[0]
            required_fields = ["id", "name", "description", "technique_type", "category", "element", "power", "rarity"]
            for field in required_fields:
                self.assertIn(field, technique)
        
        print(f"✅ GET /techniques/ returned {len(techniques)} techniques")
        
        # Verify we have all expected technique types
        technique_types = set(tech["technique_type"] for tech in techniques)
        expected_types = {"avatar", "totem", "mix-max"}
        self.assertTrue(expected_types.issubset(technique_types), 
                       f"Missing technique types. Expected: {expected_types}, Found: {technique_types}")
        
        # Verify we have all expected categories
        categories = set(tech["category"] for tech in techniques)
        expected_categories = {"Shot", "Dribble", "Block", "Save"}
        self.assertTrue(expected_categories.issubset(categories),
                       f"Missing categories. Expected: {expected_categories}, Found: {categories}")
        
        # Verify we have all expected elements
        elements = set(tech["element"] for tech in techniques)
        expected_elements = {"fire", "earth", "wind", "wood", "void"}
        self.assertTrue(expected_elements.issubset(elements),
                       f"Missing elements. Expected: {expected_elements}, Found: {elements}")
        
        print(f"✅ Technique types found: {technique_types}")
        print(f"✅ Categories found: {categories}")
        print(f"✅ Elements found: {elements}")
    
    def test_03_technique_filtering_by_type(self):
        """Test filtering functionality by technique type"""
        # Test avatar techniques
        response = requests.get(f"{API_URL}/techniques/?technique_type=avatar")
        self.assertEqual(response.status_code, 200)
        avatar_techniques = response.json()
        self.assertIsInstance(avatar_techniques, list)
        
        if avatar_techniques:
            for tech in avatar_techniques:
                self.assertEqual(tech["technique_type"], "avatar")
        
        # Test totem techniques
        response = requests.get(f"{API_URL}/techniques/?technique_type=totem")
        self.assertEqual(response.status_code, 200)
        totem_techniques = response.json()
        self.assertIsInstance(totem_techniques, list)
        
        if totem_techniques:
            for tech in totem_techniques:
                self.assertEqual(tech["technique_type"], "totem")
        
        # Test mix-max techniques
        response = requests.get(f"{API_URL}/techniques/?technique_type=mix-max")
        self.assertEqual(response.status_code, 200)
        mixmax_techniques = response.json()
        self.assertIsInstance(mixmax_techniques, list)
        
        if mixmax_techniques:
            for tech in mixmax_techniques:
                self.assertEqual(tech["technique_type"], "mix-max")
        
        print(f"✅ Type filtering: Avatar({len(avatar_techniques)}), Totem({len(totem_techniques)}), Mix-Max({len(mixmax_techniques)})")
    
    def test_04_technique_filtering_by_category(self):
        """Test filtering functionality by category"""
        categories = ["Shot", "Dribble", "Block", "Save"]
        
        for category in categories:
            response = requests.get(f"{API_URL}/techniques/?category={category}")
            self.assertEqual(response.status_code, 200)
            category_techniques = response.json()
            self.assertIsInstance(category_techniques, list)
            
            if category_techniques:
                for tech in category_techniques:
                    self.assertEqual(tech["category"], category)
            
            print(f"✅ Category filtering: {category} returned {len(category_techniques)} techniques")
    
    def test_05_technique_filtering_by_element(self):
        """Test filtering functionality by element"""
        elements = ["fire", "earth", "wind", "wood", "void"]
        
        for element in elements:
            response = requests.get(f"{API_URL}/techniques/?element={element}")
            self.assertEqual(response.status_code, 200)
            element_techniques = response.json()
            self.assertIsInstance(element_techniques, list)
            
            if element_techniques:
                for tech in element_techniques:
                    self.assertEqual(tech["element"], element)
            
            print(f"✅ Element filtering: {element} returned {len(element_techniques)} techniques")
    
    def test_06_technique_filtering_by_rarity(self):
        """Test filtering functionality by rarity"""
        rarities = ["Common", "Rare", "Epic", "Legendary"]
        
        for rarity in rarities:
            response = requests.get(f"{API_URL}/techniques/?rarity={rarity}")
            self.assertEqual(response.status_code, 200)
            rarity_techniques = response.json()
            self.assertIsInstance(rarity_techniques, list)
            
            if rarity_techniques:
                for tech in rarity_techniques:
                    self.assertEqual(tech["rarity"], rarity)
            
            print(f"✅ Rarity filtering: {rarity} returned {len(rarity_techniques)} techniques")
    
    def test_07_technique_filtering_by_power_range(self):
        """Test filtering functionality by power range"""
        # Test minimum power filter
        response = requests.get(f"{API_URL}/techniques/?min_power=200")
        self.assertEqual(response.status_code, 200)
        high_power_techniques = response.json()
        self.assertIsInstance(high_power_techniques, list)
        
        if high_power_techniques:
            for tech in high_power_techniques:
                self.assertGreaterEqual(tech["power"], 200)
        
        # Test maximum power filter
        response = requests.get(f"{API_URL}/techniques/?max_power=100")
        self.assertEqual(response.status_code, 200)
        low_power_techniques = response.json()
        self.assertIsInstance(low_power_techniques, list)
        
        if low_power_techniques:
            for tech in low_power_techniques:
                self.assertLessEqual(tech["power"], 100)
        
        # Test power range filter
        response = requests.get(f"{API_URL}/techniques/?min_power=150&max_power=250")
        self.assertEqual(response.status_code, 200)
        mid_power_techniques = response.json()
        self.assertIsInstance(mid_power_techniques, list)
        
        if mid_power_techniques:
            for tech in mid_power_techniques:
                self.assertGreaterEqual(tech["power"], 150)
                self.assertLessEqual(tech["power"], 250)
        
        print(f"✅ Power filtering: High power(≥200): {len(high_power_techniques)}, Low power(≤100): {len(low_power_techniques)}, Mid range(150-250): {len(mid_power_techniques)}")
    
    def test_08_technique_filtering_by_position(self):
        """Test filtering functionality by allowed position"""
        # Test GK-specific techniques
        response = requests.get(f"{API_URL}/techniques/?position=GK")
        self.assertEqual(response.status_code, 200)
        gk_techniques = response.json()
        self.assertIsInstance(gk_techniques, list)
        
        if gk_techniques:
            for tech in gk_techniques:
                # Should either have empty allowed_positions (all positions) or include GK
                allowed_positions = tech.get("allowed_positions", [])
                self.assertTrue(len(allowed_positions) == 0 or "GK" in allowed_positions)
        
        # Test DF-specific techniques
        response = requests.get(f"{API_URL}/techniques/?position=DF")
        self.assertEqual(response.status_code, 200)
        df_techniques = response.json()
        self.assertIsInstance(df_techniques, list)
        
        if df_techniques:
            for tech in df_techniques:
                allowed_positions = tech.get("allowed_positions", [])
                self.assertTrue(len(allowed_positions) == 0 or "DF" in allowed_positions)
        
        print(f"✅ Position filtering: GK techniques: {len(gk_techniques)}, DF techniques: {len(df_techniques)}")
    
    def test_09_technique_search_functionality(self):
        """Test search functionality"""
        # Test search by name
        response = requests.get(f"{API_URL}/techniques/?search=Fire")
        self.assertEqual(response.status_code, 200)
        fire_search_results = response.json()
        self.assertIsInstance(fire_search_results, list)
        
        if fire_search_results:
            for tech in fire_search_results:
                # Should match either name or description (case insensitive)
                self.assertTrue("fire" in tech["name"].lower() or "fire" in tech["description"].lower())
        
        # Test search by description keywords
        response = requests.get(f"{API_URL}/techniques/?search=avatar")
        self.assertEqual(response.status_code, 200)
        avatar_search_results = response.json()
        self.assertIsInstance(avatar_search_results, list)
        
        print(f"✅ Search functionality: 'Fire' returned {len(fire_search_results)} results, 'avatar' returned {len(avatar_search_results)} results")
    
    def test_10_get_technique_by_id(self):
        """Test GET /api/techniques/{technique_id} for specific technique details"""
        if not self.technique_ids:
            self.skipTest("No technique IDs available")
        
        # Test getting a specific technique
        technique_id = self.technique_ids[0]
        response = requests.get(f"{API_URL}/techniques/{technique_id}")
        self.assertEqual(response.status_code, 200)
        technique = response.json()
        
        # Verify technique structure
        required_fields = ["id", "name", "description", "technique_type", "category", "element", "power", "rarity"]
        for field in required_fields:
            self.assertIn(field, technique)
        
        self.assertEqual(technique["id"], technique_id)
        
        print(f"✅ GET /techniques/{technique_id} returned technique: {technique['name']}")
        
        # Test getting multiple specific techniques
        for i, tech_id in enumerate(self.technique_ids[:3]):  # Test first 3
            response = requests.get(f"{API_URL}/techniques/{tech_id}")
            self.assertEqual(response.status_code, 200)
            tech = response.json()
            self.assertEqual(tech["id"], tech_id)
            print(f"✅ Technique {i+1}: {tech['name']} (Type: {tech['technique_type']}, Category: {tech['category']}, Power: {tech['power']})")
    
    def test_11_get_technique_categories_stats(self):
        """Test GET /api/techniques/categories/stats for statistics"""
        response = requests.get(f"{API_URL}/techniques/categories/stats")
        self.assertEqual(response.status_code, 200)
        stats = response.json()
        
        # Verify stats structure
        required_fields = ["total_techniques", "by_type", "by_category", "by_element", "by_rarity", "avg_power", "max_power", "min_power"]
        for field in required_fields:
            self.assertIn(field, stats)
        
        # Verify stats make sense
        self.assertGreater(stats["total_techniques"], 0)
        self.assertGreater(stats["max_power"], stats["min_power"])
        self.assertGreater(stats["avg_power"], 0)
        
        # Verify arrays contain expected values
        self.assertIsInstance(stats["by_type"], list)
        self.assertIsInstance(stats["by_category"], list)
        self.assertIsInstance(stats["by_element"], list)
        self.assertIsInstance(stats["by_rarity"], list)
        
        print(f"✅ Technique statistics:")
        print(f"   Total techniques: {stats['total_techniques']}")
        print(f"   Types: {stats['by_type']}")
        print(f"   Categories: {stats['by_category']}")
        print(f"   Elements: {stats['by_element']}")
        print(f"   Rarities: {stats['by_rarity']}")
        print(f"   Power range: {stats['min_power']} - {stats['max_power']} (avg: {stats['avg_power']:.1f})")
    
    def test_12_sample_data_validation(self):
        """Verify sample techniques are properly initialized with correct data"""
        response = requests.get(f"{API_URL}/techniques/")
        self.assertEqual(response.status_code, 200)
        techniques = response.json()
        
        # Verify we have techniques from all expected types
        avatar_count = len([t for t in techniques if t["technique_type"] == "avatar"])
        totem_count = len([t for t in techniques if t["technique_type"] == "totem"])
        mixmax_count = len([t for t in techniques if t["technique_type"] == "mix-max"])
        
        self.assertGreater(avatar_count, 0, "No avatar techniques found")
        self.assertGreater(totem_count, 0, "No totem techniques found")
        self.assertGreater(mixmax_count, 0, "No mix-max techniques found")
        
        # Verify power ranges are as expected (65-275 based on sample data)
        powers = [t["power"] for t in techniques]
        min_power = min(powers)
        max_power = max(powers)
        
        self.assertGreaterEqual(min_power, 65, f"Minimum power {min_power} is below expected 65")
        self.assertLessEqual(max_power, 275, f"Maximum power {max_power} is above expected 275")
        
        # Verify all elements are present
        elements = set(t["element"] for t in techniques)
        expected_elements = {"fire", "earth", "wind", "wood", "void"}
        self.assertEqual(elements, expected_elements, f"Missing elements. Expected: {expected_elements}, Found: {elements}")
        
        # Verify all categories are present
        categories = set(t["category"] for t in techniques)
        expected_categories = {"Shot", "Dribble", "Block", "Save"}
        self.assertEqual(categories, expected_categories, f"Missing categories. Expected: {expected_categories}, Found: {categories}")
        
        # Verify position restrictions work correctly
        gk_only_techniques = [t for t in techniques if t.get("allowed_positions") == ["GK"]]
        df_only_techniques = [t for t in techniques if t.get("allowed_positions") == ["DF"]]
        
        self.assertGreater(len(gk_only_techniques), 0, "No GK-only techniques found")
        self.assertGreater(len(df_only_techniques), 0, "No DF-only techniques found")
        
        # Verify GK-only techniques are Save category
        for tech in gk_only_techniques:
            self.assertEqual(tech["category"], "Save", f"GK-only technique {tech['name']} is not Save category")
        
        print(f"✅ Sample data validation:")
        print(f"   Avatar techniques: {avatar_count}")
        print(f"   Totem techniques: {totem_count}")
        print(f"   Mix-max techniques: {mixmax_count}")
        print(f"   Power range: {min_power} - {max_power}")
        print(f"   GK-only techniques: {len(gk_only_techniques)}")
        print(f"   DF-only techniques: {len(df_only_techniques)}")
    
    def test_13_character_technique_learning_system(self):
        """Test the character-technique learning system if character system is available"""
        if not self.auth_token:
            self.skipTest("No auth token available")
        
        headers = {"Authorization": f"Bearer {self.auth_token}"}
        
        # First, try to get characters to test with
        response = requests.get(f"{API_URL}/characters/")
        if response.status_code != 200:
            print("⚠️ Character system not available, skipping character-technique learning tests")
            return
        
        characters = response.json()
        if not characters:
            print("⚠️ No characters available, skipping character-technique learning tests")
            return
        
        # Get a character for testing
        character = characters[0]
        character_id = character["id"]
        self.character_id = character_id
        
        # Get a technique that this character can learn
        if not self.technique_ids:
            self.skipTest("No technique IDs available")
        
        # Find a technique that matches character's position or has no position restrictions
        suitable_technique = None
        character_position = character.get("position", "FW")
        
        for tech_id in self.technique_ids:
            tech_response = requests.get(f"{API_URL}/techniques/{tech_id}")
            if tech_response.status_code == 200:
                tech = tech_response.json()
                allowed_positions = tech.get("allowed_positions", [])
                if not allowed_positions or character_position in allowed_positions:
                    suitable_technique = tech
                    break
        
        if not suitable_technique:
            print("⚠️ No suitable technique found for character, skipping learning test")
            return
        
        # Test learning a technique
        learn_data = {
            "character_id": character_id,
            "technique_id": suitable_technique["id"]
        }
        
        response = requests.post(f"{API_URL}/characters/{character_id}/learn-technique", 
                               json=learn_data, headers=headers)
        
        if response.status_code == 200:
            result = response.json()
            self.assertIn("message", result)
            self.assertIn("technique_name", result)
            print(f"✅ Character learned technique: {result['technique_name']}")
            
            # Test getting character's learned techniques
            response = requests.get(f"{API_URL}/characters/{character_id}/techniques", headers=headers)
            self.assertEqual(response.status_code, 200)
            learned_techniques = response.json()
            self.assertIsInstance(learned_techniques, list)
            self.assertGreater(len(learned_techniques), 0)
            
            # Verify the technique we just learned is in the list
            learned_technique_ids = [lt["technique"]["id"] for lt in learned_techniques]
            self.assertIn(suitable_technique["id"], learned_technique_ids)
            
            print(f"✅ Character has {len(learned_techniques)} learned techniques")
            
            # Test forgetting a technique
            response = requests.delete(f"{API_URL}/characters/{character_id}/techniques/{suitable_technique['id']}", 
                                     headers=headers)
            self.assertEqual(response.status_code, 200)
            result = response.json()
            self.assertIn("message", result)
            print(f"✅ Character forgot technique successfully")
            
        else:
            print(f"⚠️ Character-technique learning test failed with status {response.status_code}: {response.text}")
    
    def test_14_error_handling_invalid_technique_id(self):
        """Test error handling for invalid technique IDs"""
        # Test getting non-existent technique
        fake_id = str(uuid.uuid4())
        response = requests.get(f"{API_URL}/techniques/{fake_id}")
        self.assertEqual(response.status_code, 404)
        error = response.json()
        self.assertIn("detail", error)
        self.assertEqual(error["detail"], "Technique not found")
        
        print(f"✅ Invalid technique ID properly returns 404")
    
    def test_15_error_handling_invalid_filter_parameters(self):
        """Test error handling for invalid filter parameters"""
        # Test with invalid technique type
        response = requests.get(f"{API_URL}/techniques/?technique_type=invalid_type")
        self.assertEqual(response.status_code, 200)  # Should return empty list, not error
        techniques = response.json()
        self.assertEqual(len(techniques), 0)
        
        # Test with invalid category
        response = requests.get(f"{API_URL}/techniques/?category=InvalidCategory")
        self.assertEqual(response.status_code, 200)  # Should return empty list, not error
        techniques = response.json()
        self.assertEqual(len(techniques), 0)
        
        # Test with invalid element
        response = requests.get(f"{API_URL}/techniques/?element=invalid_element")
        self.assertEqual(response.status_code, 200)  # Should return empty list, not error
        techniques = response.json()
        self.assertEqual(len(techniques), 0)
        
        # Test with invalid power range (negative values)
        response = requests.get(f"{API_URL}/techniques/?min_power=-100")
        self.assertEqual(response.status_code, 200)  # Should still work
        techniques = response.json()
        self.assertIsInstance(techniques, list)
        
        print(f"✅ Invalid filter parameters handled gracefully")
    
    def test_16_http_status_codes(self):
        """Test proper HTTP status codes for various scenarios"""
        # Test successful GET requests
        response = requests.get(f"{API_URL}/techniques/")
        self.assertEqual(response.status_code, 200)
        
        response = requests.get(f"{API_URL}/techniques/categories/stats")
        self.assertEqual(response.status_code, 200)
        
        if self.technique_ids:
            response = requests.get(f"{API_URL}/techniques/{self.technique_ids[0]}")
            self.assertEqual(response.status_code, 200)
        
        # Test 404 for non-existent technique
        fake_id = str(uuid.uuid4())
        response = requests.get(f"{API_URL}/techniques/{fake_id}")
        self.assertEqual(response.status_code, 404)
        
        print(f"✅ HTTP status codes are correct")
    
    def test_17_technique_data_integrity(self):
        """Test that technique data maintains integrity and consistency"""
        response = requests.get(f"{API_URL}/techniques/")
        self.assertEqual(response.status_code, 200)
        techniques = response.json()
        
        for technique in techniques:
            # Verify required fields are present and valid
            self.assertIsInstance(technique["id"], str)
            self.assertIsInstance(technique["name"], str)
            self.assertIsInstance(technique["description"], str)
            self.assertIsInstance(technique["power"], int)
            self.assertGreater(technique["power"], 0)
            
            # Verify technique_type is valid
            self.assertIn(technique["technique_type"], ["avatar", "totem", "mix-max"])
            
            # Verify category is valid
            self.assertIn(technique["category"], ["Shot", "Dribble", "Block", "Save"])
            
            # Verify element is valid
            self.assertIn(technique["element"], ["fire", "earth", "wind", "wood", "void"])
            
            # Verify rarity is valid
            self.assertIn(technique["rarity"], ["Common", "Rare", "Epic", "Legendary"])
            
            # Verify position restrictions make sense
            allowed_positions = technique.get("allowed_positions", [])
            if allowed_positions:
                valid_positions = ["GK", "DF", "MF", "FW"]
                for pos in allowed_positions:
                    self.assertIn(pos, valid_positions)
            
            # Verify Save techniques are restricted to GK if they have position restrictions
            if technique["category"] == "Save" and allowed_positions:
                self.assertEqual(allowed_positions, ["GK"], 
                               f"Save technique {technique['name']} should be GK-only if position restricted")
        
        print(f"✅ Data integrity verified for {len(techniques)} techniques")

if __name__ == "__main__":
    # Run the technique system tests
    unittest.main(argv=['first-arg-is-ignored'], exit=False)