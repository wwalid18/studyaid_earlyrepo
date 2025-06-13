from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.facade.highlight_facade import HighlightFacade
from app.schemas.highlight import highlights_schema, highlight_schema, highlight_create_schema
from app.models.collection import Collection
from app.models.user import User

highlight_bp = Blueprint('highlight', __name__)

@highlight_bp.route('/highlights', methods=['POST'])
@jwt_required()
def create_highlight():
    current_user_id = get_jwt_identity()
    data = request.get_json()
    
    if not data:
        return jsonify({'error': 'No data provided'}), 400
        
    data['user_id'] = current_user_id
    
    try:
        highlight = HighlightFacade.save_highlight(data)
        return jsonify({
            'message': 'Highlight created successfully',
            'highlight': highlight_schema.dump(highlight)
        }), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@highlight_bp.route('/highlights', methods=['GET'])
@jwt_required()
def get_all_highlights():
    current_user_id = get_jwt_identity()
    try:
        highlights = HighlightFacade.get_user_highlights(current_user_id)
        return jsonify({
            'highlights': highlights_schema.dump(highlights),
            'total': len(highlights)
        }), 200
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
        if not highlight.can_access(User.query.get(current_user_id)):
            return jsonify({'error': 'Unauthorized access'}), 403
        return jsonify({
            'highlight': highlight_schema.dump(highlight)
        }), 200
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
        if not highlight.can_modify(User.query.get(current_user_id)):
            return jsonify({'error': 'Unauthorized access'}), 403
            
        highlight = HighlightFacade.update_highlight(highlight_id, data)
        return jsonify({
            'message': 'Highlight updated successfully',
            'highlight': highlight_schema.dump(highlight)
        }), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@highlight_bp.route('/highlights/<highlight_id>', methods=['DELETE'])
@jwt_required()
def delete_highlight(highlight_id):
    current_user_id = get_jwt_identity()
    try:
        highlight = HighlightFacade.get_highlight_by_id(highlight_id)
        if not highlight.can_modify(User.query.get(current_user_id)):
            return jsonify({'error': 'Unauthorized access'}), 403
            
        HighlightFacade.delete_highlight(highlight_id)
        return jsonify({
            'message': f'Highlight {highlight_id} deleted successfully'
        }), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500