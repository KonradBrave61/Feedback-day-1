#!/usr/bin/env python3

import requests
import json
import sys
from datetime import datetime

# Configuration
BACKEND_URL = "https://selection-bubble.preview.emergentagent.com/api"

class ComparisonToolTester:
    def __init__(self):
        self.backend_url = BACKEND_URL
        self.session = requests.Session()
        
    def log(self, message):
        print(f"[{datetime.now().strftime('%H:%M:%S')}] {message}")
        
    def test_characters_api(self):
        """Test Characters API - GET /api/characters"""
        self.log("⚽ Testing Characters API...")
        
        # Test basic characters endpoint
        response = self.session.get(f"{self.backend_url}/characters")
        
        if response.status_code != 200:
            self.log(f"❌ GET /api/characters failed: {response.status_code} - {response.text}")
            return False
            
        characters_data = response.json()
        if not isinstance(characters_data, list):
            self.log(f"❌ Characters data should be a list")
            return False
            
        if len(characters_data) == 0:
            self.log(f"❌ No characters found")
            return False
            
        # Verify character data structure
        character = characters_data[0]
        required_fields = ["id", "name", "position", "element", "base_stats"]
        for field in required_fields:
            if field not in character:
                self.log(f"❌ Missing field in character data: {field}")
                return False
                
        # Verify base_stats structure
        base_stats = character.get("base_stats", {})
        if not isinstance(base_stats, dict):
            self.log(f"❌ base_stats should be a dictionary")
            return False
            
        # Check for portrait field (optional but mentioned in requirements)
        if "portrait" in character:
            self.log(f"✅ Character has portrait field")
        else:
            self.log(f"⚠️ Character missing portrait field (optional)")
            
        self.log(f"✅ GET /api/characters - Retrieved {len(characters_data)} characters")
        self.log(f"   Sample character: {character['name']} ({character['position']}, {character['element']})")
        
        # Test element filtering
        response = self.session.get(f"{self.backend_url}/characters?element=Fire")
        if response.status_code == 200:
            fire_characters = response.json()
            self.log(f"✅ Element filtering works - Found {len(fire_characters)} Fire characters")
        else:
            self.log(f"⚠️ Element filtering not working or no Fire characters")
            
        # Test position filtering
        response = self.session.get(f"{self.backend_url}/characters?position=GK")
        if response.status_code == 200:
            gk_characters = response.json()
            self.log(f"✅ Position filtering works - Found {len(gk_characters)} GK characters")
        else:
            self.log(f"⚠️ Position filtering not working or no GK characters")
            
        return True
        
    def test_equipment_api(self):
        """Test Equipment/Items API - GET /api/equipment"""
        self.log("🛡️ Testing Equipment/Items API...")
        
        # Test basic equipment endpoint
        response = self.session.get(f"{self.backend_url}/equipment")
        
        if response.status_code != 200:
            self.log(f"❌ GET /api/equipment failed: {response.status_code} - {response.text}")
            return False
            
        equipment_data = response.json()
        if not isinstance(equipment_data, list):
            self.log(f"❌ Equipment data should be a list")
            return False
            
        if len(equipment_data) == 0:
            self.log(f"❌ No equipment found")
            return False
            
        # Verify equipment data structure
        equipment = equipment_data[0]
        required_fields = ["id", "name", "category", "rarity", "stats", "icon"]
        for field in required_fields:
            if field not in equipment:
                self.log(f"❌ Missing field in equipment data: {field}")
                return False
                
        # Verify stats structure
        stats = equipment.get("stats", {})
        if not isinstance(stats, dict):
            self.log(f"❌ stats should be a dictionary")
            return False
            
        self.log(f"✅ GET /api/equipment - Retrieved {len(equipment_data)} equipment items")
        self.log(f"   Sample equipment: {equipment['name']} ({equipment['category']}, {equipment['rarity']})")
        
        # Test category filtering
        response = self.session.get(f"{self.backend_url}/equipment?category=Boots")
        if response.status_code == 200:
            boots_equipment = response.json()
            self.log(f"✅ Category filtering works - Found {len(boots_equipment)} Boots items")
        else:
            self.log(f"⚠️ Category filtering not working or no Boots items")
            
        # Test rarity filtering
        response = self.session.get(f"{self.backend_url}/equipment?rarity=Legendary")
        if response.status_code == 200:
            legendary_equipment = response.json()
            self.log(f"✅ Rarity filtering works - Found {len(legendary_equipment)} Legendary items")
        else:
            self.log(f"⚠️ Rarity filtering not working or no Legendary items")
            
        return True
        
    def test_techniques_api(self):
        """Test Techniques API - GET /api/techniques"""
        self.log("⚡ Testing Techniques API...")
        
        # Test basic techniques endpoint
        response = self.session.get(f"{self.backend_url}/techniques")
        
        if response.status_code != 200:
            self.log(f"❌ GET /api/techniques failed: {response.status_code} - {response.text}")
            return False
            
        techniques_data = response.json()
        if not isinstance(techniques_data, list):
            self.log(f"❌ Techniques data should be a list")
            return False
            
        if len(techniques_data) == 0:
            self.log(f"❌ No techniques found")
            return False
            
        # Verify technique data structure
        technique = techniques_data[0]
        required_fields = ["id", "name", "technique_type", "category", "element", "power", "description"]
        for field in required_fields:
            if field not in technique:
                self.log(f"❌ Missing field in technique data: {field}")
                return False
                
        # Verify power is numeric
        power = technique.get("power")
        if not isinstance(power, (int, float)):
            self.log(f"❌ power should be numeric, got {type(power)}")
            return False
            
        self.log(f"✅ GET /api/techniques - Retrieved {len(techniques_data)} techniques")
        self.log(f"   Sample technique: {technique['name']} ({technique['technique_type']}, Power: {technique['power']})")
        
        # Test technique_type filtering
        response = self.session.get(f"{self.backend_url}/techniques?technique_type=avatar")
        if response.status_code == 200:
            avatar_techniques = response.json()
            self.log(f"✅ Technique type filtering works - Found {len(avatar_techniques)} avatar techniques")
        else:
            self.log(f"⚠️ Technique type filtering not working or no avatar techniques")
            
        # Test element filtering
        response = self.session.get(f"{self.backend_url}/techniques?element=Fire")
        if response.status_code == 200:
            fire_techniques = response.json()
            self.log(f"✅ Element filtering works - Found {len(fire_techniques)} Fire techniques")
        else:
            self.log(f"⚠️ Element filtering not working or no Fire techniques")
            
        return True
        
    def test_coaches_managers_api(self):
        """Test Coaches/Managers API - GET /api/teams/coaches/"""
        self.log("👨‍💼 Testing Coaches/Managers API...")
        
        # Test coaches endpoint
        response = self.session.get(f"{self.backend_url}/teams/coaches/")
        
        if response.status_code != 200:
            self.log(f"❌ GET /api/teams/coaches/ failed: {response.status_code} - {response.text}")
            return False
            
        coaches_data = response.json()
        if not isinstance(coaches_data, list):
            self.log(f"❌ Coaches data should be a list")
            return False
            
        if len(coaches_data) == 0:
            self.log(f"❌ No coaches found")
            return False
            
        # Verify coach data structure
        coach = coaches_data[0]
        required_fields = ["id", "name", "title", "bonuses", "specialties", "portrait"]
        for field in required_fields:
            if field not in coach:
                self.log(f"❌ Missing field in coach data: {field}")
                return False
                
        # Verify bonuses structure
        bonuses = coach.get("bonuses", {})
        if not isinstance(bonuses, dict):
            self.log(f"❌ bonuses should be a dictionary")
            return False
            
        # Verify specialties structure
        specialties = coach.get("specialties", [])
        if not isinstance(specialties, list):
            self.log(f"❌ specialties should be a list")
            return False
            
        self.log(f"✅ GET /api/teams/coaches/ - Retrieved {len(coaches_data)} coaches/managers")
        self.log(f"   Sample coach: {coach['name']} ({coach['title']})")
        self.log(f"   Bonuses: {list(bonuses.keys())}")
        self.log(f"   Specialties: {len(specialties)} specialties")
        
        return True
        
    def test_public_access(self):
        """Test that all endpoints work without authentication"""
        self.log("🔓 Testing public access (no authentication required)...")
        
        endpoints = [
            "/characters",
            "/equipment", 
            "/techniques",
            "/teams/coaches/"
        ]
        
        # Test without any authentication headers
        session_no_auth = requests.Session()
        
        for endpoint in endpoints:
            response = session_no_auth.get(f"{self.backend_url}{endpoint}")
            if response.status_code == 200:
                self.log(f"✅ {endpoint} - Public access working")
            elif response.status_code == 403:
                self.log(f"❌ {endpoint} - Requires authentication (should be public)")
                return False
            elif response.status_code == 401:
                self.log(f"❌ {endpoint} - Unauthorized (should be public)")
                return False
            else:
                self.log(f"⚠️ {endpoint} - Unexpected status: {response.status_code}")
                
        return True
        
    def test_data_completeness(self):
        """Test that data structures are complete for frontend comparison functionality"""
        self.log("📊 Testing data completeness for comparison functionality...")
        
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
        
        # Verify each category has the necessary fields for comparison
        comparison_requirements = {
            'characters': {
                'required': ['id', 'name', 'base_stats'],
                'comparison_fields': ['base_stats']
            },
            'equipment': {
                'required': ['id', 'name', 'stats'],
                'comparison_fields': ['stats']
            },
            'techniques': {
                'required': ['id', 'name', 'power', 'description'],
                'comparison_fields': ['power', 'description']
            },
            'coaches': {
                'required': ['id', 'name', 'bonuses', 'specialties'],
                'comparison_fields': ['bonuses', 'specialties']
            }
        }
        
        all_complete = True
        
        for category, data in endpoints_data.items():
            requirements = comparison_requirements[category]
            
            # Check required fields
            missing_fields = []
            for field in requirements['required']:
                if field not in data:
                    missing_fields.append(field)
                    
            if missing_fields:
                self.log(f"❌ {category} missing required fields: {missing_fields}")
                all_complete = False
            else:
                self.log(f"✅ {category} has all required fields for comparison")
                
            # Check comparison-specific fields have data
            for field in requirements['comparison_fields']:
                if field in data:
                    field_data = data[field]
                    if field_data is None or (isinstance(field_data, (dict, list)) and len(field_data) == 0):
                        self.log(f"⚠️ {category}.{field} is empty - may affect comparison quality")
                    else:
                        self.log(f"✅ {category}.{field} has data for comparison")
                        
        return all_complete
        
    def run_all_tests(self):
        """Run all comparison tool tests"""
        self.log("🚀 Starting Comparison Tool Backend API Testing")
        self.log("=" * 70)
        
        tests = [
            ("Characters API", self.test_characters_api),
            ("Equipment/Items API", self.test_equipment_api),
            ("Techniques API", self.test_techniques_api),
            ("Coaches/Managers API", self.test_coaches_managers_api),
            ("Public Access", self.test_public_access),
            ("Data Completeness", self.test_data_completeness),
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
        self.log("🏁 TESTING COMPLETE")
        self.log(f"✅ Passed: {passed}")
        self.log(f"❌ Failed: {failed}")
        self.log(f"📊 Success Rate: {(passed/(passed+failed)*100):.1f}%")
        
        if failed == 0:
            self.log("🎉 ALL TESTS PASSED! Comparison tool backend APIs are working perfectly.")
            return True
        else:
            self.log("⚠️ Some tests failed. Please review the issues above.")
            return False

if __name__ == "__main__":
    tester = ComparisonToolTester()
    success = tester.run_all_tests()
    sys.exit(0 if success else 1)