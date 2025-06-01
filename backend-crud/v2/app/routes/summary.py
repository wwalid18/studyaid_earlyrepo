from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.facade.summary_facade import SummaryFacade
from app.schemas.summary import summary_schema, summaries_schema, summary_create_schema
from app.models.collection import Collection
from app.models.user import User

summary_bp = Blueprint('summary', __name__)

@summary_bp.route('/summaries', methods=['POST'])
@jwt_required()
def create_summary():
    current_user_id = get_jwt_identity()
    data = request.get_json()
    
    # Validate input data
    errors = summary_create_schema.validate(data)
    if errors:
        return jsonify({'error': errors}), 400

    try:
        # Verify collection access
        collection = Collection.query.get(data['collection_id'])
        if not collection or not collection.can_access(User.query.get(current_user_id)):
            return jsonify({'error': 'Invalid collection or unauthorized access'}), 403

        # Add user_id to data
        data['user_id'] = current_user_id
        
        summary = SummaryFacade.save_summary(data)
        return jsonify(summary_schema.dump(summary)), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@summary_bp.route('/summaries', methods=['GET'])
@jwt_required()
def get_all_summaries():
    current_user_id = get_jwt_identity()
    try:
        summaries = SummaryFacade.get_user_summaries(current_user_id)
        return jsonify(summaries_schema.dump(summaries)), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@summary_bp.route('/summaries/<summary_id>', methods=['GET'])
@jwt_required()
def get_summary(summary_id):
    current_user_id = get_jwt_identity()
    try:
        summary = SummaryFacade.get_summary_by_id(summary_id)
        if summary.user_id != current_user_id:
            return jsonify({'error': 'Unauthorized access'}), 403
        return jsonify(summary_schema.dump(summary)), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 404

@summary_bp.route('/summaries/<summary_id>', methods=['PUT'])
@jwt_required()
def update_summary(summary_id):
    current_user_id = get_jwt_identity()
    data = request.get_json()
    if not data:
        return jsonify({'error': 'No data provided'}), 400

    try:
        summary = SummaryFacade.get_summary_by_id(summary_id)
        if summary.user_id != current_user_id:
            return jsonify({'error': 'Unauthorized access'}), 403

        # Verify collection access if collection_id is being updated
        if 'collection_id' in data and data['collection_id']:
            collection = Collection.query.get(data['collection_id'])
            if not collection or not collection.can_access(User.query.get(current_user_id)):
                return jsonify({'error': 'Invalid collection or unauthorized access'}), 403

        summary = SummaryFacade.update_summary(summary_id, data)
        return jsonify(summary_schema.dump(summary)), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 404

@summary_bp.route('/summaries/<summary_id>', methods=['DELETE'])
@jwt_required()
def delete_summary(summary_id):
    current_user_id = get_jwt_identity()
    try:
        summary = SummaryFacade.get_summary_by_id(summary_id)
        if summary.user_id != current_user_id:
            return jsonify({'error': 'Unauthorized access'}), 403

        SummaryFacade.delete_summary(summary_id)
        return jsonify({'message': f'Summary {summary_id} deleted successfully'}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 404

@summary_bp.route('/collections/<collection_id>/summaries', methods=['GET'])
@jwt_required()
def get_summaries_by_collection(collection_id):
    current_user_id = get_jwt_identity()
    try:
        # Verify collection access
        collection = Collection.query.get(collection_id)
        if not collection or not collection.can_access(User.query.get(current_user_id)):
            return jsonify({'error': 'Invalid collection or unauthorized access'}), 403

        summaries = SummaryFacade.get_summaries_by_collection(collection_id)
        return jsonify(summaries_schema.dump(summaries)), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 404