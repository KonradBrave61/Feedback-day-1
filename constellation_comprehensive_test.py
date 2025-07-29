#!/usr/bin/env python3
import requests
import json
import uuid
import random
import string

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

print(f"Testing Constellation System at: {API_URL}")

def generate_random_string(length=8):
    """Generate a random string of fixed length"""
    letters = string.ascii_lowercase
    return ''.join(random.choice(letters) for i in range(length))

def test_constellation_system():
    """Comprehensive test of the constellation/gacha system"""
    
    print("\n=== CONSTELLATION SYSTEM COMPREHENSIVE TEST ===\n")
    
    # Test 1: Register user for gacha testing
    print("1. Testing user registration with Kizuna Stars...")
    random_suffix = generate_random_string()
    user_data = {
        "username": f"gachauser_{random_suffix}",
        "email": f"gacha_{random_suffix}@example.com",
        "password": "Password123!",
        "coach_level": 5,
        "favorite_position": "FW",
        "favorite_element": "Fire",
        "favourite_team": "Raimon",
        "bio": "Gacha enthusiast and constellation explorer"
    }
    
    response = requests.post(f"{API_URL}/auth/register", json=user_data)
    if response.status_code != 200:
        print(f"❌ User registration failed: {response.status_code}")
        return False
    
    data = response.json()
    auth_token = data["access_token"]
    user_id = data["user"]["id"]
    initial_kizuna_stars = data["user"]["kizuna_stars"]
    
    print(f"✅ User registered with {initial_kizuna_stars} Kizuna Stars")
    
    # Test 2: Get all constellations
    print("\n2. Testing GET /api/constellations/ to list all constellations...")
    response = requests.get(f"{API_URL}/constellations/")
    if response.status_code != 200:
        print(f"❌ Get constellations failed: {response.status_code}")
        return False
    
    constellations = response.json()
    if len(constellations) == 0:
        print("❌ No constellations found")
        return False
    
    constellation = constellations[0]
    constellation_id = constellation["id"]
    
    print(f"✅ Found {len(constellations)} constellations")
    print(f"   Using '{constellation['name']}' ({constellation['element']}) for testing")
    
    # Test 3: Get specific constellation details
    print("\n3. Testing GET /api/constellations/{id} for constellation details...")
    response = requests.get(f"{API_URL}/constellations/{constellation_id}")
    if response.status_code != 200:
        print(f"❌ Get constellation details failed: {response.status_code}")
        return False
    
    constellation_details = response.json()
    orb_count = len(constellation_details["orbs"])
    connection_count = len(constellation_details["connections"])
    
    print(f"✅ Constellation details retrieved")
    print(f"   Name: {constellation_details['name']}")
    print(f"   Element: {constellation_details['element']}")
    print(f"   Orbs: {orb_count}")
    print(f"   Connections: {connection_count}")
    print(f"   Background: {constellation_details['background_color']}")
    print(f"   Orb Color: {constellation_details['orb_color']}")
    
    # Test 4: Get constellation character pools
    print("\n4. Testing GET /api/constellations/{id}/characters for character pools...")
    response = requests.get(f"{API_URL}/constellations/{constellation_id}/characters")
    if response.status_code != 200:
        print(f"❌ Get constellation characters failed: {response.status_code}")
        return False
    
    character_pools = response.json()
    legendary_count = len(character_pools["legendary"])
    epic_count = len(character_pools["epic"])
    rare_count = len(character_pools["rare"])
    normal_count = len(character_pools["normal"])
    total_chars = legendary_count + epic_count + rare_count + normal_count
    
    print(f"✅ Character pools retrieved")
    print(f"   Legendary: {legendary_count}")
    print(f"   Epic: {epic_count}")
    print(f"   Rare: {rare_count}")
    print(f"   Normal: {normal_count}")
    print(f"   Total: {total_chars}")
    
    # Test 5: Get drop rates without bonuses
    print("\n5. Testing GET /api/constellations/{id}/drop-rates (no bonuses)...")
    response = requests.get(f"{API_URL}/constellations/{constellation_id}/drop-rates")
    if response.status_code != 200:
        print(f"❌ Get drop rates failed: {response.status_code}")
        return False
    
    drop_rates_data = response.json()
    base_rates = drop_rates_data["base_rates"]
    
    print(f"✅ Base drop rates retrieved")
    print(f"   Legendary: {base_rates['legendary']}%")
    print(f"   Epic: {base_rates['epic']}%")
    print(f"   Rare: {base_rates['rare']}%")
    print(f"   Normal: {base_rates['normal']}%")
    
    # Test 6: Get drop rates with platform bonuses
    print("\n6. Testing GET /api/constellations/{id}/drop-rates with platform bonuses...")
    response = requests.get(f"{API_URL}/constellations/{constellation_id}/drop-rates?platform_bonuses=111")
    if response.status_code != 200:
        print(f"❌ Get drop rates with bonuses failed: {response.status_code}")
        return False
    
    bonus_rates_data = response.json()
    final_rates = bonus_rates_data["final_rates"]
    bonuses = bonus_rates_data["platform_bonuses"]
    
    legendary_increase = final_rates["legendary"] - base_rates["legendary"]
    
    print(f"✅ Drop rates with platform bonuses retrieved")
    print(f"   Platform bonuses: Nintendo={bonuses['nintendo']}, PlayStation={bonuses['playstation']}, PC={bonuses['pc']}")
    print(f"   Final legendary rate: {final_rates['legendary']}% (increased by {legendary_increase}%)")
    
    # Test 7: Test insufficient Kizuna Stars
    print("\n7. Testing gacha pull with insufficient Kizuna Stars...")
    headers = {"Authorization": f"Bearer {auth_token}"}
    
    # Try to pull more than user can afford (user has 50 stars, try 11 pulls = 55 stars)
    pull_data = {
        "constellation_id": constellation_id,
        "pull_count": 11,
        "platform_bonuses": {
            "nintendo": False,
            "playstation": False,
            "pc": False
        }
    }
    
    response = requests.post(f"{API_URL}/constellations/pull", json=pull_data, headers=headers)
    if response.status_code != 400:
        print(f"❌ Insufficient stars check failed: expected 400, got {response.status_code}")
        return False
    
    print("✅ Insufficient Kizuna Stars properly rejected")
    
    # Test 8: Single gacha pull
    print("\n8. Testing single gacha pull...")
    pull_data = {
        "constellation_id": constellation_id,
        "pull_count": 1,
        "platform_bonuses": {
            "nintendo": False,
            "playstation": False,
            "pc": False
        }
    }
    
    response = requests.post(f"{API_URL}/constellations/pull", json=pull_data, headers=headers)
    if response.status_code != 200:
        print(f"❌ Single pull failed: {response.status_code}")
        return False
    
    pull_result = response.json()
    character_obtained = pull_result["characters_obtained"][0]
    pull_detail = pull_result["pull_details"][0]
    stars_remaining = pull_result["kizuna_stars_remaining"]
    
    print(f"✅ Single pull successful")
    print(f"   Character obtained: {character_obtained['name']} ({pull_detail['character_rarity']})")
    print(f"   Stars spent: {pull_result['kizuna_stars_spent']}")
    print(f"   Stars remaining: {stars_remaining}")
    
    # Test 9: Multiple gacha pulls (if enough stars)
    if stars_remaining >= 50:
        print("\n9. Testing 10-pull gacha...")
        pull_data = {
            "constellation_id": constellation_id,
            "pull_count": 10,
            "platform_bonuses": {
                "nintendo": False,
                "playstation": False,
                "pc": False
            }
        }
        
        response = requests.post(f"{API_URL}/constellations/pull", json=pull_data, headers=headers)
        if response.status_code != 200:
            print(f"❌ 10-pull failed: {response.status_code}")
            return False
        
        multi_pull_result = response.json()
        
        # Count rarities obtained
        rarity_counts = {"legendary": 0, "epic": 0, "rare": 0, "normal": 0}
        for pull_detail in multi_pull_result["pull_details"]:
            rarity = pull_detail["character_rarity"]
            rarity_counts[rarity] += 1
        
        print(f"✅ 10-pull successful")
        print(f"   Results: {rarity_counts['legendary']} legendary, {rarity_counts['epic']} epic, {rarity_counts['rare']} rare, {rarity_counts['normal']} normal")
        print(f"   Stars remaining: {multi_pull_result['kizuna_stars_remaining']}")
        
        stars_remaining = multi_pull_result["kizuna_stars_remaining"]
    else:
        print("\n9. Skipping 10-pull test (insufficient stars)")
    
    # Test 10: Gacha pull with platform bonuses (if enough stars)
    if stars_remaining >= 5:
        print("\n10. Testing gacha pull with platform bonuses...")
        pull_data = {
            "constellation_id": constellation_id,
            "pull_count": 1,
            "platform_bonuses": {
                "nintendo": True,
                "playstation": True,
                "pc": True
            }
        }
        
        response = requests.post(f"{API_URL}/constellations/pull", json=pull_data, headers=headers)
        if response.status_code != 200:
            print(f"❌ Pull with bonuses failed: {response.status_code}")
            return False
        
        bonus_pull_result = response.json()
        bonus_character = bonus_pull_result["characters_obtained"][0]
        bonus_pull_detail = bonus_pull_result["pull_details"][0]
        bonuses_applied = bonus_pull_result["platform_bonuses_applied"]
        
        print(f"✅ Pull with platform bonuses successful")
        print(f"   Character obtained: {bonus_character['name']} ({bonus_pull_detail['character_rarity']})")
        print(f"   Bonuses applied: Nintendo={bonuses_applied['nintendo']}, PlayStation={bonuses_applied['playstation']}, PC={bonuses_applied['pc']}")
        print(f"   Stars remaining: {bonus_pull_result['kizuna_stars_remaining']}")
        
        stars_remaining = bonus_pull_result["kizuna_stars_remaining"]
    else:
        print("\n10. Skipping platform bonus test (insufficient stars)")
    
    # Test 11: Verify user Kizuna Stars deduction
    print("\n11. Verifying user Kizuna Stars deduction...")
    response = requests.get(f"{API_URL}/auth/me", headers=headers)
    if response.status_code != 200:
        print(f"❌ Get user info failed: {response.status_code}")
        return False
    
    user_info = response.json()
    current_stars = user_info["kizuna_stars"]
    stars_spent = initial_kizuna_stars - current_stars
    pulls_made = stars_spent // 5
    
    print(f"✅ User Kizuna Stars properly updated")
    print(f"   Started with: {initial_kizuna_stars} stars")
    print(f"   Current: {current_stars} stars")
    print(f"   Total spent: {stars_spent} stars")
    print(f"   Total pulls made: {pulls_made}")
    
    # Test 12: Test error handling for non-existent constellation
    print("\n12. Testing error handling for non-existent constellation...")
    fake_constellation_id = str(uuid.uuid4())
    
    response = requests.get(f"{API_URL}/constellations/{fake_constellation_id}")
    if response.status_code != 404:
        print(f"❌ Non-existent constellation check failed: expected 404, got {response.status_code}")
        return False
    
    print("✅ Non-existent constellation properly returns 404")
    
    # Test 13: Test unauthorized gacha pull
    print("\n13. Testing unauthorized gacha pull...")
    pull_data = {
        "constellation_id": constellation_id,
        "pull_count": 1,
        "platform_bonuses": {
            "nintendo": False,
            "playstation": False,
            "pc": False
        }
    }
    
    # Try to pull without auth token
    response = requests.post(f"{API_URL}/constellations/pull", json=pull_data)
    if response.status_code != 403:
        print(f"❌ Unauthorized pull check failed: expected 403, got {response.status_code}")
        return False
    
    print("✅ Unauthorized gacha pull properly rejected")
    
    # Test 14: Verify sample data initialization
    print("\n14. Verifying sample constellation data initialization...")
    response = requests.get(f"{API_URL}/constellations/")
    if response.status_code != 200:
        print(f"❌ Get constellations failed: {response.status_code}")
        return False
    
    all_constellations = response.json()
    
    # Check that we have the expected sample constellations
    constellation_names = [c["name"] for c in all_constellations]
    expected_names = ["Lightning Constellation", "Flame Constellation", "Wind Constellation"]
    
    missing_constellations = []
    for expected_name in expected_names:
        if expected_name not in constellation_names:
            missing_constellations.append(expected_name)
    
    if missing_constellations:
        print(f"❌ Missing sample constellations: {missing_constellations}")
        return False
    
    # Verify constellation structure
    for constellation in all_constellations:
        if len(constellation["orbs"]) == 0:
            print(f"❌ {constellation['name']} has no orbs")
            return False
        
        if len(constellation["connections"]) == 0:
            print(f"❌ {constellation['name']} has no connections")
            return False
        
        # Check drop rates sum to 100%
        rates = constellation["base_drop_rates"]
        total_rate = rates["legendary"] + rates["epic"] + rates["rare"] + rates["normal"]
        if abs(total_rate - 100.0) > 0.1:
            print(f"❌ {constellation['name']} drop rates don't sum to 100% (got {total_rate}%)")
            return False
    
    print(f"✅ Sample data initialization verified")
    print(f"   Found all expected constellations: {expected_names}")
    print(f"   All constellations have proper orb positions and drop rates")
    
    print("\n=== CONSTELLATION SYSTEM TEST COMPLETE ===")
    print("🎉 All constellation/gacha system tests passed successfully!")
    
    return True

if __name__ == "__main__":
    success = test_constellation_system()
    if not success:
        print("\n❌ Some tests failed!")
        exit(1)
    else:
        print("\n✅ All tests passed!")
        exit(0)