-- Это сделано для создания отдельной базы данных для кулинарного сайта
CREATE SCHEMA cooking_site;
SET search_path = 'cooking_site';

-- Создаю типы данных для:
-- 1. Ролей пользователей (обычный пользователь, повар, администратор)
-- 2. Сложности рецептов (легкий, средний, сложный)
-- 3. Категорий блюд (завтрак, обед, ужин и т.д.)
CREATE TYPE user_role AS ENUM ('user', 'chef', 'admin');
CREATE TYPE recipe_difficulty AS ENUM ('easy', 'medium', 'hard');
CREATE TYPE recipe_category AS ENUM ('breakfast', 'lunch', 'dinner', 'dessert', 'snack', 'drink');

-- Это сделано для хранения информации о пользователях
-- Я смогу:
-- - регистрировать новых пользователей
-- - хранить их роли и аватары
-- - отслеживать дату регистрации и обновления профиля
CREATE TABLE users (
    user_id SERIAL PRIMARY KEY,          -- Уникальный идентификатор пользователя
    username VARCHAR(50) UNIQUE NOT NULL, -- Уникальное имя пользователя
    email VARCHAR(100) UNIQUE NOT NULL,  -- Уникальный email
    password_hash VARCHAR(255) NOT NULL,  -- Хэш пароля для безопасности
    role user_role DEFAULT 'user',       -- Роль пользователя (по умолчанию 'user')
    avatar_url VARCHAR(255),             -- Ссылка на аватар пользователя
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, -- Дата создания аккаунта
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP  -- Дата последнего обновления
);

-- Это сделано для расширенных профилей поваров
-- Я смогу:
-- - хранить информацию о профессиональных поварах
-- - показывать их специализацию и опыт
-- - указывать место работы
CREATE TABLE chefs (
    chef_id SERIAL PRIMARY KEY, -- Уникальный идентификатор шеф-повара
    user_id INTEGER REFERENCES users(user_id), -- Связь с таблицей пользователей
    full_name VARCHAR(100) NOT NULL,     -- Полное имя шеф-повара
    bio TEXT,                            -- Биография
    specialization VARCHAR(100),         -- Специализация (например, "Итальянская кухня")
    experience_years INTEGER,            -- Опыт работы в годах
    photo_url VARCHAR(255),             -- Фото шеф-повара
    restaurant VARCHAR(100),            -- Ресторан, где работает
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP -- Дата создания записи
);

-- Это сделано для категоризации рецептов по странам
-- Я смогу:
-- - группировать рецепты по национальным кухням
-- - добавлять описания кухонь разных стран
-- - прикреплять изображения к каждой кухне
CREATE TABLE countries (
    country_id SERIAL PRIMARY KEY,      -- Уникальный идентификатор страны
    name VARCHAR(100) NOT NULL,         -- Название страны
    description TEXT,                   -- Описание кухни страны
    image_url VARCHAR(255)             -- Изображение, представляющее кухню
);

-- Это сделано для хранения основной информации о рецептах
-- Я смогу:
-- - создавать рецепты с описанием и фото
-- - указывать время приготовления и сложность
-- - отслеживать просмотры рецептов
CREATE TABLE recipes (
    recipe_id SERIAL PRIMARY KEY,       -- Уникальный идентификатор рецепта
    title VARCHAR(200) NOT NULL,        -- Название рецепта
    description TEXT,                   -- Описание блюда
    cooking_time INTEGER,               -- Время приготовления в минутах
    difficulty recipe_difficulty,       -- Сложность приготовления
    servings INTEGER,                   -- Количество порций
    category recipe_category,           -- Категория блюда
    country_id INTEGER REFERENCES countries(country_id), -- Связь с национальной кухней
    author_id INTEGER REFERENCES users(user_id),        -- Автор рецепта
    main_image_url VARCHAR(255),        -- Главное фото блюда
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    views_count INTEGER DEFAULT 0       -- Счетчик просмотров
);

-- Это сделано для каталога ингредиентов
-- Я смогу:
-- - создавать базу всех возможных ингредиентов
-- - добавлять их описания и фотографии
CREATE TABLE ingredients (
    ingredient_id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,         -- Название ингредиента
    description TEXT,                   -- Описание ингредиента
    image_url VARCHAR(255)             -- Фото ингредиента
);

-- Это сделано для связи рецептов с ингредиентами
-- Я смогу:
-- - указывать точное количество каждого ингредиента
-- - задавать единицы измерения
CREATE TABLE recipe_ingredients (
    recipe_id INTEGER REFERENCES recipes(recipe_id),
    ingredient_id INTEGER REFERENCES ingredients(ingredient_id),
    quantity DECIMAL,                   -- Количество ингредиента
    unit VARCHAR(20),                   -- Единица измерения (грамм, штука и т.д.)
    PRIMARY KEY (recipe_id, ingredient_id)
);

-- Это сделано для пошаговых инструкций
-- Я смогу:
-- - создавать последовательность шагов приготовления
-- - добавлять фото к каждому шагу
CREATE TABLE cooking_steps (
    step_id SERIAL PRIMARY KEY,
    recipe_id INTEGER REFERENCES recipes(recipe_id),
    step_number INTEGER,                -- Порядковый номер шага
    description TEXT,                   -- Описание шага
    image_url VARCHAR(255)             -- Фото для шага (опционально)
);

-- Это сделано для категоризации рецептов тегами
-- Я смогу:
-- - создавать теги для фильтрации рецептов
-- - группировать рецепты по характеристикам
CREATE TABLE tags (
    tag_id SERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL    -- Уникальное название тега
);

-- Это сделано для связи рецептов с тегами
-- Я смогу:
-- - присваивать рецептам множество тегов
CREATE TABLE recipe_tags (
    recipe_id INTEGER REFERENCES recipes(recipe_id),
    tag_id INTEGER REFERENCES tags(tag_id),
    PRIMARY KEY (recipe_id, tag_id)
);

-- Это сделано для системы комментариев
-- Я смогу:
-- - позволять пользователям оставлять комментарии
-- - отслеживать время создания и редактирования
CREATE TABLE comments (
    comment_id SERIAL PRIMARY KEY,
    recipe_id INTEGER REFERENCES recipes(recipe_id),
    user_id INTEGER REFERENCES users(user_id),
    content TEXT,                       -- Текст комментария
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Это сделано для системы оценок
-- Я смогу:
-- - позволять пользователям оценивать рецепты
-- - ограничивать одну оценку от пользователя
CREATE TABLE recipe_ratings (
    rating_id SERIAL PRIMARY KEY,
    recipe_id INTEGER REFERENCES recipes(recipe_id),
    user_id INTEGER REFERENCES users(user_id),
    rating INTEGER CHECK (rating >= 1 AND rating <= 5), -- Проверка допустимости оценки
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (recipe_id, user_id)         -- Один пользователь может оставить только одну оценку
);

-- Это сделано для функции "Избранное"
-- Я смогу:
-- - позволять пользователям сохранять рецепты
-- - создавать персональные коллекции
CREATE TABLE favorite_recipes (
    user_id INTEGER REFERENCES users(user_id),
    recipe_id INTEGER REFERENCES recipes(recipe_id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, recipe_id)    -- Уникальная комбинация пользователь-рецепт
);

-- Это сделано для новостного раздела
-- Я смогу:
-- - публиковать новости и статьи
-- - добавлять изображения к новостям
CREATE TABLE news (
    news_id SERIAL PRIMARY KEY,
    title VARCHAR(200) NOT NULL,        -- Заголовок новости
    content TEXT,                       -- Содержание новости
    image_url VARCHAR(255),             -- Изображение к новости
    author_id INTEGER REFERENCES users(user_id), -- Автор новости
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Это сделано для оптимизации поиска
-- Я смогу:
-- - ускорить поиск по категориям
-- - ускорить поиск по странам
-- - ускорить поиск комментариев и оценок
CREATE INDEX idx_recipes_category ON recipes(category);           -- Поиск по категории
CREATE INDEX idx_recipes_country ON recipes(country_id);         -- Поиск по стране
CREATE INDEX idx_recipes_author ON recipes(author_id);           -- Поиск по автору
CREATE INDEX idx_recipe_ingredients_recipe ON recipe_ingredients(recipe_id); -- Поиск ингредиентов рецепта
CREATE INDEX idx_recipe_tags_recipe ON recipe_tags(recipe_id);   -- Поиск тегов рецепта
CREATE INDEX idx_comments_recipe ON comments(recipe_id);         -- Поиск комментариев к рецепту
CREATE INDEX idx_recipe_ratings_recipe ON recipe_ratings(recipe_id); -- Поиск оценок рецепта
CREATE INDEX idx_favorite_recipes_user ON favorite_recipes(user_id); -- Поиск избранных рецептов пользователя

-- Это сделано для автоматического обновления времени
-- Я смогу:
-- - автоматически обновлять временные метки
-- - отслеживать время последних изменений
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Это сделано для автоматического обновления данных
-- Я смогу:
-- - автоматически обновлять время изменения записей
-- - поддерживать актуальность данных
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_recipes_updated_at
    BEFORE UPDATE ON recipes
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_comments_updated_at
    BEFORE UPDATE ON comments
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_news_updated_at
    BEFORE UPDATE ON news
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column(); 