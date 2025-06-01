from app.models.base import BaseModel
from app.utils.db import db
from argon2 import PasswordHasher
from sqlalchemy import Column, String, DateTime
from datetime import datetime

ph = PasswordHasher()

class User(BaseModel):
    __tablename__ = 'users'

    username = Column(String(50), unique=True, nullable=False)
    email = Column(String(120), unique=True, nullable=False)
    password_hash = Column(String(128), nullable=False)
    last_login = Column(DateTime, nullable=True)
    
    # Relationships
    highlights = db.relationship('Highlight', back_populates='user', lazy='dynamic')
    summaries = db.relationship('Summary', back_populates='user', lazy='dynamic')
    quizzes = db.relationship('Quiz', back_populates='user', lazy='dynamic')

    def set_password(self, password):
        self.password_hash = ph.hash(password)

    def check_password(self, password):
        try:
            return ph.verify(self.password_hash, password)
        except:
            return False

    def update_last_login(self):
        self.last_login = datetime.utcnow()

    def get_collections(self):
        """Get all collections (owned and collaborated)"""
        owned = self.owned_collections.all()
        collaborated = self.collaborated_collections.all()
        return owned + collaborated

    def __repr__(self):
        return f'<User {self.username}>'