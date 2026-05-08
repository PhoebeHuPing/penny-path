from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List
from datetime import date
from sqlalchemy.orm import Session
from .db.database import SessionLocal, init_db, DBExpense, DBCategory

app = FastAPI()

# Initialize Database on startup
@app.on_event("startup")
def startup_event():
    init_db()

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Dependency to get DB session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Pydantic Schemas
class ExpenseBase(BaseModel):
    date: date
    location: str
    amount: float
    category_id: int

class ExpenseCreate(ExpenseBase):
    pass

class Expense(ExpenseBase):
    id: int

    class Config:
        from_attributes = True

class Category(BaseModel):
    id: int
    name: str

    class Config:
        from_attributes = True

# API Endpoints
@app.get("/api/categories", response_model=dict)
async def get_categories(db: Session = Depends(get_db)):
    categories = db.query(DBCategory).all()
    return {"data": {"categories": categories}}

@app.get("/api/expenses", response_model=dict)
async def get_expenses(db: Session = Depends(get_db)):
    expenses = db.query(DBExpense).order_by(DBExpense.date.desc()).all()
    return {"data": {"expenses": expenses}}

@app.post("/api/expenses", response_model=dict)
async def create_expense(expense: ExpenseCreate, db: Session = Depends(get_db)):
    db_expense = DBExpense(**expense.dict())
    db.add(db_expense)
    db.commit()
    db.refresh(db_expense)
    return {"data": {"expense": db_expense}}

@app.delete("/api/expenses/{expense_id}")
async def delete_expense(expense_id: int, db: Session = Depends(get_db)):
    db_expense = db.query(DBExpense).filter(DBExpense.id == expense_id).first()
    if not db_expense:
        raise HTTPException(status_code=404, detail="Expense not found")
    db.delete(db_expense)
    db.commit()
    return {"message": "Expense deleted successfully"}

@app.get("/")
async def root():
    return {"message": "PennyPath Backend API Running with PostgreSQL"}
