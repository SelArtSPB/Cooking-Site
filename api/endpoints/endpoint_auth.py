import sys
import os

# Добавляем корневой каталог проекта в путь для импорта
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
import jwt
import datetime
from functools import wraps
from base64 import b64encode, b64decode
from database.models import SessionLocal, UserInfo, UserProfile
from flask import jsonify, request
from flask_cors import cross_origin
from argon2 import PasswordHasher
from argon2.exceptions import VerifyMismatchError
from utils import encrypt, decrypt, generate_avatar
from config import SECRET_PEPPER, AES_KEY
from auth import create_access_token, create_refresh_token, verify_token
from . import api

ph = PasswordHasher()

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

@api.route("/register", methods=["POST"])
def register():
    data = request.json
    email = data.get("email")
    login = data.get("login")
    password = data.get("password")

    if not login or not password:
        return jsonify({"error": "Заполните логин и пароль!"}), 400

    session = SessionLocal()
    try:
        existing_user = session.query(UserInfo).filter_by(userLogin=login).first()
        
        if existing_user:
            return jsonify({"error": "Этот логин уже занят!"}), 400
            
        # Проверяем email, только если он указан
        if email:
            existing_email = session.query(UserInfo).filter_by(userEmail=email).first()
            if existing_email:
                return jsonify({"error": "Этот email уже зарегистрирован!"}), 400

        # Создаем хеш пароля
        salt = os.urandom(16)
        encoded_salt = b64encode(salt).decode()
        password_with_pepper = password + SECRET_PEPPER
        hashed_password = ph.hash(password_with_pepper, salt=salt)
        encrypted_password = encrypt(hashed_password, AES_KEY)

        # Создаем нового пользователя
        new_user = UserInfo(
            userEmail=email, 
            userLogin=login, 
            userPassword=encrypted_password, 
            salt=encoded_salt
        )
        session.add(new_user)
        
        # Генерируем аватар на основе первой буквы логина
        avatar_binary = generate_avatar(login)
        avatar_base64 = f"data:image/png;base64,{b64encode(avatar_binary).decode()}"
        
        # Создаем профиль пользователя с аватаром
        new_profile = UserProfile(
            userLoginID=login,
            userDescription="Нет описания",
            userImage=avatar_base64,  # Совместимость со старым кодом
            userAvatarBinary=avatar_binary,
            userAvatarBase64=avatar_base64,
            userRecipes=0
        )
        session.add(new_profile)
        
        session.commit()

        # Создаем токены
        access_token = create_access_token(login)
        refresh_token = create_refresh_token(login)
        
        return jsonify({
            "message": "Регистрация успешна!",
            "access_token": access_token,
            "refresh_token": refresh_token,
            "user_login": login,
            "avatar": avatar_base64
        }), 201
        
    except Exception as e:
        session.rollback()
        print(f"[REGISTER] ❌ Ошибка БД: {e}")
        return jsonify({"error": "Ошибка сервера при регистрации!"}), 500
    finally:
        session.close()

@api.route("/login", methods=["POST"])
def login():
    data = request.json
    login = data.get("login")
    password = data.get("password")

    if not login or not password:
        return jsonify({"error": "Заполните все поля!"}), 400

    session = SessionLocal()
    user = session.query(UserInfo).filter_by(userLogin=login).first()
    session.close()

    if not user:
        return jsonify({"error": "Пользователь не найден!"}), 404

    try:
        stored_salt = b64decode(user.salt)
        encrypted_password = user.userPassword
        stored_hash = decrypt(encrypted_password, AES_KEY)
        
        # Если произошла ошибка расшифровки, decrypt вернет пустую строку
        if not stored_hash:
            print(f"[LOGIN] ❌ Ошибка расшифровки пароля для пользователя {login}")
            return jsonify({"error": "Ошибка сервера при входе. Пожалуйста, обратитесь к администратору."}), 500
        
        password_with_pepper = password + SECRET_PEPPER
        hashed_input = ph.hash(password_with_pepper, salt=stored_salt)

        if hashed_input == stored_hash:
            # Создаем оба токена
            access_token = create_access_token(login)
            refresh_token = create_refresh_token(login)
            
            return jsonify({
                "message": "Вход успешен!",
                "access_token": access_token,
                "refresh_token": refresh_token,
                "user_login": login
            }), 200
        else:
            return jsonify({"error": "Неверный пароль!"}), 401
    except Exception as e:
        print(f"[LOGIN] ❌ Ошибка: {e}")
        return jsonify({"error": "Ошибка сервера при входе!"}), 500

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