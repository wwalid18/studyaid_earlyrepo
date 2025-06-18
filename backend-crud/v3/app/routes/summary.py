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
    
    if not data:
        return jsonify({'error': 'No data provided'}), 400

    try:
        # Add user_id to the data
        data['user_id'] = current_user_id
        
        # Validate collection access
        collection = Collection.query.get(data.get('collection_id'))
        if not collection:
            return jsonify({'error': 'Collection not found'}), 404
            
        user = User.query.get(current_user_id)
        if not collection.can_access(user):
            return jsonify({'error': 'Unauthorized access to collection'}), 403
        
        summary = SummaryFacade.save_summary(data)
        return jsonify({
            'message': 'Summary created successfully',
            'summary': summary_schema.dump(summary)
        }), 201
    except ValueError as e:
        return jsonify({'error': str(e)}), 400
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@summary_bp.route('/summaries', methods=['GET'])
@jwt_required()
def get_all_summaries():
    current_user_id = get_jwt_identity()
    try:
        summaries = SummaryFacade.get_user_summaries(current_user_id)
        return jsonify({
            'summaries': summaries_schema.dump(summaries),
            'total': len(summaries)
        }), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@summary_bp.route('/summaries/<summary_id>', methods=['GET'])
@jwt_required()
def get_summary(summary_id):
    current_user_id = get_jwt_identity()
    try:
        summary = SummaryFacade.get_summary_by_id(summary_id)
        
        # Check if user has access to the collection
        collection = Collection.query.get(summary.collection_id)
        if not collection:
            return jsonify({'error': 'Collection not found'}), 404
            
        user = User.query.get(current_user_id)
        if not collection.can_access(user):
            return jsonify({'error': 'Unauthorized access'}), 403
        
        return jsonify({
            'summary': summary_schema.dump(summary)
        }), 200
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
        
        # Check if user owns the summary
        if summary.user_id != current_user_id:
            return jsonify({'error': 'Unauthorized access'}), 403
        
        summary = SummaryFacade.update_summary(summary_id, data)
        return jsonify({
            'message': 'Summary updated successfully',
            'summary': summary_schema.dump(summary)
        }), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@summary_bp.route('/summaries/<summary_id>', methods=['DELETE'])
@jwt_required()
def delete_summary(summary_id):
    current_user_id = get_jwt_identity()
    try:
        summary = SummaryFacade.get_summary_by_id(summary_id)
        
        # Check if user owns the summary
        if summary.user_id != current_user_id:
            return jsonify({'error': 'Unauthorized access'}), 403
        
        SummaryFacade.delete_summary(summary_id)
        return jsonify({
            'message': f'Summary {summary_id} deleted successfully'
        }), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@summary_bp.route('/summaries/<summary_id>/regenerate', methods=['POST'])
@jwt_required()
def regenerate_summary(summary_id):
    current_user_id = get_jwt_identity()
    try:
        summary = SummaryFacade.get_summary_by_id(summary_id)
        
        # Check if user owns the summary
        if summary.user_id != current_user_id:
            return jsonify({'error': 'Unauthorized access'}), 403
        
        regenerated_summary = SummaryFacade.regenerate_summary_with_ai(summary_id)
        return jsonify({
            'message': 'Summary regenerated successfully with AI',
            'summary': summary_schema.dump(regenerated_summary)
        }), 200
    except ValueError as e:
        return jsonify({'error': str(e)}), 400
    except Exception as e:
        return jsonify({'error': str(e)}), 500

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