import sys
import os

# Добавляем корневой каталог проекта в путь для импорта
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from flask import jsonify, request
from flask_cors import cross_origin
from database.models import SessionLocal, SiteRecipe, StageRecipe, UserProfile
from .endpoint_auth import token_required
from . import api

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