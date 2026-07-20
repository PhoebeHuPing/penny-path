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


class DBCategory(Base):
    __tablename__ = "categories"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True)
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
    category = relationship("DBCategory", back_populates="expenses")

    def __repr__(self):
        return f"<DBExpense(id={self.id}, amount={self.amount}, date={self.date})>"


def init_db():
    Base.metadata.create_all(bind=engine)

    db = SessionLocal()
    if db.query(DBCategory).count() == 0:
        categories = ["Food", "Transport", "Shopping", "Entertainment", "Medical", "Other"]
        for cat_name in categories:
            db.add(DBCategory(name=cat_name))
        db.commit()
    db.close()
