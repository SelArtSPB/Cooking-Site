-- Конфигурация и настройки
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- База и таблицы
CREATE TABLE "userInfo"(
    "userEmail" VARCHAR(125) NOT NULL UNIQUE,
    "userLogin" VARCHAR(75) NOT NULL PRIMARY KEY,
    "userPassword" VARCHAR(225) NOT NULL -- Пароль будет шифроваться через триггер
);

CREATE TABLE "siteRecipes" (
    "idRecipe" SERIAL PRIMARY KEY,
    "imageRecipe" TEXT,
    "titleRecipe" TEXT NOT NULL,
    "discriptionRecipe" TEXT,
    "contryRecipe" TEXT,
    "typeRecipe" TEXT,
    "autorRecipe" VARCHAR(75) REFERENCES "userInfo"("userLogin") ON DELETE CASCADE
);

CREATE TABLE "stageRecipes" (
    "idStage" SERIAL PRIMARY KEY,
    "idRecipe" INTEGER REFERENCES "siteRecipes"("idRecipe") ON DELETE CASCADE,
    "stage" INTEGER NOT NULL,
    "stageImage" TEXT,
    "stageDiscription" TEXT NOT NULL
);

CREATE TABLE "userProfile"(
    "userLoginID" VARCHAR(75) PRIMARY KEY REFERENCES "userInfo"("userLogin") ON DELETE CASCADE,
    "userImage" VARCHAR(1000) NULL, -- Ссылка на изображение
    "userFullName" VARCHAR(125) NULL,
    "userDescription" VARCHAR(500) NULL,
    "userRecipes" INTEGER DEFAULT 0 -- Количество рецептов пользователя
);

-- Триггер для хеширования пароля перед вставкой
CREATE OR REPLACE FUNCTION hash_user_password()
RETURNS TRIGGER AS $$
BEGIN
    NEW."userPassword" := crypt(NEW."userPassword", gen_salt('bf'));
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_hash_password
BEFORE INSERT ON "userInfo"
FOR EACH ROW
EXECUTE FUNCTION hash_user_password();



