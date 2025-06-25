from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.facade.user_facade import UserFacade
from app.schemas.user import user_schema, user_update_schema
from marshmallow import ValidationError

user_bp = Blueprint('user', __name__)

@user_bp.route('/users', methods=['GET'])
@jwt_required()
def get_users():
    try:
        users = UserFacade.get_all_users()
        return jsonify(user_schema.dump(users, many=True)), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@user_bp.route('/users/<user_id>', methods=['GET'])
@jwt_required()
def get_user(user_id):
    try:
        user = UserFacade.get_user_by_id(user_id)
        return jsonify(user_schema.dump(user)), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 404

@user_bp.route('/users/<user_id>', methods=['PUT'])
@jwt_required()
def update_user(user_id):
    try:
        current_user_id = get_jwt_identity()
        if current_user_id != user_id:
            return jsonify({'error': 'Unauthorized'}), 403
        data = user_update_schema.load(request.get_json(), partial=True)
        user = UserFacade.update_user(user_id, data)
        return jsonify(user_schema.dump(user)), 200
    except ValidationError as err:
        return jsonify(err.messages), 400
    except ValueError as e:
        return jsonify({'error': str(e)}), 400
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@user_bp.route('/users/<user_id>', methods=['DELETE'])
@jwt_required()
def delete_user(user_id):
    try:
        current_user_id = get_jwt_identity()
        if current_user_id != user_id:
            return jsonify({'error': 'Unauthorized'}), 403
        UserFacade.delete_user(user_id)
        return jsonify({'message': 'User deleted successfully'}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 404

@user_bp.route('/users/me', methods=['GET'])
@jwt_required()
def get_current_user():
    current_user_id = get_jwt_identity()
    try:
        user = UserFacade.get_user_by_id(current_user_id)
        return jsonify(user_schema.dump(user)), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 404