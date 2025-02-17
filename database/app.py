from flask import Flask, jsonify
from sqlalchemy import Column, Integer, String, Text, ForeignKey, Sequence, create_engine
from sqlalchemy.orm import relationship, declarative_base, sessionmaker
import threading
import time

Base = declarative_base()

class UserProfile(Base):
    __tablename__ = "usersProfile"
    id_user = Column("idUser", Integer, Sequence("sq_idUser"), primary_key=True)
    user_name = Column("userName", String(75))
    user_tag = Column("userTag", String(50), unique=True)
    password = Column("password", String(25))
    email = Column("email", String(50))
    description = Column("description", String(5000))
    
    recipes = relationship("CardRecipe", back_populates="author")

class CardRecipe(Base):
    __tablename__ = "cardRecipe"
    card_id = Column("cardID", Integer, Sequence("sq_cardID"), primary_key=True)
    title = Column("titleRecipe", String(50))
    description_little = Column("descriptionLittle", String(150))
    cooking_time = Column("cookingTime", String(50))
    country = Column("countryRecipe", String(50))
    type_recipe = Column("typeRecipe", String(50))
    author_tag = Column("authorTag", String(50), ForeignKey("usersProfile.userTag"))
    recipe_text = Column("recipeText", Text)
    image = Column("imageRecipe", String(150))
    
    author = relationship("UserProfile", back_populates="recipes")

class UserRecipe(Base):
    __tablename__ = "userRecipe"
    id_user = Column("idUser", Integer, ForeignKey("usersProfile.idUser"), primary_key=True)
    card_id = Column("cardID", Integer, ForeignKey("cardRecipe.cardID"), primary_key=True)

DATABASE_URL = "postgresql://postgres:123456789@localhost/Cooking-Site"
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(bind=engine)

app = Flask(__name__)

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

load_data()

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

def autosave():
    while True:
        time.sleep(300)  # каждые 5 минут
        save_data()

autosave_thread = threading.Thread(target=autosave, daemon=True)
autosave_thread.start()

@app.route("/users", methods=["GET"])
def users():
    return jsonify([{ "id": u.id_user, "name": u.user_name, "tag": u.user_tag, "email": u.email, "description": u.description } for u in data_store["users"]])

@app.route("/users/<int:user_id>", methods=["GET"])
def user_by_id(user_id):
    user = next((u for u in data_store["users"] if u.id_user == user_id), None)
    if user:
        return jsonify({ "id": user.id_user, "name": user.user_name, "tag": user.user_tag, "email": user.email, "description": user.description })
    return jsonify({ "error": "User not found" }), 404

@app.route("/users/<int:user_id>/recipes", methods=["GET"])
def recipes_by_user(user_id):
    recipes = [r for r in data_store["recipes"] if r.author_tag in [u.user_tag for u in data_store["users"] if u.id_user == user_id]]
    return jsonify([{ "id": r.card_id, "title": r.title, "description": r.description_little, "cooking_time": r.cooking_time, "country": r.country, "type": r.type_recipe, "recipe_text": r.recipe_text, "image": r.image } for r in recipes])

@app.route("/recipes", methods=["GET"])
def recipes():
    return jsonify([{ "id": r.card_id, "title": r.title, "description": r.description_little, "cooking_time": r.cooking_time, "country": r.country, "type": r.type_recipe, "author": r.author_tag, "recipe_text": r.recipe_text, "image": r.image } for r in data_store["recipes"]])

if __name__ == "__main__":
    app.run(debug=True)