-- Примерные данные
INSERT INTO "userInfo" ("userEmail", "userLogin", "userPassword") 
VALUES 
('test1@example.com', 'chefAlex', 'password123'),
('test2@example.com', 'foodieAnna', 'securepass'),
('test3@example.com', 'recipeMaster', 'mystrongpassword');

INSERT INTO "userProfile" ("userLoginID", "userImage", "userFullName", "userDescription", "userRecipes") 
VALUES 
('chefAlex', 'images/alex.jpg', 'Алексей Иванов', 'Люблю готовить итальянскую кухню', 2),
('foodieAnna', 'images/anna.jpg', 'Анна Петрова', 'Экспериментирую с десертами', 3),
('recipeMaster', 'images/master.jpg', 'Иван Сидоров', 'Профессиональный повар', 5);

INSERT INTO "siteRecipes" ("imageRecipe", "titleRecipe", "discriptionRecipe", "contryRecipe", "typeRecipe", "autorRecipe") 
VALUES 
('images/carbonara.jpg', 'Паста Карбонара', 'Классический итальянский рецепт', 'Италия', 'Основное блюдо', 'chefAlex'),
('images/borsh.jpg', 'Борщ', 'Традиционный русский борщ с говядиной', 'Россия', 'Суп', 'foodieAnna'),
('images/sushi.jpg', 'Суши', 'Японские суши с лососем и авокадо', 'Япония', 'Закуска', 'recipeMaster');
