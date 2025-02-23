from werkzeug.security import generate_password_hash
from flask import Blueprint, jsonify, request
from .models import SessionLocal, UserProfile, CardRecipe
from flask_cors import cross_origin

api = Blueprint("api", __name__)

data_store = {
    "users": [],
    "recipes": []
}

def load_data():
    #Загружает данные из базы данных в data_store
    session = SessionLocal()
    try:
        data_store["users"] = session.query(UserProfile).all()
        data_store["recipes"] = session.query(CardRecipe).all()
        
        if not data_store["users"]:
            print("Ошибка: данные пользователей не загружены из БД")
        if not data_store["recipes"]:
            print("Ошибка: данные рецептов не загружены из БД")
    finally:
        session.close()

def save_data():
    #Сохраняет данные из data_store в базу данных
    session = SessionLocal()
    try:
        for user in data_store["users"]:
            session.merge(user)
        for recipe in data_store["recipes"]:
            session.merge(recipe)
        session.commit()
    except Exception as e:
        print(f"Ошибка сохранения данных в БД: {e}")
    finally:
        session.close()

@api.route("/users", methods=["GET"])
def get_users():
    #Возвращает список всех пользователей
    return jsonify([
        {
            "id": user.id_user,
            "name": user.user_name,
            "tag": user.user_tag,
            "email": user.email,
            "description": user.description
        }
        for user in data_store["users"]
    ])

@api.route("/users/<int:user_id>", methods=["GET"])
def get_user_by_id(user_id):
    #Возвращает информацию о конкретном пользователе по ID
    user = next((u for u in data_store["users"] if u.id_user == user_id), None)
    if user:
        return jsonify({
            "name": user.user_name,
            "tag": user.user_tag,
            "email": user.email,
            "description": user.description
        })
    return jsonify({"error": "User not found"}), 404

@api.route("/users/<int:user_id>/recipes", methods=["GET"])
def get_recipes_by_user(user_id):
    #Возвращает список рецептов конкретного пользователя
    user_tags = [u.user_tag for u in data_store["users"] if u.id_user == user_id]
    recipes = [r for r in data_store["recipes"] if r.author_tag in user_tags]
    
    return jsonify([
        {
            "title": recipe.title,
            "description": recipe.description_little,
            "cooking_time": recipe.cooking_time,
            "country": recipe.country,
            "type": recipe.type_recipe,
            "author": recipe.author_tag,
            "recipe_text": recipe.recipe_text,
            "image": recipe.image
        }
        for recipe in recipes
    ])

@api.route("/recipes", methods=["GET"])
def get_recipes():
    #Возвращает список всех рецептов
    return jsonify([
        {
            "title": recipe.title,
            "description": recipe.description_little,
            "cooking_time": recipe.cooking_time,
            "country": recipe.country,
            "type": recipe.type_recipe,
            "author": recipe.author_tag,
            "recipe_text": recipe.recipe_text,
            "image": recipe.image
        }
        for recipe in data_store["recipes"]
    ])


@api.route("/register", methods=["POST"])
@cross_origin()
def register_user():
    try:
        data = request.json
        if not data:
            return jsonify({"error": "Нет данных в запросе"}), 400

        print("Полученные данные:", data)  # Отладка

        session = SessionLocal()
        existing_user = session.query(UserProfile).filter_by(user_tag=data["user_tag"]).first()
        if existing_user:
            return jsonify({"error": "Пользователь уже существует"}), 400

        new_user = UserProfile(
            user_name=data["user_name"],
            user_tag=data["user_tag"],
            password=generate_password_hash(data["password"]),
            email=data["email"],
            description=data.get("description", "")
        )

        session.add(new_user)
        session.commit()
        return jsonify({"message": "Регистрация успешна"}), 201
    except Exception as e:
        print("Ошибка:", e)  # Выведет ошибку в консоль Flask
        return jsonify({"error": f"Ошибка на сервере: {e}"}), 500
