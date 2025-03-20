import os
from base64 import b64encode, b64decode

SECRET_PEPPER = "SuperSecretPepper123!"
# Используем фиксированный ключ длиной ровно 32 байта
AES_KEY = b'12345678901234567890123456789012'  # Ровно 32 байта

# Для продакшена рекомендуется использовать более безопасный ключ,
# но он также должен быть длиной 32 байта

# Добавляем секретный ключ для JWT
JWT_SECRET_KEY = "your-secret-key-here"  # В продакшене используйте безопасный ключ
JWT_REFRESH_SECRET_KEY = "your-refresh-secret-key-here"

# Время жизни токенов
ACCESS_TOKEN_EXPIRES = 30  # минут
REFRESH_TOKEN_EXPIRES = 30  # дней
