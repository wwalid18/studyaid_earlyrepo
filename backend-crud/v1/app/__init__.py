from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from config import Config

db = SQLAlchemy()
migrate = Migrate()

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    # Initialize extensions
    db.init_app(app)
    migrate.init_app(app, db)

    # Import routes after app initialization to avoid circular imports
    with app.app_context():
        from app.routes.highlight import highlight_bp
        from app.routes.collection import collection_bp
        from app.routes.summary import summary_bp
        app.register_blueprint(highlight_bp, url_prefix='/api')
        app.register_blueprint(collection_bp, url_prefix='/api')
        app.register_blueprint(summary_bp, url_prefix='/api')

    return app