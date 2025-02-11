-- Это сделано для создания отдельной базы данных для кулинарного сайта
CREATE SCHEMA cooking_site;
SET search_path = 'cooking_site';

CREATE SEQUENCE 'sq_idUser';

CREATE TABLE users (
    idUser int primary key default(nextval('sq_idUser')),
    password varchar(25), --шифровать при получении код ниже
    email varchar(50) 
    description (5000)
)