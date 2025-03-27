import sys
import os
from flask import Blueprint, jsonify, request
from functools import wraps
from base64 import b64encode, b64decode
from database.models import SessionLocal, UserInfo, UserProfile
from flask_cors import cross_origin
from argon2 import PasswordHasher
from argon2.exceptions import VerifyMismatchError
from utils import encrypt, decrypt, generate_avatar
from config import SECRET_PEPPER, AES_KEY
from auth import create_access_token, create_refresh_token, verify_token
from . import api
from database.database import db_session
import logging

ph = PasswordHasher()

# Создаем Blueprint для аутентификации
auth_bp = Blueprint('auth', __name__)

logger = logging.getLogger(__name__)

# Декоратор для защиты маршрутов
def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = request.headers.get('Authorization')
        if not token:
            return jsonify({'error': 'Token is missing'}), 401
        
        token = token.split(' ')[1] if token.startswith('Bearer ') else token
        user_login = verify_token(token)
        
        if not user_login:
            return jsonify({'error': 'Token is invalid or expired'}), 401
        
        return f(user_login, *args, **kwargs)
    return decorated

@auth_bp.route("/auth/register", methods=["POST", "OPTIONS"])
def register():
    try:
        data = request.get_json()
        if not data:
            return jsonify({"error": "Нет данных для регистрации"}), 400
            
        user_login = data.get("login")
        email = data.get("email")
        password = data.get("password")
        
        if not all([user_login, email, password]):
            return jsonify({"error": "Не все поля заполнены"}), 400
            
        # Проверяем, существует ли пользователь
        if UserInfo.query.filter_by(userLogin=user_login).first():
            return jsonify({"error": "Пользователь с таким логином уже существует"}), 409
            
        if UserInfo.query.filter_by(userEmail=email).first():
            return jsonify({"error": "Пользователь с таким email уже существует"}), 409
            
        # Создаем нового пользователя
        user = UserInfo(
            userLogin=user_login,
            userEmail=email,
            userPassword=password
        )
        
        db_session.add(user)
        db_session.commit()
        
        return jsonify({"message": "Пользователь успешно зарегистрирован"}), 201
    except Exception as e:
        logger.error(f"Ошибка при регистрации: {str(e)}")
        return jsonify({"error": "Внутренняя ошибка сервера"}), 500

@auth_bp.route("/auth/login", methods=["POST", "OPTIONS"])
def login():
    try:
        data = request.get_json()
        if not data:
            return jsonify({"error": "Нет данных для входа"}), 400
            
        user_login = data.get("login")
        password = data.get("password")
        
        if not user_login or not password:
            return jsonify({"error": "Не указаны логин или пароль"}), 400
            
        user = UserInfo.query.filter_by(userLogin=user_login).first()
        if not user:
            return jsonify({"error": "Пользователь не найден"}), 404
            
        # Проверяем пароль
        if not user.check_password(password):
            return jsonify({"error": "Неверный пароль"}), 401
            
        # Генерируем токен
        token = user.generate_token()
        
        return jsonify({
            "token": token,
            "user": {
                "login": user.userLogin,
                "email": user.userEmail
            }
        })
    except Exception as e:
        logger.error(f"Ошибка при входе: {str(e)}")
        return jsonify({"error": "Внутренняя ошибка сервера"}), 500

@api.route("/refresh", methods=["POST"])
def refresh():
    refresh_token = request.headers.get('Authorization')
    if not refresh_token:
        return jsonify({"error": "Refresh token отсутствует"}), 401
    
    refresh_token = refresh_token.split(' ')[1] if refresh_token.startswith('Bearer ') else refresh_token
    user_login = verify_token(refresh_token, is_refresh=True)
    
    if not user_login:
        return jsonify({"error": "Невалидный или истекший refresh token"}), 401
    
    # Создаем новый access token
    new_access_token = create_access_token(user_login)
    
    return jsonify({
        "access_token": new_access_token,
        "user_login": user_login
    }), 200 