from flask_marshmallow import Marshmallow
from marshmallow import fields, validate, validates, ValidationError
from app.models.user import User
from app.utils.db import db

ma = Marshmallow()

class AdminGrantSchema(ma.Schema):
    reason = fields.Str(required=True, validate=validate.Length(min=10, max=255))

class AdminRevokeSchema(ma.Schema):
    confirm = fields.Bool(required=True, validate=validate.Equal(True))

class AdminUserListSchema(ma.SQLAlchemyAutoSchema):
    class Meta:
        model = User
        load_instance = False
        sqla_session = db.session
        fields = ('id', 'username', 'email', 'is_admin', 'admin_granted_by', 
                 'admin_granted_at', 'admin_grant_reason', 'last_login')

admin_grant_schema = AdminGrantSchema()
admin_revoke_schema = AdminRevokeSchema()
admin_user_list_schema = AdminUserListSchema(many=True) 