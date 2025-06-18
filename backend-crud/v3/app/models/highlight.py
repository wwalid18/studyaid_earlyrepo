from app.utils.db import db
from app.models.base import BaseModel
from sqlalchemy import Column, String, Text, DateTime, ForeignKey

class Highlight(BaseModel):
    __tablename__ = 'highlights'

    url = Column(String(2048), nullable=False)
    text = Column(Text, nullable=False)
    timestamp = Column(DateTime, nullable=False)
    collection_id = Column(String(36), ForeignKey('collections.id'), nullable=True)
    user_id = Column(String(36), ForeignKey('users.id'), nullable=False)

    # Relationships
    collection = db.relationship('Collection', back_populates='highlights')
    user = db.relationship('User', back_populates='highlights')

    def __repr__(self):
        return f"<Highlight {self.id} - {self.url}>"

    def can_access(self, user):
        """Check if a user can access this highlight"""
        return (self.user_id == user.id or 
                (self.collection and self.collection.can_access(user)) or 
                user.is_admin)

    def can_modify(self, user):
        """Check if a user can modify this highlight"""
        return (self.user_id == user.id or user.is_admin)