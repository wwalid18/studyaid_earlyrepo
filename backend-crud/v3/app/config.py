import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'your-secret-key'
    JWT_SECRET_KEY = os.environ.get('JWT_SECRET_KEY') or 'your-jwt-secret-key'
    SQLALCHEMY_DATABASE_URI = 'mysql+mysqlconnector://walid:walid@localhost/studyaid'
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    
    # AI Configuration
    GEMINI_API_KEY = os.environ.get('GEMINI_API_KEY')
    GEMINI_MODEL = 'gemini-1.5-flash'  # or 'gemini-1.5-pro' for more complex tasks
    MAX_TOKENS = 2048
    TEMPERATURE = 0.7