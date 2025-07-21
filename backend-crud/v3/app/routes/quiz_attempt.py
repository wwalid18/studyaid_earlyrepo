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
from sqlalchemy.orm import joinedload

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

    from app.models.quiz_attempt import QuizAttempt
    attempts = QuizAttempt.query.filter_by(quiz_id=quiz_id).options(joinedload(QuizAttempt.user)).all()
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

@quiz_attempt_bp.route('/quizzes/<quiz_id>/attempts/<attempt_id>/review', methods=['GET'])
@jwt_required()
def review_quiz_attempt(quiz_id, attempt_id):
    current_user_id = get_jwt_identity()
    from app.models.quiz_attempt import QuizAttempt
    from app.models.quiz import Quiz
    attempt = QuizAttempt.query.get_or_404(attempt_id)
    quiz = Quiz.query.get_or_404(quiz_id)
    # Only allow if user is owner/collaborator or the attempt owner
    summary = quiz.summary
    collection = summary.collection
    user = User.query.get(current_user_id)
    if not (collection.user_id == current_user_id or collection.is_collaborator(user) or attempt.user_id == current_user_id):
        return jsonify({'error': 'Unauthorized'}), 403
    correct_answers = quiz.get_correct_answers()
    user_answers = attempt.answers
    questions = quiz.questions
    incorrect = []
    user_answers_text = []
    correct_answers_text = []
    for idx, (user_ans, correct_ans) in enumerate(zip(user_answers, correct_answers)):
        user_ans_text = questions[idx]['options'].get(user_ans, '') if user_ans else ''
        correct_ans_text = questions[idx]['options'].get(correct_ans, '') if correct_ans else ''
        user_answers_text.append(user_ans_text)
        correct_answers_text.append(correct_ans_text)
        if user_ans != correct_ans:
            incorrect.append(idx)
    wrong_questions = [questions[i]['question'] for i in incorrect]
    return jsonify({
        'score': attempt.score,
        'total_questions': attempt.total_questions,
        'percentage': attempt.percentage,
        'user_answers': user_answers,
        'user_answers_text': user_answers_text,
        'correct_answers': correct_answers,
        'correct_answers_text': correct_answers_text,
        'incorrect_indices': incorrect,
        'questions': [q['question'] for q in questions],
        'wrong_questions': wrong_questions
    }), 200