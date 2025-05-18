from flask import Blueprint, request, jsonify
from app.facade.highlight_facade import HighlightFacade
from app.schemas.highlight import highlights_schema, highlight_schema

highlight_bp = Blueprint('highlight', __name__)

@highlight_bp.route('/highlights', methods=['POST'])
def create_highlights():
    data = request.get_json()
    if not isinstance(data, list):
        return jsonify({'error': 'Data must be an array'}), 400

    try:
        highlights = HighlightFacade.save_highlights(data)
        return jsonify(highlights_schema.dump(highlights)), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@highlight_bp.route('/highlights', methods=['GET'])
def get_all_highlights():
    try:
        highlights = HighlightFacade.get_all_highlights()
        return jsonify(highlights_schema.dump(highlights)), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@highlight_bp.route('/highlights/<highlight_id>', methods=['GET'])
def get_highlight(highlight_id):
    try:
        highlight = HighlightFacade.get_highlight_by_id(highlight_id)
        return jsonify(highlight_schema.dump(highlight)), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 404

@highlight_bp.route('/highlights/<highlight_id>', methods=['PUT'])
def update_highlight(highlight_id):
    data = request.get_json()
    if not data:
        return jsonify({'error': 'No data provided'}), 400

    try:
        highlight = HighlightFacade.update_highlight(highlight_id, data)
        return jsonify(highlight_schema.dump(highlight)), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@highlight_bp.route('/highlights/<highlight_id>', methods=['DELETE'])
def delete_highlight(highlight_id):
    try:
        HighlightFacade.delete_highlight(highlight_id)
        return jsonify({'message': f'Highlight {highlight_id} deleted successfully'}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500