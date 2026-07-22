from sqlalchemy import Column, Integer, String, Float, Date, ForeignKey, create_engine
from sqlalchemy.orm import DeclarativeBase, sessionmaker, relationship
import os
from dotenv import load_dotenv
from datetime import date

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://postgres:postgres@localhost:5432/pennypath")

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


class Base(DeclarativeBase):
    pass


class DBUser(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    username = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)

    expenses = relationship("DBExpense", back_populates="owner")
    categories = relationship("DBCategory", back_populates="owner")

    def __repr__(self):
        return f"<DBUser(id={self.id}, username='{self.username}')>"


class DBCategory(Base):
    __tablename__ = "categories"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    owner = relationship("DBUser", back_populates="categories")
    expenses = relationship("DBExpense", back_populates="category")

    def __repr__(self):
        return f"<DBCategory(id={self.id}, name='{self.name}')>"


class DBExpense(Base):
    __tablename__ = "expenses"

    id = Column(Integer, primary_key=True, index=True)
    date = Column(Date, default=date.today)
    location = Column(String)
    amount = Column(Float)
    category_id = Column(Integer, ForeignKey("categories.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    category = relationship("DBCategory", back_populates="expenses")
    owner = relationship("DBUser", back_populates="expenses")

    def __repr__(self):
        return f"<DBExpense(id={self.id}, amount={self.amount}, date={self.date})>"


def init_db():
    Base.metadata.create_all(bind=engine)
