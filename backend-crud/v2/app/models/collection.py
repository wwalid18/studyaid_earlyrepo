from app.utils.db import db
from app.models.base import BaseModel
from sqlalchemy import Column, String, Text, DateTime, ForeignKey, Table
from sqlalchemy.orm import relationship

# Association table for collection collaborators
collection_collaborators = Table(
    'collection_collaborators',
    db.metadata,
    Column('collection_id', String(36), ForeignKey('collections.id'), primary_key=True),
    Column('user_id', String(36), ForeignKey('users.id'), primary_key=True)
)

class Collection(BaseModel):
    __tablename__ = 'collections'

    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    timestamp = Column(DateTime, nullable=False)
    user_id = Column(String(36), ForeignKey('users.id'), nullable=False)
    
    # Relationships
    owner = db.relationship('User', backref=db.backref('owned_collections'), foreign_keys=[user_id])
    highlights = db.relationship('Highlight', back_populates='collection')
    summaries = db.relationship('Summary', back_populates='collection')
    
    # Collaboration relationship
    collaborators = db.relationship(
        'User',
        secondary=collection_collaborators,
        backref=db.backref('collaborated_collections')
    )

    def add_collaborator(self, user):
        """Add a user as a collaborator to this collection"""
        if user not in self.collaborators:
            self.collaborators.append(user)
            db.session.commit()

    def remove_collaborator(self, user):
        """Remove a user from collection collaborators"""
        if user in self.collaborators:
            self.collaborators.remove(user)
            db.session.commit()

    def is_collaborator(self, user):
        """Check if a user is a collaborator"""
        return user in self.collaborators

    def can_access(self, user):
        """Check if a user can access this collection (owner or collaborator)"""
        return user.id == self.user_id or self.is_collaborator(user)

    def __repr__(self):
        return f"<Collection {self.id} - {self.title}>"