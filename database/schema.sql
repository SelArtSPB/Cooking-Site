-- База и таблицы
CREATE TABLE "userInfo" (
    "userLogin" VARCHAR(75) PRIMARY KEY,
    "userEmail" VARCHAR(125) NOT NULL UNIQUE,
    "userPassword" VARCHAR(225) NOT NULL, -- Храним зашифрованный пароль
    "salt" VARCHAR(50) NOT NULL -- Храним соль для Argon2
);

CREATE TABLE "siteRecipes" (
    "idRecipe" SERIAL PRIMARY KEY,
    "imageRecipe" TEXT,
    "titleRecipe" TEXT NOT NULL,
    "discriptionRecipe" TEXT,
    "cookingTime" INTEGER,
    "contryRecipe" TEXT,
    "typeRecipe" TEXT,
    "autorRecipe" VARCHAR(75) REFERENCES "userInfo"("userLogin") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE "stageRecipes" (
    "idStage" SERIAL PRIMARY KEY,
    "idRecipe" INTEGER REFERENCES "siteRecipes"("idRecipe") ON DELETE CASCADE,
    "stage" INTEGER NOT NULL,
    "stageImage" TEXT,
    "stageDiscription" TEXT NOT NULL
);

CREATE TABLE "userProfile" (
    "userLoginID" VARCHAR(75) REFERENCES "userInfo"("userLogin") ON DELETE CASCADE ON UPDATE CASCADE,
    "userImage" TEXT,
    "userDescription" TEXT,
    "userRecipes" INTEGER DEFAULT 0,
    PRIMARY KEY ("userLoginID")
);

-- Новая таблица для рекомендуемых рецептов
CREATE TABLE "recommendedRecipes" (
    "id" SERIAL PRIMARY KEY,
    "recipeId" INTEGER REFERENCES "siteRecipes"("idRecipe") ON DELETE CASCADE,
    "dateAdded" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);



