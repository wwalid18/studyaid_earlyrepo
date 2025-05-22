from flask import Blueprint, request, jsonify
from app.facade.collection_facade import CollectionFacade
from app.schemas.collection import collections_schema, collection_schema
from app.schemas.highlight import highlights_schema

collection_bp = Blueprint('collection', __name__)

@collection_bp.route('/collections', methods=['POST'])
def create_collections():
    data = request.get_json()
    if not isinstance(data, list):
        return jsonify({'error': 'Data must be an array'}), 400

    try:
        collections = CollectionFacade.save_collections(data)
        return jsonify(collections_schema.dump(collections)), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@collection_bp.route('/collections', methods=['GET'])
def get_all_collections():
    try:
        collections = CollectionFacade.get_all_collections()
        return jsonify(collections_schema.dump(collections)), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@collection_bp.route('/collections/<collection_id>', methods=['GET'])
def get_collection(collection_id):
    try:
        collection = CollectionFacade.get_collection_by_id(collection_id)
        return jsonify(collection_schema.dump(collection)), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 404

@collection_bp.route('/collections/<collection_id>', methods=['PUT'])
def update_collection(collection_id):
    data = request.get_json()
    if not data:
        return jsonify({'error': 'No data provided'}), 400

    try:
        collection = CollectionFacade.update_collection(collection_id, data)
        return jsonify(collection_schema.dump(collection)), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@collection_bp.route('/collections/<collection_id>', methods=['DELETE'])
def delete_collection(collection_id):
    try:
        CollectionFacade.delete_collection(collection_id)
        return jsonify({'message': f'Collection {collection_id} deleted successfully'}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@collection_bp.route('/collections/<collection_id>/highlights/<highlight_id>', methods=['POST'])
def add_highlight_to_collection(collection_id, highlight_id):
    try:
        collection = CollectionFacade.add_highlight_to_collection(collection_id, highlight_id)
        return jsonify(collection_schema.dump(collection)), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 404

@collection_bp.route('/collections/<collection_id>/highlights', methods=['GET'])
def get_highlights_by_collection(collection_id):
    try:
        highlights = CollectionFacade.get_highlights_by_collection(collection_id)
        return jsonify(highlights_schema.dump(highlights)), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 404