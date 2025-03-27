import jwt
import datetime
from config import (
    JWT_SECRET_KEY, 
    JWT_REFRESH_SECRET_KEY, 
    ACCESS_TOKEN_EXPIRES, 
    REFRESH_TOKEN_EXPIRES
)

def create_access_token(user_login):
    """Создает JWT access token"""
    payload = {
        'user_login': user_login,
        'exp': datetime.datetime.utcnow() + datetime.timedelta(minutes=ACCESS_TOKEN_EXPIRES),
        'iat': datetime.datetime.utcnow(),
        'type': 'access'
    }
    return jwt.encode(payload, JWT_SECRET_KEY, algorithm='HS256')

def create_refresh_token(user_login):
    """Создает JWT refresh token"""
    payload = {
        'user_login': user_login,
        'exp': datetime.datetime.utcnow() + datetime.timedelta(days=REFRESH_TOKEN_EXPIRES),
        'iat': datetime.datetime.utcnow(),
        'type': 'refresh'
    }
    return jwt.encode(payload, JWT_REFRESH_SECRET_KEY, algorithm='HS256')

def verify_token(token, is_refresh=False):
    """Проверяет валидность токена"""
    try:
        secret = JWT_REFRESH_SECRET_KEY if is_refresh else JWT_SECRET_KEY
        payload = jwt.decode(token, secret, algorithms=['HS256'])
        
        # Проверяем тип токена
        if is_refresh and payload.get('type') != 'refresh':
            return None
        if not is_refresh and payload.get('type') != 'access':
            return None
            
        return payload['user_login']
    except jwt.ExpiredSignatureError:
        return None
    except jwt.InvalidTokenError:
        return None 