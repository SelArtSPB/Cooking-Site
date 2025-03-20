from models import Base, engine

def reset_database():
    Base.metadata.drop_all(engine)  # Удаляет все таблицы
    Base.metadata.create_all(engine)  # Создает все таблицы заново

if __name__ == "__main__":
    reset_database() 