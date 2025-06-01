from app.utils.db import db
from app.models.base import BaseModel
from sqlalchemy import Column, String, Text, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship

class Quiz(BaseModel):
    __tablename__ = 'quizzes'

    title = Column(String(255), nullable=False)
    questions = Column(JSON, nullable=False)  # Store questions and answers as JSON
    timestamp = Column(DateTime, nullable=False)
    summary_id = Column(String(36), ForeignKey('summaries.id'), nullable=False, unique=True)
    user_id = Column(String(36), ForeignKey('users.id'), nullable=False)
    
    # Relationships
    summary = db.relationship('Summary', back_populates='quiz')
    user = db.relationship('User', back_populates='quizzes')

    def __repr__(self):
        return f"<Quiz {self.id} - {self.title}>"

    @staticmethod
    def can_generate_quiz(summary_id):
        """Check if a quiz can be generated for this summary"""
        return not Quiz.query.filter_by(summary_id=summary_id).first()