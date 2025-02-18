from flask import Flask
from models import Base, engine
from endpoints import api, load_data, save_data
import threading
import time

app = Flask(__name__)
app.register_blueprint(api)

Base.metadata.create_all(engine)

load_data()

def autosave():
    while True:
        time.sleep(300)  # каждые 5 минут
        save_data()

autosave_thread = threading.Thread(target=autosave, daemon=True)
autosave_thread.start()

if __name__ == "__main__":
    app.run(debug=True)
