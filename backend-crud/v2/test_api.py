#!/usr/bin/env python3
"""
Comprehensive API Test Suite for StudyAid Backend
Tests all endpoints with proper authentication and data validation
"""

import requests
import json
import time
from datetime import datetime

# Configuration
BASE_URL = "http://localhost:5000/api"
AUTH_URL = "http://localhost:5000/api/auth"

class APITester:
    def __init__(self):
        self.session = requests.Session()
        self.access_token = None
        self.user_data = {}
        self.test_data = {}
        
    def print_test(self, test_name, status_code, response_data=None):
        """Print test results with formatting"""
        status_icon = "✅" if 200 <= status_code < 300 else "❌"
        print(f"{status_icon} {test_name} - Status: {status_code}")
        if response_data and status_code >= 400:
            print(f"   Error: {response_data}")
        print()

    def set_auth_header(self):
        """Set authorization header if token exists"""
        if self.access_token:
            self.session.headers.update({
                'Authorization': f'Bearer {self.access_token}',
                'Content-Type': 'application/json'
            })

    # ==================== AUTHENTICATION TESTS ====================
    
    def test_register(self):
        """Test user registration"""
        print("🔐 TESTING AUTHENTICATION ENDPOINTS")
        print("=" * 50)
        
        # Test 1: Register new user
        user_data = {
            "username": f"testuser_{int(time.time())}",
            "email": f"testuser_{int(time.time())}@example.com",
            "password": "testpassword123"
        }
        
        response = self.session.post(f"{AUTH_URL}/register", json=user_data)
        self.print_test("Register User", response.status_code, response.json() if response.status_code != 201 else None)
        
        if response.status_code == 201:
            self.user_data = response.json()
            return True
        return False

    def test_login(self):
        """Test user login"""
        login_data = {
            "email": self.user_data.get('email', "testuser@example.com"),
            "password": "testpassword123"
        }
        
        response = self.session.post(f"{AUTH_URL}/login", json=login_data)
        self.print_test("Login User", response.status_code, response.json() if response.status_code != 200 else None)
        
        if response.status_code == 200:
            data = response.json()
            self.access_token = data.get('access_token')
            self.set_auth_header()
            return True
        return False

    def test_reset_password_request(self):
        """Test password reset request"""
        reset_data = {
            "email": self.user_data.get('email', "testuser@example.com")
        }
        
        response = self.session.post(f"{AUTH_URL}/reset-password-request", json=reset_data)
        self.print_test("Password Reset Request", response.status_code, response.json() if response.status_code != 200 else None)
        
        if response.status_code == 200:
            self.test_data['reset_token'] = response.json().get('token')
            return True
        return False

    def test_reset_password(self):
        """Test password reset"""
        if not self.test_data.get('reset_token'):
            print("❌ Password Reset - Skipped (no reset token)")
            return False
            
        reset_data = {
            "token": self.test_data['reset_token'],
            "new_password": "newpassword123"
        }
        
        response = self.session.post(f"{AUTH_URL}/reset-password", json=reset_data)
        self.print_test("Password Reset", response.status_code, response.json() if response.status_code != 200 else None)
        return response.status_code == 200

    # ==================== USER TESTS ====================
    
    def test_user_endpoints(self):
        """Test user management endpoints"""
        print("👤 TESTING USER ENDPOINTS")
        print("=" * 50)
        
        # Test 1: Get all users
        response = self.session.get(f"{BASE_URL}/users")
        self.print_test("Get All Users", response.status_code)
        
        # Test 2: Get specific user
        if self.user_data.get('id'):
            response = self.session.get(f"{BASE_URL}/users/{self.user_data['id']}")
            self.print_test("Get User by ID", response.status_code)
        
        # Test 3: Update user
        update_data = {
            "username": f"updateduser_{int(time.time())}"
        }
        if self.user_data.get('id'):
            response = self.session.put(f"{BASE_URL}/users/{self.user_data['id']}", json=update_data)
            self.print_test("Update User", response.status_code, response.json() if response.status_code != 200 else None)

    # ==================== COLLECTION TESTS ====================
    
    def test_collection_endpoints(self):
        """Test collection management endpoints"""
        print("📚 TESTING COLLECTION ENDPOINTS")
        print("=" * 50)
        
        # Test 1: Create collections
        collections_data = [
            {
                "title": f"Test Collection 1_{int(time.time())}",
                "description": "Test collection description",
                "timestamp": datetime.now().strftime('%Y-%m-%dT%H:%M:%S')
            },
            {
                "title": f"Test Collection 2_{int(time.time())}",
                "description": "Another test collection",
                "timestamp": datetime.now().strftime('%Y-%m-%dT%H:%M:%S')
            }
        ]
        
        response = self.session.post(f"{BASE_URL}/collections", json=collections_data)
        self.print_test("Create Collections", response.status_code, response.json() if response.status_code != 201 else None)
        
        if response.status_code == 201:
            data = response.json()
            self.test_data['collections'] = data.get('collections', [])
            
            # Test 2: Get all collections
            response = self.session.get(f"{BASE_URL}/collections")
            self.print_test("Get All Collections", response.status_code)
            
            # Test 3: Get specific collection
            if self.test_data['collections']:
                collection_id = self.test_data['collections'][0]['id']
                response = self.session.get(f"{BASE_URL}/collections/{collection_id}")
                self.print_test("Get Collection by ID", response.status_code)
                
                # Test 4: Update collection
                update_data = {
                    "title": f"Updated Collection_{int(time.time())}",
                    "description": "Updated description"
                }
                response = self.session.put(f"{BASE_URL}/collections/{collection_id}", json=update_data)
                self.print_test("Update Collection", response.status_code, response.json() if response.status_code != 200 else None)
                
                # Test 5: Get collaborators
                response = self.session.get(f"{BASE_URL}/collections/{collection_id}/collaborators")
                self.print_test("Get Collection Collaborators", response.status_code)
                
                # Store collection ID for later tests
                self.test_data['collection_id'] = collection_id

    # ==================== HIGHLIGHT TESTS ====================
    
    def test_highlight_endpoints(self):
        """Test highlight management endpoints"""
        print("🔍 TESTING HIGHLIGHT ENDPOINTS")
        print("=" * 50)
        
        # Test 1: Create highlight
        highlight_data = {
            "url": "https://example.com/test-article",
            "text": "This is a test highlight text that contains important information.",
            "timestamp": datetime.now().strftime('%Y-%m-%dT%H:%M:%S')
        }
        
        response = self.session.post(f"{BASE_URL}/highlights", json=highlight_data)
        self.print_test("Create Highlight", response.status_code, response.json() if response.status_code != 201 else None)
        
        if response.status_code == 201:
            data = response.json()
            highlight_id = data.get('highlight', {}).get('id')
            self.test_data['highlight_id'] = highlight_id
            
            # Test 2: Get all highlights
            response = self.session.get(f"{BASE_URL}/highlights")
            self.print_test("Get All Highlights", response.status_code)
            
            # Test 3: Get highlight by ID
            if highlight_id:
                response = self.session.get(f"{BASE_URL}/highlights/{highlight_id}")
                self.print_test("Get Highlight by ID", response.status_code)
                
                # Test 4: Update highlight
                update_data = {
                    "text": "Updated highlight text with new information."
                }
                response = self.session.put(f"{BASE_URL}/highlights/{highlight_id}", json=update_data)
                self.print_test("Update Highlight", response.status_code, response.json() if response.status_code != 200 else None)
                
                # Test 5: Add highlight to collection
                if self.test_data.get('collection_id'):
                    response = self.session.post(f"{BASE_URL}/collections/{self.test_data['collection_id']}/highlights", json=[highlight_id])
                    self.print_test("Add Highlight to Collection", response.status_code, response.json() if response.status_code != 200 else None)
                    
                    # Test 6: Get highlights by collection
                    response = self.session.get(f"{BASE_URL}/collections/{self.test_data['collection_id']}/highlights")
                    self.print_test("Get Highlights by Collection", response.status_code)

    # ==================== SUMMARY TESTS ====================
    
    def test_summary_endpoints(self):
        """Test summary management endpoints"""
        print("📝 TESTING SUMMARY ENDPOINTS")
        print("=" * 50)
        
        if not self.test_data.get('collection_id'):
            print("❌ Summary tests skipped - no collection available")
            return
        
        # Test 1: Create summary
        summary_data = {
            "content": "This is a test summary of the collection content.",
            "timestamp": datetime.now().strftime('%Y-%m-%dT%H:%M:%S'),
            "collection_id": self.test_data['collection_id'],
            "highlight_ids": [self.test_data.get('highlight_id')] if self.test_data.get('highlight_id') else []
        }
        
        response = self.session.post(f"{BASE_URL}/summaries", json=summary_data)
        self.print_test("Create Summary", response.status_code, response.json() if response.status_code != 201 else None)
        
        if response.status_code == 201:
            data = response.json()
            summary_id = data.get('id')
            self.test_data['summary_id'] = summary_id
            
            # Test 2: Get all summaries
            response = self.session.get(f"{BASE_URL}/summaries")
            self.print_test("Get All Summaries", response.status_code)
            
            # Test 3: Get summary by ID
            if summary_id:
                response = self.session.get(f"{BASE_URL}/summaries/{summary_id}")
                self.print_test("Get Summary by ID", response.status_code)
                
                # Test 4: Update summary
                update_data = {
                    "content": "Updated summary content with new information."
                }
                response = self.session.put(f"{BASE_URL}/summaries/{summary_id}", json=update_data)
                self.print_test("Update Summary", response.status_code, response.json() if response.status_code != 200 else None)
                
                # Test 5: Get summaries by collection
                response = self.session.get(f"{BASE_URL}/collections/{self.test_data['collection_id']}/summaries")
                self.print_test("Get Summaries by Collection", response.status_code)

    # ==================== QUIZ TESTS ====================
    
    def test_quiz_endpoints(self):
        """Test quiz management endpoints"""
        print("🧠 TESTING QUIZ ENDPOINTS")
        print("=" * 50)
        
        if not self.test_data.get('summary_id'):
            print("❌ Quiz tests skipped - no summary available")
            return
        
        # Test 1: Create quiz
        quiz_data = {
            "title": f"Test Quiz_{int(time.time())}",
            "questions": [
                {
                    "question": "What is the capital of France?",
                    "options": {"A": "London", "B": "Paris", "C": "Berlin", "D": "Madrid"},
                    "correct_answer": "B"
                },
                {
                    "question": "What is 2 + 2?",
                    "options": {"A": "3", "B": "4", "C": "5", "D": "6"},
                    "correct_answer": "B"
                }
            ],
            "timestamp": datetime.now().strftime('%Y-%m-%dT%H:%M:%S'),
            "summary_id": self.test_data['summary_id']
        }
        
        response = self.session.post(f"{BASE_URL}/quizzes", json=quiz_data)
        self.print_test("Create Quiz", response.status_code, response.json() if response.status_code != 201 else None)
        
        if response.status_code == 201:
            data = response.json()
            quiz_id = data.get('id')
            self.test_data['quiz_id'] = quiz_id
            
            # Test 2: Get all quizzes
            response = self.session.get(f"{BASE_URL}/quizzes")
            self.print_test("Get All Quizzes", response.status_code)
            
            # Test 3: Get quiz by ID
            if quiz_id:
                response = self.session.get(f"{BASE_URL}/quizzes/{quiz_id}")
                self.print_test("Get Quiz by ID", response.status_code)
                
                # Test 4: Get quiz by summary
                response = self.session.get(f"{BASE_URL}/summaries/{self.test_data['summary_id']}/quizzes")
                self.print_test("Get Quiz by Summary", response.status_code)

    # ==================== QUIZ ATTEMPT TESTS ====================
    
    def test_quiz_attempt_endpoints(self):
        """Test quiz attempt endpoints"""
        print("📊 TESTING QUIZ ATTEMPT ENDPOINTS")
        print("=" * 50)
        
        if not self.test_data.get('quiz_id'):
            print("❌ Quiz attempt tests skipped - no quiz available")
            return
        
        # Test 1: Submit quiz attempt
        attempt_data = {
            "answers": ["B", "B"]  # Correct answers for our test quiz
        }
        
        response = self.session.post(f"{BASE_URL}/quizzes/{self.test_data['quiz_id']}/attempt", json=attempt_data)
        self.print_test("Submit Quiz Attempt", response.status_code, response.json() if response.status_code != 201 else None)
        
        if response.status_code == 201:
            # Test 2: Get my attempt
            response = self.session.get(f"{BASE_URL}/quizzes/{self.test_data['quiz_id']}/my-attempt")
            self.print_test("Get My Quiz Attempt", response.status_code)
            
            # Test 3: Get all attempts for quiz
            response = self.session.get(f"{BASE_URL}/quizzes/{self.test_data['quiz_id']}/attempts")
            self.print_test("Get All Quiz Attempts", response.status_code)
            
            # Test 4: Get quiz leaderboard
            response = self.session.get(f"{BASE_URL}/quizzes/{self.test_data['quiz_id']}/leaderboard")
            self.print_test("Get Quiz Leaderboard", response.status_code)

    # ==================== ADMIN TESTS ====================
    
    def create_admin_user(self):
        """Login as the existing admin user for testing admin endpoints"""
        admin_data = {
            "email": "admin@test.com",
            "password": "adminpassword123"
        }
        
        # Login as admin
        response = self.session.post(f"{AUTH_URL}/login", json=admin_data)
        if response.status_code == 200:
            data = response.json()
            self.admin_token = data.get('access_token')
            self.admin_user_id = data.get('user', {}).get('id')
            return True
        return False

    def test_admin_endpoints(self):
        """Test admin management endpoints"""
        print("👑 TESTING ADMIN ENDPOINTS")
        print("=" * 50)
        
        # Create admin user first
        if self.create_admin_user():
            # Switch to admin session
            admin_session = requests.Session()
            admin_session.headers.update({
                'Authorization': f'Bearer {self.admin_token}',
                'Content-Type': 'application/json'
            })
            
            # Test 1: List all users (admin only)
            response = admin_session.get(f"{BASE_URL}/admin/users")
            self.print_test("List All Users (Admin)", response.status_code, response.json() if response.status_code != 200 else None)
            
            # Test 2: Grant admin privileges (admin only)
            if self.user_data.get('id'):
                grant_data = {
                    "reason": "Testing admin functionality"
                }
                response = admin_session.post(f"{BASE_URL}/admin/users/{self.user_data['id']}/grant-admin", json=grant_data)
                self.print_test("Grant Admin Privileges", response.status_code, response.json() if response.status_code != 200 else None)
                
                # Test 3: Revoke admin privileges (admin only)
                revoke_data = {
                    "reason": "Testing admin functionality"
                }
                response = admin_session.post(f"{BASE_URL}/admin/users/{self.user_data['id']}/revoke-admin", json=revoke_data)
                self.print_test("Revoke Admin Privileges", response.status_code, response.json() if response.status_code != 200 else None)
        else:
            print("❌ Admin tests skipped - could not create admin user")

    # ==================== COLLABORATION TESTS ====================
    
    def test_collaboration_endpoints(self):
        """Test collaboration endpoints"""
        print("🤝 TESTING COLLABORATION ENDPOINTS")
        print("=" * 50)
        
        if not self.test_data.get('collection_id'):
            print("❌ Collaboration tests skipped - no collection available")
            return
        
        # Create a collaborator user first
        collaborator_data = {
            "username": f"collaborator_{int(time.time())}",
            "email": f"collaborator_{int(time.time())}@example.com",
            "password": "collabpassword123"
        }
        
        response = self.session.post(f"{AUTH_URL}/register", json=collaborator_data)
        if response.status_code != 201:
            print("❌ Collaboration tests skipped - could not create collaborator user")
            return
        
        # Test 1: Add collaborator
        add_collaborator_data = {
            "email": collaborator_data["email"]
        }
        response = self.session.post(f"{BASE_URL}/collections/{self.test_data['collection_id']}/collaborators", json=add_collaborator_data)
        self.print_test("Add Collaborator", response.status_code, response.json() if response.status_code != 200 else None)
        
        # Test 2: Get collaborators
        response = self.session.get(f"{BASE_URL}/collections/{self.test_data['collection_id']}/collaborators")
        self.print_test("Get Collaborators", response.status_code)
        
        # Test 3: Remove collaborator (if any exist)
        if response.status_code == 200:
            data = response.json()
            if data.get('collaborators'):
                collaborator_id = data['collaborators'][0]['id']
                response = self.session.delete(f"{BASE_URL}/collections/{self.test_data['collection_id']}/collaborators/{collaborator_id}")
                self.print_test("Remove Collaborator", response.status_code, response.json() if response.status_code != 200 else None)

    # ==================== ERROR HANDLING TESTS ====================
    
    def test_error_handling(self):
        """Test error handling and edge cases"""
        print("⚠️ TESTING ERROR HANDLING")
        print("=" * 50)
        
        # Test 1: Invalid JSON
        response = self.session.post(f"{BASE_URL}/collections", data="invalid json")
        self.print_test("Invalid JSON", response.status_code)
        
        # Test 2: Missing required fields
        response = self.session.post(f"{BASE_URL}/collections", json={})
        self.print_test("Missing Required Fields", response.status_code)
        
        # Test 3: Invalid UUID
        response = self.session.get(f"{BASE_URL}/collections/invalid-uuid")
        self.print_test("Invalid UUID", response.status_code)
        
        # Test 4: Unauthorized access
        self.session.headers.pop('Authorization', None)
        response = self.session.get(f"{BASE_URL}/collections")
        self.print_test("Unauthorized Access", response.status_code)
        self.set_auth_header()  # Restore auth header

    def run_all_tests(self):
        """Run all test suites"""
        print("🚀 STARTING COMPREHENSIVE API TEST SUITE")
        print("=" * 60)
        print()
        
        # Authentication tests
        if self.test_register():
            self.test_login()
            self.test_reset_password_request()
            self.test_reset_password()
        
        # User tests
        self.test_user_endpoints()
        
        # Collection tests
        self.test_collection_endpoints()
        
        # Highlight tests
        self.test_highlight_endpoints()
        
        # Summary tests
        self.test_summary_endpoints()
        
        # Quiz tests
        self.test_quiz_endpoints()
        
        # Quiz attempt tests
        self.test_quiz_attempt_endpoints()
        
        # Collaboration tests
        self.test_collaboration_endpoints()
        
        # Admin tests
        self.test_admin_endpoints()
        
        # Error handling tests
        self.test_error_handling()
        
        print("🎉 TEST SUITE COMPLETED!")
        print("=" * 60)

if __name__ == "__main__":
    # Check if server is running
    try:
        response = requests.get("http://localhost:5000/api/auth/register", timeout=5)
        print("✅ Server is running!")
    except requests.exceptions.RequestException:
        print("❌ Server is not running. Please start the Flask application first:")
        print("   python run.py")
        exit(1)
    
    # Run tests
    tester = APITester()
    tester.run_all_tests() 