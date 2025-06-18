from app.utils.db import db
from app.models.base import BaseModel
from sqlalchemy import Column, String, Text, DateTime, ForeignKey, JSON, Integer
from sqlalchemy.orm import relationship
from datetime import datetime

class QuizAttempt(BaseModel):
    __tablename__ = 'quiz_attempts'

    quiz_id = Column(String(36), ForeignKey('quizzes.id'), nullable=False)
    user_id = Column(String(36), ForeignKey('users.id'), nullable=False)
    answers = Column(JSON, nullable=False)  # Store user's answers as JSON
    score = Column(Integer, nullable=False, default=0)  # Number of correct answers
    total_questions = Column(Integer, nullable=False, default=0)  # Total questions in quiz
    percentage = Column(Integer, nullable=False, default=0)  # Score as percentage
    completed_at = Column(DateTime, nullable=False, default=datetime.utcnow)
    
    # Relationships
    quiz = db.relationship('Quiz', back_populates='attempts')
    user = db.relationship('User', back_populates='quiz_attempts')

    def __repr__(self):
        return f"<QuizAttempt {self.id} - User: {self.user_id}, Quiz: {self.quiz_id}, Score: {self.score}/{self.total_questions}>"

    def calculate_score(self):
        """Calculate the score based on user answers vs correct answers"""
        if not self.quiz or not self.answers:
            raise ValueError("Quiz or answers missing")
        
        correct_answers = self.quiz.get_correct_answers()
        user_answers = self.answers
        
        if len(correct_answers) != len(user_answers):
            raise ValueError("Number of answers does not match number of questions")
        
        correct_count = 0
        for i, (correct, user_answer) in enumerate(zip(correct_answers, user_answers)):
            if correct == user_answer:
                correct_count += 1
        
        total_questions = len(correct_answers)
        percentage = int((correct_count / total_questions) * 100) if total_questions > 0 else 0
        
        self.score = correct_count
        self.total_questions = total_questions
        self.percentage = percentage
        
        return correct_count, total_questions, percentage

    @staticmethod
    def can_attempt_quiz(quiz_id, user_id):
        """Check if a user can attempt a quiz (one attempt per user per quiz)"""
        return not QuizAttempt.query.filter_by(quiz_id=quiz_id, user_id=user_id).first()

    @staticmethod
    def get_user_attempt(quiz_id, user_id):
        """Get a user's attempt for a specific quiz"""
        return QuizAttempt.query.filter_by(quiz_id=quiz_id, user_id=user_id).first() 