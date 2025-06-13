import os
import sys
import uuid
from datetime import datetime
from werkzeug.security import generate_password_hash

# Add the parent directory to the Python path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app import create_app
from app.models.user import User
from app.utils.db import db

def create_first_admin():
    app = create_app('development')
    with app.app_context():
        # Check if any admin exists
        if User.query.filter_by(is_admin=True).first():
            print("An admin user already exists!")
            return

        # Get admin details from environment variables
        admin_username = os.getenv('FIRST_ADMIN_USERNAME')
        admin_email = os.getenv('FIRST_ADMIN_EMAIL')
        admin_password = os.getenv('FIRST_ADMIN_PASSWORD')

        if not all([admin_username, admin_email, admin_password]):
            print("Please set FIRST_ADMIN_USERNAME, FIRST_ADMIN_EMAIL, and FIRST_ADMIN_PASSWORD environment variables")
            return

        # Create admin user
        admin = User(
            id=str(uuid.uuid4()),
            username=admin_username,
            email=admin_email,
            is_admin=True,
            admin_granted_at=datetime.utcnow(),
            admin_grant_reason="Initial system administrator"
        )
        admin.set_password(admin_password)

        try:
            db.session.add(admin)
            db.session.commit()
            print(f"Successfully created admin user: {admin_username}")
        except Exception as e:
            db.session.rollback()
            print(f"Error creating admin user: {str(e)}")

if __name__ == '__main__':
    create_first_admin() 