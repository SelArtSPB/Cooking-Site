from flask import Blueprint, jsonify, request
from sqlalchemy.orm import Session
from models import SessionLocal, UserInfo, SiteRecipe, StageRecipe, UserProfile
from werkzeug.security import generate_password_hash
from flask_cors import cross_origin

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
