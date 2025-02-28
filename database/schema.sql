-- База и таблицы
CREATE TABLE "userInfo" (
    "userEmail" VARCHAR(125) NOT NULL UNIQUE,
    "userLogin" VARCHAR(75) NOT NULL PRIMARY KEY,
    "userPassword" VARCHAR(225) NOT NULL, -- Храним зашифрованный пароль
    "salt" VARCHAR(50) NOT NULL -- Храним соль для Argon2
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



