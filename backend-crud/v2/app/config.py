import os

class Config:
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'your-secret-key'
    JWT_SECRET_KEY = os.environ.get('JWT_SECRET_KEY') or 'your-jwt-secret-key'
    SQLALCHEMY_DATABASE_URI = 'mysql+mysqlconnector://walid:walid@localhost/studyaid'
    SQLALCHEMY_TRACK_MODIFICATIONS = False