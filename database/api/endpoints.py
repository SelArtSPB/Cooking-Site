from flask import Blueprint, jsonify
from .models import SessionLocal, UserProfile, CardRecipe

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