import os
from contextlib import asynccontextmanager

from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, EmailStr
from typing import List, Optional
from datetime import date
from sqlalchemy.orm import Session

from .db.database import SessionLocal, init_db, DBExpense, DBCategory, DBUser
from .auth import (
    hash_password,
    verify_password,
    create_access_token,
    get_current_user,
    get_db,
)

# --- Configuration ---
ALLOWED_ORIGINS = os.getenv(
    "CORS_ORIGINS", "http://localhost:5173,http://127.0.0.1:5173"
).split(",")

DEFAULT_CATEGORIES = ["Food", "Transport", "Shopping", "Entertainment", "Medical", "Other"]


# --- Lifespan ---
@asynccontextmanager
async def lifespan(app: FastAPI):
    init_db()
    yield


app = FastAPI(lifespan=lifespan)

# --- CORS middleware ---
app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["Content-Type", "Authorization"],
)


# ============================================================
# Pydantic Schemas
# ============================================================

# --- Auth ---
class RegisterRequest(BaseModel):
    email: str
    username: str
    password: str


class LoginRequest(BaseModel):
    email: str
    password: str


class AuthResponse(BaseModel):
    token: str
    user: "UserInfo"


class UserInfo(BaseModel):
    id: int
    email: str
    username: str

    class Config:
        from_attributes = True


# --- Categories ---
class Category(BaseModel):
    id: int
    name: str

    class Config:
        from_attributes = True


class CategoryCreate(BaseModel):
    name: str


class CategoryListResponse(BaseModel):
    categories: List[Category]


class CategoriesResponse(BaseModel):
    data: CategoryListResponse


class CategorySingleResponse(BaseModel):
    category: Category


class CategoryCreateResponse(BaseModel):
    data: CategorySingleResponse


# --- Expenses ---
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


class ExpenseListResponse(BaseModel):
    expenses: List[Expense]
    total_count: int


class ExpensesResponse(BaseModel):
    data: ExpenseListResponse


class ExpenseSingleResponse(BaseModel):
    expense: Expense


class ExpenseCreateResponse(BaseModel):
    data: ExpenseSingleResponse


# ============================================================
# Auth Endpoints
# ============================================================

@app.post("/api/auth/register", response_model=AuthResponse)
async def register(body: RegisterRequest, db: Session = Depends(get_db)):
    # Check existing email
    if db.query(DBUser).filter(DBUser.email == body.email).first():
        raise HTTPException(status_code=400, detail="Email already registered")
    # Check existing username
    if db.query(DBUser).filter(DBUser.username == body.username).first():
        raise HTTPException(status_code=400, detail="Username already taken")

    # Create user
    user = DBUser(
        email=body.email,
        username=body.username,
        hashed_password=hash_password(body.password),
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    # Create default categories for the new user
    for cat_name in DEFAULT_CATEGORIES:
        db.add(DBCategory(name=cat_name, user_id=user.id))
    db.commit()

    token = create_access_token(user.id, user.username)
    return {"token": token, "user": user}


@app.post("/api/auth/login", response_model=AuthResponse)
async def login(body: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(DBUser).filter(DBUser.email == body.email).first()
    if not user or not verify_password(body.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    token = create_access_token(user.id, user.username)
    return {"token": token, "user": user}


@app.get("/api/auth/me", response_model=UserInfo)
async def get_me(current_user: DBUser = Depends(get_current_user)):
    return current_user


# ============================================================
# Category Endpoints (scoped to user)
# ============================================================

@app.get("/api/categories", response_model=CategoriesResponse)
async def get_categories(
    db: Session = Depends(get_db),
    current_user: DBUser = Depends(get_current_user),
):
    categories = db.query(DBCategory).filter(DBCategory.user_id == current_user.id).all()
    return {"data": {"categories": categories}}


@app.post("/api/categories", response_model=CategoryCreateResponse)
async def create_category(
    category: CategoryCreate,
    db: Session = Depends(get_db),
    current_user: DBUser = Depends(get_current_user),
):
    # Check unique within user's categories
    existing = (
        db.query(DBCategory)
        .filter(DBCategory.user_id == current_user.id, DBCategory.name == category.name)
        .first()
    )
    if existing:
        raise HTTPException(status_code=400, detail="Category already exists")

    db_category = DBCategory(name=category.name, user_id=current_user.id)
    db.add(db_category)
    db.commit()
    db.refresh(db_category)
    return {"data": {"category": db_category}}


# ============================================================
# Expense Endpoints (scoped to user)
# ============================================================

@app.get("/api/expenses", response_model=ExpensesResponse)
async def get_expenses(
    skip: int = 0,
    limit: int = 20,
    category_id: Optional[int] = None,
    date_from: Optional[date] = None,
    date_to: Optional[date] = None,
    db: Session = Depends(get_db),
    current_user: DBUser = Depends(get_current_user),
):
    query = db.query(DBExpense).filter(DBExpense.user_id == current_user.id)

    if category_id is not None:
        query = query.filter(DBExpense.category_id == category_id)
    if date_from is not None:
        query = query.filter(DBExpense.date >= date_from)
    if date_to is not None:
        query = query.filter(DBExpense.date <= date_to)

    total_count = query.count()
    expenses = query.order_by(DBExpense.date.desc()).offset(skip).limit(limit).all()
    return {"data": {"expenses": expenses, "total_count": total_count}}


@app.post("/api/expenses", response_model=ExpenseCreateResponse)
async def create_expense(
    expense: ExpenseCreate,
    db: Session = Depends(get_db),
    current_user: DBUser = Depends(get_current_user),
):
    # Verify category belongs to user
    cat = (
        db.query(DBCategory)
        .filter(DBCategory.id == expense.category_id, DBCategory.user_id == current_user.id)
        .first()
    )
    if not cat:
        raise HTTPException(status_code=400, detail="Invalid category")

    db_expense = DBExpense(**expense.model_dump(), user_id=current_user.id)
    db.add(db_expense)
    db.commit()
    db.refresh(db_expense)
    return {"data": {"expense": db_expense}}


@app.delete("/api/expenses/{expense_id}")
async def delete_expense(
    expense_id: int,
    db: Session = Depends(get_db),
    current_user: DBUser = Depends(get_current_user),
):
    db_expense = (
        db.query(DBExpense)
        .filter(DBExpense.id == expense_id, DBExpense.user_id == current_user.id)
        .first()
    )
    if not db_expense:
        raise HTTPException(status_code=404, detail="Expense not found")
    db.delete(db_expense)
    db.commit()
    return {"message": "Expense deleted successfully"}


@app.get("/")
async def root():
    return {"message": "PennyPath Backend API Running"}
