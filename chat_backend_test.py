#!/usr/bin/env python3
"""
Backend Smoke Tests for Chat Endpoints and Updated Comments
Focus: Newly added chat functionality and comment parent_id feature
"""

import requests
import json
import uuid
from datetime import datetime
import os

# Get backend URL from environment
BACKEND_URL = os.environ.get('REACT_APP_BACKEND_URL', 'https://chat-hub-20.preview.emergentagent.com')
API_BASE = f"{BACKEND_URL}/api"

class BackendTester:
    def __init__(self):
        self.session = requests.Session()
        self.user_a_token = None
        self.user_b_token = None
        self.user_a_id = None
        self.user_b_id = None
        self.conversation_id = None
        self.team_id = None
        self.test_results = []
        
    def log_result(self, test_name, success, details="", response_code=None):
        """Log test result"""
        status = "✅ PASS" if success else "❌ FAIL"
        result = {
            "test": test_name,
            "status": status,
            "details": details,
            "response_code": response_code
        }
        self.test_results.append(result)
        print(f"{status}: {test_name}")
        if details:
            print(f"   Details: {details}")
        if response_code:
            print(f"   Response Code: {response_code}")
        print()

    def register_and_login_users(self):
        """Register and login two test users (A follows B)"""
        print("=== STEP 1: User Registration and Authentication ===")
        
        # Generate unique usernames
        timestamp = str(int(datetime.now().timestamp()))
        user_a_email = f"user_a_{timestamp}@test.com"
        user_b_email = f"user_b_{timestamp}@test.com"
        
        # Register User A
        try:
            user_a_data = {
                "username": f"UserA_{timestamp}",
                "email": user_a_email,
                "password": "testpass123",
                "coach_level": 5,
                "favorite_position": "MF",
                "favorite_element": "Fire",
                "favourite_team": "Raimon"
            }
            
            response = self.session.post(f"{API_BASE}/auth/register", json=user_a_data)
            if response.status_code in [200, 201]:
                self.user_a_token = response.json()["access_token"]
                self.user_a_id = response.json()["user"]["id"]
                self.log_result("User A Registration", True, f"User ID: {self.user_a_id}", response.status_code)
            else:
                self.log_result("User A Registration", False, response.text, response.status_code)
                return False
                
        except Exception as e:
            self.log_result("User A Registration", False, str(e))
            return False
            
        # Register User B
        try:
            user_b_data = {
                "username": f"UserB_{timestamp}",
                "email": user_b_email,
                "password": "testpass123",
                "coach_level": 3,
                "favorite_position": "FW",
                "favorite_element": "Wind",
                "favourite_team": "Zeus"
            }
            
            response = self.session.post(f"{API_BASE}/auth/register", json=user_b_data)
            if response.status_code == 201:
                self.user_b_token = response.json()["access_token"]
                self.user_b_id = response.json()["user"]["id"]
                self.log_result("User B Registration", True, f"User ID: {self.user_b_id}", 201)
            else:
                self.log_result("User B Registration", False, response.text, response.status_code)
                return False
                
        except Exception as e:
            self.log_result("User B Registration", False, str(e))
            return False
            
        # User A follows User B
        try:
            headers = {"Authorization": f"Bearer {self.user_a_token}"}
            follow_data = {"user_id": self.user_b_id}
            
            response = self.session.post(f"{API_BASE}/community/follow", json=follow_data, headers=headers)
            if response.status_code == 200:
                self.log_result("User A follows User B", True, "Follow relationship established", 200)
                return True
            else:
                self.log_result("User A follows User B", False, response.text, response.status_code)
                return False
                
        except Exception as e:
            self.log_result("User A follows User B", False, str(e))
            return False

    def test_chat_start(self):
        """Test POST /api/chat/start with partner_id"""
        print("=== STEP 2: Chat Start Endpoint ===")
        
        try:
            headers = {"Authorization": f"Bearer {self.user_a_token}"}
            data = {"partner_id": self.user_b_id}
            
            response = self.session.post(f"{API_BASE}/chat/start", json=data, headers=headers)
            
            if response.status_code == 200:
                result = response.json()
                if result.get("success") and "conversation" in result:
                    self.conversation_id = result["conversation"]["id"]
                    participants = result["conversation"].get("participants", [])
                    
                    if self.user_a_id in participants and self.user_b_id in participants:
                        self.log_result("POST /api/chat/start", True, 
                                      f"Conversation created: {self.conversation_id}", 200)
                        return True
                    else:
                        self.log_result("POST /api/chat/start", False, 
                                      "Participants not correctly set", 200)
                        return False
                else:
                    self.log_result("POST /api/chat/start", False, 
                                  "Invalid response structure", 200)
                    return False
            else:
                self.log_result("POST /api/chat/start", False, response.text, response.status_code)
                return False
                
        except Exception as e:
            self.log_result("POST /api/chat/start", False, str(e))
            return False

    def test_chat_conversations(self):
        """Test GET /api/chat/conversations"""
        print("=== STEP 3: Chat Conversations List ===")
        
        try:
            headers = {"Authorization": f"Bearer {self.user_a_token}"}
            
            response = self.session.get(f"{API_BASE}/chat/conversations", headers=headers)
            
            if response.status_code == 200:
                result = response.json()
                if result.get("success") and "conversations" in result:
                    conversations = result["conversations"]
                    
                    # Find our conversation
                    our_convo = None
                    for convo in conversations:
                        if convo["id"] == self.conversation_id:
                            our_convo = convo
                            break
                    
                    if our_convo:
                        # Check partner info
                        partner = our_convo.get("partner", {})
                        if partner.get("id") == self.user_b_id and partner.get("username"):
                            self.log_result("GET /api/chat/conversations", True, 
                                          f"Found conversation with partner info", 200)
                            return True
                        else:
                            self.log_result("GET /api/chat/conversations", False, 
                                          "Partner info incomplete", 200)
                            return False
                    else:
                        self.log_result("GET /api/chat/conversations", False, 
                                      "Conversation not found in list", 200)
                        return False
                else:
                    self.log_result("GET /api/chat/conversations", False, 
                                  "Invalid response structure", 200)
                    return False
            else:
                self.log_result("GET /api/chat/conversations", False, response.text, response.status_code)
                return False
                
        except Exception as e:
            self.log_result("GET /api/chat/conversations", False, str(e))
            return False

    def test_send_message(self):
        """Test POST /api/chat/conversations/{id}/messages"""
        print("=== STEP 4: Send Message ===")
        
        try:
            headers = {"Authorization": f"Bearer {self.user_a_token}"}
            data = {"content": "Hello from User A! This is a test message."}
            
            response = self.session.post(
                f"{API_BASE}/chat/conversations/{self.conversation_id}/messages", 
                json=data, 
                headers=headers
            )
            
            if response.status_code == 200:
                result = response.json()
                if result.get("success") and "message" in result:
                    message = result["message"]
                    if (message.get("sender_id") == self.user_a_id and 
                        message.get("receiver_id") == self.user_b_id and
                        message.get("content") == data["content"]):
                        self.log_result("POST /api/chat/conversations/{id}/messages", True, 
                                      "Message sent successfully", 200)
                        return True
                    else:
                        self.log_result("POST /api/chat/conversations/{id}/messages", False, 
                                      "Message data incorrect", 200)
                        return False
                else:
                    self.log_result("POST /api/chat/conversations/{id}/messages", False, 
                                  "Invalid response structure", 200)
                    return False
            else:
                self.log_result("POST /api/chat/conversations/{id}/messages", False, 
                              response.text, response.status_code)
                return False
                
        except Exception as e:
            self.log_result("POST /api/chat/conversations/{id}/messages", False, str(e))
            return False

    def test_get_messages(self):
        """Test GET /api/chat/conversations/{id}/messages"""
        print("=== STEP 5: Get Messages ===")
        
        try:
            headers = {"Authorization": f"Bearer {self.user_a_token}"}
            
            response = self.session.get(
                f"{API_BASE}/chat/conversations/{self.conversation_id}/messages", 
                headers=headers
            )
            
            if response.status_code == 200:
                result = response.json()
                if result.get("success") and "messages" in result:
                    messages = result["messages"]
                    if len(messages) > 0:
                        # Check if our message is there
                        found_message = False
                        for msg in messages:
                            if (msg.get("sender_id") == self.user_a_id and 
                                "Hello from User A!" in msg.get("content", "")):
                                found_message = True
                                break
                        
                        if found_message:
                            self.log_result("GET /api/chat/conversations/{id}/messages", True, 
                                          f"Retrieved {len(messages)} messages", 200)
                            return True
                        else:
                            self.log_result("GET /api/chat/conversations/{id}/messages", False, 
                                          "Sent message not found", 200)
                            return False
                    else:
                        self.log_result("GET /api/chat/conversations/{id}/messages", False, 
                                      "No messages returned", 200)
                        return False
                else:
                    self.log_result("GET /api/chat/conversations/{id}/messages", False, 
                                  "Invalid response structure", 200)
                    return False
            else:
                self.log_result("GET /api/chat/conversations/{id}/messages", False, 
                              response.text, response.status_code)
                return False
                
        except Exception as e:
            self.log_result("GET /api/chat/conversations/{id}/messages", False, str(e))
            return False

    def test_block_user(self):
        """Test POST /api/chat/block"""
        print("=== STEP 6: Block User ===")
        
        try:
            headers = {"Authorization": f"Bearer {self.user_a_token}"}
            data = {"user_id": self.user_b_id}
            
            response = self.session.post(f"{API_BASE}/chat/block", json=data, headers=headers)
            
            if response.status_code == 200:
                result = response.json()
                if result.get("success") and result.get("blocked") == True:
                    self.log_result("POST /api/chat/block", True, "User blocked successfully", 200)
                    return True
                else:
                    self.log_result("POST /api/chat/block", False, "Block status not confirmed", 200)
                    return False
            else:
                self.log_result("POST /api/chat/block", False, response.text, response.status_code)
                return False
                
        except Exception as e:
            self.log_result("POST /api/chat/block", False, str(e))
            return False

    def test_blocked_message_attempt(self):
        """Test that sending message fails when blocked"""
        print("=== STEP 7: Blocked Message Attempt ===")
        
        try:
            headers = {"Authorization": f"Bearer {self.user_a_token}"}
            data = {"content": "This message should be blocked"}
            
            response = self.session.post(
                f"{API_BASE}/chat/conversations/{self.conversation_id}/messages", 
                json=data, 
                headers=headers
            )
            
            if response.status_code == 403:
                self.log_result("Blocked Message Attempt", True, 
                              "Message correctly blocked with 403", 403)
                return True
            else:
                self.log_result("Blocked Message Attempt", False, 
                              f"Expected 403, got {response.status_code}", response.status_code)
                return False
                
        except Exception as e:
            self.log_result("Blocked Message Attempt", False, str(e))
            return False

    def test_unblock_user(self):
        """Test POST /api/chat/unblock"""
        print("=== STEP 8: Unblock User ===")
        
        try:
            headers = {"Authorization": f"Bearer {self.user_a_token}"}
            data = {"user_id": self.user_b_id}
            
            response = self.session.post(f"{API_BASE}/chat/unblock", json=data, headers=headers)
            
            if response.status_code == 200:
                result = response.json()
                if result.get("success") and result.get("blocked") == False:
                    self.log_result("POST /api/chat/unblock", True, "User unblocked successfully", 200)
                    return True
                else:
                    self.log_result("POST /api/chat/unblock", False, "Unblock status not confirmed", 200)
                    return False
            else:
                self.log_result("POST /api/chat/unblock", False, response.text, response.status_code)
                return False
                
        except Exception as e:
            self.log_result("POST /api/chat/unblock", False, str(e))
            return False

    def test_unblocked_message(self):
        """Test that messaging works again after unblock"""
        print("=== STEP 9: Unblocked Message Test ===")
        
        try:
            headers = {"Authorization": f"Bearer {self.user_a_token}"}
            data = {"content": "This message should work after unblock"}
            
            response = self.session.post(
                f"{API_BASE}/chat/conversations/{self.conversation_id}/messages", 
                json=data, 
                headers=headers
            )
            
            if response.status_code == 200:
                result = response.json()
                if result.get("success"):
                    self.log_result("Unblocked Message Test", True, 
                                  "Message sent successfully after unblock", 200)
                    return True
                else:
                    self.log_result("Unblocked Message Test", False, 
                                  "Message failed despite unblock", 200)
                    return False
            else:
                self.log_result("Unblocked Message Test", False, 
                              response.text, response.status_code)
                return False
                
        except Exception as e:
            self.log_result("Unblocked Message Test", False, str(e))
            return False

    def test_chat_settings(self):
        """Test PUT /api/chat/settings"""
        print("=== STEP 10: Chat Settings ===")
        
        try:
            headers = {"Authorization": f"Bearer {self.user_a_token}"}
            data = {
                "accept_messages_from": "following",
                "read_receipts": True,
                "notifications": True
            }
            
            response = self.session.put(f"{API_BASE}/chat/settings", json=data, headers=headers)
            
            if response.status_code == 200:
                result = response.json()
                if result.get("success"):
                    self.log_result("PUT /api/chat/settings", True, 
                                  "Settings updated successfully", 200)
                    return True
                else:
                    self.log_result("PUT /api/chat/settings", False, 
                                  "Settings update not confirmed", 200)
                    return False
            else:
                self.log_result("PUT /api/chat/settings", False, response.text, response.status_code)
                return False
                
        except Exception as e:
            self.log_result("PUT /api/chat/settings", False, str(e))
            return False

    def create_test_team(self):
        """Create a test team for comment testing"""
        print("=== STEP 11: Create Test Team for Comments ===")
        
        try:
            headers = {"Authorization": f"Bearer {self.user_a_token}"}
            team_data = {
                "name": "Test Team for Comments",
                "formation": "4-4-2",
                "players": [
                    {
                        "character_id": "char1",
                        "position_id": "pos1",
                        "user_level": 99,
                        "user_rarity": "Legendary"
                    }
                ],
                "description": "A test team for comment functionality",
                "is_public": True,
                "tags": ["test", "comments"]
            }
            
            response = self.session.post(f"{API_BASE}/teams", json=team_data, headers=headers)
            
            if response.status_code == 201:
                result = response.json()
                self.team_id = result["id"]
                self.log_result("Create Test Team", True, f"Team ID: {self.team_id}", 201)
                return True
            else:
                self.log_result("Create Test Team", False, response.text, response.status_code)
                return False
                
        except Exception as e:
            self.log_result("Create Test Team", False, str(e))
            return False

    def test_comment_with_parent_id(self):
        """Test POST /api/teams/{team_id}/comment with optional parent_id"""
        print("=== STEP 12: Comment with Parent ID ===")
        
        if not self.team_id:
            self.log_result("Comment with Parent ID", False, "No team ID available")
            return False
        
        try:
            headers = {"Authorization": f"Bearer {self.user_b_token}"}
            
            # First, add a parent comment
            parent_comment_data = {
                "content": "This is a parent comment on the team!"
            }
            
            response = self.session.post(
                f"{API_BASE}/teams/{self.team_id}/comment", 
                json=parent_comment_data, 
                headers=headers
            )
            
            if response.status_code != 200:
                self.log_result("Comment with Parent ID", False, 
                              f"Parent comment failed: {response.text}", response.status_code)
                return False
            
            parent_result = response.json()
            parent_comment_id = parent_result["comment"]["id"]
            
            # Now add a reply with parent_id
            reply_comment_data = {
                "content": "This is a reply to the parent comment!",
                "parent_id": parent_comment_id
            }
            
            response = self.session.post(
                f"{API_BASE}/teams/{self.team_id}/comment", 
                json=reply_comment_data, 
                headers=headers
            )
            
            if response.status_code == 200:
                result = response.json()
                comment = result.get("comment", {})
                
                if (comment.get("content") == reply_comment_data["content"] and 
                    comment.get("parent_id") == parent_comment_id):
                    self.log_result("POST /api/teams/{team_id}/comment with parent_id", True, 
                                  f"Reply comment created with parent_id: {parent_comment_id}", 200)
                    return True
                else:
                    self.log_result("POST /api/teams/{team_id}/comment with parent_id", False, 
                                  "Comment data incorrect", 200)
                    return False
            else:
                self.log_result("POST /api/teams/{team_id}/comment with parent_id", False, 
                              response.text, response.status_code)
                return False
                
        except Exception as e:
            self.log_result("POST /api/teams/{team_id}/comment with parent_id", False, str(e))
            return False

    def run_all_tests(self):
        """Run all backend smoke tests"""
        print("🚀 STARTING BACKEND SMOKE TESTS FOR CHAT ENDPOINTS AND COMMENTS")
        print("=" * 70)
        
        # Step 1: Authentication setup
        if not self.register_and_login_users():
            print("❌ Authentication setup failed. Stopping tests.")
            return False
        
        # Step 2-10: Chat functionality tests
        chat_tests = [
            self.test_chat_start,
            self.test_chat_conversations,
            self.test_send_message,
            self.test_get_messages,
            self.test_block_user,
            self.test_blocked_message_attempt,
            self.test_unblock_user,
            self.test_unblocked_message,
            self.test_chat_settings
        ]
        
        for test in chat_tests:
            if not test():
                print(f"❌ Chat test failed: {test.__name__}")
        
        # Step 11-12: Comment functionality tests
        if self.create_test_team():
            self.test_comment_with_parent_id()
        
        # Print summary
        self.print_summary()
        
        return True

    def print_summary(self):
        """Print test summary"""
        print("\n" + "=" * 70)
        print("📊 TEST SUMMARY")
        print("=" * 70)
        
        passed = sum(1 for result in self.test_results if "✅ PASS" in result["status"])
        failed = sum(1 for result in self.test_results if "❌ FAIL" in result["status"])
        total = len(self.test_results)
        
        print(f"Total Tests: {total}")
        print(f"Passed: {passed} ✅")
        print(f"Failed: {failed} ❌")
        print(f"Success Rate: {(passed/total*100):.1f}%")
        
        if failed > 0:
            print("\n🚨 FAILED TESTS:")
            for result in self.test_results:
                if "❌ FAIL" in result["status"]:
                    print(f"  - {result['test']}: {result['details']}")
        
        print("\n📋 DETAILED RESULTS:")
        for result in self.test_results:
            print(f"{result['status']}: {result['test']}")
            if result['details']:
                print(f"   {result['details']}")

if __name__ == "__main__":
    tester = BackendTester()
    tester.run_all_tests()