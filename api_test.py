#!/usr/bin/env python3
import requests
import json
import random
import string
import time

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

def test_api_root():
    """Test API root endpoint"""
    print("\n--- Testing API Root Endpoint ---")
    try:
        response = requests.get(ROOT_URL)
        if response.status_code == 200:
            data = response.json()
            if "message" in data:
                print("✅ API root endpoint working")
                return True
            else:
                print("❌ API root endpoint response missing 'message' field")
                return False
        else:
            print(f"❌ API root endpoint returned status code {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Error testing API root endpoint: {str(e)}")
        return False

def test_auth_endpoints():
    """Test authentication endpoints"""
    print("\n--- Testing Authentication Endpoints ---")
    
    # Generate unique username and email for testing
    random_suffix = generate_random_string()
    test_username = f"testuser_{random_suffix}"
    test_email = f"test_{random_suffix}@example.com"
    test_password = "Password123!"
    
    # User registration data
    user_data = {
        "username": test_username,
        "email": test_email,
        "password": test_password,
        "coach_level": 5,
        "favorite_position": "FW",
        "favorite_element": "Fire"
    }
    
    # Test registration
    print("\nTesting user registration...")
    try:
        response = requests.post(f"{API_URL}/auth/register", json=user_data)
        if response.status_code == 200:
            data = response.json()
            if "access_token" in data and "user" in data:
                auth_token = data["access_token"]
                user_id = data["user"]["id"]
                print(f"✅ User registration successful with ID: {user_id}")
            else:
                print("❌ Registration response missing token or user data")
                return False
        else:
            print(f"❌ Registration failed with status code {response.status_code}")
            print(f"Response: {response.text}")
            return False
    except Exception as e:
        print(f"❌ Error during registration: {str(e)}")
        return False
    
    # Test login
    print("\nTesting user login...")
    login_data = {
        "email": test_email,
        "password": test_password
    }
    try:
        response = requests.post(f"{API_URL}/auth/login", json=login_data)
        if response.status_code == 200:
            data = response.json()
            if "access_token" in data:
                auth_token = data["access_token"]
                print("✅ User login successful")
            else:
                print("❌ Login response missing token")
                return False
        else:
            print(f"❌ Login failed with status code {response.status_code}")
            print(f"Response: {response.text}")
            return False
    except Exception as e:
        print(f"❌ Error during login: {str(e)}")
        return False
    
    # Test get current user
    print("\nTesting get current user...")
    headers = {"Authorization": f"Bearer {auth_token}"}
    try:
        response = requests.get(f"{API_URL}/auth/me", headers=headers)
        if response.status_code == 200:
            data = response.json()
            if data["username"] == test_username and data["email"] == test_email:
                print("✅ Get current user successful")
            else:
                print("❌ User data doesn't match expected values")
                return False
        else:
            print(f"❌ Get current user failed with status code {response.status_code}")
            print(f"Response: {response.text}")
            return False
    except Exception as e:
        print(f"❌ Error getting current user: {str(e)}")
        return False
    
    # Test update user profile
    print("\nTesting update user profile...")
    update_data = {
        "coach_level": 10,
        "favorite_position": "GK",
        "favorite_element": "Wind"
    }
    try:
        response = requests.put(f"{API_URL}/auth/me", json=update_data, headers=headers)
        if response.status_code == 200:
            data = response.json()
            if data["coach_level"] == 10 and data["favorite_position"] == "GK" and data["favorite_element"] == "Wind":
                print("✅ Update user profile successful")
            else:
                print("❌ Updated user data doesn't match expected values")
                return False
        else:
            print(f"❌ Update user profile failed with status code {response.status_code}")
            print(f"Response: {response.text}")
            return False
    except Exception as e:
        print(f"❌ Error updating user profile: {str(e)}")
        return False
    
    return auth_token, user_id

def test_teams_endpoints(auth_token, user_id):
    """Test teams endpoints"""
    print("\n--- Testing Teams Endpoints ---")
    
    if not auth_token or not user_id:
        print("❌ No auth token or user ID available")
        return False
    
    # Team creation data
    random_suffix = generate_random_string()
    team_data = {
        "name": f"Test Team {random_suffix}",
        "formation": "1",  # Using default formation ID
        "players": [],
        "bench_players": [],
        "tactics": [],
        "coach": None
    }
    
    # Test create team
    print("\nTesting team creation...")
    headers = {"Authorization": f"Bearer {auth_token}"}
    try:
        response = requests.post(f"{API_URL}/teams", json=team_data, headers=headers)
        if response.status_code == 200:
            data = response.json()
            if "id" in data and data["name"] == team_data["name"]:
                team_id = data["id"]
                print(f"✅ Team creation successful with ID: {team_id}")
            else:
                print("❌ Team creation response missing ID or incorrect data")
                return False
        else:
            print(f"❌ Team creation failed with status code {response.status_code}")
            print(f"Response: {response.text}")
            return False
    except Exception as e:
        print(f"❌ Error creating team: {str(e)}")
        return False
    
    # Test get user teams
    print("\nTesting get user teams...")
    try:
        response = requests.get(f"{API_URL}/teams", headers=headers)
        if response.status_code == 200:
            data = response.json()
            if isinstance(data, list) and len(data) > 0:
                print(f"✅ Get user teams successful, found {len(data)} teams")
            else:
                print("❌ Get user teams returned empty list or invalid data")
                return False
        else:
            print(f"❌ Get user teams failed with status code {response.status_code}")
            print(f"Response: {response.text}")
            return False
    except Exception as e:
        print(f"❌ Error getting user teams: {str(e)}")
        return False
    
    # Test get team by ID
    print("\nTesting get team by ID...")
    try:
        response = requests.get(f"{API_URL}/teams/{team_id}", headers=headers)
        if response.status_code == 200:
            data = response.json()
            if data["id"] == team_id and data["name"] == team_data["name"]:
                print("✅ Get team by ID successful")
            else:
                print("❌ Team data doesn't match expected values")
                return False
        else:
            print(f"❌ Get team by ID failed with status code {response.status_code}")
            print(f"Response: {response.text}")
            return False
    except Exception as e:
        print(f"❌ Error getting team by ID: {str(e)}")
        return False
    
    # Test update team
    print("\nTesting update team...")
    update_data = {
        "name": f"Updated Team {generate_random_string()}",
        "formation": "2"  # Using another formation ID
    }
    try:
        response = requests.put(f"{API_URL}/teams/{team_id}", json=update_data, headers=headers)
        if response.status_code == 200:
            data = response.json()
            if data["id"] == team_id and data["name"] == update_data["name"] and data["formation"] == update_data["formation"]:
                print("✅ Update team successful")
            else:
                print("❌ Updated team data doesn't match expected values")
                return False
        else:
            print(f"❌ Update team failed with status code {response.status_code}")
            print(f"Response: {response.text}")
            return False
    except Exception as e:
        print(f"❌ Error updating team: {str(e)}")
        return False
    
    # Test delete team
    print("\nTesting delete team...")
    try:
        response = requests.delete(f"{API_URL}/teams/{team_id}", headers=headers)
        if response.status_code == 200:
            data = response.json()
            if "message" in data:
                print("✅ Delete team successful")
            else:
                print("❌ Delete team response missing message")
                return False
        else:
            print(f"❌ Delete team failed with status code {response.status_code}")
            print(f"Response: {response.text}")
            return False
    except Exception as e:
        print(f"❌ Error deleting team: {str(e)}")
        return False
    
    return True

def test_unauthorized_access():
    """Test accessing protected endpoints without authentication"""
    print("\n--- Testing Unauthorized Access ---")
    
    # Test accessing /api/auth/me without token
    print("\nTesting access to /api/auth/me without token...")
    try:
        response = requests.get(f"{API_URL}/auth/me")
        if response.status_code in [401, 403]:
            print("✅ Unauthorized access to /api/auth/me properly rejected")
        else:
            print(f"❌ Unauthorized access to /api/auth/me returned unexpected status code {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Error testing unauthorized access to /api/auth/me: {str(e)}")
        return False
    
    # Test accessing /api/teams without token
    print("\nTesting access to /api/teams without token...")
    try:
        response = requests.get(f"{API_URL}/teams")
        if response.status_code in [401, 403]:
            print("✅ Unauthorized access to /api/teams properly rejected")
        else:
            print(f"❌ Unauthorized access to /api/teams returned unexpected status code {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Error testing unauthorized access to /api/teams: {str(e)}")
        return False
    
    return True

def run_tests():
    """Run all tests"""
    print("\n=== Starting API Tests ===\n")
    
    # Test API root
    api_root_success = test_api_root()
    
    # Test unauthorized access
    unauthorized_success = test_unauthorized_access()
    
    # Test authentication endpoints
    auth_result = test_auth_endpoints()
    if auth_result:
        auth_token, user_id = auth_result
        auth_success = True
    else:
        auth_success = False
        auth_token, user_id = None, None
    
    # Test teams endpoints
    if auth_success:
        teams_success = test_teams_endpoints(auth_token, user_id)
    else:
        teams_success = False
    
    # Print summary
    print("\n=== Test Summary ===")
    print(f"API Root Endpoint: {'✅ PASSED' if api_root_success else '❌ FAILED'}")
    print(f"Unauthorized Access: {'✅ PASSED' if unauthorized_success else '❌ FAILED'}")
    print(f"Authentication Endpoints: {'✅ PASSED' if auth_success else '❌ FAILED'}")
    print(f"Teams Endpoints: {'✅ PASSED' if teams_success else '❌ FAILED'}")
    
    overall_success = api_root_success and unauthorized_success and auth_success and teams_success
    print(f"\nOverall Test Result: {'✅ PASSED' if overall_success else '❌ FAILED'}")
    
    return overall_success

if __name__ == "__main__":
    run_tests()