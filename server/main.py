import os
from contextlib import asynccontextmanager

from fastapi import FastAPI, Depends, HTTPException, Security
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import APIKeyHeader
from pydantic import BaseModel
from typing import List
from datetime import date
from sqlalchemy.orm import Session

from .db.database import SessionLocal, init_db, DBExpense, DBCategory

# --- Configuration ---
ALLOWED_ORIGINS = os.getenv(
    "CORS_ORIGINS", "http://localhost:5173,http://127.0.0.1:5173"
).split(",")

API_KEY = os.getenv("API_KEY", "pennypath-dev-key")

api_key_header = APIKeyHeader(name="X-API-Key", auto_error=False)


# --- Lifespan (replaces deprecated @app.on_event) ---
@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    init_db()
    yield
    # Shutdown (nothing needed for now)


app = FastAPI(lifespan=lifespan)

# --- CORS middleware (restricted origins) ---
app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "DELETE", "OPTIONS"],
    allow_headers=["Content-Type", "X-API-Key"],
)


# --- Auth dependency ---
async def verify_api_key(key: str = Security(api_key_header)):
    if key is None or key != API_KEY:
        raise HTTPException(status_code=401, detail="Invalid or missing API key")
    return key


# --- DB dependency ---
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# --- Pydantic Schemas ---
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


class CategoryCreate(BaseModel):
    name: str


class CategorySingleResponse(BaseModel):
    category: Category


class CategoryCreateResponse(BaseModel):
    data: CategorySingleResponse


class CategoryListResponse(BaseModel):
    categories: List[Category]


class CategoriesResponse(BaseModel):
    data: CategoryListResponse


class ExpenseListResponse(BaseModel):
    expenses: List[Expense]
    total_count: int


class ExpensesResponse(BaseModel):
    data: ExpenseListResponse


class ExpenseSingleResponse(BaseModel):
    expense: Expense


class ExpenseCreateResponse(BaseModel):
    data: ExpenseSingleResponse


# --- API Endpoints ---
@app.get("/api/categories", response_model=CategoriesResponse)
async def get_categories(
    db: Session = Depends(get_db),
    _: str = Depends(verify_api_key),
):
    categories = db.query(DBCategory).all()
    return {"data": {"categories": categories}}


@app.post("/api/categories", response_model=CategoryCreateResponse)
async def create_category(
    category: CategoryCreate,
    db: Session = Depends(get_db),
    _: str = Depends(verify_api_key),
):
    db_category = db.query(DBCategory).filter(DBCategory.name == category.name).first()
    if db_category:
        raise HTTPException(status_code=400, detail="Category already exists")

    db_category = DBCategory(name=category.name)
    db.add(db_category)
    db.commit()
    db.refresh(db_category)
    return {"data": {"category": db_category}}


@app.get("/api/expenses", response_model=ExpensesResponse)
async def get_expenses(
    skip: int = 0,
    limit: int = 20,
    db: Session = Depends(get_db),
    _: str = Depends(verify_api_key),
):
    total_count = db.query(DBExpense).count()
    expenses = (
        db.query(DBExpense).order_by(DBExpense.date.desc()).offset(skip).limit(limit).all()
    )
    return {"data": {"expenses": expenses, "total_count": total_count}}


@app.post("/api/expenses", response_model=ExpenseCreateResponse)
async def create_expense(
    expense: ExpenseCreate,
    db: Session = Depends(get_db),
    _: str = Depends(verify_api_key),
):
    db_expense = DBExpense(**expense.model_dump())
    db.add(db_expense)
    db.commit()
    db.refresh(db_expense)
    return {"data": {"expense": db_expense}}


@app.delete("/api/expenses/{expense_id}")
async def delete_expense(
    expense_id: int,
    db: Session = Depends(get_db),
    _: str = Depends(verify_api_key),
):
    db_expense = db.query(DBExpense).filter(DBExpense.id == expense_id).first()
    if not db_expense:
        raise HTTPException(status_code=404, detail="Expense not found")
    db.delete(db_expense)
    db.commit()
    return {"message": "Expense deleted successfully"}


@app.get("/")
async def root():
    return {"message": "PennyPath Backend API Running"}
