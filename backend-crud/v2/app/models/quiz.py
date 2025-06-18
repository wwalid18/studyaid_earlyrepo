from app.utils.db import db
from app.models.base import BaseModel
from sqlalchemy import Column, String, Text, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship

class Quiz(BaseModel):
    __tablename__ = 'quizzes'

    title = Column(String(255), nullable=False)
    questions = Column(JSON, nullable=False)  # Store questions with A, B, C, D options
    timestamp = Column(DateTime, nullable=False)
    summary_id = Column(String(36), ForeignKey('summaries.id'), nullable=False, unique=True)
    
    # Relationships
    summary = db.relationship('Summary', back_populates='quiz')
    attempts = db.relationship('QuizAttempt', back_populates='quiz', cascade='all, delete-orphan')

    def __repr__(self):
        return f"<Quiz {self.id} - {self.title}>"

    @staticmethod
    def can_generate_quiz(summary_id):
        """Check if a quiz can be generated for this summary"""
        return not Quiz.query.filter_by(summary_id=summary_id).first()

    def get_question_count(self):
        """Get the number of questions in this quiz"""
        return len(self.questions) if self.questions else 0

    def get_correct_answers(self):
        """Get the correct answers for all questions"""
        if not self.questions:
            return []
        return [question.get('correct_answer', '') for question in self.questions]