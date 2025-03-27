import sys
import os

# Добавляем корневой каталог проекта в путь для импорта
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from flask import jsonify, request
from flask_cors import cross_origin
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy import desc
from database.models import SessionLocal, SiteRecipe, RecommendedRecipe
from .endpoint_auth import token_required
from . import api

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