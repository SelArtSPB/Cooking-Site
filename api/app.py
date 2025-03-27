import os
import logging
import traceback
from pathlib import Path
from flask import Flask, jsonify, request, Response
from flask_cors import CORS
from database.models import Base, engine
from endpoints import api

# Настраиваем логирование
logging.basicConfig(
    level=logging.DEBUG,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler("app_requests.log"),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger("flask_app")

# Функция для настройки приложения
def create_app():
    app = Flask(__name__)
    
    # Настраиваем CORS более детально
    CORS(app, 
        resources={r"/*": {
            "origins": ["http://localhost:5000", "http://127.0.0.1:5500", "http://localhost:3000"], 
            "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
            "allow_headers": ["Content-Type", "Authorization"]
        }}, 
        supports_credentials=True
    )
    
    # Регистрируем middleware для логирования запросов
    @app.before_request
    def log_request():
        logger.info(f"Запрос: {request.method} {request.path}")
        logger.debug(f"Headers: {dict(request.headers)}")
        if request.get_json(silent=True):
            # Скрываем пароль в логах, если он есть
            data = request.get_json()
            if isinstance(data, dict) and 'password' in data:
                safe_data = {**data, 'password': '******' if data['password'] else None}
                logger.debug(f"JSON данные: {safe_data}")
            else:
                logger.debug(f"JSON данные: {data}")
    
    # Регистрируем middleware для логирования ответов
    @app.after_request
    def log_response(response):
        logger.info(f"Ответ: {response.status}")
        logger.debug(f"Response headers: {dict(response.headers)}")
        
        # Логируем тело ответа, если это JSON
        if response.headers.get('Content-Type') == 'application/json':
            try:
                # Получаем данные, не изменяя ответ
                response_data = response.get_data(as_text=True)
                logger.debug(f"Response data: {response_data}")
            except Exception as e:
                logger.error(f"Не удалось прочитать тело ответа: {e}")
        
        return response
    
    # Обработчик ошибок
    @app.errorhandler(Exception)
    def handle_exception(e):
        logger.error(f"Необработанное исключение: {str(e)}")
        logger.error(traceback.format_exc())
        return jsonify({"error": "Внутренняя ошибка сервера"}), 500
    
    # Регистрируем blueprint
    app.register_blueprint(api, url_prefix='/api')
    
    # Настройки приложения
    app.config["DEBUG"] = True
    
    # Создаем структуру директорий для загрузки файлов
    uploads_dir = Path('uploads/recipes')
    if not uploads_dir.exists():
        uploads_dir.mkdir(parents=True, exist_ok=True)
        logger.info(f"Создана директория для загрузки рецептов: {uploads_dir}")
    
    # Создаем директорию для аватаров, если её нет
    avatars_dir = Path('uploads/avatars')
    if not avatars_dir.exists():
        avatars_dir.mkdir(parents=True, exist_ok=True)
        logger.info(f"Создана директория для аватаров: {avatars_dir}")
    
    # Инициализация базы данных
    Base.metadata.create_all(engine)
    logger.info("База данных успешно инициализирована")
    
    return app

# Создаем экземпляр приложения
app = create_app()

if __name__ == "__main__":
    app.run(debug=True)
