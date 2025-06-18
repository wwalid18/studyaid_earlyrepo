from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.facade.quiz_facade import QuizFacade
from app.schemas.quiz import quizzes_schema, quiz_schema, quiz_create_schema
from app.models.user import User
from app.models.summary import Summary

quiz_bp = Blueprint('quiz', __name__)

@quiz_bp.route('/quizzes', methods=['POST'])
@jwt_required()
def create_quiz():
    current_user_id = get_jwt_identity()
    data = request.get_json()
    
    if not data:
        return jsonify({'error': 'No data provided'}), 400

    try:
        # Validate summary access
        summary = Summary.query.get(data.get('summary_id'))
        if not summary:
            return jsonify({'error': 'Summary not found'}), 404
            
        user = User.query.get(current_user_id)
        if summary.user_id != current_user_id:
            return jsonify({'error': 'Unauthorized access to summary'}), 403
        
        quiz = QuizFacade.save_quiz(data)
        return jsonify({
            'message': 'Quiz created successfully',
            'quiz': quiz_schema.dump(quiz)
        }), 201
    except ValueError as e:
        return jsonify({'error': str(e)}), 400
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@quiz_bp.route('/quizzes', methods=['GET'])
@jwt_required()
def get_all_quizzes():
    current_user_id = get_jwt_identity()
    try:
        quizzes = QuizFacade.get_accessible_quizzes(current_user_id)
        return jsonify({
            'quizzes': quizzes_schema.dump(quizzes),
            'total': len(quizzes)
        }), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@quiz_bp.route('/quizzes/<quiz_id>', methods=['GET'])
@jwt_required()
def get_quiz(quiz_id):
    current_user_id = get_jwt_identity()
    try:
        quiz = QuizFacade.get_quiz_by_id(quiz_id)
        
        # Check if user has access to the summary
        summary = Summary.query.get(quiz.summary_id)
        if not summary:
            return jsonify({'error': 'Summary not found'}), 404
            
        user = User.query.get(current_user_id)
        if summary.user_id != current_user_id:
            return jsonify({'error': 'Unauthorized access'}), 403
        
        return jsonify({
            'quiz': quiz_schema.dump(quiz)
        }), 200
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
        
        # Check if user has access to the summary
        summary = Summary.query.get(quiz.summary_id)
        if not summary:
            return jsonify({'error': 'Summary not found'}), 404
            
        user = User.query.get(current_user_id)
        if summary.user_id != current_user_id:
            return jsonify({'error': 'Unauthorized access'}), 403
        
        quiz = QuizFacade.update_quiz(quiz_id, data)
        return jsonify({
            'message': 'Quiz updated successfully',
            'quiz': quiz_schema.dump(quiz)
        }), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@quiz_bp.route('/quizzes/<quiz_id>', methods=['DELETE'])
@jwt_required()
def delete_quiz(quiz_id):
    current_user_id = get_jwt_identity()
    try:
        quiz = QuizFacade.get_quiz_by_id(quiz_id)
        
        # Check if user has access to the summary
        summary = Summary.query.get(quiz.summary_id)
        if not summary:
            return jsonify({'error': 'Summary not found'}), 404
            
        user = User.query.get(current_user_id)
        if summary.user_id != current_user_id:
            return jsonify({'error': 'Unauthorized access'}), 403
        
        QuizFacade.delete_quiz(quiz_id)
        return jsonify({
            'message': f'Quiz {quiz_id} deleted successfully'
        }), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@quiz_bp.route('/quizzes/<quiz_id>/regenerate', methods=['POST'])
@jwt_required()
def regenerate_quiz(quiz_id):
    current_user_id = get_jwt_identity()
    data = request.get_json() or {}
    num_questions = data.get('num_questions', 4)
    
    try:
        quiz = QuizFacade.get_quiz_by_id(quiz_id)
        
        # Check if user has access to the summary
        summary = Summary.query.get(quiz.summary_id)
        if not summary:
            return jsonify({'error': 'Summary not found'}), 404
            
        user = User.query.get(current_user_id)
        if summary.user_id != current_user_id:
            return jsonify({'error': 'Unauthorized access'}), 403
        
        regenerated_quiz = QuizFacade.regenerate_quiz_with_ai(quiz_id, num_questions)
        return jsonify({
            'message': 'Quiz regenerated successfully with AI',
            'quiz': quiz_schema.dump(regenerated_quiz)
        }), 200
    except ValueError as e:
        return jsonify({'error': str(e)}), 400
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@quiz_bp.route('/summaries/<summary_id>/quiz', methods=['GET'])
@jwt_required()
def get_quiz_by_summary(summary_id):
    current_user_id = get_jwt_identity()
    try:
        # Check if user has access to the summary
        summary = Summary.query.get(summary_id)
        if not summary:
            return jsonify({'error': 'Summary not found'}), 404
            
        user = User.query.get(current_user_id)
        if summary.user_id != current_user_id:
            return jsonify({'error': 'Unauthorized access'}), 403
        
        quiz = QuizFacade.get_quiz_by_summary(summary_id)
        if not quiz:
            return jsonify({'error': 'No quiz found for this summary'}), 404
        
        return jsonify({
            'quiz': quiz_schema.dump(quiz)
        }), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500