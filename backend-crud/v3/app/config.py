import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'your-secret-key'
    JWT_SECRET_KEY = os.environ.get('JWT_SECRET_KEY') or 'your-jwt-secret-key'
    SQLALCHEMY_DATABASE_URI = 'mysql+mysqlconnector://walid:walid@localhost/studyaid'
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    
    # AI Configuration (for Groq, add config here later)
    MAX_TOKENS = 2048
    TEMPERATURE = 0.7