from sqlalchemy import Column, Integer, String, Text, ForeignKey, create_engine
from sqlalchemy.orm import relationship, declarative_base, sessionmaker

Base = declarative_base()

class UserInfo(Base):
    __tablename__ = "userInfo"
    
    userEmail = Column(String(125), primary_key=True, nullable=False)
    userLogin = Column(String(75), unique=True, nullable=False)
    userPassword = Column(String(225), nullable=False)  # Хранится в зашифрованном виде
    salt = Column(String(50), nullable=False)  # Храним соль
    
    recipes = relationship("SiteRecipe", back_populates="author")


class SiteRecipe(Base):
    __tablename__ = "siteRecipes"
    
    idRecipe = Column(Integer, primary_key=True, autoincrement=True)
    imageRecipe = Column(Text, nullable=True)
    titleRecipe = Column(Text, nullable=False)
    discriptionRecipe = Column(Text, nullable=True)
    contryRecipe = Column(Text, nullable=True)
    typeRecipe = Column(Text, nullable=True)
    autorRecipe = Column(String(75), ForeignKey("userInfo.userLogin", ondelete="CASCADE"))
    
    author = relationship("UserInfo", back_populates="recipes")


class UserProfile(Base):
    __tablename__ = "userProfile"
    
    userLoginID = Column(String, ForeignKey("userInfo.userLogin", ondelete="CASCADE"), primary_key=True)
    userImage = Column(Text, nullable=True)  # Тестово картинка в локальных файлах, хранится путь
    userFullName = Column(String(125), nullable=True)
    userDescription = Column(Text, nullable=True)
    userRecipes = Column(Integer, nullable=True)

DATABASE_URL = "postgresql://postgres:123456789@localhost/postgres"
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(bind=engine)
