from sqlalchemy import Column, Integer, String, Float, Date, create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os
from dotenv import load_dotenv
from datetime import date

load_dotenv()

# Format: postgresql://user:password@postgresserver/db
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://postgres:postgres@localhost:5432/pennypath")

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

class DBExpense(Base):
    __tablename__ = "expenses"

    id = Column(Integer, primary_key=True, index=True)
    date = Column(Date, default=date.today)
    location = Column(String)
    amount = Column(Float)
    category_id = Column(Integer)

    def __repr__(self):
        return f"<DBExpense(id={self.id}, amount={self.amount}, date={self.date})>"

class DBCategory(Base):
    __tablename__ = "categories"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True)

    def __repr__(self):
        return f"<DBCategory(id={self.id}, name='{self.name}')>"

def init_db():
    Base.metadata.create_all(bind=engine)
    
    db = SessionLocal()
    if db.query(DBCategory).count() == 0:
        categories = ["Food", "Transport", "Shopping", "Entertainment", "Medical", "Other"]
        for cat_name in categories:
            db.add(DBCategory(name=cat_name))
        db.commit()
    db.close()
