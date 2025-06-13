from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.models.user import User
from app.utils.db import db
from app.schemas.admin import admin_grant_schema, admin_revoke_schema, admin_user_list_schema
from datetime import datetime

admin_bp = Blueprint('admin', __name__)

def admin_required(fn):
    """Decorator to require admin privileges for a route"""
    def wrapper(*args, **kwargs):
        current_user_id = get_jwt_identity()
        user = User.query.get(current_user_id)
        
        if not user or not user.is_admin:
            return jsonify({'error': 'Admin privileges required'}), 403
            
        return fn(*args, **kwargs)
    wrapper.__name__ = fn.__name__
    return wrapper

@admin_bp.route('/admin/users/<user_id>/grant-admin', methods=['POST'])
@jwt_required()
@admin_required
def grant_admin(user_id):
    current_user_id = get_jwt_identity()
    data = request.get_json()
    
    # Validate request data
    errors = admin_grant_schema.validate(data)
    if errors:
        return jsonify({'error': errors}), 400
        
    try:
        grantor = User.query.get(current_user_id)
        user = User.query.get_or_404(user_id)
        
        if user.is_admin:
            return jsonify({'error': 'User is already an admin'}), 400
            
        user.grant_admin(grantor, data['reason'])
        db.session.commit()
        
        return jsonify({
            'message': f'Admin privileges granted to {user.username}',
            'user': {
                'id': user.id,
                'username': user.username,
                'email': user.email,
                'is_admin': user.is_admin,
                'admin_granted_at': user.admin_granted_at.isoformat(),
                'admin_granted_by': grantor.username
            }
        }), 200
        
    except ValueError as e:
        return jsonify({'error': str(e)}), 400
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@admin_bp.route('/admin/users/<user_id>/revoke-admin', methods=['POST'])
@jwt_required()
@admin_required
def revoke_admin(user_id):
    current_user_id = get_jwt_identity()
    data = request.get_json()
    
    # Validate request data
    errors = admin_revoke_schema.validate(data)
    if errors:
        return jsonify({'error': errors}), 400
    
    try:
        revoker = User.query.get(current_user_id)
        user = User.query.get_or_404(user_id)
        
        if not user.is_admin:
            return jsonify({'error': 'User is not an admin'}), 400
            
        user.revoke_admin(revoker)
        db.session.commit()
        
        return jsonify({
            'message': f'Admin privileges revoked from {user.username}',
            'user': {
                'id': user.id,
                'username': user.username,
                'email': user.email,
                'is_admin': user.is_admin
            }
        }), 200
        
    except ValueError as e:
        return jsonify({'error': str(e)}), 400
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@admin_bp.route('/admin/users', methods=['GET'])
@jwt_required()
@admin_required
def list_users():
    try:
        users = User.query.all()
        return jsonify({
            'users': admin_user_list_schema.dump(users),
            'total': len(users),
            'admins': sum(1 for user in users if user.is_admin)
        }), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500 