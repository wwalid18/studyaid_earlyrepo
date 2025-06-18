from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_jwt_extended import JWTManager
from flask_marshmallow import Marshmallow
from app.config import Config

db = SQLAlchemy()
migrate = Migrate()
jwt = JWTManager()
ma = Marshmallow()

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    # Initialize extensions
    db.init_app(app)
    migrate.init_app(app, db)
    jwt.init_app(app)
    ma.init_app(app)

    # Import routes after app initialization to avoid circular imports
    with app.app_context():
        print("Importing routes...")
        from app.routes.highlight import highlight_bp
        from app.routes.collection import collection_bp
        from app.routes.summary import summary_bp
        from app.routes.quiz import quiz_bp
        from app.routes.auth import auth_bp
        from app.routes.user import user_bp
        from app.routes.admin import admin_bp
        from app.routes.quiz_attempt import quiz_attempt_bp
        print("Registering blueprints...")
        app.register_blueprint(highlight_bp, url_prefix='/api')
        app.register_blueprint(collection_bp, url_prefix='/api')
        app.register_blueprint(summary_bp, url_prefix='/api')
        app.register_blueprint(quiz_bp, url_prefix='/api')
        app.register_blueprint(auth_bp, url_prefix='/api/auth')
        app.register_blueprint(user_bp, url_prefix='/api')
        app.register_blueprint(admin_bp, url_prefix='/api')
        app.register_blueprint(quiz_attempt_bp, url_prefix='/api')
        print("Blueprints registered successfully.")

    return app