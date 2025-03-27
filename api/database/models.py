from sqlalchemy import Column, Integer, String, Text, ForeignKey, create_engine, DateTime, LargeBinary
from sqlalchemy.orm import relationship, declarative_base, sessionmaker
from config import DATABASE_URL
from sqlalchemy.sql import func
from datetime import datetime
from .database import Base

Base = declarative_base()

class UserInfo(Base):
    __tablename__ = "userInfo"
    
    userEmail = Column(String(125), unique=True, nullable=False)
    userLogin = Column(String(75), primary_key=True)
    userPassword = Column(String(225), nullable=False)  # Хранится в зашифрованном виде
    salt = Column(String(50), nullable=False)  # Храним соль
    
    # Отношения
    profile = relationship("UserProfile", back_populates="user", uselist=False)
    recipes = relationship("SiteRecipe", back_populates="author")

    def check_password(self, password):
        from argon2 import PasswordHasher
        from config import SECRET_PEPPER
        from utils import decrypt
        
        ph = PasswordHasher()
        try:
            stored_hash = decrypt(self.userPassword)
            password_with_pepper = password + SECRET_PEPPER
            ph.verify(stored_hash, password_with_pepper)
            return True
        except:
            return False

    def generate_token(self):
        from auth import create_access_token
        return create_access_token(self.userLogin)

class SiteRecipe(Base):
    __tablename__ = "siteRecipes"
    
    idRecipe = Column(Integer, primary_key=True)
    imageRecipe = Column(Text)
    titleRecipe = Column(Text, nullable=False)
    discriptionRecipe = Column(Text)
    cookingTime = Column(Integer)
    contryRecipe = Column(Text)
    typeRecipe = Column(Text)
    autorRecipe = Column(String(75), ForeignKey("userInfo.userLogin", ondelete="CASCADE", onupdate="CASCADE"))
    
    # Отношения
    author = relationship("UserInfo", back_populates="recipes")
    stages = relationship("StageRecipe", back_populates="recipe", cascade="all, delete-orphan")
    recommended = relationship("RecommendedRecipe", back_populates="recipe", cascade="all, delete-orphan")

class StageRecipe(Base):
    __tablename__ = "stageRecipes"
    
    idStage = Column(Integer, primary_key=True)
    idRecipe = Column(Integer, ForeignKey("siteRecipes.idRecipe", ondelete="CASCADE"))
    stage = Column(Integer, nullable=False)
    stageImage = Column(Text)
    stageDiscription = Column(Text, nullable=False)
    
    # Отношения
    recipe = relationship("SiteRecipe", back_populates="stages")

class UserProfile(Base):
    __tablename__ = "userProfile"
    
    userLoginID = Column(String(75), ForeignKey("userInfo.userLogin", ondelete="CASCADE", onupdate="CASCADE"), primary_key=True)
    userImage = Column(Text)
    userDescription = Column(Text)
    userRecipes = Column(Integer, default=0)
    userAvatarBinary = Column(Text)
    userAvatarBase64 = Column(Text)

    # Отношения
    user = relationship("UserInfo", back_populates="profile")

class RecommendedRecipe(Base):
    __tablename__ = "recommendedRecipes"
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    recipeId = Column(Integer, ForeignKey("siteRecipes.idRecipe", ondelete="CASCADE"))
    dateAdded = Column(DateTime, default=func.now())
    
    recipe = relationship("SiteRecipe", back_populates="recommended")

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(bind=engine) 