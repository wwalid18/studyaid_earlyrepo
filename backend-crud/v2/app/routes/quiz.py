from flask import Blueprint, request, jsonify
from app.facade.quiz_facade import QuizFacade
from app.schemas.quiz import quiz_schema, quizzes_schema

quiz_bp = Blueprint('quiz', __name__)

@quiz_bp.route('/quizzes', methods=['POST'])
def create_quiz():
    data = request.get_json()
    if not data or 'summary_id' not in data:
        return jsonify({'error': 'summary_id is required'}), 400

    try:
        quiz = QuizFacade.save_quiz(data['summary_id'])
        return jsonify(quiz_schema.dump(quiz)), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@quiz_bp.route('/quizzes', methods=['GET'])
def get_all_quizzes():
    try:
        quizzes = QuizFacade.get_all_quizzes()
        return jsonify(quizzes_schema.dump(quizzes)), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@quiz_bp.route('/quizzes/<quiz_id>', methods=['GET'])
def get_quiz(quiz_id):
    try:
        quiz = QuizFacade.get_quiz_by_id(quiz_id)
        return jsonify(quiz_schema.dump(quiz)), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 404

@quiz_bp.route('/quizzes/<quiz_id>', methods=['PUT'])
def update_quiz(quiz_id):
    data = request.get_json()
    if not data:
        return jsonify({'error': 'No data provided'}), 400

    try:
        quiz = QuizFacade.update_quiz(quiz_id, data)
        return jsonify(quiz_schema.dump(quiz)), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 404

@quiz_bp.route('/quizzes/<quiz_id>', methods=['DELETE'])
def delete_quiz(quiz_id):
    try:
        QuizFacade.delete_quiz(quiz_id)
        return jsonify({'message': f'Quiz {quiz_id} deleted successfully'}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 404

@quiz_bp.route('/summaries/<summary_id>/quizzes', methods=['GET'])
def get_quiz_by_summary(summary_id):
    try:
        quiz = QuizFacade.get_quiz_by_summary(summary_id)
        if quiz:
            return jsonify(quiz_schema.dump(quiz)), 200
        return jsonify({'message': 'No quiz found for this summary'}), 404
    except Exception as e:
        return jsonify({'error': str(e)}), 500