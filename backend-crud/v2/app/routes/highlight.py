from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.facade.highlight_facade import HighlightFacade
from app.schemas.highlight import highlights_schema, highlight_schema, highlight_create_schema
from app.models.collection import Collection
from app.models.user import User

highlight_bp = Blueprint('highlight', __name__)

@highlight_bp.route('/highlights', methods=['POST'])
@jwt_required()
def create_highlights():
    current_user_id = get_jwt_identity()
    data = request.get_json()
    if not isinstance(data, list):
        return jsonify({'error': 'Data must be an array'}), 400

    try:
        # Add user_id to each highlight
        for highlight_data in data:
            highlight_data['user_id'] = current_user_id
            # Verify collection access if collection_id is provided
            if highlight_data.get('collection_id'):
                collection = Collection.query.get(highlight_data['collection_id'])
                if not collection or not collection.can_access(User.query.get(current_user_id)):
                    return jsonify({'error': 'Invalid collection or unauthorized access'}), 403

        highlights = HighlightFacade.save_highlights(data)
        return jsonify(highlights_schema.dump(highlights)), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@highlight_bp.route('/highlights', methods=['GET'])
@jwt_required()
def get_all_highlights():
    current_user_id = get_jwt_identity()
    try:
        highlights = HighlightFacade.get_user_highlights(current_user_id)
        return jsonify(highlights_schema.dump(highlights)), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@highlight_bp.route('/highlights/user/<user_id>', methods=['GET'])
@jwt_required()
def get_highlights_by_user_id(user_id):
    current_user_id = get_jwt_identity()
    try:
        # Check if the requesting user has access to the target user's highlights
        # This could be through collaboration or other access control mechanisms
        target_user = User.query.get_or_404(user_id)
        
        # For now, we'll only allow users to view their own highlights
        # You can modify this logic based on your access control requirements
        if current_user_id != user_id:
            return jsonify({'error': 'Unauthorized access'}), 403
            
        highlights = HighlightFacade.get_user_highlights(user_id)
        return jsonify(highlights_schema.dump(highlights)), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@highlight_bp.route('/highlights/<highlight_id>', methods=['GET'])
@jwt_required()
def get_highlight(highlight_id):
    current_user_id = get_jwt_identity()
    try:
        highlight = HighlightFacade.get_highlight_by_id(highlight_id)
        if highlight.user_id != current_user_id:
            return jsonify({'error': 'Unauthorized access'}), 403
        return jsonify(highlight_schema.dump(highlight)), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 404

@highlight_bp.route('/highlights/<highlight_id>', methods=['PUT'])
@jwt_required()
def update_highlight(highlight_id):
    current_user_id = get_jwt_identity()
    data = request.get_json()
    if not data:
        return jsonify({'error': 'No data provided'}), 400

    try:
        highlight = HighlightFacade.get_highlight_by_id(highlight_id)
        if highlight.user_id != current_user_id:
            return jsonify({'error': 'Unauthorized access'}), 403

        # Verify collection access if collection_id is being updated
        if 'collection_id' in data and data['collection_id']:
            collection = Collection.query.get(data['collection_id'])
            if not collection or not collection.can_access(User.query.get(current_user_id)):
                return jsonify({'error': 'Invalid collection or unauthorized access'}), 403

        highlight = HighlightFacade.update_highlight(highlight_id, data)
        return jsonify(highlight_schema.dump(highlight)), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@highlight_bp.route('/highlights/<highlight_id>', methods=['DELETE'])
@jwt_required()
def delete_highlight(highlight_id):
    current_user_id = get_jwt_identity()
    try:
        highlight = HighlightFacade.get_highlight_by_id(highlight_id)
        if highlight.user_id != current_user_id:
            return jsonify({'error': 'Unauthorized access'}), 403

        HighlightFacade.delete_highlight(highlight_id)
        return jsonify({'message': f'Highlight {highlight_id} deleted successfully'}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500