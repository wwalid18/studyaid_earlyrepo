from app.models.user import User
from app.models.reset_token import ResetToken
from app.utils.db import db
from flask_jwt_extended import create_access_token
import uuid
from datetime import datetime, timedelta

class UserFacade:
    @staticmethod
    def create_user(data):
        user = User(username=data['username'], email=data['email'])
        user.set_password(data['password'])
        db.session.add(user)
        db.session.commit()
        return user

    @staticmethod
    def authenticate_user(email, password):
        user = User.query.filter_by(email=email).first()
        if user and user.check_password(password):
            expires = timedelta(days=365 * 100)
            token = create_access_token(identity=user.id)
            return user, token
        return None, None

    @staticmethod
    def get_user_by_id(user_id):
        return User.query.get_or_404(user_id)

    @staticmethod
    def get_all_users():
        return User.query.all()

    @staticmethod
    def update_user(user_id, data):
        user = User.query.get_or_404(user_id)
        if 'username' in data and data['username'] != user.username:
            if User.query.filter_by(username=data['username']).first():
                raise ValueError('Username already exists')
            user.username = data['username']
        if 'email' in data and data['email'] != user.email:
            if User.query.filter_by(email=data['email']).first():
                raise ValueError('Email already exists')
            user.email = data['email']
        db.session.commit()
        return user

    @staticmethod
    def delete_user(user_id):
        user = User.query.get_or_404(user_id)
        db.session.delete(user)
        db.session.commit()

    @staticmethod
    def create_reset_token(email):
        user = User.query.filter_by(email=email).first()
        if not user:
            raise ValueError('User not found')
        token = str(uuid.uuid4())
        reset_token = ResetToken(token=token, user_id=user.id)
        db.session.add(reset_token)
        db.session.commit()
        return token

    @staticmethod
    def reset_password(token, new_password):
        reset_token = ResetToken.query.filter_by(token=token).first()
        if not reset_token or reset_token.is_expired():
            raise ValueError('Invalid or expired token')
        user = User.query.get_or_404(reset_token.user_id)
        user.set_password(new_password)
        db.session.delete(reset_token)
        db.session.commit()
        return user