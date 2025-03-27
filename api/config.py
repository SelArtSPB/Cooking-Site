import os
import secrets
import string
from pathlib import Path
from dotenv import load_dotenv
from base64 import b64encode, b64decode

# Функция для генерации случайного ключа
def generate_random_key(length=32):
    alphabet = string.ascii_letters + string.digits + "!@#$%^&*()_-+=<>?/"
    return ''.join(secrets.choice(alphabet) for _ in range(length))

# Функция для генерации .env файла
def generate_env_file():
    env_path = Path('.env')
    
    if env_path.exists():
        print("Файл .env уже существует. Используем существующий файл.")
        return
    
    # Генерируем случайные ключи безопасности
    secret_pepper = generate_random_key(24)
    aes_key = generate_random_key(32)  # AES ключ должен быть 32 байта для AES-256
    jwt_secret = generate_random_key(32)
    jwt_refresh_secret = generate_random_key(32)
    
    # Запрашиваем у пользователя параметры подключения к БД
    print("Необходимо настроить подключение к базе данных PostgreSQL")
    db_user = input("Имя пользователя PostgreSQL (по умолчанию postgres): ") or "postgres"
    db_password = input("Пароль PostgreSQL: ")
    db_host = input("Хост PostgreSQL (по умолчанию localhost): ") or "localhost"
    db_name = input("Имя базы данных (по умолчанию postgres): ") or "postgres"
    
    # Формируем строку подключения
    db_url = f"postgresql://{db_user}:{db_password}@{db_host}/{db_name}"
    
    # Создаем содержимое .env файла
    env_content = f"""SECRET_PEPPER={secret_pepper}
AES_KEY={aes_key}
JWT_SECRET_KEY={jwt_secret}
JWT_REFRESH_SECRET_KEY={jwt_refresh_secret}
ACCESS_TOKEN_EXPIRES=30
REFRESH_TOKEN_EXPIRES=30
DATABASE_URL={db_url}
"""
    
    # Записываем в файл
    with open(env_path, 'w') as f:
        f.write(env_content)
    
    print(f"Файл .env успешно создан с безопасными ключами")

# Генерируем .env файл, если он не существует
generate_env_file()

# Загружаем переменные окружения из .env файла
load_dotenv()

# Получаем значения из переменных окружения
SECRET_PEPPER = os.getenv('SECRET_PEPPER')
AES_KEY = os.getenv('AES_KEY').encode()  # Конвертируем в bytes

# Для продакшена рекомендуется использовать более безопасный ключ,
# но он также должен быть длиной 32 байта

# Добавляем секретный ключ для JWT
JWT_SECRET_KEY = os.getenv('JWT_SECRET_KEY')
JWT_REFRESH_SECRET_KEY = os.getenv('JWT_REFRESH_SECRET_KEY')

# Время жизни токенов
ACCESS_TOKEN_EXPIRES = int(os.getenv('ACCESS_TOKEN_EXPIRES', 30))  # минут
REFRESH_TOKEN_EXPIRES = int(os.getenv('REFRESH_TOKEN_EXPIRES', 30))  # дней

# URL базы данных
DATABASE_URL = os.getenv('DATABASE_URL')
