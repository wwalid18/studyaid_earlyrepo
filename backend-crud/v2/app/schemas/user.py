from flask_marshmallow import Marshmallow
from marshmallow import fields, validate, validates, ValidationError
from app.models.user import User
from app.utils.db import db

ma = Marshmallow()

class UserBaseSchema(ma.SQLAlchemyAutoSchema):
    username = fields.Str(required=True, validate=validate.Length(min=3, max=50))
    email = fields.Email(required=True)
    is_admin = fields.Bool(dump_only=True)
    admin_granted_by = fields.Str(dump_only=True)
    admin_granted_at = fields.DateTime(dump_only=True)
    admin_grant_reason = fields.Str(dump_only=True)

    class Meta:
        model = User
        load_instance = True
        sqla_session = db.session
        exclude = ('password_hash',)

    highlights = fields.Nested('HighlightSchema', many=True, exclude=('user',))
    admin_grantor = fields.Nested('self', exclude=('admin_grantor', 'admin_granted_users'), dump_only=True)
    admin_granted_users = fields.Nested('self', exclude=('admin_grantor', 'admin_granted_users'), many=True, dump_only=True)

class UserRegisterSchema(UserBaseSchema):
    password = fields.Str(required=True, validate=validate.Length(min=6), load_only=True)

    class Meta(UserBaseSchema.Meta):
        load_instance = False  # Ensure load() returns a dictionary, not a User object

    @validates('username')
    def validate_username(self, value):
        if User.query.filter_by(username=value).first():
            raise ValidationError('Username already exists')

    @validates('email')
    def validate_email(self, value):
        if User.query.filter_by(email=value).first():
            raise ValidationError('Email already exists')

class UserLoginSchema(ma.Schema):
    email = fields.Email(required=True)
    password = fields.Str(required=True, load_only=True)

class UserUpdateSchema(ma.SQLAlchemyAutoSchema):
    username = fields.Str(required=False, validate=validate.Length(min=3, max=50))
    email = fields.Email(required=False)

    class Meta:
        model = User
        load_instance = False
        sqla_session = db.session
        exclude = ('password_hash',)

class ResetPasswordRequestSchema(ma.Schema):
    email = fields.Email(required=True)

class ResetPasswordSchema(ma.Schema):
    token = fields.Str(required=True)
    new_password = fields.Str(required=True, validate=validate.Length(min=6), load_only=True)

UserSchema = UserBaseSchema
user_schema = UserBaseSchema()
users_schema = UserBaseSchema(many=True)
user_register_schema = UserRegisterSchema()
user_login_schema = UserLoginSchema()
user_update_schema = UserUpdateSchema()
reset_password_request_schema = ResetPasswordRequestSchema()
reset_password_schema = ResetPasswordSchema()