from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.facade.quiz_facade import QuizFacade
from app.schemas.quiz import quiz_schema, quizzes_schema, quiz_create_schema
from app.models.summary import Summary
from app.models.collection import Collection
from app.models.user import User

quiz_bp = Blueprint('quiz', __name__)

@quiz_bp.route('/quizzes', methods=['POST'])
@jwt_required()
def create_quiz():
    current_user_id = get_jwt_identity()
    data = request.get_json()
    
    # Validate input data
    errors = quiz_create_schema.validate(data)
    if errors:
        return jsonify({'error': errors}), 400

    try:
        # Verify summary access
        summary = Summary.query.get(data['summary_id'])
        if not summary:
            return jsonify({'error': 'Summary not found'}), 404
            
        # Check if user has access to the collection
        collection = Collection.query.get(summary.collection_id)
        if not collection or not collection.can_access(User.query.get(current_user_id)):
            return jsonify({'error': 'Unauthorized access to summary'}), 403

        quiz = QuizFacade.save_quiz(data)
        return jsonify(quiz_schema.dump(quiz)), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@quiz_bp.route('/quizzes', methods=['GET'])
@jwt_required()
def get_all_quizzes():
    current_user_id = get_jwt_identity()
    try:
        # Get all quizzes that the user has access to through collections
        quizzes = QuizFacade.get_accessible_quizzes(current_user_id)
        return jsonify(quizzes_schema.dump(quizzes)), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@quiz_bp.route('/quizzes/<quiz_id>', methods=['GET'])
@jwt_required()
def get_quiz(quiz_id):
    current_user_id = get_jwt_identity()
    try:
        quiz = QuizFacade.get_quiz_by_id(quiz_id)
        # Check if user has access to the quiz through the summary's collection
        summary = Summary.query.get(quiz.summary_id)
        if not summary or not summary.collection.can_access(User.query.get(current_user_id)):
            return jsonify({'error': 'Unauthorized access'}), 403
        return jsonify(quiz_schema.dump(quiz)), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 404

@quiz_bp.route('/quizzes/<quiz_id>', methods=['PUT'])
@jwt_required()
def update_quiz(quiz_id):
    current_user_id = get_jwt_identity()
    data = request.get_json()
    if not data:
        return jsonify({'error': 'No data provided'}), 400

    try:
        quiz = QuizFacade.get_quiz_by_id(quiz_id)
        # Check if user has access to the quiz through the summary's collection
        summary = Summary.query.get(quiz.summary_id)
        if not summary or not summary.collection.can_access(User.query.get(current_user_id)):
            return jsonify({'error': 'Unauthorized access'}), 403

        # Verify summary access if summary_id is being updated
        if 'summary_id' in data and data['summary_id']:
            new_summary = Summary.query.get(data['summary_id'])
            if not new_summary:
                return jsonify({'error': 'Summary not found'}), 404
                
            collection = Collection.query.get(new_summary.collection_id)
            if not collection or not collection.can_access(User.query.get(current_user_id)):
                return jsonify({'error': 'Unauthorized access to summary'}), 403

        quiz = QuizFacade.update_quiz(quiz_id, data)
        return jsonify(quiz_schema.dump(quiz)), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 404

@quiz_bp.route('/quizzes/<quiz_id>', methods=['DELETE'])
@jwt_required()
def delete_quiz(quiz_id):
    current_user_id = get_jwt_identity()
    try:
        quiz = QuizFacade.get_quiz_by_id(quiz_id)
        # Check if user has access to the quiz through the summary's collection
        summary = Summary.query.get(quiz.summary_id)
        if not summary or not summary.collection.can_access(User.query.get(current_user_id)):
            return jsonify({'error': 'Unauthorized access'}), 403

        QuizFacade.delete_quiz(quiz_id)
        return jsonify({'message': f'Quiz {quiz_id} deleted successfully'}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 404

@quiz_bp.route('/summaries/<summary_id>/quizzes', methods=['GET'])
@jwt_required()
def get_quiz_by_summary(summary_id):
    current_user_id = get_jwt_identity()
    try:
        # Verify summary access
        summary = Summary.query.get(summary_id)
        if not summary:
            return jsonify({'error': 'Summary not found'}), 404
            
        # Check if user has access to the collection
        collection = Collection.query.get(summary.collection_id)
        if not collection or not collection.can_access(User.query.get(current_user_id)):
            return jsonify({'error': 'Unauthorized access to summary'}), 403

        quiz = QuizFacade.get_quiz_by_summary(summary_id)
        if quiz:
            return jsonify(quiz_schema.dump(quiz)), 200
        return jsonify({'message': 'No quiz found for this summary'}), 404
    except Exception as e:
        return jsonify({'error': str(e)}), 500