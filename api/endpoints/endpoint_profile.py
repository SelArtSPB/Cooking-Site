import sys
import os

# Добавляем корневой каталог проекта в путь для импорта
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
import logging
import traceback
import base64
from pathlib import Path
from io import BytesIO
from PIL import Image
from flask import jsonify, request, Blueprint
from database.models import SessionLocal, UserInfo, UserProfile
from argon2 import PasswordHasher
from flask_cors import cross_origin
from config import SECRET_PEPPER, AES_KEY
from utils import encrypt, generate_avatar
from . import api
from .endpoint_auth import token_required
from sqlalchemy import text
from database.database import db_session

# Настройка логирования
logging.basicConfig(
    level=logging.DEBUG,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler("profile_update.log"),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger("profile_api")

ph = PasswordHasher()

# Создаем Blueprint для профиля
profile_bp = Blueprint('profile', __name__)

@profile_bp.route("/profile/<string:user_login>", methods=["GET", "OPTIONS"])
@cross_origin(origins=["http://localhost:5000", "http://127.0.0.1:5500", "http://localhost:3000"], 
              methods=["GET", "OPTIONS"], 
              allow_headers=["Content-Type", "Authorization"],
              supports_credentials=True)
def get_profile(user_login):
    # Обработка предварительных запросов OPTIONS
    if request.method == "OPTIONS":
        return jsonify({"message": "OK"}), 200
        
    logger.info(f"Получение данных профиля для пользователя: {user_login}")
    session = SessionLocal()
    try:
        user = session.query(UserInfo).filter_by(userLogin=user_login).first()
        if not user:
            logger.warning(f"Пользователь {user_login} не найден при получении профиля")
            return jsonify({"error": "Пользователь не найден"}), 404
            
        profile = session.query(UserProfile).filter_by(userLoginID=user_login).first()
        if not profile:
            # Создаем профиль, если его нет
            profile = UserProfile(
                userLoginID=user_login,
                userImage=None,
                userDescription="",
                userRecipes=0
            )
            session.add(profile)
            session.commit()
            
        # Определяем, какое изображение использовать
        image_url = profile.userImage
        
        # Если есть base64 представление аватара, используем его
        if profile.userAvatarBase64:
            image_url = profile.userAvatarBase64
            logger.debug(f"Использую существующее base64 изображение для пользователя: {user_login}")
        # Если есть только бинарные данные, конвертируем их в base64
        elif profile.userAvatarBinary:
            logger.debug(f"Конвертирую бинарные данные в base64 для пользователя: {user_login}")
            image_url = f"data:image/png;base64,{base64.b64encode(profile.userAvatarBinary).decode()}"
            # Обновляем базу данных для будущих запросов
            profile.userAvatarBase64 = image_url
            session.commit()
            
        result = {
            "login": user.userLogin,
            "email": user.userEmail,
            "image": image_url,
            "description": profile.userDescription,
            "recipes_count": profile.userRecipes
        }
        
        logger.info(f"Профиль успешно получен для пользователя: {user_login}")
        return jsonify(result)
    except Exception as e:
        logger.error(f"[GET_PROFILE] ❌ Ошибка при получении профиля: {e}")
        logger.error(traceback.format_exc())
        return jsonify({"error": f"Ошибка при получении профиля: {str(e)}"}), 500
    finally:
        session.close()

@profile_bp.route("/profile/update", methods=["POST", "OPTIONS"])
def update_profile():
    try:
        data = request.get_json()
        if not data:
            return jsonify({"error": "Нет данных для обновления"}), 400
            
        user_login = data.get("login")
        if not user_login:
            return jsonify({"error": "Не указан логин пользователя"}), 400
            
        profile = SessionLocal().query(UserProfile).filter_by(userLoginID=user_login).first()
        if not profile:
            return jsonify({"error": "Профиль не найден"}), 404
            
        # Обновляем описание
        if "description" in data:
            profile.userDescription = data["description"]
            
        # Обновляем изображение
        if "image" in data and data["image"]:
            # Генерируем новое изображение
            avatar_path = generate_avatar(data["image"], user_login)
            profile.userImage = avatar_path
            
        db_session.commit()
        return jsonify({"message": "Профиль успешно обновлен"})
    except Exception as e:
        logger.error(f"[UPDATE_PROFILE] ❌ Общая ошибка при обновлении профиля: {e}")
        logger.error(traceback.format_exc())
        return jsonify({"error": f"Ошибка при обновлении профиля: {str(e)}"}), 500

@api.route("/profile/update", methods=["POST"])
def update_profile_old():
    data = request.json
    user_login = data.get("userLogin")
    new_login = data.get("newLogin")
    
    logger.info(f"Запрос на обновление профиля для пользователя: {user_login}")
    logger.debug(f"Данные запроса: {data}")
    
    if not user_login:
        logger.warning("Не указан логин пользователя в запросе")
        return jsonify({"error": "Не указан логин пользователя"}), 400
    
    session = SessionLocal()
    try:
        # Получаем текущие данные пользователя
        user = session.query(UserInfo).filter_by(userLogin=user_login).first()
        user_profile = session.query(UserProfile).filter_by(userLoginID=user_login).first()

        if not user or not user_profile:
            logger.warning(f"Пользователь {user_login} не найден при обновлении профиля")
            return jsonify({"error": "Пользователь не найден"}), 404

        changes_made = False
        logger.debug(f"Исходные данные пользователя: email={user.userEmail}, description={user_profile.userDescription}")

        # Проверяем новый логин
        need_login_update = False
        if new_login and new_login != user_login:
            logger.info(f"Попытка изменения логина с '{user_login}' на '{new_login}'")
            existing_user = session.query(UserInfo).filter_by(userLogin=new_login).first()
            if existing_user:
                logger.warning(f"Логин '{new_login}' уже занят другим пользователем")
                return jsonify({"error": "Это имя пользователя уже занято"}), 400
                
            # Отметим, что нужно обновить логин после других обновлений
            need_login_update = True
            changes_made = True

        # Обновляем остальные поля
        if "email" in data and data["email"] and data["email"] != user.userEmail:
            logger.info(f"Попытка изменения email с '{user.userEmail}' на '{data['email']}'")
            existing_email = session.query(UserInfo).filter_by(userEmail=data["email"]).first()
            if existing_email and existing_email.userLogin != user.userLogin:
                logger.warning(f"Email '{data['email']}' уже используется другим пользователем")
                return jsonify({"error": "Этот email уже используется"}), 400
            user.userEmail = data["email"]
            logger.info(f"Email пользователя изменен на '{data['email']}'")
            changes_made = True
        elif "email" in data and data["email"] == "":
            logger.info(f"Удаление email для пользователя '{user_login}'")
            user.userEmail = None
            logger.info("Email пользователя успешно удален")
            changes_made = True

        if "password" in data and data["password"]:
            logger.info("Попытка изменения пароля")
            salt = os.urandom(16)
            encoded_salt = base64.b64encode(salt).decode()
            password_with_pepper = data["password"] + SECRET_PEPPER
            hashed_password = ph.hash(password_with_pepper, salt=salt)
            encrypted_password = encrypt(hashed_password, AES_KEY)
            user.userPassword = encrypted_password
            user.salt = encoded_salt
            logger.info("Пароль пользователя успешно изменен")
            changes_made = True

        if "description" in data and data["description"] != user_profile.userDescription:
            logger.info(f"Изменение описания пользователя")
            user_profile.userDescription = data["description"]
            logger.debug(f"Описание изменено на: {data['description']}")
            changes_made = True

        if "image" in data and data["image"] and data["image"] != user_profile.userImage:
            logger.info("Попытка изменения изображения профиля")
            # Обновляем все поля изображения для совместимости
            
            # Если это base64 изображение, извлекаем бинарные данные
            if data["image"].startswith('data:image'):
                try:
                    logger.debug("Обрабатываю base64 изображение")
                    # Извлекаем данные после base64,
                    image_data = data["image"].split(',')[1]
                    binary_data = base64.b64decode(image_data)
                    logger.debug(f"Размер декодированного изображения: {len(binary_data)} байт")
                    
                    # Обновляем бинарные и base64 представления
                    user_profile.userImage = data["image"]
                    user_profile.userAvatarBinary = binary_data
                    user_profile.userAvatarBase64 = data["image"]
                    logger.info("Изображение профиля успешно обновлено")
                    changes_made = True
                except Exception as e:
                    logger.error(f"[UPDATE_PROFILE] ❌ Ошибка при обработке изображения: {e}")
                    logger.error(traceback.format_exc())
                    return jsonify({"error": f"Ошибка при обработке изображения: {str(e)}"}), 400
            else:
                # Если это не base64, просто сохраняем как есть
                user_profile.userImage = data["image"]
                changes_made = True

        if not changes_made:
            logger.info("Нет изменений для сохранения")
            return jsonify({"message": "Нет изменений для сохранения"}), 200

        # Выполняем коммит изменений до изменения логина
        # Это нужно, чтобы сохранить все прочие изменения
        if changes_made and not need_login_update:
            logger.info("Сохраняю изменения в базе данных...")
            try:
                session.commit()
                logger.info("Изменения успешно сохранены в базе данных")
            except Exception as commit_error:
                logger.error(f"Ошибка при сохранении изменений: {commit_error}")
                logger.error(traceback.format_exc())
                session.rollback()
                raise

        # Если нужно изменить логин, делаем это отдельно
        # и обновляем также связанные записи
        if need_login_update:
            logger.info(f"Обновление логина с '{user_login}' на '{new_login}'")
            try:
                # Создаем SQL-запрос для обновления userProfile с использованием функции text() и параметров
                session.execute(
                    text('UPDATE "userProfile" SET "userLoginID" = :new_login WHERE "userLoginID" = :user_login'),
                    {"new_login": new_login, "user_login": user_login}
                )
                
                # Создаем SQL-запрос для обновления siteRecipes с использованием функции text() и параметров
                session.execute(
                    text('UPDATE "siteRecipes" SET "autorRecipe" = :new_login WHERE "autorRecipe" = :user_login'),
                    {"new_login": new_login, "user_login": user_login}
                )
                
                # Обновляем логин пользователя
                user.userLogin = new_login
                
                # Коммитим все изменения
                session.commit()
                logger.info(f"Логин успешно изменен с '{user_login}' на '{new_login}'")
            except Exception as update_error:
                logger.error(f"Ошибка при обновлении логина: {update_error}")
                logger.error(traceback.format_exc())
                session.rollback()
                raise
        
        return jsonify({
            "message": "Профиль успешно обновлен",
            "newLogin": new_login if new_login != user_login else user_login
        }), 200
        
    except Exception as e:
        session.rollback()
        logger.error(f"[UPDATE_PROFILE] ❌ Общая ошибка при обновлении профиля: {e}")
        logger.error(traceback.format_exc())
        return jsonify({"error": f"Ошибка при обновлении профиля: {str(e)}"}), 500
    finally:
        session.close() 