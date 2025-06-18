from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.facade.quiz_attempt_facade import QuizAttemptFacade
from app.schemas.quiz_attempt import (
    quiz_attempt_schema,
    quiz_attempts_schema,
    quiz_attempt_create_schema
)
from app.models.quiz import Quiz
from app.models.collection import Collection
from app.models.user import User

quiz_attempt_bp = Blueprint('quiz_attempt', __name__)

@quiz_attempt_bp.route('/quizzes/<quiz_id>/attempt', methods=['POST'])
@jwt_required()
def submit_quiz_attempt(quiz_id):
    try:
        current_user_id = get_jwt_identity()
        data = request.get_json()
        errors = quiz_attempt_create_schema.validate(data)
        if errors:
            return jsonify({'error': errors}), 400

        # Check if user is a collaborator or owner of the collection
        quiz = Quiz.query.get_or_404(quiz_id)
        summary = quiz.summary
        collection = summary.collection
        user = User.query.get(current_user_id)
        if not (collection.user_id == current_user_id or collection.is_collaborator(user)):
            return jsonify({'error': 'Unauthorized'}), 403

        try:
            attempt = QuizAttemptFacade.submit_quiz_attempt(
                quiz_id=quiz_id,
                user_id=current_user_id,
                answers=data['answers']
            )
            return quiz_attempt_schema.dump(attempt), 201
        except ValueError as e:
            return jsonify({'error': str(e)}), 400
    except Exception as e:
        return jsonify({'error': str(e)}), 400

@quiz_attempt_bp.route('/quizzes/<quiz_id>/attempts', methods=['GET'])
@jwt_required()
def get_quiz_attempts(quiz_id):
    # Only collaborators or owner can view attempts
    current_user_id = get_jwt_identity()
    quiz = Quiz.query.get_or_404(quiz_id)
    summary = quiz.summary
    collection = summary.collection
    user = User.query.get(current_user_id)
    if not (collection.user_id == current_user_id or collection.is_collaborator(user)):
        return jsonify({'error': 'Unauthorized'}), 403

    attempts = QuizAttemptFacade.get_quiz_attempts(quiz_id)
    return jsonify(quiz_attempts_schema.dump(attempts)), 200

@quiz_attempt_bp.route('/quizzes/<quiz_id>/leaderboard', methods=['GET'])
@jwt_required()
def get_quiz_leaderboard(quiz_id):
    # Only collaborators or owner can view leaderboard
    current_user_id = get_jwt_identity()
    quiz = Quiz.query.get_or_404(quiz_id)
    summary = quiz.summary
    collection = summary.collection
    user = User.query.get(current_user_id)
    if not (collection.user_id == current_user_id or collection.is_collaborator(user)):
        return jsonify({'error': 'Unauthorized'}), 403

    leaderboard = QuizAttemptFacade.get_quiz_leaderboard(quiz_id)
    return jsonify(quiz_attempts_schema.dump(leaderboard)), 200

@quiz_attempt_bp.route('/quizzes/<quiz_id>/my-attempt', methods=['GET'])
@jwt_required()
def get_my_quiz_attempt(quiz_id):
    current_user_id = get_jwt_identity()
    attempt = QuizAttemptFacade.get_user_attempt(quiz_id, current_user_id)
    if not attempt:
        return jsonify({'message': 'No attempt found'}), 404
    return quiz_attempt_schema.dump(attempt), 200