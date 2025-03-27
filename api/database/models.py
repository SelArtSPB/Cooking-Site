from sqlalchemy import Column, Integer, String, Text, ForeignKey, create_engine, DateTime, LargeBinary
from sqlalchemy.orm import relationship, declarative_base, sessionmaker
from config import DATABASE_URL
from sqlalchemy.sql import func

Base = declarative_base()

class UserInfo(Base):
    __tablename__ = "userInfo"
    
    userEmail = Column(String(125), unique=True, nullable=True)
    userLogin = Column(String(75), primary_key=True, nullable=False)
    userPassword = Column(String(225), nullable=False)  # Хранится в зашифрованном виде
    salt = Column(String(50), nullable=False)  # Храним соль
    
    recipes = relationship("SiteRecipe", back_populates="author")


class SiteRecipe(Base):
    __tablename__ = "siteRecipes"
    
    idRecipe = Column(Integer, primary_key=True, autoincrement=True)
    imageRecipe = Column(Text, nullable=True)
    titleRecipe = Column(Text, nullable=False)
    discriptionRecipe = Column(Text, nullable=True)
    cookingTime = Column(Integer, nullable=True)  # Поле уже добавлено
    contryRecipe = Column(Text, nullable=True)
    typeRecipe = Column(Text, nullable=True)
    autorRecipe = Column(String(75), ForeignKey("userInfo.userLogin", ondelete="CASCADE"))
    
    author = relationship("UserInfo", back_populates="recipes")
    stages = relationship("StageRecipe", back_populates="recipe", cascade="all, delete-orphan")
    recommended = relationship("RecommendedRecipe", back_populates="recipe", cascade="all, delete-orphan")

class StageRecipe(Base):
    __tablename__ = "stageRecipes"
    
    idStage = Column(Integer, primary_key=True, autoincrement=True)
    idRecipe = Column(Integer, ForeignKey("siteRecipes.idRecipe", ondelete="CASCADE"))
    stage = Column(Integer, nullable=False)
    stageImage = Column(Text, nullable=True)
    stageDiscription = Column(Text, nullable=False)
    
    recipe = relationship("SiteRecipe", back_populates="stages")

class UserProfile(Base):
    __tablename__ = "userProfile"
    
    userLoginID = Column(String, ForeignKey("userInfo.userLogin", ondelete="CASCADE"), primary_key=True)
    userImage = Column(Text, nullable=True)  # Путь к файлу для обратной совместимости
    userAvatarBinary = Column(LargeBinary, nullable=True)  # Бинарные данные аватара
    userAvatarBase64 = Column(Text, nullable=True)  # Base64 представление для фронтенда
    userDescription = Column(Text, nullable=True)
    userRecipes = Column(Integer, nullable=True)

class RecommendedRecipe(Base):
    __tablename__ = "recommendedRecipes"
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    recipeId = Column(Integer, ForeignKey("siteRecipes.idRecipe", ondelete="CASCADE"))
    dateAdded = Column(DateTime, default=func.now())
    
    recipe = relationship("SiteRecipe", back_populates="recommended")

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(bind=engine) 