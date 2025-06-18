from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from app.facade.user_facade import UserFacade
from app.schemas.user import user_register_schema, user_login_schema, user_schema, reset_password_request_schema, reset_password_schema
from marshmallow import ValidationError

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/register', methods=['POST'])
def register():
    try:
        data = user_register_schema.load(request.get_json())
        user = UserFacade.create_user(data)
        return jsonify(user_schema.dump(user)), 201
    except ValidationError as err:
        return jsonify(err.messages), 400
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@auth_bp.route('/login', methods=['POST'])
def login():
    try:
        data = user_login_schema.load(request.get_json())
        user, token = UserFacade.authenticate_user(data['email'], data['password'])
        if user:
            return jsonify({'access_token': token, 'user': user_schema.dump(user)}), 200
        return jsonify({'error': 'Invalid credentials'}), 401
    except ValidationError as err:
        return jsonify(err.messages), 400
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@auth_bp.route('/reset-password-request', methods=['POST'])
def reset_password_request():
    try:
        data = reset_password_request_schema.load(request.get_json())
        token = UserFacade.create_reset_token(data['email'])
        # In production, send token via email; for now, return it
        return jsonify({'message': 'Reset token generated', 'token': token}), 200
    except ValidationError as err:
        return jsonify(err.messages), 400
    except ValueError as e:
        return jsonify({'error': str(e)}), 404
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@auth_bp.route('/reset-password', methods=['POST'])
def reset_password():
    try:
        data = reset_password_schema.load(request.get_json())
        user = UserFacade.reset_password(data['token'], data['new_password'])
        return jsonify({'message': 'Password reset successfully', 'user': user_schema.dump(user)}), 200
    except ValidationError as err:
        return jsonify(err.messages), 400
    except ValueError as e:
        return jsonify({'error': str(e)}), 400
    except Exception as e:
        return jsonify({'error': str(e)}), 500