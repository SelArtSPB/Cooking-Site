from flask import Flask
from .models import Base, engine
from .endpoints import api, load_data, save_data
import threading
import time

app = Flask(__name__)
app.register_blueprint(api)

def init_app():
    """Инициализация приложения и базы данных"""
    Base.metadata.create_all(engine)
    load_data()

def autosave():
    """Фоновая задача автосохранения данных каждые 5 минут"""
    while True:
        time.sleep(300)  # 5 минут
        save_data()

if __name__ == "__main__":
    init_app()
    
    # Запуск фоновой задачи автосохранения
    autosave_thread = threading.Thread(target=autosave, daemon=True)
    autosave_thread.start()
    
    app.run(debug=True)