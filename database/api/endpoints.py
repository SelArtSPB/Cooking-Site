import os
from base64 import b64encode, b64decode
from flask import Blueprint, jsonify, request
from sqlalchemy.orm import Session
from models import SessionLocal, UserInfo, SiteRecipe, StageRecipe, UserProfile
from werkzeug.security import generate_password_hash
from flask_cors import cross_origin
import hashlib
from argon2 import PasswordHasher, exceptions


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
            "fullName": user.userFullName,
            "description": user.userDescription,
            "image": user.userImage,
            "recipesCount": user.userRecipes
        })
    return jsonify({"error": "User not found"}), 404

@api.route("/recipes", methods=["GET"])
def get_recipes():
    session = SessionLocal()
    recipes = session.query(SiteRecipe).all()
    session.close()
    return jsonify([
        {"id": r.idRecipe, "title": r.titleRecipe, "author": r.autorRecipe} for r in recipes
    ])

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
        {"stage": s.stage, "description": s.stageDiscription, "image": s.stageImage} for s in stages
    ])

ph = PasswordHasher()





@api.route("/register", methods=["POST"])
def register():
    data = request.json
    email = data.get("email")
    login = data.get("user_tag")
    password = data.get("password")

    if not email or not login or not password:
        return jsonify({"error": "Заполните все поля!"}), 400

    session = SessionLocal()
    existing_user = session.query(UserInfo).filter_by(userLogin=login).first()
    existing_email = session.query(UserInfo).filter_by(userEmail=email).first()

    if existing_user:
        session.close()
        return jsonify({"error": "Этот логин уже занят!"}), 400
    if existing_email:
        session.close()
        return jsonify({"error": "Этот email уже зарегистрирован!"}), 400

    print(f"[REGISTER] Исходный пароль: {password}")

    # 🔥 Генерируем соль
    salt = os.urandom(16)  # 16 байт случайной соли
    encoded_salt = b64encode(salt).decode()  # Кодируем в base64 для хранения

    # 🔥 Явно передаем соль в Argon2
    hashed_password = ph.hash(password, salt=salt)

    print(f"[REGISTER] Сгенерированная соль: {encoded_salt}")
    print(f"[REGISTER] Итоговый хеш пароля: {hashed_password}")

    new_user = UserInfo(userEmail=email, userLogin=login, userPassword=hashed_password, salt=encoded_salt)

    try:
        session.add(new_user)
        session.commit()
        print(f"[REGISTER] ✅ Пользователь '{login}' успешно зарегистрирован!")
        return jsonify({"message": "Регистрация успешна!"}), 201
    except Exception as e:
        session.rollback()
        print(f"[REGISTER] ❌ Ошибка при сохранении в БД: {e}")
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
        print(f"[LOGIN] ❌ Ошибка: Пользователь '{login}' не найден!")
        return jsonify({"error": "Пользователь не найден!"}), 404

    print(f"[LOGIN] Исходный пароль пользователя: {password}")

    # 🔥 Загружаем соль из БД
    stored_salt = b64decode(user.salt)  # Декодируем обратно
    print(f"[LOGIN] Используемая соль: {user.salt}")

    # 🔥 Хешируем введенный пароль с этой солью (как в `register()`)
    hashed_input = ph.hash(password, salt=stored_salt)
    print(f"[LOGIN] Новый хеш из введенного пароля: {hashed_input}")
    print(f"[LOGIN] Хеш в БД: {user.userPassword}")

    # 🔥 Сравниваем хеши
    if hashed_input == user.userPassword:
        print(f"[LOGIN] ✅ Вход успешен для пользователя '{login}'")
        return jsonify({"message": "Вход успешен!"}), 200
    else:
        print(f"[LOGIN] ❌ Ошибка: Пароли не совпадают!")
        return jsonify({"error": "Неверный пароль!"}), 401
