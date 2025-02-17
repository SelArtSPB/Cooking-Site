-- Это сделано для создания отдельной базы данных для кулинарного сайта
CREATE SCHEMA cooking_site;
SET search_path = 'cooking_site';

CREATE SEQUENCE  sq_idUser;

CREATE TABLE usersProfile (
    idUser int primary key default(nextval('sq_idUser')),
    userTag varchar(50) UNIQUE , -- всегла начинается с @
    password varchar(25), --шифровать при получении код ниже
    email varchar(50), --почта моджет изменятся 
    description varchar(5000) --опсиание добавляет пользователь
);

CREATE SEQUENCE sq_cardID;

CREATE TABLE cardRecipe(
    cardID int primary key DEFAULT(nextval('sq_cardID')),
    titleRecipe varchar(50), 
    descriptionLittle varchar(150),
    cookingTime varchar(50),
    countryRecipe varchar(50),
    typeRecipe varchar(50),
    authorTag varchar(50),
    recipeText text,
    imageRecipe varchar(150), --ссылка на картинку
    Foreign Key (authorTag) REFERENCES usersProfile(userTag)
);

CREATE TABLE userRecipe(
    idUser int,
    cardID int,
    Foreign Key (idUser) REFERENCES usersProfile(idUser),
    Foreign Key (cardID) REFERENCES cardRecipe(cardID)
)