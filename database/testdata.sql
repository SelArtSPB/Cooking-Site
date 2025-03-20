-- Примерные данные
INSERT INTO "userInfo" ("userEmail", "userLogin", "userPassword") 
VALUES 
('test1@example.com', 'chefAlex', 'password123'),
('test2@example.com', 'foodieAnna', 'securepass'),
('test3@example.com', 'recipeMaster', 'mystrongpassword');

INSERT INTO "userProfile" ("userLoginID", "userImage", "userDescription", "userRecipes") 
VALUES 
('chefAlex', 'images/alex.jpg', 'Люблю готовить итальянскую кухню', 2),
('foodieAnna', 'images/anna.jpg', 'Экспериментирую с десертами', 3),
('recipeMaster', 'images/master.jpg', 'Профессиональный повар', 5);

INSERT INTO "siteRecipes" ("imageRecipe", "titleRecipe", "discriptionRecipe", "contryRecipe", "typeRecipe", "autorRecipe") 
VALUES 
('images/carbonara.jpg', 'Паста Карбонара', 'Классический итальянский рецепт', 'Италия', 'Основное блюдо', 'chefAlex'),
('images/borsh.jpg', 'Борщ', 'Традиционный русский борщ с говядиной', 'Россия', 'Суп', 'foodieAnna'),
('images/sushi.jpg', 'Суши', 'Японские суши с лососем и авокадо', 'Япония', 'Закуска', 'recipeMaster');

-- Получаем id рецепта "Паста Карбонара"
WITH inserted AS (
    INSERT INTO "siteRecipes" ("imageRecipe", "titleRecipe", "discriptionRecipe", "contryRecipe", "typeRecipe", "autorRecipe") 
    VALUES ('images/carbonara.jpg', 'Паста Карбонара', 'Классический итальянский рецепт', 'Италия', 'Основное блюдо', 'chefAlex')
    RETURNING "idRecipe"
)
-- Добавляем этапы для "Паста Карбонара"
INSERT INTO "stageRecipes" ("idRecipe", "stage", "stageImage", "stageDiscription") 
SELECT "idRecipe", stage_num, stage_img, stage_desc FROM (
    VALUES 
    (1, 'images/step1.jpg', 'Нарезать бекон небольшими кубиками.'),
    (2, 'images/step2.jpg', 'Обжарить бекон на среднем огне 5 минут.'),
    (3, 'images/step3.jpg', 'Добавить яйца и пармезан, перемешать.'),
    (4, 'images/step4.jpg', 'Смешать с макаронами и прогреть 2 минуты.')
) AS steps(stage_num, stage_img, stage_desc), inserted;