from app.models.base import BaseModel
from app.utils.db import db
from sqlalchemy import Column, String, ForeignKey, DateTime
from datetime import datetime, timedelta

class ResetToken(BaseModel):
    __tablename__ = 'reset_tokens'

    token = Column(String(36), unique=True, nullable=False)
    user_id = Column(String(36), ForeignKey('users.id'), nullable=False)
    expires_at = Column(DateTime, nullable=False, default=lambda: datetime.utcnow() + timedelta(hours=1))

    user = db.relationship('User', backref='reset_tokens')

    def is_expired(self):
        return datetime.utcnow() > self.expires_at

    def __repr__(self):
        return f'<ResetToken for user {self.user_id}>'