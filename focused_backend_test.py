#!/usr/bin/env python3
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

print(f"Testing API at: {API_URL}")

def generate_random_string(length=8):
    """Generate a random string of fixed length"""
    letters = string.ascii_lowercase
    return ''.join(random.choice(letters) for i in range(length))

def test_authentication_and_teams():
    """Comprehensive test of authentication and team management features"""
    
    # Generate unique test data
    random_suffix = generate_random_string()
    test_username = f"testuser_{random_suffix}"
    test_email = f"test_{random_suffix}@example.com"
    test_password = "Password123!"
    
    user_data = {
        "username": test_username,
        "email": test_email,
        "password": test_password,
        "coach_level": 5,
        "favorite_position": "FW",
        "favorite_element": "Fire",
        "favourite_team": "Raimon",
        "profile_picture": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==",
        "bio": "Passionate football coach and strategist"
    }
    
    team_data = {
        "name": f"Test Team {random_suffix}",
        "formation": "4-3-3",
        "players": [],
        "bench_players": [],
        "tactics": [],
        "coach": None,
        "description": "A test team created for API testing with enhanced community features",
        "is_public": True,
        "tags": ["test", "api", "community"]
    }
    
    auth_token = None
    user_id = None
    team_id = None
    
    print("\n=== AUTHENTICATION TESTS ===")
    
    # Test 1: User Registration
    print("1. Testing user registration...")
    response = requests.post(f"{API_URL}/auth/register", json=user_data)
    if response.status_code == 200:
        data = response.json()
        auth_token = data["access_token"]
        user_id = data["user"]["id"]
        print(f"✅ User registration successful with ID: {user_id}")
        
        # Verify enhanced fields
        user = data["user"]
        assert "favourite_team" in user, "favourite_team field missing"
        assert "profile_picture" in user, "profile_picture field missing"
        assert "bio" in user, "bio field missing"
        assert "total_teams" in user, "total_teams field missing"
        assert "total_likes_received" in user, "total_likes_received field missing"
        assert "followers" in user, "followers field missing"
        assert "following" in user, "following field missing"
        print("✅ Enhanced user registration fields verified")
    else:
        print(f"❌ User registration failed: {response.status_code} - {response.text}")
        return False
    
    # Test 2: User Login
    print("2. Testing user login...")
    login_data = {"email": test_email, "password": test_password}
    response = requests.post(f"{API_URL}/auth/login", json=login_data)
    if response.status_code == 200:
        data = response.json()
        auth_token = data["access_token"]  # Update token
        print("✅ User login successful")
    else:
        print(f"❌ User login failed: {response.status_code} - {response.text}")
        return False
    
    # Test 3: Get Current User
    print("3. Testing get current user...")
    headers = {"Authorization": f"Bearer {auth_token}"}
    response = requests.get(f"{API_URL}/auth/me", headers=headers)
    if response.status_code == 200:
        data = response.json()
        assert data["username"] == test_username, "Username mismatch"
        assert data["email"] == test_email, "Email mismatch"
        print("✅ Get current user successful")
    else:
        print(f"❌ Get current user failed: {response.status_code} - {response.text}")
        return False
    
    # Test 4: Update User Profile
    print("4. Testing user profile update...")
    update_data = {
        "coach_level": 10,
        "favorite_position": "GK",
        "favorite_element": "Wind"
    }
    response = requests.put(f"{API_URL}/auth/me", json=update_data, headers=headers)
    if response.status_code == 200:
        data = response.json()
        assert data["coach_level"] == 10, "Coach level not updated"
        assert data["favorite_position"] == "GK", "Favorite position not updated"
        assert data["favorite_element"] == "Wind", "Favorite element not updated"
        print("✅ User profile update successful")
    else:
        print(f"❌ User profile update failed: {response.status_code} - {response.text}")
        return False
    
    print("\n=== TEAM MANAGEMENT TESTS ===")
    
    # Test 5: Create Team
    print("5. Testing team creation...")
    response = requests.post(f"{API_URL}/teams", json=team_data, headers=headers)
    if response.status_code == 200:
        data = response.json()
        team_id = data["id"]
        print(f"✅ Team creation successful with ID: {team_id}")
        
        # Verify enhanced team fields
        assert "description" in data, "description field missing"
        assert "is_public" in data, "is_public field missing"
        assert "tags" in data, "tags field missing"
        assert "likes" in data, "likes field missing"
        assert "liked_by" in data, "liked_by field missing"
        assert "comments" in data, "comments field missing"
        assert "views" in data, "views field missing"
        assert "rating" in data, "rating field missing"
        assert "username" in data, "username field missing"
        assert "user_avatar" in data, "user_avatar field missing"
        print("✅ Enhanced team creation fields verified")
    else:
        print(f"❌ Team creation failed: {response.status_code} - {response.text}")
        return False
    
    # Test 6: Get User Teams
    print("6. Testing get user teams...")
    response = requests.get(f"{API_URL}/teams", headers=headers)
    if response.status_code == 200:
        data = response.json()
        assert isinstance(data, list), "Response should be a list"
        assert len(data) >= 1, "Should have at least one team"
        assert data[0]["user_id"] == user_id, "Team should belong to user"
        print(f"✅ Get user teams successful, found {len(data)} teams")
    else:
        print(f"❌ Get user teams failed: {response.status_code} - {response.text}")
        return False
    
    # Test 7: Get Team by ID
    print("7. Testing get team by ID...")
    response = requests.get(f"{API_URL}/teams/{team_id}", headers=headers)
    if response.status_code == 200:
        data = response.json()
        assert data["id"] == team_id, "Team ID mismatch"
        assert data["name"] == team_data["name"], "Team name mismatch"
        print("✅ Get team by ID successful")
    else:
        print(f"❌ Get team by ID failed: {response.status_code} - {response.text}")
        return False
    
    # Test 8: Update Team
    print("8. Testing team update...")
    update_data = {
        "name": f"Updated Team {generate_random_string()}",
        "formation": "3-5-2"
    }
    response = requests.put(f"{API_URL}/teams/{team_id}", json=update_data, headers=headers)
    if response.status_code == 200:
        data = response.json()
        assert data["id"] == team_id, "Team ID mismatch"
        assert data["name"] == update_data["name"], "Team name not updated"
        assert data["formation"] == update_data["formation"], "Formation not updated"
        print("✅ Team update successful")
    else:
        print(f"❌ Team update failed: {response.status_code} - {response.text}")
        return False
    
    print("\n=== COMMUNITY FEATURES TESTS ===")
    
    # Test 9: Community Teams Endpoint
    print("9. Testing community teams endpoint...")
    response = requests.get(f"{API_URL}/community/teams", headers=headers)
    if response.status_code == 200:
        data = response.json()
        assert isinstance(data, list), "Response should be a list"
        print("✅ Community teams endpoint working")
    else:
        print(f"❌ Community teams endpoint failed: {response.status_code} - {response.text}")
        return False
    
    # Test 10: Team Like Functionality
    print("10. Testing team like functionality...")
    response = requests.post(f"{API_URL}/teams/{team_id}/like", headers=headers)
    if response.status_code == 200:
        data = response.json()
        assert "message" in data, "Message field missing"
        assert "liked" in data, "Liked field missing"
        print("✅ Team like functionality working")
    else:
        print(f"❌ Team like functionality failed: {response.status_code} - {response.text}")
        return False
    
    # Test 11: Team Comment Functionality
    print("11. Testing team comment functionality...")
    comment_data = {"content": "This is a test comment on the team!"}
    response = requests.post(f"{API_URL}/teams/{team_id}/comment", json=comment_data, headers=headers)
    if response.status_code == 200:
        data = response.json()
        assert "message" in data, "Message field missing"
        assert "comment" in data, "Comment field missing"
        comment = data["comment"]
        assert comment["user_id"] == user_id, "Comment user_id mismatch"
        assert comment["content"] == comment_data["content"], "Comment content mismatch"
        print("✅ Team comment functionality working")
    else:
        print(f"❌ Team comment functionality failed: {response.status_code} - {response.text}")
        return False
    
    # Test 12: Community Featured Endpoint
    print("12. Testing community featured endpoint...")
    response = requests.get(f"{API_URL}/community/featured", headers=headers)
    if response.status_code == 200:
        data = response.json()
        assert "teams_of_week" in data, "teams_of_week field missing"
        assert "popular_formations" in data, "popular_formations field missing"
        assert isinstance(data["teams_of_week"], list), "teams_of_week should be a list"
        assert isinstance(data["popular_formations"], list), "popular_formations should be a list"
        print("✅ Community featured endpoint working")
    else:
        print(f"❌ Community featured endpoint failed: {response.status_code} - {response.text}")
        return False
    
    # Test 13: Community Stats Endpoint
    print("13. Testing community stats endpoint...")
    response = requests.get(f"{API_URL}/community/stats", headers=headers)
    if response.status_code == 200:
        data = response.json()
        assert "total_users" in data, "total_users field missing"
        assert "total_teams" in data, "total_teams field missing"
        assert "total_public_teams" in data, "total_public_teams field missing"
        assert "total_likes" in data, "total_likes field missing"
        assert "total_views" in data, "total_views field missing"
        assert isinstance(data["total_users"], int), "total_users should be int"
        assert isinstance(data["total_teams"], int), "total_teams should be int"
        assert data["total_users"] >= 1, "Should have at least 1 user"
        assert data["total_teams"] >= 1, "Should have at least 1 team"
        print("✅ Community stats endpoint working")
    else:
        print(f"❌ Community stats endpoint failed: {response.status_code} - {response.text}")
        return False
    
    print("\n=== SAVE SLOTS TESTS ===")
    
    # Test 14: Save Slots Endpoint
    print("14. Testing save slots endpoint...")
    response = requests.get(f"{API_URL}/save-slots", headers=headers)
    if response.status_code == 200:
        data = response.json()
        assert "save_slots" in data, "save_slots field missing"
        assert isinstance(data["save_slots"], list), "save_slots should be a list"
        assert len(data["save_slots"]) == 5, "Should have 5 slots"
        
        # Check slot structure
        for slot in data["save_slots"]:
            assert "slot_number" in slot, "slot_number field missing"
            assert "slot_name" in slot, "slot_name field missing"
            assert "is_occupied" in slot, "is_occupied field missing"
            assert "team_id" in slot, "team_id field missing"
            assert "team_name" in slot, "team_name field missing"
        print("✅ Save slots endpoint working")
    else:
        print(f"❌ Save slots endpoint failed: {response.status_code} - {response.text}")
        return False
    
    # Test 15: Save Team to Slot
    print("15. Testing save team to slot...")
    slot_data = {
        "slot_number": 1,
        "slot_name": "My First Team",
        "overwrite": True
    }
    response = requests.post(f"{API_URL}/teams/{team_id}/save-to-slot", json=slot_data, headers=headers)
    if response.status_code == 200:
        data = response.json()
        assert "message" in data, "Message field missing"
        print("✅ Save team to slot working")
    else:
        print(f"❌ Save team to slot failed: {response.status_code} - {response.text}")
        return False
    
    print("\n=== FOLLOW/UNFOLLOW TESTS ===")
    
    # Test 16: Follow/Unfollow Functionality
    print("16. Testing follow/unfollow functionality...")
    
    # Create a second user to follow
    random_suffix2 = generate_random_string()
    user2_data = {
        "username": f"testuser2_{random_suffix2}",
        "email": f"test2_{random_suffix2}@example.com",
        "password": "Password123!",
        "coach_level": 3,
        "favorite_position": "GK",
        "favorite_element": "Earth",
        "favourite_team": "Zeus"
    }
    
    # Register second user
    response = requests.post(f"{API_URL}/auth/register", json=user2_data)
    if response.status_code == 200:
        user2_data_response = response.json()
        user2_id = user2_data_response["user"]["id"]
        
        # Follow the second user
        follow_data = {"user_id": user2_id}
        response = requests.post(f"{API_URL}/community/follow", json=follow_data, headers=headers)
        if response.status_code == 200:
            data = response.json()
            assert "message" in data, "Message field missing"
            assert "following" in data, "Following field missing"
            assert data["following"] == True, "Should be following"
            print("✅ Follow functionality working")
            
            # Unfollow the second user
            response = requests.post(f"{API_URL}/community/follow", json=follow_data, headers=headers)
            if response.status_code == 200:
                data = response.json()
                assert data["following"] == False, "Should not be following"
                print("✅ Unfollow functionality working")
            else:
                print(f"❌ Unfollow failed: {response.status_code} - {response.text}")
                return False
        else:
            print(f"❌ Follow failed: {response.status_code} - {response.text}")
            return False
    else:
        print(f"❌ Second user registration failed: {response.status_code} - {response.text}")
        return False
    
    print("\n=== TEAM RATING TESTS ===")
    
    # Test 17: Team Rating System
    print("17. Testing team rating system...")
    
    # Create a third user to rate the team (can't rate own team)
    random_suffix3 = generate_random_string()
    user3_data = {
        "username": f"rater_{random_suffix3}",
        "email": f"rater_{random_suffix3}@example.com",
        "password": "Password123!",
        "coach_level": 3,
        "favorite_position": "GK",
        "favorite_element": "Earth",
        "favourite_team": "Aliea"
    }
    
    # Register third user
    response = requests.post(f"{API_URL}/auth/register", json=user3_data)
    if response.status_code == 200:
        user3_response = response.json()
        user3_token = user3_response["access_token"]
        user3_headers = {"Authorization": f"Bearer {user3_token}"}
        
        # Rate the team
        rating_data = {
            "team_id": team_id,
            "tension_usage": 4.5,
            "difficulty": 3.8,
            "fun": 4.2,
            "creativity": 4.0,
            "effectiveness": 3.9,
            "balance": 4.1
        }
        
        response = requests.post(f"{API_URL}/teams/{team_id}/rate", json=rating_data, headers=user3_headers)
        if response.status_code == 200:
            data = response.json()
            assert "message" in data, "Message field missing"
            assert "rating" in data, "Rating field missing"
            
            rating = data["rating"]
            assert "tension_usage" in rating, "tension_usage field missing"
            assert "difficulty" in rating, "difficulty field missing"
            assert "fun" in rating, "fun field missing"
            assert "creativity" in rating, "creativity field missing"
            assert "effectiveness" in rating, "effectiveness field missing"
            assert "balance" in rating, "balance field missing"
            assert "total_ratings" in rating, "total_ratings field missing"
            assert "average_rating" in rating, "average_rating field missing"
            assert rating["total_ratings"] == 1, "Should have 1 rating"
            print("✅ Team rating system working")
        else:
            print(f"❌ Team rating failed: {response.status_code} - {response.text}")
            return False
    else:
        print(f"❌ Third user registration failed: {response.status_code} - {response.text}")
        return False
    
    # Test 18: Team Details Endpoint
    print("18. Testing team details endpoint...")
    response = requests.get(f"{API_URL}/teams/{team_id}/details", headers=headers)
    if response.status_code == 200:
        data = response.json()
        assert "team" in data, "team field missing"
        assert "is_liked" in data, "is_liked field missing"
        assert "is_following" in data, "is_following field missing"
        assert "can_rate" in data, "can_rate field missing"
        assert isinstance(data["is_liked"], bool), "is_liked should be bool"
        assert isinstance(data["is_following"], bool), "is_following should be bool"
        assert isinstance(data["can_rate"], bool), "can_rate should be bool"
        assert data["can_rate"] == False, "Owner can't rate their own team"
        print("✅ Team details endpoint working")
    else:
        print(f"❌ Team details endpoint failed: {response.status_code} - {response.text}")
        return False
    
    # Test 19: Delete Team (cleanup)
    print("19. Testing team deletion...")
    response = requests.delete(f"{API_URL}/teams/{team_id}", headers=headers)
    if response.status_code == 200:
        data = response.json()
        assert "message" in data, "Message field missing"
        print("✅ Team deletion successful")
    else:
        print(f"❌ Team deletion failed: {response.status_code} - {response.text}")
        return False
    
    print("\n=== ALL TESTS COMPLETED SUCCESSFULLY ===")
    return True

if __name__ == "__main__":
    success = test_authentication_and_teams()
    if success:
        print("\n🎉 All authentication and team management tests passed!")
        exit(0)
    else:
        print("\n❌ Some tests failed!")
        exit(1)