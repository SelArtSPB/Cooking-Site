import os
from dotenv import load_dotenv
from base64 import b64encode, b64decode

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
