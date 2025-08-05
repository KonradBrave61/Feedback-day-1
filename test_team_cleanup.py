#!/usr/bin/env python3
import requests
import json
import os

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

def create_test_user_and_get_token():
    """Create a test user and get authentication token"""
    import random
    import string
    
    def generate_random_string(length=8):
        letters = string.ascii_lowercase
        return ''.join(random.choice(letters) for i in range(length))
    
    random_suffix = generate_random_string()
    user_data = {
        "username": f"cleanup_user_{random_suffix}",
        "email": f"cleanup_{random_suffix}@example.com",
        "password": "CleanupUser123!",
        "coach_level": 1,
        "favorite_position": "FW",
        "favorite_element": "Fire",
        "favourite_team": "Raimon"
    }
    
    try:
        response = requests.post(f"{API_URL}/auth/register", json=user_data)
        if response.status_code == 200:
            data = response.json()
            return data["access_token"], data["user"]["id"]
        else:
            print(f"Failed to create test user: {response.status_code} - {response.text}")
            return None, None
    except Exception as e:
        print(f"Error creating test user: {e}")
        return None, None

def list_all_teams():
    """List all teams in the system"""
    print("\n=== LISTING ALL TEAMS IN THE SYSTEM ===")
    
    # First, try to get teams without authentication (community teams)
    try:
        response = requests.get(f"{API_URL}/community/teams")
        if response.status_code == 200:
            teams = response.json()
            print(f"Found {len(teams)} community teams:")
            
            test_teams = []
            for team in teams:
                team_name = team.get('name', '').lower()
                team_id = team.get('id')
                username = team.get('username', '')
                
                # Check if this looks like a test team
                is_test_team = any(keyword in team_name for keyword in [
                    'test', 'comprehensive', 'demo', 'sample', 'example', 
                    'teambuilder', 'api', 'cleanup', 'temp'
                ])
                
                print(f"  - ID: {team_id}")
                print(f"    Name: {team.get('name')}")
                print(f"    Owner: {username}")
                print(f"    Public: {team.get('is_public', False)}")
                print(f"    Description: {team.get('description', 'N/A')}")
                print(f"    Tags: {team.get('tags', [])}")
                print(f"    Likes: {team.get('likes', 0)}")
                print(f"    Views: {team.get('views', 0)}")
                print(f"    Created: {team.get('created_at', 'N/A')}")
                
                if is_test_team:
                    test_teams.append({
                        'id': team_id,
                        'name': team.get('name'),
                        'username': username,
                        'reason': f"Contains test keyword in name: '{team_name}'"
                    })
                    print(f"    ⚠️  IDENTIFIED AS TEST TEAM: Contains test keywords")
                
                print()
            
            return test_teams
            
        else:
            print(f"Failed to get community teams: {response.status_code} - {response.text}")
            return []
            
    except Exception as e:
        print(f"Error listing teams: {e}")
        return []

def delete_test_team(team_id, auth_token):
    """Delete a specific team by ID"""
    print(f"\n=== ATTEMPTING TO DELETE TEAM {team_id} ===")
    
    headers = {"Authorization": f"Bearer {auth_token}"}
    
    try:
        # First, try to get team details to confirm it exists
        response = requests.get(f"{API_URL}/teams/{team_id}", headers=headers)
        if response.status_code == 200:
            team = response.json()
            print(f"Team found: {team.get('name')} (Owner: {team.get('username', 'Unknown')})")
        elif response.status_code == 404:
            print(f"Team {team_id} not found or already deleted")
            return True
        else:
            print(f"Error getting team details: {response.status_code} - {response.text}")
        
        # Attempt to delete the team
        response = requests.delete(f"{API_URL}/teams/{team_id}", headers=headers)
        
        if response.status_code == 200:
            print(f"✅ Successfully deleted team {team_id}")
            return True
        elif response.status_code == 403:
            print(f"❌ Access denied - Cannot delete team {team_id} (not owner or insufficient permissions)")
            return False
        elif response.status_code == 404:
            print(f"✅ Team {team_id} not found (may already be deleted)")
            return True
        else:
            print(f"❌ Failed to delete team {team_id}: {response.status_code} - {response.text}")
            return False
            
    except Exception as e:
        print(f"Error deleting team {team_id}: {e}")
        return False

def confirm_team_removal(team_id):
    """Confirm that a team has been removed"""
    print(f"\n=== CONFIRMING REMOVAL OF TEAM {team_id} ===")
    
    try:
        # Try to get the team from community endpoint
        response = requests.get(f"{API_URL}/community/teams")
        if response.status_code == 200:
            teams = response.json()
            team_found = any(team.get('id') == team_id for team in teams)
            
            if not team_found:
                print(f"✅ Confirmed: Team {team_id} is no longer in community teams list")
                return True
            else:
                print(f"❌ Team {team_id} still appears in community teams list")
                return False
        else:
            print(f"Could not verify removal: {response.status_code} - {response.text}")
            return False
            
    except Exception as e:
        print(f"Error confirming removal: {e}")
        return False

def main():
    """Main function to clean up test teams"""
    print("🧹 TEAM CLEANUP UTILITY")
    print("=" * 50)
    
    # Step 1: List all teams and identify test teams
    test_teams = list_all_teams()
    
    if not test_teams:
        print("\n✅ No test teams found that need cleanup!")
        return
    
    print(f"\n🎯 IDENTIFIED {len(test_teams)} TEST TEAMS FOR CLEANUP:")
    for i, team in enumerate(test_teams, 1):
        print(f"{i}. Team ID: {team['id']}")
        print(f"   Name: {team['name']}")
        print(f"   Owner: {team['username']}")
        print(f"   Reason: {team['reason']}")
        print()
    
    # Step 2: Create authentication token for deletion attempts
    print("🔑 Creating authentication token for cleanup operations...")
    auth_token, user_id = create_test_user_and_get_token()
    
    if not auth_token:
        print("❌ Could not create authentication token. Cannot proceed with deletions.")
        print("Note: Test teams can only be deleted by their owners or administrators.")
        return
    
    print(f"✅ Authentication token created for user {user_id}")
    
    # Step 3: Attempt to delete each test team
    successful_deletions = 0
    failed_deletions = 0
    
    for team in test_teams:
        success = delete_test_team(team['id'], auth_token)
        if success:
            successful_deletions += 1
            # Confirm removal
            confirm_team_removal(team['id'])
        else:
            failed_deletions += 1
    
    # Step 4: Summary
    print(f"\n📊 CLEANUP SUMMARY:")
    print(f"✅ Successfully processed: {successful_deletions}")
    print(f"❌ Failed to delete: {failed_deletions}")
    print(f"📝 Total test teams found: {len(test_teams)}")
    
    if failed_deletions > 0:
        print(f"\n⚠️  NOTE: {failed_deletions} teams could not be deleted.")
        print("This is normal if the teams belong to other users.")
        print("Only team owners can delete their own teams.")
    
    # Step 5: Final verification - list teams again
    print(f"\n🔍 FINAL VERIFICATION - Listing remaining teams:")
    remaining_test_teams = list_all_teams()
    
    if len(remaining_test_teams) < len(test_teams):
        print(f"✅ Progress made: Reduced from {len(test_teams)} to {len(remaining_test_teams)} test teams")
    elif len(remaining_test_teams) == 0:
        print("🎉 All test teams have been cleaned up!")
    else:
        print(f"ℹ️  {len(remaining_test_teams)} test teams remain (may belong to other users)")

if __name__ == "__main__":
    main()