from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.facade.user_facade import UserFacade
from app.schemas.admin import admin_user_list_schema
from app.models.user import User
from app.utils.db import db
from app.utils.ai_service import AIService

admin_bp = Blueprint('admin', __name__)

@admin_bp.route('/admin/users', methods=['GET'])
@jwt_required()
def get_all_users():
    current_user_id = get_jwt_identity()
    try:
        current_user = User.query.get(current_user_id)
        if not current_user or not current_user.is_admin:
            return jsonify({'error': 'Admin access required'}), 403
        
        users = UserFacade.get_all_users()
        return jsonify({
            'users': admin_user_list_schema.dump(users),
            'total': len(users)
        }), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@admin_bp.route('/admin/users/<user_id>/grant-admin', methods=['POST'])
@jwt_required()
def grant_admin(user_id):
    current_user_id = get_jwt_identity()
    data = request.get_json()
    
    if not data or 'reason' not in data:
        return jsonify({'error': 'Reason is required'}), 400
    
    try:
        current_user = User.query.get(current_user_id)
        if not current_user or not current_user.is_admin:
            return jsonify({'error': 'Admin access required'}), 403
        
        target_user = User.query.get_or_404(user_id)
        target_user.grant_admin(current_user, data['reason'])
        db.session.commit()
        
        return jsonify({
            'message': f'Admin privileges granted to {target_user.username}',
            'user': {
                'id': target_user.id,
                'username': target_user.username,
                'email': target_user.email,
                'is_admin': target_user.is_admin
            }
        }), 200
    except ValueError as e:
        return jsonify({'error': str(e)}), 400
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@admin_bp.route('/admin/users/<user_id>/revoke-admin', methods=['POST'])
@jwt_required()
def revoke_admin(user_id):
    current_user_id = get_jwt_identity()
    data = request.get_json()
    
    if not data or 'reason' not in data:
        return jsonify({'error': 'Reason is required'}), 400
    
    try:
        current_user = User.query.get(current_user_id)
        if not current_user or not current_user.is_admin:
            return jsonify({'error': 'Admin access required'}), 403
        
        target_user = User.query.get_or_404(user_id)
        target_user.revoke_admin(current_user)
        db.session.commit()
        
        return jsonify({
            'message': f'Admin privileges revoked from {target_user.username}',
            'user': {
                'id': target_user.id,
                'username': target_user.username,
                'email': target_user.email,
                'is_admin': target_user.is_admin
            }
        }), 200
    except ValueError as e:
        return jsonify({'error': str(e)}), 400
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@admin_bp.route('/admin/ai-health', methods=['GET'])
@jwt_required()
def check_ai_health():
    current_user_id = get_jwt_identity()
    try:
        current_user = User.query.get(current_user_id)
        if not current_user or not current_user.is_admin:
            return jsonify({'error': 'Admin access required'}), 403
        
        ai_service = AIService()
        status = ai_service.get_status()
        is_working = ai_service.test_connection()
        
        return jsonify({
            'ai_service_status': 'working' if is_working else 'not_working',
            'ai_available': status['ai_available'],
            'gemini_available': status['gemini_available'],
            'api_key_configured': status['api_key_configured'],
            'model': status['model'],
            'fallback_mode': not status['ai_available'],
            'message': 'AI service is working with Gemini' if is_working else 
                      'AI service is using fallback mode' if status['ai_available'] else 
                      'AI service is not available'
        }), 200
    except Exception as e:
        return jsonify({
            'ai_service_status': 'error',
            'error': str(e),
            'fallback_mode': True
        }), 500 