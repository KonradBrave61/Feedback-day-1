#!/usr/bin/env python3
"""
Backend API Testing After Frontend UI Fixes
============================================

This test verifies that all backend APIs are still working correctly after the frontend UI fixes:
1. Replaced all browser alert() calls with toast notifications
2. Fixed Support Page interaction issues 
3. Improved color contrast for better button visibility

Since these were purely frontend changes, the backend should not be affected.
"""

import requests
import json
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

print(f"🔍 Testing Backend APIs at: {API_URL}")
print(f"🔍 Testing Root at: {ROOT_URL}")
print("=" * 80)

def generate_random_string(length=8):
    """Generate a random string of fixed length"""
    letters = string.ascii_lowercase
    return ''.join(random.choice(letters) for i in range(length))

def test_api_status():
    """Test basic API status endpoints"""
    print("🧪 Testing API Status Endpoints...")
    
    try:
        # Test root endpoint
        response = requests.get(f"{ROOT_URL}/")
        if response.status_code == 200:
            print("✅ Root endpoint working")
        else:
            print(f"❌ Root endpoint failed: {response.status_code}")
            return False
        
        # Test API status endpoint
        response = requests.get(f"{API_URL}/status")
        if response.status_code == 200:
            data = response.json()
            if "status" in data:
                print("✅ API status endpoint working")
            else:
                print("❌ API status endpoint missing status field")
                return False
        else:
            print(f"❌ API status endpoint failed: {response.status_code}")
            return False
            
        return True
    except Exception as e:
        print(f"❌ API status test failed with error: {e}")
        return False

def test_character_endpoints():
    """Test character-related endpoints"""
    print("\n🧪 Testing Character Endpoints...")
    
    try:
        # Test getting characters
        response = requests.get(f"{API_URL}/characters/")
        if response.status_code == 200:
            characters = response.json()
            if isinstance(characters, list) and len(characters) > 0:
                print(f"✅ Characters endpoint working - Found {len(characters)} characters")
                
                # Test character filtering by element
                response = requests.get(f"{API_URL}/characters/?element=Fire")
                if response.status_code == 200:
                    fire_chars = response.json()
                    print(f"✅ Character element filtering working - Found {len(fire_chars)} Fire characters")
                else:
                    print(f"❌ Character element filtering failed: {response.status_code}")
                    return False
                
                # Test character filtering by position
                response = requests.get(f"{API_URL}/characters/?position=GK")
                if response.status_code == 200:
                    gk_chars = response.json()
                    print(f"✅ Character position filtering working - Found {len(gk_chars)} GK characters")
                else:
                    print(f"❌ Character position filtering failed: {response.status_code}")
                    return False
                
                # Test individual character retrieval
                if characters:
                    char_id = characters[0]["id"]
                    response = requests.get(f"{API_URL}/characters/{char_id}")
                    if response.status_code == 200:
                        character = response.json()
                        if "element" in character:
                            print("✅ Individual character retrieval working with element data")
                        else:
                            print("❌ Individual character missing element data")
                            return False
                    else:
                        print(f"❌ Individual character retrieval failed: {response.status_code}")
                        return False
                
                return True
            else:
                print("❌ Characters endpoint returned empty or invalid data")
                return False
        else:
            print(f"❌ Characters endpoint failed: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Character endpoints test failed with error: {e}")
        return False

def test_equipment_endpoints():
    """Test equipment-related endpoints"""
    print("\n🧪 Testing Equipment Endpoints...")
    
    try:
        # Test getting equipment
        response = requests.get(f"{API_URL}/equipment/")
        if response.status_code == 200:
            equipment = response.json()
            if isinstance(equipment, list) and len(equipment) > 0:
                print(f"✅ Equipment endpoint working - Found {len(equipment)} equipment items")
                
                # Test equipment filtering by category
                response = requests.get(f"{API_URL}/equipment/?category=Boots")
                if response.status_code == 200:
                    boots = response.json()
                    print(f"✅ Equipment category filtering working - Found {len(boots)} Boots")
                else:
                    print(f"❌ Equipment category filtering failed: {response.status_code}")
                    return False
                
                # Test equipment filtering by rarity
                response = requests.get(f"{API_URL}/equipment/?rarity=Legendary")
                if response.status_code == 200:
                    legendary = response.json()
                    print(f"✅ Equipment rarity filtering working - Found {len(legendary)} Legendary items")
                else:
                    print(f"❌ Equipment rarity filtering failed: {response.status_code}")
                    return False
                
                return True
            else:
                print("❌ Equipment endpoint returned empty or invalid data")
                return False
        else:
            print(f"❌ Equipment endpoint failed: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Equipment endpoints test failed with error: {e}")
        return False

def test_team_builder_endpoints():
    """Test team builder related endpoints"""
    print("\n🧪 Testing Team Builder Endpoints...")
    
    try:
        # Test formations
        response = requests.get(f"{API_URL}/teams/formations/")
        if response.status_code == 200:
            formations = response.json()
            if isinstance(formations, list) and len(formations) > 0:
                print(f"✅ Formations endpoint working - Found {len(formations)} formations")
            else:
                print("❌ Formations endpoint returned empty data")
                return False
        else:
            print(f"❌ Formations endpoint failed: {response.status_code}")
            return False
        
        # Test tactics
        response = requests.get(f"{API_URL}/teams/tactics/")
        if response.status_code == 200:
            tactics = response.json()
            if isinstance(tactics, list) and len(tactics) > 0:
                print(f"✅ Tactics endpoint working - Found {len(tactics)} tactics")
            else:
                print("❌ Tactics endpoint returned empty data")
                return False
        else:
            print(f"❌ Tactics endpoint failed: {response.status_code}")
            return False
        
        # Test coaches
        response = requests.get(f"{API_URL}/teams/coaches/")
        if response.status_code == 200:
            coaches = response.json()
            if isinstance(coaches, list) and len(coaches) > 0:
                print(f"✅ Coaches endpoint working - Found {len(coaches)} coaches")
            else:
                print("❌ Coaches endpoint returned empty data")
                return False
        else:
            print(f"❌ Coaches endpoint failed: {response.status_code}")
            return False
        
        return True
    except Exception as e:
        print(f"❌ Team builder endpoints test failed with error: {e}")
        return False

def test_constellation_endpoints():
    """Test constellation/gacha system endpoints"""
    print("\n🧪 Testing Constellation Endpoints...")
    
    try:
        # Test getting constellations
        response = requests.get(f"{API_URL}/constellations/")
        if response.status_code == 200:
            constellations = response.json()
            if isinstance(constellations, list):
                print(f"✅ Constellations endpoint working - Found {len(constellations)} constellations")
                
                if constellations:
                    constellation_id = constellations[0]["id"]
                    
                    # Test constellation details
                    response = requests.get(f"{API_URL}/constellations/{constellation_id}")
                    if response.status_code == 200:
                        constellation = response.json()
                        if "orbs" in constellation:
                            print("✅ Constellation details endpoint working with orb data")
                        else:
                            print("❌ Constellation details missing orb data")
                            return False
                    else:
                        print(f"❌ Constellation details failed: {response.status_code}")
                        return False
                    
                    # Test constellation characters
                    response = requests.get(f"{API_URL}/constellations/{constellation_id}/characters")
                    if response.status_code == 200:
                        characters = response.json()
                        print("✅ Constellation characters endpoint working")
                    else:
                        print(f"❌ Constellation characters failed: {response.status_code}")
                        return False
                
                return True
            else:
                print("❌ Constellations endpoint returned invalid data")
                return False
        else:
            print(f"❌ Constellations endpoint failed: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Constellation endpoints test failed with error: {e}")
        return False

def test_authentication_endpoints():
    """Test authentication endpoints (without creating users)"""
    print("\n🧪 Testing Authentication Endpoints...")
    
    try:
        # Test unauthorized access (should return 403)
        response = requests.get(f"{API_URL}/auth/me")
        if response.status_code == 403:
            print("✅ Authentication properly rejects unauthorized access")
        else:
            print(f"❌ Authentication endpoint unexpected response: {response.status_code}")
            return False
        
        # Test invalid login (should return 401)
        login_data = {
            "email": "nonexistent@example.com",
            "password": "wrongpassword"
        }
        response = requests.post(f"{API_URL}/auth/login", json=login_data)
        if response.status_code == 401:
            print("✅ Authentication properly rejects invalid credentials")
        else:
            print(f"❌ Invalid login unexpected response: {response.status_code}")
            return False
        
        return True
    except Exception as e:
        print(f"❌ Authentication endpoints test failed with error: {e}")
        return False

def test_community_endpoints():
    """Test community endpoints (public access)"""
    print("\n🧪 Testing Community Endpoints...")
    
    try:
        # Test community stats (should work without auth for public data)
        response = requests.get(f"{API_URL}/community/stats")
        if response.status_code in [200, 403]:  # Either works or requires auth
            if response.status_code == 200:
                data = response.json()
                if "total_users" in data:
                    print("✅ Community stats endpoint working")
                else:
                    print("❌ Community stats missing expected fields")
                    return False
            else:
                print("✅ Community stats endpoint properly protected")
        else:
            print(f"❌ Community stats unexpected response: {response.status_code}")
            return False
        
        # Test community featured
        response = requests.get(f"{API_URL}/community/featured")
        if response.status_code in [200, 403]:  # Either works or requires auth
            if response.status_code == 200:
                data = response.json()
                if "teams_of_week" in data and "popular_formations" in data:
                    print("✅ Community featured endpoint working")
                else:
                    print("❌ Community featured missing expected fields")
                    return False
            else:
                print("✅ Community featured endpoint properly protected")
        else:
            print(f"❌ Community featured unexpected response: {response.status_code}")
            return False
        
        return True
    except Exception as e:
        print(f"❌ Community endpoints test failed with error: {e}")
        return False

def main():
    """Run all backend tests"""
    print("🚀 BACKEND API TESTING AFTER FRONTEND UI FIXES")
    print("=" * 80)
    print("Testing that backend APIs are still working after frontend changes:")
    print("1. Replaced browser alert() calls with toast notifications")
    print("2. Fixed Support Page interaction issues")
    print("3. Improved color contrast for better button visibility")
    print("=" * 80)
    
    tests = [
        ("API Status", test_api_status),
        ("Character Endpoints", test_character_endpoints),
        ("Equipment Endpoints", test_equipment_endpoints),
        ("Team Builder Endpoints", test_team_builder_endpoints),
        ("Constellation Endpoints", test_constellation_endpoints),
        ("Authentication Endpoints", test_authentication_endpoints),
        ("Community Endpoints", test_community_endpoints),
    ]
    
    passed = 0
    total = len(tests)
    
    for test_name, test_func in tests:
        try:
            if test_func():
                passed += 1
                print(f"✅ {test_name}: PASSED")
            else:
                print(f"❌ {test_name}: FAILED")
        except Exception as e:
            print(f"❌ {test_name}: ERROR - {e}")
    
    print("\n" + "=" * 80)
    print(f"🎯 BACKEND TESTING RESULTS: {passed}/{total} tests passed")
    
    if passed == total:
        print("🎉 ALL BACKEND APIS ARE WORKING CORRECTLY!")
        print("✅ Frontend UI fixes did not affect backend functionality")
        return True
    else:
        print(f"⚠️  {total - passed} backend tests failed")
        print("❌ Some backend issues detected")
        return False

if __name__ == "__main__":
    success = main()
    exit(0 if success else 1)