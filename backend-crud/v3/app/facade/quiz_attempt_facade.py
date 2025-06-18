from app.models.quiz_attempt import QuizAttempt
from app.models.quiz import Quiz
from app.models.user import User
from app.utils.db import db
from datetime import datetime

class QuizAttemptFacade:
    @staticmethod
    def submit_quiz_attempt(quiz_id, user_id, answers):
        """Submit a quiz attempt and calculate the score"""
        # Check if user has already attempted this quiz
        existing_attempt = QuizAttempt.get_user_attempt(quiz_id, user_id)
        if existing_attempt:
            raise ValueError("User has already attempted this quiz")
        
        # Get the quiz
        quiz = Quiz.query.get_or_404(quiz_id)
        
        # Create the attempt
        attempt = QuizAttempt(
            quiz_id=quiz_id,
            user_id=user_id,
            answers=answers
        )
        attempt.quiz = quiz  # Ensure relationship is set
        
        # Calculate score
        attempt.calculate_score()
        
        db.session.add(attempt)
        db.session.commit()
        
        return attempt

    @staticmethod
    def get_user_attempt(quiz_id, user_id):
        """Get a user's attempt for a specific quiz"""
        return QuizAttempt.get_user_attempt(quiz_id, user_id)

    @staticmethod
    def get_user_attempts(user_id):
        """Get all quiz attempts for a user"""
        return QuizAttempt.query.filter_by(user_id=user_id).all()

    @staticmethod
    def get_quiz_attempts(quiz_id):
        """Get all attempts for a specific quiz"""
        return QuizAttempt.query.filter_by(quiz_id=quiz_id).all()

    @staticmethod
    def get_quiz_leaderboard(quiz_id):
        """Get leaderboard for a specific quiz (sorted by score)"""
        attempts = QuizAttempt.query.filter_by(quiz_id=quiz_id).order_by(
            QuizAttempt.percentage.desc(),
            QuizAttempt.completed_at.asc()
        ).all()
        
        return attempts

    @staticmethod
    def delete_attempt(attempt_id):
        """Delete a quiz attempt"""
        attempt = QuizAttempt.query.get_or_404(attempt_id)
        db.session.delete(attempt)
        db.session.commit()
        return True 