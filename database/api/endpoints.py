from flask import Blueprint, jsonify
from models import SessionLocal, UserProfile, CardRecipe

api = Blueprint("api", __name__)

data_store = {"users": [], "recipes": []}

def load_data():
    session = SessionLocal()
    data_store["users"] = session.query(UserProfile).all()
    data_store["recipes"] = session.query(CardRecipe).all()
    session.close()
    if not data_store["users"]:
        print("Ошибка: данные пользователей не загружены из БД")
    if not data_store["recipes"]:
        print("Ошибка: данные рецептов не загружены из БД")

def save_data():
    session = SessionLocal()
    try:
        for user in data_store["users"]:
            session.merge(user)
        for recipe in data_store["recipes"]:
            session.merge(recipe)
        session.commit()
    except Exception as e:
        print("Ошибка сохранения данных в БД:", e)
    finally:
        session.close()

@api.route("/users", methods=["GET"])
def users():
    return jsonify([{ "id": u.id_user, "name": u.user_name, "tag": u.user_tag, "email": u.email, "description": u.description } for u in data_store["users"]])

@api.route("/users/<int:user_id>", methods=["GET"])
def user_by_id(user_id):
    user = next((u for u in data_store["users"] if u.id_user == user_id), None)
    if user:
        return jsonify({ "name": user.user_name, "tag": user.user_tag, "email": user.email, "description": user.description })
    return jsonify({ "error": "User not found" }), 404

@api.route("/users/<int:user_id>/recipes", methods=["GET"])
def recipes_by_user(user_id):
    recipes = [r for r in data_store["recipes"] if r.author_tag in [u.user_tag for u in data_store["users"] if u.id_user == user_id]]
    return jsonify([{ "title": r.title, "description": r.description_little, "cooking_time": r.cooking_time, "country": r.country, "type": r.type_recipe, "author": r.author_tag, "recipe_text": r.recipe_text, "image": r.image } for r in recipes])

@api.route("/recipes", methods=["GET"])
def recipes():
    return jsonify([{ "title": r.title, "description": r.description_little, "cooking_time": r.cooking_time, "country": r.country, "type": r.type_recipe, "author": r.author_tag, "recipe_text": r.recipe_text, "image": r.image } for r in data_store["recipes"]])
