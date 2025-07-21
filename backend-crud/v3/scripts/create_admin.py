#!/usr/bin/env python3
"""
Script to create an admin user for testing admin endpoints
"""

import os
import sys
import uuid
from datetime import datetime

# Add the current directory to Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app import create_app
from app.models.user import User
from app.utils.db import db

def create_admin_user():
    app = create_app()
    
    with app.app_context():
        # Check if admin already exists
        admin = User.query.filter_by(email='admin@test.com').first()
        if admin:
            print(f"Admin user already exists: {admin.email}")
            return admin
        
        # Create admin user
        admin = User(
            id=str(uuid.uuid4()),
            username='testadmin',
            email='admin@test.com',
            is_admin=True,
            admin_granted_at=datetime.utcnow(),
            admin_grant_reason='Test admin user'
        )
        admin.set_password('adminpassword123')
        
        try:
            db.session.add(admin)
            db.session.commit()
            print(f"✅ Admin user created successfully: {admin.email}")
            print(f"   Username: {admin.username}")
            print(f"   Password: adminpassword123")
            return admin
        except Exception as e:
            db.session.rollback()
            print(f"❌ Error creating admin user: {str(e)}")
            return None

if __name__ == '__main__':
    create_admin_user() 