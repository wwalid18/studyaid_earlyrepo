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

    def safe_json_response(self, response):
        """Safely extract JSON from response"""
        try:
            if response.text.strip():
                return response.json()
            return None
        except:
            return None

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
        self.print_test("Register User", response.status_code, self.safe_json_response(response) if response.status_code != 201 else None)
        
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
        self.print_test("Login User", response.status_code, self.safe_json_response(response) if response.status_code != 200 else None)
        
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
        self.print_test("Password Reset Request", response.status_code, self.safe_json_response(response) if response.status_code != 200 else None)
        
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
        self.print_test("Password Reset", response.status_code, self.safe_json_response(response) if response.status_code != 200 else None)
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
            self.print_test("Update User", response.status_code, self.safe_json_response(response) if response.status_code != 200 else None)

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
        self.print_test("Create Collections", response.status_code, self.safe_json_response(response) if response.status_code != 201 else None)
        
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
                self.print_test("Update Collection", response.status_code, self.safe_json_response(response) if response.status_code != 200 else None)
                
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
            "text": "This is a test highlight text that contains important information about machine learning and artificial intelligence.",
            "timestamp": datetime.now().strftime('%Y-%m-%dT%H:%M:%S')
        }
        
        response = self.session.post(f"{BASE_URL}/highlights", json=highlight_data)
        self.print_test("Create Highlight", response.status_code, self.safe_json_response(response) if response.status_code != 201 else None)
        
        if response.status_code == 201:
            data = response.json()
            self.test_data['highlight_id'] = data.get('highlight', {}).get('id')
            
            # Test 2: Get all highlights
            response = self.session.get(f"{BASE_URL}/highlights")
            self.print_test("Get All Highlights", response.status_code)
            
            # Test 3: Get specific highlight
            if self.test_data.get('highlight_id'):
                response = self.session.get(f"{BASE_URL}/highlights/{self.test_data['highlight_id']}")
                self.print_test("Get Highlight by ID", response.status_code)
                
                # Test 4: Update highlight
                update_data = {
                    "text": "Updated highlight text with more detailed information about AI and ML concepts."
                }
                response = self.session.put(f"{BASE_URL}/highlights/{self.test_data['highlight_id']}", json=update_data)
                self.print_test("Update Highlight", response.status_code, self.safe_json_response(response) if response.status_code != 200 else None)

    # ==================== AI-POWERED SUMMARY TESTS ====================
    
    def test_ai_summary_endpoints(self):
        """Test AI-powered summary generation endpoints"""
        print("🤖 TESTING AI SUMMARY ENDPOINTS")
        print("=" * 50)
        
        if not self.test_data.get('collection_id'):
            print("❌ AI Summary Tests - Skipped (no collection created)")
            return
        
        # Test 1: Create AI-generated summary
        summary_data = {
            "collection_id": self.test_data['collection_id'],
            "highlight_ids": [self.test_data.get('highlight_id')] if self.test_data.get('highlight_id') else []
        }
        
        response = self.session.post(f"{BASE_URL}/summaries", json=summary_data)
        self.print_test("Create AI Summary", response.status_code, self.safe_json_response(response) if response.status_code != 201 else None)
        
        if response.status_code == 201:
            data = response.json()
            self.test_data['summary_id'] = data.get('summary', {}).get('id')
            
            # Test 2: Get all summaries
            response = self.session.get(f"{BASE_URL}/summaries")
            self.print_test("Get All Summaries", response.status_code)
            
            # Test 3: Get specific summary
            if self.test_data.get('summary_id'):
                response = self.session.get(f"{BASE_URL}/summaries/{self.test_data['summary_id']}")
                self.print_test("Get Summary by ID", response.status_code)
                
                # Test 4: Regenerate summary with AI
                response = self.session.post(f"{BASE_URL}/summaries/{self.test_data['summary_id']}/regenerate")
                self.print_test("Regenerate AI Summary", response.status_code, self.safe_json_response(response) if response.status_code != 200 else None)

    # ==================== AI-POWERED QUIZ TESTS ====================
    
    def test_ai_quiz_endpoints(self):
        """Test AI-powered quiz generation endpoints"""
        print("🧠 TESTING AI QUIZ ENDPOINTS")
        print("=" * 50)
        
        if not self.test_data.get('summary_id'):
            print("❌ AI Quiz Tests - Skipped (no summary created)")
            return
        
        # Test 1: Create AI-generated quiz
        quiz_data = {
            "summary_id": self.test_data['summary_id'],
            "num_questions": 4
        }
        
        response = self.session.post(f"{BASE_URL}/quizzes", json=quiz_data)
        self.print_test("Create AI Quiz", response.status_code, self.safe_json_response(response) if response.status_code != 201 else None)
        
        if response.status_code == 201:
            data = response.json()
            self.test_data['quiz_id'] = data.get('quiz', {}).get('id')

            # Fetch the quiz to get the number of questions for quiz attempt test
            quiz_id = self.test_data['quiz_id']
            quiz_resp = self.session.get(f"{BASE_URL}/quizzes/{quiz_id}")
            if quiz_resp.status_code == 200:
                quiz_obj = quiz_resp.json().get('quiz', {})
                questions = quiz_obj.get('questions', [])
                self.test_data['quiz_num_questions'] = len(questions)
            else:
                self.test_data['quiz_num_questions'] = 4  # fallback
            
            # Test 2: Get all quizzes
            response = self.session.get(f"{BASE_URL}/quizzes")
            self.print_test("Get All Quizzes", response.status_code)
            
            # Test 3: Get specific quiz
            if self.test_data.get('quiz_id'):
                response = self.session.get(f"{BASE_URL}/quizzes/{self.test_data['quiz_id']}")
                self.print_test("Get Quiz by ID", response.status_code)
                
                # Test 4: Get quiz by summary
                response = self.session.get(f"{BASE_URL}/summaries/{self.test_data['summary_id']}/quiz")
                self.print_test("Get Quiz by Summary", response.status_code)
                
                # Test 5: Regenerate quiz with AI
                regenerate_data = {"num_questions": 3}
                response = self.session.post(f"{BASE_URL}/quizzes/{self.test_data['quiz_id']}/regenerate", json=regenerate_data)
                self.print_test("Regenerate AI Quiz", response.status_code, self.safe_json_response(response) if response.status_code != 200 else None)

    # ==================== QUIZ ATTEMPT TESTS ====================
    
    def test_quiz_attempt_endpoints(self):
        """Test quiz attempt endpoints"""
        print("📝 TESTING QUIZ ATTEMPT ENDPOINTS")
        print("=" * 50)
        
        if not self.test_data.get('quiz_id'):
            print("❌ Quiz Attempt Tests - Skipped (no quiz created)")
            return
        
        quiz_id = self.test_data['quiz_id']
        num_questions = self.test_data.get('quiz_num_questions', 4)
        # Test 1: Submit quiz attempt (correct endpoint)
        attempt_data = {
            "answers": ["A"] * num_questions  # Submit the correct number of answers
        }
        response = self.session.post(f"{BASE_URL}/quizzes/{quiz_id}/attempt", json=attempt_data)
        self.print_test("Submit Quiz Attempt", response.status_code, self.safe_json_response(response) if response.status_code != 201 else None)
        
        if response.status_code == 201:
            data = response.json()
            self.test_data['attempt_id'] = data.get('id') or data.get('attempt', {}).get('id')
            # Test 2: Get all attempts (not implemented in backend, so skip)
            # Test 3: Get specific attempt (not implemented in backend, so skip)

    # ==================== ADMIN TESTS ====================
    
    def login_as_precreated_admin(self):
        """Login as the pre-created admin user for admin endpoint tests"""
        print("\n🔑 Logging in as pre-created admin user for admin endpoint tests...")
        admin_login_data = {
            "email": "admin@test.com",
            "password": "adminpassword123"
        }
        response = self.session.post(f"{AUTH_URL}/login", json=admin_login_data)
        if response.status_code == 200:
            data = response.json()
            self.test_data['admin_token'] = data.get('access_token')
            print("✅ Logged in as pre-created admin user")
            return True
        else:
            print("❌ Failed to log in as pre-created admin user. Did you run create_admin.py?")
            return False

    def test_admin_endpoints(self):
        """Test admin management endpoints"""
        print("👑 TESTING ADMIN ENDPOINTS")
        print("=" * 50)
        
        # Always login as pre-created admin for admin endpoint tests
        if not self.login_as_precreated_admin():
            print("❌ Admin Tests - Skipped (could not log in as admin)")
            return
        
        # Set admin token
        self.session.headers.update({
            'Authorization': f'Bearer {self.test_data["admin_token"]}',
            'Content-Type': 'application/json'
        })
        
        # Test 1: Get all users (admin only)
        response = self.session.get(f"{BASE_URL}/admin/users")
        self.print_test("Get All Users (Admin)", response.status_code)
        
        # Test 2: Grant admin privileges (try to grant to self)
        if self.test_data.get('admin_user_id'):
            grant_data = {"reason": "Testing admin functionality"}
            response = self.session.post(f"{BASE_URL}/admin/users/{self.test_data['admin_user_id']}/grant-admin", json=grant_data)
            self.print_test("Grant Admin Privileges", response.status_code, self.safe_json_response(response) if response.status_code != 200 else None)
        
        # Test 3: AI Health Check
        response = self.session.get(f"{BASE_URL}/admin/ai-health")
        self.print_test("AI Health Check", response.status_code, self.safe_json_response(response) if response.status_code != 200 else None)

        # Restore test user token after admin tests
        if self.access_token:
            self.session.headers.update({
                'Authorization': f'Bearer {self.access_token}',
                'Content-Type': 'application/json'
            })

    # ==================== COLLABORATION TESTS ====================
    
    def ensure_collaborator_exists(self):
        """Ensure collaborator@example.com exists (register if not)"""
        collaborator_email = "collaborator@example.com"
        collaborator_password = "collabpassword123"
        # Try to register (ignore if already exists)
        user_data = {
            "username": "collaborator",
            "email": collaborator_email,
            "password": collaborator_password
        }
        response = self.session.post(f"{AUTH_URL}/register", json=user_data)
        # If already exists, that's fine
        return True

    def test_collaboration_endpoints(self):
        """Test collaboration endpoints"""
        print("🤝 TESTING COLLABORATION ENDPOINTS")
        print("=" * 50)
        
        if not self.test_data.get('collection_id'):
            print("❌ Collaboration Tests - Skipped (no collection created)")
            return
        
        self.ensure_collaborator_exists()
        # Test 1: Add collaborator
        collaborator_data = {"email": "collaborator@example.com"}
        response = self.session.post(f"{BASE_URL}/collections/{self.test_data['collection_id']}/collaborators", json=collaborator_data)
        self.print_test("Add Collaborator", response.status_code, self.safe_json_response(response) if response.status_code != 200 else None)
        
        # Test 2: Get collaborators
        response = self.session.get(f"{BASE_URL}/collections/{self.test_data['collection_id']}/collaborators")
        self.print_test("Get Collaborators", response.status_code)

    # ==================== ERROR HANDLING TESTS ====================
    
    def test_error_handling(self):
        """Test error handling and edge cases"""
        print("⚠️ TESTING ERROR HANDLING")
        print("=" * 50)
        
        # Test 1: Invalid token
        self.session.headers.update({'Authorization': 'Bearer invalid_token'})
        response = self.session.get(f"{BASE_URL}/users")
        self.print_test("Invalid Token", response.status_code)
        
        # Test 2: Missing data
        self.set_auth_header()  # Reset to valid token
        response = self.session.post(f"{BASE_URL}/collections", json={})
        self.print_test("Missing Data", response.status_code)
        
        # Test 3: Invalid ID
        response = self.session.get(f"{BASE_URL}/collections/invalid-id")
        self.print_test("Invalid ID", response.status_code)

    def run_all_tests(self):
        """Run all test suites"""
        print("🚀 Starting Comprehensive API Test Suite")
        print("=" * 60)
        
        # Authentication tests
        if not self.test_register():
            print("❌ Registration failed, stopping tests")
            return
        
        if not self.test_login():
            print("❌ Login failed, stopping tests")
            return
        
        self.test_reset_password_request()
        self.test_reset_password()
        
        # Core functionality tests
        self.test_user_endpoints()
        self.test_collection_endpoints()
        self.test_highlight_endpoints()
        
        # AI-powered tests
        self.test_ai_summary_endpoints()
        self.test_ai_quiz_endpoints()
        self.test_quiz_attempt_endpoints()
        
        # Admin tests
        self.test_admin_endpoints()
        
        # Collaboration tests
        self.test_collaboration_endpoints()
        
        # Error handling tests
        self.test_error_handling()
        
        print("\n🎉 All tests completed!")
        print("=" * 60)

if __name__ == '__main__':
    tester = APITester()
    tester.run_all_tests() 