from flask import Blueprint, request, jsonify
from app.facade.highlight_facade import HighlightFacade
from app.schemas.highlight import highlights_schema

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
