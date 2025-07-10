from app.models.base import BaseModel
from app.utils.db import db
from argon2 import PasswordHasher
from sqlalchemy import Column, String, DateTime, Boolean, ForeignKey
from datetime import datetime
import uuid
from werkzeug.security import generate_password_hash, check_password_hash

ph = PasswordHasher()

class User(BaseModel):
    __tablename__ = 'users'

    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(255))
    is_admin = db.Column(db.Boolean, default=False)
    admin_granted_by = db.Column(db.String(36), db.ForeignKey('users.id'), nullable=True)
    admin_granted_at = db.Column(db.DateTime, nullable=True)
    admin_grant_reason = db.Column(db.String(255), nullable=True)
    last_login = db.Column(DateTime, nullable=True)
    
    # Relationships
    highlights = db.relationship('Highlight', back_populates='user', lazy='dynamic')
    summaries = db.relationship('Summary', back_populates='user', lazy='dynamic')
    quiz_attempts = db.relationship('QuizAttempt', back_populates='user', lazy='dynamic')

    # Add relationship for admin tracking
    admin_granted_users = db.relationship('User', 
                                        backref=db.backref('admin_grantor', remote_side=[id]),
                                        foreign_keys=[admin_granted_by])

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

    def is_authenticated(self):
        return True

    def is_active(self):
        return True

    def is_anonymous(self):
        return False

    def get_id(self):
        return str(self.id)

    def can_access_collection(self, collection):
        return (self.id == collection.user_id or 
                collection.is_collaborator(self) or 
                self.is_admin)

    def can_modify_collection(self, collection):
        return (self.id == collection.user_id or 
                self.is_admin)

    def can_access_highlight(self, highlight):
        return (self.id == highlight.user_id or 
                self.is_admin)

    def can_modify_highlight(self, highlight):
        return (self.id == highlight.user_id or 
                self.is_admin)

    def grant_admin(self, grantor, reason):
        """Grant admin privileges to this user. Only existing admins can grant admin privileges."""
        if not grantor.is_admin:
            raise ValueError("Only admins can grant admin privileges")
        
        self.is_admin = True
        self.admin_granted_by = grantor.id
        self.admin_granted_at = datetime.utcnow()
        self.admin_grant_reason = reason

    def revoke_admin(self, revoker):
        """Revoke admin privileges from this user. Only existing admins can revoke admin privileges."""
        if not revoker.is_admin:
            raise ValueError("Only admins can revoke admin privileges")
        
        if self.id == revoker.id:
            raise ValueError("Admins cannot revoke their own admin privileges")
        
        self.is_admin = False
        self.admin_granted_by = None
        self.admin_granted_at = None
        self.admin_grant_reason = None

    def update_last_login(self):
        self.last_login = datetime.utcnow()

    def get_collections(self):
        """Get all collections (owned and collaborated)"""
        owned = self.owned_collections
        collaborated = self.collaborated_collections
        return list(owned) + list(collaborated)

    def __repr__(self):
        return f'<User {self.username}>'