from app.utils.db import db
from app.models.base import BaseModel
from sqlalchemy import Column, String, Text, DateTime, ForeignKey, Table
from sqlalchemy.orm import relationship

# Association table for summary highlights
summary_highlights = Table(
    'summary_highlights',
    db.metadata,
    Column('summary_id', String(36), ForeignKey('summaries.id'), primary_key=True),
    Column('highlight_id', String(36), ForeignKey('highlights.id'), primary_key=True)
)

class Summary(BaseModel):
    __tablename__ = 'summaries'

    content = Column(Text, nullable=False)
    timestamp = Column(DateTime, nullable=False)
    collection_id = Column(String(36), ForeignKey('collections.id'), nullable=False)
    user_id = Column(String(36), ForeignKey('users.id'), nullable=False)
    
    # Relationships
    collection = db.relationship('Collection', back_populates='summaries')
    user = db.relationship('User', back_populates='summaries')
    highlights = db.relationship('Highlight', secondary=summary_highlights, backref='summaries')
    quiz = db.relationship('Quiz', back_populates='summary', uselist=False)

    def __repr__(self):
        return f"<Summary {self.id} - {self.timestamp}>"