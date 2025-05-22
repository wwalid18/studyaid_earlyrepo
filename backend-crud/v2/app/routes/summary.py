from flask import Blueprint, request, jsonify
from app.facade.summary_facade import SummaryFacade
from app.schemas.summary import summary_schema, summaries_schema

summary_bp = Blueprint('summary', __name__)

@summary_bp.route('/summaries', methods=['POST'])
def create_summary():
    data = request.get_json()
    if not data or 'collection_id' not in data or 'highlight_ids' not in data:
        return jsonify({'error': 'collection_id and highlight_ids are required'}), 400

    try:
        summary = SummaryFacade.save_summary(
            data['collection_id'],
            data['highlight_ids']
        )
        return jsonify(summary_schema.dump(summary)), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@summary_bp.route('/summaries', methods=['GET'])
def get_all_summaries():
    try:
        summaries = SummaryFacade.get_all_summaries()
        return jsonify(summaries_schema.dump(summaries)), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@summary_bp.route('/summaries/<summary_id>', methods=['GET'])
def get_summary(summary_id):
    try:
        summary = SummaryFacade.get_summary_by_id(summary_id)
        return jsonify(summary_schema.dump(summary)), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 404

@summary_bp.route('/summaries/<summary_id>', methods=['PUT'])
def update_summary(summary_id):
    data = request.get_json()
    if not data:
        return jsonify({'error': 'No data provided'}), 400

    try:
        summary = SummaryFacade.update_summary(summary_id, data)
        return jsonify(summary_schema.dump(summary)), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 404

@summary_bp.route('/summaries/<summary_id>', methods=['DELETE'])
def delete_summary(summary_id):
    try:
        SummaryFacade.delete_summary(summary_id)
        return jsonify({'message': f'Summary {summary_id} deleted successfully'}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 404

@summary_bp.route('/collections/<collection_id>/summaries', methods=['GET'])
def get_summaries_by_collection(collection_id):
    try:
        summaries = SummaryFacade.get_summaries_by_collection(collection_id)
        return jsonify(summaries_schema.dump(summaries)), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 404