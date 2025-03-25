import os
from base64 import b64encode, b64decode
from flask import Blueprint, jsonify, request
from sqlalchemy.orm import Session
from models import SessionLocal, UserInfo, SiteRecipe, StageRecipe, UserProfile, RecommendedRecipe
from werkzeug.security import generate_password_hash
from flask_cors import cross_origin, CORS
import hashlib
from argon2 import PasswordHasher, exceptions
from sqlalchemy.sql import text
from auth import create_access_token, verify_token, create_refresh_token
from functools import wraps


api = Blueprint("api", __name__)

@api.route("/users", methods=["GET"])
def get_users():
    session = SessionLocal()
    users = session.query(UserInfo).all()
    session.close()
    return jsonify([
        {"email": user.userEmail, "login": user.userLogin} for user in users
    ])

@api.route("/users/<string:user_login>", methods=["GET"])
def get_user_profile(user_login):
    session = SessionLocal()
    user = session.query(UserProfile).filter_by(userLoginID=user_login).first()
    session.close()
    if user:
        return jsonify({
            "login": user.userLoginID,
            "description": user.userDescription,
            "image": user.userImage,
            "recipesCount": user.userRecipes
        })
    return jsonify({"error": "User not found"}), 404

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@api.route("/recipes", methods=["GET", "OPTIONS"])
@cross_origin(origins=["http://localhost:5000", "http://127.0.0.1:5500", "http://localhost:3000"], 
              methods=["GET", "OPTIONS"], 
              allow_headers=["Content-Type", "Authorization"],
              supports_credentials=True)
def get_recipes():
    # Обработка предварительных запросов OPTIONS
    if request.method == "OPTIONS":
        return jsonify({"message": "OK"}), 200
        
    db = next(get_db())
    author = request.args.get('author')
    
    try:
        if author:
            recipes = db.query(SiteRecipe).filter_by(autorRecipe=author).all()
        else:
            recipes = db.query(SiteRecipe).all()
        
        return jsonify([{
            "id": r.idRecipe,
            "title": r.titleRecipe,
            "description": r.discriptionRecipe,
            "cookingTime": r.cookingTime,
            "country": r.contryRecipe,
            "type": r.typeRecipe,
            "author": r.autorRecipe,
            "image": r.imageRecipe
        } for r in recipes])
    except Exception as e:
        print(f"[GET_RECIPES] ❌ Ошибка: {e}")
        return jsonify({"error": "Ошибка при получении рецептов"}), 500
    finally:
        db.close()

@api.route("/recipes/<int:recipe_id>", methods=["GET"])
def get_recipe(recipe_id):
    session = SessionLocal()
    recipe = session.query(SiteRecipe).filter_by(idRecipe=recipe_id).first()
    session.close()
    if recipe:
        return jsonify({
            "id": recipe.idRecipe,
            "title": recipe.titleRecipe,
            "description": recipe.discriptionRecipe,
            "cookingTime": recipe.cookingTime,
            "country": recipe.contryRecipe,
            "type": recipe.typeRecipe,
            "author": recipe.autorRecipe,
            "image": recipe.imageRecipe
        })
    return jsonify({"error": "Recipe not found"}), 404

@api.route("/recipes/<int:recipe_id>/stages", methods=["GET"])
def get_recipe_stages(recipe_id):
    session = SessionLocal()
    stages = session.query(StageRecipe).filter_by(idRecipe=recipe_id).all()
    session.close()
    return jsonify([
        {
            "stage": s.stage,
            "description": s.stageDiscription,
            "image": s.stageImage
        } for s in stages
    ])

ph = PasswordHasher()

from config import SECRET_PEPPER, AES_KEY
from utils import encrypt

@api.route("/register", methods=["POST"])
def register():
    data = request.json
    email = data.get("email")
    login = data.get("user_tag")
    password = data.get("password")

    if not email or not login or not password:
        return jsonify({"error": "Заполните все поля!"}), 400

    session = SessionLocal()
    try:
        existing_user = session.query(UserInfo).filter_by(userLogin=login).first()
        existing_email = session.query(UserInfo).filter_by(userEmail=email).first()

        if existing_user:
            return jsonify({"error": "Этот логин уже занят!"}), 400
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
        
        # Создаем профиль пользователя
        new_profile = UserProfile(
            userLoginID=login,
            userDescription="Нет описания",
            userImage="src/img/default.jpg",
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
            "user_login": login
        }), 201
        
    except Exception as e:
        session.rollback()
        print(f"[REGISTER] ❌ Ошибка БД: {e}")
        return jsonify({"error": "Ошибка сервера при регистрации!"}), 500
    finally:
        session.close()


from utils import decrypt

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

    stored_salt = b64decode(user.salt)
    encrypted_password = user.userPassword
    stored_hash = decrypt(encrypted_password, AES_KEY)
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

@api.route("/recipes/add", methods=["POST"])
def add_recipe():
    data = request.json
    user_login = data.get("author")
    
    session = SessionLocal()
    try:
        # Создаем новый рецепт
        new_recipe = SiteRecipe(
            titleRecipe=data.get("title"),
            discriptionRecipe=data.get("description"),
            cookingTime=data.get("cookingTime"),  # Добавляем время готовки
            contryRecipe=data.get("country"),
            typeRecipe=data.get("type"),
            autorRecipe=user_login,
            imageRecipe=data.get("image")
        )
        session.add(new_recipe)
        session.flush()  # Чтобы получить id нового рецепта
        
        # Добавляем этапы приготовления
        for stage_data in data.get("stages", []):
            stage = StageRecipe(
                idRecipe=new_recipe.idRecipe,
                stage=stage_data.get("number"),
                stageImage=stage_data.get("image"),
                stageDiscription=stage_data.get("description")
            )
            session.add(stage)
        
        # Обновляем количество рецептов у пользователя
        user_profile = session.query(UserProfile).filter_by(userLoginID=user_login).first()
        if user_profile:
            user_profile.userRecipes = (user_profile.userRecipes or 0) + 1
        
        session.commit()
        return jsonify({"message": "Рецепт успешно добавлен!", "recipeId": new_recipe.idRecipe}), 201
    
    except Exception as e:
        session.rollback()
        print(f"[ADD_RECIPE] ❌ Ошибка: {e}")
        return jsonify({"error": "Ошибка при добавлении рецепта"}), 500
    finally:
        session.close()

@api.route("/profile/<string:user_login>", methods=["GET", "OPTIONS"])
@cross_origin(origins=["http://localhost:5000", "http://127.0.0.1:5500", "http://localhost:3000"], 
              methods=["GET", "OPTIONS"], 
              allow_headers=["Content-Type", "Authorization"],
              supports_credentials=True)
def get_profile_data(user_login):
    # Обработка предварительных запросов OPTIONS
    if request.method == "OPTIONS":
        return jsonify({"message": "OK"}), 200
        
    session = SessionLocal()
    try:
        user_profile = session.query(UserProfile).filter_by(userLoginID=user_login).first()
        if not user_profile:
            return jsonify({"error": "Профиль не найден"}), 404
            
        result = {
            "login": user_profile.userLoginID,
            "description": user_profile.userDescription,
            "image": user_profile.userImage,
            "recipesCount": user_profile.userRecipes
        }
        
        return jsonify(result)
    except Exception as e:
        print(f"[GET_PROFILE] ❌ Ошибка: {e}")
        return jsonify({"error": f"Ошибка при получении профиля: {str(e)}"}), 500
    finally:
        session.close()

@api.route("/recipes/<int:recipe_id>", methods=["DELETE"])
def delete_recipe(recipe_id):
    session = SessionLocal()
    try:
        recipe = session.query(SiteRecipe).filter_by(idRecipe=recipe_id).first()
        if not recipe:
            return jsonify({"error": "Рецепт не найден"}), 404

        # Обновляем количество рецептов у пользователя
        user_profile = session.query(UserProfile).filter_by(userLoginID=recipe.autorRecipe).first()
        if user_profile and user_profile.userRecipes > 0:
            user_profile.userRecipes -= 1

        session.delete(recipe)
        session.commit()
        return jsonify({"message": "Рецепт успешно удален"}), 200

    except Exception as e:
        session.rollback()
        print(f"[DELETE_RECIPE] ❌ Ошибка: {e}")
        return jsonify({"error": "Ошибка при удалении рецепта"}), 500
    finally:
        session.close()

@api.route("/profile/update", methods=["POST"])
def update_profile():
    data = request.json
    user_login = data.get("userLogin")
    new_login = data.get("newLogin")
    
    if not user_login:
        return jsonify({"error": "Не указан логин пользователя"}), 400
    
    session = SessionLocal()
    try:
        # Получаем текущие данные пользователя
        user = session.query(UserInfo).filter_by(userLogin=user_login).first()
        user_profile = session.query(UserProfile).filter_by(userLoginID=user_login).first()

        if not user or not user_profile:
            return jsonify({"error": "Пользователь не найден"}), 404

        changes_made = False

        # Проверяем новый логин
        if new_login and new_login != user_login:
            existing_user = session.query(UserInfo).filter_by(userLogin=new_login).first()
            if existing_user:
                return jsonify({"error": "Это имя пользователя уже занято"}), 400

            # Благодаря каскадному обновлению, достаточно изменить только логин
            user.userLogin = new_login
            changes_made = True

        # Обновляем остальные поля
        if "email" in data and data["email"] and data["email"] != user.userEmail:
            existing_email = session.query(UserInfo).filter_by(userEmail=data["email"]).first()
            if existing_email and existing_email.userLogin != user.userLogin:
                return jsonify({"error": "Этот email уже используется"}), 400
            user.userEmail = data["email"]
            changes_made = True

        if "password" in data and data["password"]:
            salt = os.urandom(16)
            encoded_salt = b64encode(salt).decode()
            password_with_pepper = data["password"] + SECRET_PEPPER
            hashed_password = ph.hash(password_with_pepper, salt=salt)
            encrypted_password = encrypt(hashed_password, AES_KEY)
            user.userPassword = encrypted_password
            user.salt = encoded_salt
            changes_made = True

        if "description" in data and data["description"] != user_profile.userDescription:
            user_profile.userDescription = data["description"]
            changes_made = True

        if "image" in data and data["image"] and data["image"] != user_profile.userImage:
            user_profile.userImage = data["image"]
            changes_made = True

        if not changes_made:
            return jsonify({"message": "Нет изменений для сохранения"}), 200

        session.commit()
        
        return jsonify({
            "message": "Профиль успешно обновлен",
            "newLogin": new_login if new_login != user_login else user_login
        }), 200
        
    except Exception as e:
        session.rollback()
        print(f"[UPDATE_PROFILE] ❌ Ошибка: {e}")
        return jsonify({"error": "Ошибка при обновлении профиля"}), 500
    finally:
        session.close()

@api.route("/recommended-recipes", methods=["GET", "OPTIONS"])
@cross_origin(origins=["http://localhost:5000", "http://127.0.0.1:5500", "http://localhost:3000"], 
              methods=["GET", "OPTIONS"], 
              allow_headers=["Content-Type", "Authorization"],
              supports_credentials=True)
def get_recommended_recipes():
    """Получить список рекомендуемых рецептов"""
    # Обработка предварительных запросов OPTIONS
    if request.method == "OPTIONS":
        return jsonify({"message": "OK"}), 200
        
    session = SessionLocal()
    try:
        recommended = session.query(RecommendedRecipe).join(SiteRecipe).all()
        
        return jsonify([{
            "id": r.recipe.idRecipe,
            "title": r.recipe.titleRecipe,
            "description": r.recipe.discriptionRecipe,
            "cookingTime": r.recipe.cookingTime,
            "country": r.recipe.contryRecipe,
            "type": r.recipe.typeRecipe,
            "author": r.recipe.autorRecipe,
            "image": r.recipe.imageRecipe,
            "dateAdded": r.dateAdded.isoformat() if r.dateAdded else None
        } for r in recommended])
    except Exception as e:
        print(f"[GET_RECOMMENDED] ❌ Ошибка: {e}")
        return jsonify({"error": "Ошибка при получении рекомендуемых рецептов"}), 500
    finally:
        session.close()

@api.route("/recommended-recipes/add", methods=["POST"])
@token_required
def add_recommended_recipe(user_login):
    """Добавить рецепт в рекомендуемые"""
    data = request.json
    recipe_id = data.get("recipeId")
    
    if not recipe_id:
        return jsonify({"error": "Не указан ID рецепта"}), 400
    
    session = SessionLocal()
    try:
        # Проверяем существование рецепта
        recipe = session.query(SiteRecipe).filter_by(idRecipe=recipe_id).first()
        if not recipe:
            return jsonify({"error": "Рецепт не найден"}), 404
        
        # Проверяем, не добавлен ли уже рецепт в рекомендуемые
        existing = session.query(RecommendedRecipe).filter_by(recipeId=recipe_id).first()
        if existing:
            return jsonify({"error": "Рецепт уже добавлен в рекомендуемые"}), 400
        
        # Добавляем в рекомендуемые
        new_recommended = RecommendedRecipe(recipeId=recipe_id)
        session.add(new_recommended)
        session.commit()
        
        return jsonify({"message": "Рецепт успешно добавлен в рекомендуемые", "id": new_recommended.id}), 201
    except Exception as e:
        session.rollback()
        print(f"[ADD_RECOMMENDED] ❌ Ошибка: {e}")
        return jsonify({"error": "Ошибка при добавлении рецепта в рекомендуемые"}), 500
    finally:
        session.close()

@api.route("/recommended-recipes/remove/<int:recipe_id>", methods=["DELETE"])
@token_required
def remove_recommended_recipe(user_login, recipe_id):
    """Удалить рецепт из рекомендуемых"""
    session = SessionLocal()
    try:
        recommended = session.query(RecommendedRecipe).filter_by(recipeId=recipe_id).first()
        if not recommended:
            return jsonify({"error": "Рецепт не найден в рекомендуемых"}), 404
        
        session.delete(recommended)
        session.commit()
        
        return jsonify({"message": "Рецепт успешно удален из рекомендуемых"}), 200
    except Exception as e:
        session.rollback()
        print(f"[REMOVE_RECOMMENDED] ❌ Ошибка: {e}")
        return jsonify({"error": "Ошибка при удалении рецепта из рекомендуемых"}), 500
    finally:
        session.close()

# Добавляем новые эндпоинты для получения списков стран и типов блюд
@api.route("/countries", methods=["GET"])
def get_countries():
    """Получить список всех доступных стран"""
    countries = [
        "Русская кухня",
        "Китайская кухня",
        "Индийская кухня",
        "Итальянская кухня",
        "Мексиканская кухня",
        "Французская кухня",
        "Японская кухня",
        "Тайская кухня",
        "Турецкая кухня",
        "Израильская кухня",
        "Вьетнамская кухня",
        "Грузинская кухня",
        "Корейская кухня",
        "Испанская кухня",
        "Греческая кухня"
    ]
    return jsonify(countries)

@api.route("/dish-types", methods=["GET"])
def get_dish_types():
    """Получить список всех типов блюд"""
    types = [
        "Основное блюдо",
        "Суп",
        "Салат",
        "Десерт",
        "Закуска",
        "Напиток",
        "Соус",
        "Выпечка",
        "Завтрак",
        "Гарнир",
        "Паста",
        "Пицца",
        "Сэндвич",
        "Морепродукты",
        "Вегетарианское"
    ]
    return jsonify(types)
