import sys
import os

# Добавляем корневой каталог проекта в путь для импорта
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from database.models import Base, engine

def reset_database():
    Base.metadata.drop_all(engine)  # Удаляет все таблицы
    Base.metadata.create_all(engine)  # Создает все таблицы заново

if __name__ == "__main__":
    reset_database()
    print("База данных успешно сброшена и пересоздана.") 