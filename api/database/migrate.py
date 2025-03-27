import sys
import os

# Добавляем корневой каталог проекта в путь для импорта
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from database.models import engine
from sqlalchemy import text

def add_cooking_time_column():
    with engine.connect() as connection:
        connection.execute(text('ALTER TABLE "siteRecipes" ADD COLUMN IF NOT EXISTS "cookingTime" INTEGER'))
        connection.commit()

def remove_full_name_column():
    with engine.connect() as connection:
        connection.execute(text('ALTER TABLE "userProfile" DROP COLUMN IF EXISTS "userFullName"'))
        connection.commit()
        print("Столбец userFullName успешно удален из таблицы userProfile")

def update_primary_key():
    with engine.connect() as connection:
        # Удаляем существующие ограничения
        connection.execute(text('ALTER TABLE "userInfo" DROP CONSTRAINT IF EXISTS "userInfo_pkey"'))
        connection.execute(text('ALTER TABLE "userInfo" DROP CONSTRAINT IF EXISTS "userInfo_userEmail_key"'))
        
        # Устанавливаем новые ограничения
        connection.execute(text('ALTER TABLE "userInfo" ADD PRIMARY KEY ("userLogin")'))
        connection.execute(text('ALTER TABLE "userInfo" ADD CONSTRAINT "userInfo_userEmail_key" UNIQUE ("userEmail")'))
        
        connection.commit()
        print("Структура таблицы userInfo успешно обновлена")

def update_foreign_keys():
    with engine.connect() as connection:
        # Удаляем существующие внешние ключи
        connection.execute(text('''
            ALTER TABLE "siteRecipes" 
            DROP CONSTRAINT IF EXISTS "siteRecipes_autorRecipe_fkey"
        '''))
        connection.execute(text('''
            ALTER TABLE "userProfile" 
            DROP CONSTRAINT IF EXISTS "userProfile_userLoginID_fkey"
        '''))
        
        # Добавляем новые внешние ключи с каскадным обновлением
        connection.execute(text('''
            ALTER TABLE "siteRecipes" 
            ADD CONSTRAINT "siteRecipes_autorRecipe_fkey" 
            FOREIGN KEY ("autorRecipe") 
            REFERENCES "userInfo"("userLogin") 
            ON DELETE CASCADE ON UPDATE CASCADE
        '''))
        connection.execute(text('''
            ALTER TABLE "userProfile" 
            ADD CONSTRAINT "userProfile_userLoginID_fkey" 
            FOREIGN KEY ("userLoginID") 
            REFERENCES "userInfo"("userLogin") 
            ON DELETE CASCADE ON UPDATE CASCADE
        '''))
        
        connection.commit()
        print("Внешние ключи успешно обновлены")

def create_recommended_recipes_table():
    with engine.connect() as connection:
        connection.execute(text('''
            CREATE TABLE IF NOT EXISTS "recommendedRecipes" (
                "id" SERIAL PRIMARY KEY,
                "recipeId" INTEGER REFERENCES "siteRecipes"("idRecipe") ON DELETE CASCADE,
                "dateAdded" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        '''))
        
        connection.commit()
        print("Таблица recommendedRecipes успешно создана или уже существует")

def add_avatar_binary_columns():
    with engine.connect() as connection:
        # Добавляем колонки для бинарных данных аватара и Base64 представления
        connection.execute(text('''
            ALTER TABLE "userProfile" 
            ADD COLUMN IF NOT EXISTS "userAvatarBinary" BYTEA,
            ADD COLUMN IF NOT EXISTS "userAvatarBase64" TEXT
        '''))
        
        connection.commit()
        print("Колонки для хранения бинарных данных аватара успешно добавлены")

def make_email_nullable():
    with engine.connect() as connection:
        # Обновляем ограничения для email
        connection.execute(text('''
            ALTER TABLE "userInfo" 
            ALTER COLUMN "userEmail" DROP NOT NULL
        '''))
        
        connection.commit()
        print("Поле userEmail успешно изменено на необязательное")

if __name__ == "__main__":
    add_cooking_time_column()
    remove_full_name_column()
    update_primary_key()
    update_foreign_keys()
    create_recommended_recipes_table()
    add_avatar_binary_columns()
    make_email_nullable() 