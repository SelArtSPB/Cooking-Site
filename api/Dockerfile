FROM python:3.9-slim

WORKDIR /app

# Устанавливаем необходимые инструменты
RUN apt-get update && apt-get install -y netcat-openbsd && apt-get clean

# Копируем файлы зависимостей
COPY requirements.txt .

# Устанавливаем зависимости
RUN pip install --no-cache-dir -r requirements.txt

# Копируем скрипт ожидания и делаем его исполняемым
COPY wait-for-it.sh /app/wait-for-it.sh
RUN chmod +x /app/wait-for-it.sh

# Копируем остальные файлы проекта
COPY . .

# Создаем директории для файлов
RUN mkdir -p uploads/recipes uploads/avatars

# Устанавливаем переменные окружения
ENV FLASK_APP=app.py
ENV FLASK_ENV=development
ENV PYTHONUNBUFFERED=1

EXPOSE 5000

# Запускаем приложение с ожиданием БД
CMD ["/app/wait-for-it.sh", "database", "5432", "python", "app.py"] 