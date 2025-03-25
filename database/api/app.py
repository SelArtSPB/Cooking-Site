from flask import Flask
from models import Base, engine
from endpoints import api
from flask_cors import CORS

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
app.register_blueprint(api, url_prefix='/api')  # Добавляем префикс /api
app.config["DEBUG"] = True  # Включаем режим отладки

# Инициализация базы данных
Base.metadata.create_all(engine)

if __name__ == "__main__":
    app.run(debug=True)
