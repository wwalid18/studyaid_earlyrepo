from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.facade.collection_facade import CollectionFacade
from app.schemas.collection import collections_schema, collection_schema, collection_create_schema
from app.schemas.highlight import highlights_schema
from app.models.user import User
from app.utils.db import db

collection_bp = Blueprint('collection', __name__)

@collection_bp.route('/collections', methods=['POST'])
@jwt_required()
def create_collections():
    current_user_id = get_jwt_identity()
    data = request.get_json()
    
    if not isinstance(data, list):
        return jsonify({'error': 'Data must be an array'}), 400

    try:
        # Add user_id to each collection
        for collection_data in data:
            collection_data['user_id'] = current_user_id
            
        collections = CollectionFacade.save_collections(data)
        return jsonify(collections_schema.dump(collections)), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@collection_bp.route('/collections', methods=['GET'])
@jwt_required()
def get_all_collections():
    current_user_id = get_jwt_identity()
    try:
        collections = CollectionFacade.get_user_collections(current_user_id)
        return jsonify(collections_schema.dump(collections)), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@collection_bp.route('/collections/<collection_id>', methods=['GET'])
@jwt_required()
def get_collection(collection_id):
    current_user_id = get_jwt_identity()
    try:
        collection = CollectionFacade.get_collection_by_id(collection_id)
        if not collection.can_access(User.query.get(current_user_id)):
            return jsonify({'error': 'Unauthorized access'}), 403
        return jsonify(collection_schema.dump(collection)), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 404

@collection_bp.route('/collections/<collection_id>', methods=['PUT'])
@jwt_required()
def update_collection(collection_id):
    current_user_id = get_jwt_identity()
    data = request.get_json()
    if not data:
        return jsonify({'error': 'No data provided'}), 400

    try:
        collection = CollectionFacade.get_collection_by_id(collection_id)
        if collection.user_id != current_user_id:  # Only owner can update collection details
            return jsonify({'error': 'Unauthorized access'}), 403
            
        collection = CollectionFacade.update_collection(collection_id, data)
        return jsonify(collection_schema.dump(collection)), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@collection_bp.route('/collections/<collection_id>', methods=['DELETE'])
@jwt_required()
def delete_collection(collection_id):
    current_user_id = get_jwt_identity()
    try:
        collection = CollectionFacade.get_collection_by_id(collection_id)
        if collection.user_id != current_user_id:  # Only owner can delete collection
            return jsonify({'error': 'Unauthorized access'}), 403
            
        CollectionFacade.delete_collection(collection_id)
        return jsonify({'message': f'Collection {collection_id} deleted successfully'}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@collection_bp.route('/collections/<collection_id>/highlights/<highlight_id>', methods=['POST'])
@jwt_required()
def add_highlight_to_collection(collection_id, highlight_id):
    current_user_id = get_jwt_identity()
    try:
        collection = CollectionFacade.get_collection_by_id(collection_id)
        if not collection.can_access(User.query.get(current_user_id)):
            return jsonify({'error': 'Unauthorized access'}), 403
            
        collection = CollectionFacade.add_highlight_to_collection(collection_id, highlight_id)
        return jsonify(collection_schema.dump(collection)), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 404

@collection_bp.route('/collections/<collection_id>/highlights', methods=['GET'])
@jwt_required()
def get_highlights_by_collection(collection_id):
    current_user_id = get_jwt_identity()
    try:
        collection = CollectionFacade.get_collection_by_id(collection_id)
        if not collection.can_access(User.query.get(current_user_id)):
            return jsonify({'error': 'Unauthorized access'}), 403
            
        highlights = CollectionFacade.get_highlights_by_collection(collection_id)
        return jsonify(highlights_schema.dump(highlights)), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 404

# New collaboration endpoints
@collection_bp.route('/collections/<collection_id>/collaborators', methods=['POST'])
@jwt_required()
def add_collaborator(collection_id):
    current_user_id = get_jwt_identity()
    data = request.get_json()
    
    if not data or 'email' not in data:
        return jsonify({'error': 'Email is required'}), 400

    try:
        collection = CollectionFacade.get_collection_by_id(collection_id)
        if collection.user_id != current_user_id:  # Only owner can add collaborators
            return jsonify({'error': 'Unauthorized access'}), 403

        collaborator = User.query.filter_by(email=data['email']).first()
        if not collaborator:
            return jsonify({'error': 'User not found'}), 404

        if collaborator.id == current_user_id:
            return jsonify({'error': 'Cannot add yourself as a collaborator'}), 400

        if collection.is_collaborator(collaborator):
            return jsonify({'error': 'User is already a collaborator'}), 400

        collection.add_collaborator(collaborator)
        return jsonify({'message': f'Collaborator {collaborator.email} added successfully'}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@collection_bp.route('/collections/<collection_id>/collaborators/<user_id>', methods=['DELETE'])
@jwt_required()
def remove_collaborator(collection_id, user_id):
    current_user_id = get_jwt_identity()
    try:
        collection = CollectionFacade.get_collection_by_id(collection_id)
        if collection.user_id != current_user_id:  # Only owner can remove collaborators
            return jsonify({'error': 'Unauthorized access'}), 403

        collaborator = User.query.get_or_404(user_id)
        collection.remove_collaborator(collaborator)
        return jsonify({'message': f'Collaborator {collaborator.email} removed successfully'}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@collection_bp.route('/collections/<collection_id>/collaborators', methods=['GET'])
@jwt_required()
def get_collaborators(collection_id):
    current_user_id = get_jwt_identity()
    try:
        collection = CollectionFacade.get_collection_by_id(collection_id)
        if not collection.can_access(User.query.get(current_user_id)):
            return jsonify({'error': 'Unauthorized access'}), 403

        collaborators = [{'id': c.id, 'email': c.email, 'username': c.username} 
                        for c in collection.collaborators]
        return jsonify(collaborators), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500