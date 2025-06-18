from app.schemas.user import *
from app.schemas.collection import *
from app.schemas.highlight import *
from app.schemas.quiz import *
from app.schemas.summary import *
from app.schemas.admin import *
from .quiz import quiz_schema, quizzes_schema, quiz_create_schema
from .quiz_attempt import quiz_attempt_schema, quiz_attempts_schema, quiz_attempt_create_schema