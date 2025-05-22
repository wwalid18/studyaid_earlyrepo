from app.models.base import BaseModel
from app.utils.db import db
from argon2 import PasswordHasher
from sqlalchemy import Column, String

ph = PasswordHasher()

class User(BaseModel):
    __tablename__ = 'users'

    username = Column(String(50), unique=True, nullable=False)
    email = Column(String(120), unique=True, nullable=False)
    password_hash = Column(String(128), nullable=False)

    def set_password(self, password):
        self.password_hash = ph.hash(password)

    def check_password(self, password):
        try:
            return ph.verify(self.password_hash, password)
        except:
            return False

    def __repr__(self):
        return f'<User {self.username}>'