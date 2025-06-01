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