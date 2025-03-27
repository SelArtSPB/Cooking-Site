import sys
import os
from flask import Blueprint, jsonify, request
from flask_cors import cross_origin
from database.models import SessionLocal, SiteRecipe, StageRecipe, UserProfile
from .endpoint_auth import token_required
import logging

# Добавляем корневой каталог проекта в путь для импорта
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Создаем Blueprint для рецептов
recipes_bp = Blueprint('recipes', __name__)

logger = logging.getLogger(__name__)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@recipes_bp.route("/recipes", methods=["GET", "OPTIONS"])
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
            "image": r.imageRecipe,
            "stages": [{
                "id": stage.idStage,
                "description": stage.stageDiscription,
                "image": stage.stageImage
            } for stage in r.stages]
        } for r in recipes])
    except Exception as e:
        logger.error(f"Ошибка при получении рецептов: {str(e)}")
        return jsonify({"error": "Внутренняя ошибка сервера"}), 500
    finally:
        db.close()

@recipes_bp.route("/recipes/<int:recipe_id>", methods=["GET", "OPTIONS"])
def get_recipe(recipe_id):
    db = next(get_db())
    try:
        recipe = db.query(SiteRecipe).filter_by(idRecipe=recipe_id).first()
        if recipe:
            return jsonify({
                "id": recipe.idRecipe,
                "title": recipe.titleRecipe,
                "description": recipe.discriptionRecipe,
                "cookingTime": recipe.cookingTime,
                "country": recipe.contryRecipe,
                "type": recipe.typeRecipe,
                "author": recipe.autorRecipe,
                "image": recipe.imageRecipe,
                "stages": [{
                    "id": stage.idStage,
                    "description": stage.stageDiscription,
                    "image": stage.stageImage
                } for stage in recipe.stages]
            })
        return jsonify({"error": "Recipe not found"}), 404
    except Exception as e:
        logger.error(f"Ошибка при получении рецепта: {str(e)}")
        return jsonify({"error": "Внутренняя ошибка сервера"}), 500
    finally:
        db.close()

@recipes_bp.route("/recipes/<int:recipe_id>/stages", methods=["GET"])
def get_recipe_stages(recipe_id):
    db = next(get_db())
    try:
        stages = db.query(StageRecipe).filter_by(idRecipe=recipe_id).all()
        return jsonify([{
            "id": stage.idStage,
            "stage": stage.stage,
            "description": stage.stageDiscription,
            "image": stage.stageImage
        } for stage in stages])
    except Exception as e:
        logger.error(f"Ошибка при получении этапов рецепта: {str(e)}")
        return jsonify({"error": "Внутренняя ошибка сервера"}), 500
    finally:
        db.close()

@recipes_bp.route("/recipes/add", methods=["POST"])
@token_required
def add_recipe(current_user):
    data = request.json
    user_login = current_user.userLogin
    
    db = next(get_db())
    try:
        # Создаем новый рецепт
        new_recipe = SiteRecipe(
            titleRecipe=data.get("title"),
            discriptionRecipe=data.get("description"),
            cookingTime=data.get("cookingTime"),
            contryRecipe=data.get("country"),
            typeRecipe=data.get("type"),
            autorRecipe=user_login,
            imageRecipe=data.get("image")
        )
        db.add(new_recipe)
        db.flush()  # Чтобы получить id нового рецепта
        
        # Добавляем этапы приготовления
        for stage_data in data.get("stages", []):
            stage = StageRecipe(
                idRecipe=new_recipe.idRecipe,
                stage=stage_data.get("number"),
                stageImage=stage_data.get("image"),
                stageDiscription=stage_data.get("description")
            )
            db.add(stage)
        
        # Обновляем количество рецептов у пользователя
        user_profile = db.query(UserProfile).filter_by(userLoginID=user_login).first()
        if user_profile:
            user_profile.userRecipes = (user_profile.userRecipes or 0) + 1
        
        db.commit()
        return jsonify({"message": "Рецепт успешно добавлен!", "recipeId": new_recipe.idRecipe}), 201
    except Exception as e:
        db.rollback()
        logger.error(f"Ошибка при добавлении рецепта: {str(e)}")
        return jsonify({"error": "Ошибка при добавлении рецепта"}), 500
    finally:
        db.close()

@recipes_bp.route("/recipes/<int:recipe_id>", methods=["DELETE"])
@token_required
def delete_recipe(current_user, recipe_id):
    db = next(get_db())
    try:
        recipe = db.query(SiteRecipe).filter_by(idRecipe=recipe_id).first()
        if not recipe:
            return jsonify({"error": "Рецепт не найден"}), 404
            
        if recipe.autorRecipe != current_user.userLogin:
            return jsonify({"error": "У вас нет прав на удаление этого рецепта"}), 403
            
        db.delete(recipe)
        db.commit()
        return jsonify({"message": "Рецепт успешно удален"})
    except Exception as e:
        db.rollback()
        logger.error(f"Ошибка при удалении рецепта: {str(e)}")
        return jsonify({"error": "Ошибка при удалении рецепта"}), 500
    finally:
        db.close() 