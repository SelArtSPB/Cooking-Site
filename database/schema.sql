DROP SEQUENCE IF EXISTS sq_idUser;
CREATE SEQUENCE  sq_idUser;

CREATE TABLE "usersProfile"(
    "idUser" int primary key default(nextval('sq_idUser')),
    "userName" varchar(75),
    "userTag" varchar(50) UNIQUE , -- всегла начинается с @
    "password" varchar(25), --шифровать при получении код ниже
    "email" varchar(50), --почта моджет изменятся 
    "description" varchar(5000) --опсиание добавляет пользователь
);
DROP SEQUENCE IF EXISTS sq_cardID;
CREATE SEQUENCE sq_cardID;

CREATE TABLE "cardRecipe"(
    "cardID" int primary key DEFAULT(nextval('sq_cardID')),
    "titleRecipe" varchar(50), 
    "descriptionLittle" varchar(150),
    "cookingTime" varchar(50),
    "countryRecipe" varchar(50),
    "typeRecipe" varchar(50),
    "authorTag" varchar(50),
    "recipeText" text,
    "imageRecipe" varchar(150), --ссылка на картинку
    Foreign Key ("authorTag") REFERENCES "usersProfile"("userTag")
);

CREATE TABLE "userRecipe"(
    "idUser" int,
    "cardID" int,
    Foreign Key ("idUser") REFERENCES "usersProfile"("idUser"),
    Foreign Key ("cardID") REFERENCES "cardRecipe"("cardID")
)