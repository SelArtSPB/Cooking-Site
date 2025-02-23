from sqlalchemy import Column, Integer, String, Text, ForeignKey, Sequence, create_engine
from sqlalchemy.orm import relationship, declarative_base, sessionmaker

Base = declarative_base()

class UserProfile(Base):
    #Модель профиля пользователя
    __tablename__ = "usersProfile"
    
    id_user = Column("idUser", Integer, Sequence("sq_idUser"), primary_key=True)
    user_name = Column("userName", String(75))
    user_tag = Column("userTag", String(50), unique=True)
    password = Column("password", String(255))
    email = Column("email", String(50))
    description = Column("description", String(5000))
    
    recipes = relationship("CardRecipe", back_populates="author")

class CardRecipe(Base):
    #Модель карточки рецепта
    __tablename__ = "cardRecipe"
    
    card_id = Column("cardID", Integer, Sequence("sq_cardID"), primary_key=True)
    title = Column("titleRecipe", String(50))
    description_little = Column("descriptionLittle", String(150))
    cooking_time = Column("cookingTime", String(50))
    country = Column("countryRecipe", String(50))
    type_recipe = Column("typeRecipe", String(50))
    author_tag = Column("authorTag", String(50), ForeignKey("usersProfile.userTag"))
    recipe_text = Column("recipeText", Text)
    image = Column("imageRecipe", String(150))
    
    author = relationship("UserProfile", back_populates="recipes")

class UserRecipe(Base):
    #Модель связи пользователя и рецепта
    __tablename__ = "userRecipe"
    
    id_user = Column("idUser", Integer, ForeignKey("usersProfile.idUser"), primary_key=True)
    card_id = Column("cardID", Integer, ForeignKey("cardRecipe.cardID"), primary_key=True)

# Конфигурация базы данных
DATABASE_URL = "postgresql://postgres:123456789@localhost/postgres"
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(bind=engine)