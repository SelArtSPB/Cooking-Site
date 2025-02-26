from flask import Flask
from models import Base, engine
from endpoints import api
from flask_cors import CORS

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})  # Разрешает запросы со всех источников
app.register_blueprint(api)
app.config["DEBUG"] = True  # Включаем режим отладки

# Инициализация базы данных
Base.metadata.create_all(engine)

if __name__ == "__main__":
    app.run(debug=True)
