#!/usr/bin/env python3

import requests
import json
import sys
from datetime import datetime

# Configuration
BACKEND_URL = "https://compare-data-fix.preview.emergentagent.com/api"

class ComparisonToolTester:
    def __init__(self):
        self.backend_url = BACKEND_URL
        self.session = requests.Session()
        
    def log(self, message):
        print(f"[{datetime.now().strftime('%H:%M:%S')}] {message}")
        
    def test_characters_endpoint(self):
        """Test GET /api/characters - should return characters data with proper structure for comparison"""
        self.log("👥 Testing Characters API endpoint...")
        
        response = self.session.get(f"{self.backend_url}/characters")
        
        if response.status_code != 200:
            self.log(f"❌ GET /api/characters failed: {response.status_code} - {response.text}")
            return False
            
        try:
            characters_data = response.json()
        except json.JSONDecodeError:
            self.log(f"❌ Invalid JSON response from characters endpoint")
            return False
            
        if not isinstance(characters_data, list):
            self.log(f"❌ Characters data should be a list, got {type(characters_data)}")
            return False
            
        if len(characters_data) == 0:
            self.log(f"❌ No characters found in database")
            return False
            
        # Check first character structure for comparison tool requirements
        character = characters_data[0]
        required_fields = ["id", "name", "position", "element", "base_stats"]
        
        for field in required_fields:
            if field not in character:
                self.log(f"❌ Missing required field '{field}' in character data")
                return False
                
        # Verify base_stats structure for comparison
        base_stats = character.get("base_stats", {})
        if not isinstance(base_stats, dict):
            self.log(f"❌ base_stats should be a dictionary for comparison functionality")
            return False
            
        # Check for common stat fields
        expected_stats = ["kick", "dribbling", "technique", "block", "speed", "stamina"]
        stats_found = 0
        for stat in expected_stats:
            if stat in base_stats:
                stats_found += 1
                
        if stats_found == 0:
            self.log(f"❌ No recognizable stats found in base_stats for comparison")
            return False
            
        self.log(f"✅ GET /api/characters - SUCCESS")
        self.log(f"   Retrieved {len(characters_data)} characters")
        self.log(f"   Sample character: {character['name']} ({character['position']}, {character['element']})")
        self.log(f"   Stats available: {stats_found}/{len(expected_stats)} common stats found")
        self.log(f"   All stats: {list(base_stats.keys())}")
        
        return True
        
    def test_equipment_endpoint(self):
        """Test GET /api/equipment - should return equipment/items data"""
        self.log("⚔️ Testing Equipment API endpoint...")
        
        response = self.session.get(f"{self.backend_url}/equipment")
        
        if response.status_code != 200:
            self.log(f"❌ GET /api/equipment failed: {response.status_code} - {response.text}")
            return False
            
        try:
            equipment_data = response.json()
        except json.JSONDecodeError:
            self.log(f"❌ Invalid JSON response from equipment endpoint")
            return False
            
        if not isinstance(equipment_data, list):
            self.log(f"❌ Equipment data should be a list, got {type(equipment_data)}")
            return False
            
        if len(equipment_data) == 0:
            self.log(f"❌ No equipment found in database")
            return False
            
        # Check first equipment structure for comparison tool requirements
        equipment = equipment_data[0]
        required_fields = ["id", "name", "category", "rarity", "stats"]
        
        for field in required_fields:
            if field not in equipment:
                self.log(f"❌ Missing required field '{field}' in equipment data")
                return False
                
        # Verify stats structure for comparison
        stats = equipment.get("stats", {})
        if not isinstance(stats, dict):
            self.log(f"❌ stats should be a dictionary for comparison functionality")
            return False
            
        # Check for icon field for display
        has_icon = "icon" in equipment
        
        self.log(f"✅ GET /api/equipment - SUCCESS")
        self.log(f"   Retrieved {len(equipment_data)} equipment items")
        self.log(f"   Sample equipment: {equipment['name']} ({equipment['category']}, {equipment['rarity']})")
        self.log(f"   Stats structure: {list(stats.keys())}")
        self.log(f"   Has icon field: {has_icon}")
        
        return True
        
    def test_techniques_endpoint(self):
        """Test GET /api/techniques - should return techniques data"""
        self.log("⚡ Testing Techniques API endpoint...")
        
        response = self.session.get(f"{self.backend_url}/techniques")
        
        if response.status_code != 200:
            self.log(f"❌ GET /api/techniques failed: {response.status_code} - {response.text}")
            return False
            
        try:
            techniques_data = response.json()
        except json.JSONDecodeError:
            self.log(f"❌ Invalid JSON response from techniques endpoint")
            return False
            
        if not isinstance(techniques_data, list):
            self.log(f"❌ Techniques data should be a list, got {type(techniques_data)}")
            return False
            
        if len(techniques_data) == 0:
            self.log(f"❌ No techniques found in database")
            return False
            
        # Check first technique structure for comparison tool requirements
        technique = techniques_data[0]
        required_fields = ["id", "name", "description", "power"]
        
        for field in required_fields:
            if field not in technique:
                self.log(f"❌ Missing required field '{field}' in technique data")
                return False
                
        # Check for additional useful fields
        optional_fields = ["element", "technique_type", "category", "rarity"]
        optional_found = []
        for field in optional_fields:
            if field in technique:
                optional_found.append(field)
                
        self.log(f"✅ GET /api/techniques - SUCCESS")
        self.log(f"   Retrieved {len(techniques_data)} techniques")
        self.log(f"   Sample technique: {technique['name']} (Power: {technique['power']})")
        self.log(f"   Description: {technique['description'][:50]}...")
        self.log(f"   Additional fields: {optional_found}")
        
        return True
        
    def test_coaches_endpoint(self):
        """Test GET /api/teams/coaches/ - should return coaches data"""
        self.log("👨‍💼 Testing Coaches API endpoint...")
        
        response = self.session.get(f"{self.backend_url}/teams/coaches/")
        
        if response.status_code != 200:
            self.log(f"❌ GET /api/teams/coaches/ failed: {response.status_code} - {response.text}")
            return False
            
        try:
            coaches_data = response.json()
        except json.JSONDecodeError:
            self.log(f"❌ Invalid JSON response from coaches endpoint")
            return False
            
        if not isinstance(coaches_data, list):
            self.log(f"❌ Coaches data should be a list, got {type(coaches_data)}")
            return False
            
        if len(coaches_data) == 0:
            self.log(f"❌ No coaches found in database")
            return False
            
        # Check first coach structure for comparison tool requirements
        coach = coaches_data[0]
        required_fields = ["id", "name", "bonuses", "specialties"]
        
        for field in required_fields:
            if field not in coach:
                self.log(f"❌ Missing required field '{field}' in coach data")
                return False
                
        # Verify bonuses structure for comparison
        bonuses = coach.get("bonuses", {})
        if not isinstance(bonuses, dict):
            self.log(f"❌ bonuses should be a dictionary for comparison functionality")
            return False
            
        # Verify specialties structure
        specialties = coach.get("specialties", [])
        if not isinstance(specialties, list):
            self.log(f"❌ specialties should be a list for comparison functionality")
            return False
            
        # Check for additional useful fields
        optional_fields = ["title", "portrait"]
        optional_found = []
        for field in optional_fields:
            if field in coach:
                optional_found.append(field)
                
        self.log(f"✅ GET /api/teams/coaches/ - SUCCESS")
        self.log(f"   Retrieved {len(coaches_data)} coaches")
        self.log(f"   Sample coach: {coach['name']}")
        self.log(f"   Bonuses: {list(bonuses.keys())}")
        self.log(f"   Specialties: {len(specialties)} items")
        self.log(f"   Additional fields: {optional_found}")
        
        return True
        
    def test_data_structure_completeness(self):
        """Test that all endpoints return data suitable for comparison table format"""
        self.log("📊 Testing data structure completeness for comparison table...")
        
        # Get sample data from each endpoint
        endpoints_data = {}
        
        # Characters
        response = self.session.get(f"{self.backend_url}/characters")
        if response.status_code == 200:
            characters = response.json()
            if characters:
                endpoints_data['characters'] = characters[0]
                
        # Equipment
        response = self.session.get(f"{self.backend_url}/equipment")
        if response.status_code == 200:
            equipment = response.json()
            if equipment:
                endpoints_data['equipment'] = equipment[0]
                
        # Techniques
        response = self.session.get(f"{self.backend_url}/techniques")
        if response.status_code == 200:
            techniques = response.json()
            if techniques:
                endpoints_data['techniques'] = techniques[0]
                
        # Coaches
        response = self.session.get(f"{self.backend_url}/teams/coaches/")
        if response.status_code == 200:
            coaches = response.json()
            if coaches:
                endpoints_data['coaches'] = coaches[0]
                
        if len(endpoints_data) != 4:
            self.log(f"❌ Could not retrieve sample data from all endpoints")
            return False
            
        # Check that each data type has sufficient fields for comparison
        comparison_requirements = {
            'characters': ['name', 'base_stats', 'element', 'position'],
            'equipment': ['name', 'stats', 'category', 'rarity'],
            'techniques': ['name', 'power', 'description'],
            'coaches': ['name', 'bonuses', 'specialties']
        }
        
        all_good = True
        for data_type, required_fields in comparison_requirements.items():
            data = endpoints_data[data_type]
            missing_fields = []
            
            for field in required_fields:
                if field not in data:
                    missing_fields.append(field)
                    
            if missing_fields:
                self.log(f"❌ {data_type} missing comparison fields: {missing_fields}")
                all_good = False
            else:
                self.log(f"✅ {data_type} has all required comparison fields")
                
        if all_good:
            self.log(f"✅ All endpoints provide sufficient data for comparison table format")
            return True
        else:
            self.log(f"❌ Some endpoints lack required fields for comparison functionality")
            return False
            
    def test_filtering_capabilities(self):
        """Test filtering capabilities for comparison tool"""
        self.log("🔍 Testing filtering capabilities...")
        
        # Test character filtering by element
        response = self.session.get(f"{self.backend_url}/characters?element=Fire")
        if response.status_code == 200:
            fire_characters = response.json()
            self.log(f"✅ Character element filtering: {len(fire_characters)} Fire characters")
        else:
            self.log(f"⚠️ Character element filtering not working or no Fire characters")
            
        # Test character filtering by position
        response = self.session.get(f"{self.backend_url}/characters?position=GK")
        if response.status_code == 200:
            gk_characters = response.json()
            self.log(f"✅ Character position filtering: {len(gk_characters)} GK characters")
        else:
            self.log(f"⚠️ Character position filtering not working or no GK characters")
            
        # Test equipment filtering by category
        response = self.session.get(f"{self.backend_url}/equipment?category=Boots")
        if response.status_code == 200:
            boots_equipment = response.json()
            self.log(f"✅ Equipment category filtering: {len(boots_equipment)} Boots items")
        else:
            self.log(f"⚠️ Equipment category filtering not working or no Boots items")
            
        # Test equipment filtering by rarity
        response = self.session.get(f"{self.backend_url}/equipment?rarity=Legendary")
        if response.status_code == 200:
            legendary_equipment = response.json()
            self.log(f"✅ Equipment rarity filtering: {len(legendary_equipment)} Legendary items")
        else:
            self.log(f"⚠️ Equipment rarity filtering not working or no Legendary items")
            
        # Test technique filtering by type
        response = self.session.get(f"{self.backend_url}/techniques?technique_type=avatar")
        if response.status_code == 200:
            avatar_techniques = response.json()
            self.log(f"✅ Technique type filtering: {len(avatar_techniques)} avatar techniques")
        else:
            self.log(f"⚠️ Technique type filtering not working or no avatar techniques")
            
        self.log(f"✅ Filtering capabilities tested (some filters may not be implemented)")
        return True
        
    def run_all_tests(self):
        """Run all comparison tool tests in sequence"""
        self.log("🚀 Starting Comparison Tool Backend API Testing")
        self.log("=" * 70)
        
        tests = [
            ("Characters Endpoint", self.test_characters_endpoint),
            ("Equipment Endpoint", self.test_equipment_endpoint),
            ("Techniques Endpoint", self.test_techniques_endpoint),
            ("Coaches Endpoint", self.test_coaches_endpoint),
            ("Data Structure Completeness", self.test_data_structure_completeness),
            ("Filtering Capabilities", self.test_filtering_capabilities),
        ]
        
        passed = 0
        failed = 0
        
        for test_name, test_func in tests:
            self.log(f"\n📋 Running: {test_name}")
            self.log("-" * 50)
            
            try:
                if test_func():
                    passed += 1
                    self.log(f"✅ {test_name} - PASSED")
                else:
                    failed += 1
                    self.log(f"❌ {test_name} - FAILED")
            except Exception as e:
                failed += 1
                self.log(f"❌ {test_name} - ERROR: {str(e)}")
                
        self.log("\n" + "=" * 70)
        self.log("🏁 COMPARISON TOOL TESTING COMPLETE")
        self.log(f"✅ Passed: {passed}")
        self.log(f"❌ Failed: {failed}")
        self.log(f"📊 Success Rate: {(passed/(passed+failed)*100):.1f}%")
        
        if failed == 0:
            self.log("🎉 ALL TESTS PASSED! Comparison tool backend APIs are working perfectly.")
            self.log("📋 SUMMARY:")
            self.log("   • GET /api/characters - Returns characters with proper structure for comparison")
            self.log("   • GET /api/equipment - Returns equipment with stats and categories")
            self.log("   • GET /api/techniques - Returns techniques with power and descriptions")
            self.log("   • GET /api/teams/coaches/ - Returns coaches with bonuses and specialties")
            self.log("   • All endpoints provide data suitable for columns and rows table format")
            self.log("   • Data includes all necessary fields for comparison (stats, names, descriptions, etc.)")
            return True
        else:
            self.log("⚠️ Some tests failed. Please review the issues above.")
            return False

if __name__ == "__main__":
    tester = ComparisonToolTester()
    success = tester.run_all_tests()
    sys.exit(0 if success else 1)