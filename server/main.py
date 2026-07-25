import os
from contextlib import asynccontextmanager
from calendar import monthrange

from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, EmailStr
from typing import List, Optional
from datetime import date
from sqlalchemy.orm import Session
from sqlalchemy import func

from .db.database import SessionLocal, init_db, DBExpense, DBCategory, DBUser, DBBudget
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
    amount_min: Optional[float] = None,
    amount_max: Optional[float] = None,
    keyword: Optional[str] = None,
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
    if amount_min is not None:
        query = query.filter(DBExpense.amount >= amount_min)
    if amount_max is not None:
        query = query.filter(DBExpense.amount <= amount_max)
    if keyword is not None and keyword.strip():
        query = query.filter(DBExpense.location.ilike(f"%{keyword.strip()}%"))

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


# --- Budgets ---
class BudgetBase(BaseModel):
    category_id: Optional[int] = None
    amount: float
    month: int
    year: int


class BudgetCreate(BudgetBase):
    pass


class Budget(BudgetBase):
    id: int
    user_id: int

    class Config:
        from_attributes = True


class BudgetWithStatus(BaseModel):
    id: int
    category_id: Optional[int] = None
    category_name: Optional[str] = None
    amount: float
    month: int
    year: int
    spent: float
    remaining: float
    is_over_budget: bool


class BudgetStatusResponse(BaseModel):
    budgets: List[BudgetWithStatus]


# ============================================================
# Budget Endpoints (scoped to user)
# ============================================================

@app.get("/api/budgets", response_model=List[Budget])
async def get_budgets(
    month: int,
    year: int,
    db: Session = Depends(get_db),
    current_user: DBUser = Depends(get_current_user),
):
    budgets = (
        db.query(DBBudget)
        .filter(
            DBBudget.user_id == current_user.id,
            DBBudget.month == month,
            DBBudget.year == year,
        )
        .all()
    )
    return budgets


@app.post("/api/budgets", response_model=Budget)
async def create_or_update_budget(
    budget: BudgetCreate,
    db: Session = Depends(get_db),
    current_user: DBUser = Depends(get_current_user),
):
    # Validate month/year
    if budget.month < 1 or budget.month > 12:
        raise HTTPException(status_code=400, detail="Month must be between 1 and 12")
    if budget.amount <= 0:
        raise HTTPException(status_code=400, detail="Amount must be positive")

    # Validate category belongs to user (if provided)
    if budget.category_id is not None:
        cat = (
            db.query(DBCategory)
            .filter(DBCategory.id == budget.category_id, DBCategory.user_id == current_user.id)
            .first()
        )
        if not cat:
            raise HTTPException(status_code=400, detail="Invalid category")

    # Upsert: check if budget already exists for same user+category+month+year
    existing = (
        db.query(DBBudget)
        .filter(
            DBBudget.user_id == current_user.id,
            DBBudget.category_id == budget.category_id if budget.category_id is not None
            else DBBudget.category_id.is_(None),
            DBBudget.month == budget.month,
            DBBudget.year == budget.year,
        )
        .first()
    )

    if existing:
        existing.amount = budget.amount
        db.commit()
        db.refresh(existing)
        return existing
    else:
        db_budget = DBBudget(
            user_id=current_user.id,
            category_id=budget.category_id,
            amount=budget.amount,
            month=budget.month,
            year=budget.year,
        )
        db.add(db_budget)
        db.commit()
        db.refresh(db_budget)
        return db_budget


@app.delete("/api/budgets/{budget_id}")
async def delete_budget(
    budget_id: int,
    db: Session = Depends(get_db),
    current_user: DBUser = Depends(get_current_user),
):
    db_budget = (
        db.query(DBBudget)
        .filter(DBBudget.id == budget_id, DBBudget.user_id == current_user.id)
        .first()
    )
    if not db_budget:
        raise HTTPException(status_code=404, detail="Budget not found")
    db.delete(db_budget)
    db.commit()
    return {"message": "Budget deleted successfully"}


@app.get("/api/budgets/status", response_model=BudgetStatusResponse)
async def get_budget_status(
    month: int,
    year: int,
    db: Session = Depends(get_db),
    current_user: DBUser = Depends(get_current_user),
):
    # Get all budgets for this month
    budgets = (
        db.query(DBBudget)
        .filter(
            DBBudget.user_id == current_user.id,
            DBBudget.month == month,
            DBBudget.year == year,
        )
        .all()
    )

    # Calculate date range for the month
    _, last_day = monthrange(year, month)
    month_start = date(year, month, 1)
    month_end = date(year, month, last_day)

    result = []
    for b in budgets:
        # Calculate spent amount
        query = db.query(DBExpense).filter(
            DBExpense.user_id == current_user.id,
            DBExpense.date >= month_start,
            DBExpense.date <= month_end,
        )
        if b.category_id is not None:
            query = query.filter(DBExpense.category_id == b.category_id)

        spent = query.with_entities(func.coalesce(func.sum(DBExpense.amount), 0)).scalar()

        # Get category name
        category_name = None
        if b.category_id is not None:
            cat = db.query(DBCategory).filter(DBCategory.id == b.category_id).first()
            if cat:
                category_name = cat.name

        result.append(BudgetWithStatus(
            id=b.id,
            category_id=b.category_id,
            category_name=category_name if b.category_id else "Overall",
            amount=b.amount,
            month=b.month,
            year=b.year,
            spent=float(spent),
            remaining=b.amount - float(spent),
            is_over_budget=float(spent) > b.amount,
        ))

    return {"budgets": result}


@app.get("/")
async def root():
    return {"message": "PennyPath Backend API Running"}
