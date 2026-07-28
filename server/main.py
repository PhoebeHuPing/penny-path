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

from .db.database import SessionLocal, init_db, DBExpense, DBCategory, DBUser, DBBudget, DBIncome
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


# --- Incomes ---
class IncomeBase(BaseModel):
    date: date
    source: str
    amount: float


class IncomeCreate(IncomeBase):
    pass


class Income(IncomeBase):
    id: int

    class Config:
        from_attributes = True


class IncomeListResponse(BaseModel):
    incomes: List[Income]
    total_count: int


class IncomesResponse(BaseModel):
    data: IncomeListResponse


class IncomeSingleResponse(BaseModel):
    income: Income


class IncomeCreateResponse(BaseModel):
    data: IncomeSingleResponse


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


# ============================================================
# Income Endpoints (scoped to user)
# ============================================================

@app.get("/api/incomes", response_model=IncomesResponse)
async def get_incomes(
    skip: int = 0,
    limit: int = 20,
    date_from: Optional[date] = None,
    date_to: Optional[date] = None,
    db: Session = Depends(get_db),
    current_user: DBUser = Depends(get_current_user),
):
    query = db.query(DBIncome).filter(DBIncome.user_id == current_user.id)

    if date_from is not None:
        query = query.filter(DBIncome.date >= date_from)
    if date_to is not None:
        query = query.filter(DBIncome.date <= date_to)

    total_count = query.count()
    incomes = query.order_by(DBIncome.date.desc()).offset(skip).limit(limit).all()
    return {"data": {"incomes": incomes, "total_count": total_count}}


@app.post("/api/incomes", response_model=IncomeCreateResponse)
async def create_income(
    income: IncomeCreate,
    db: Session = Depends(get_db),
    current_user: DBUser = Depends(get_current_user),
):
    if income.amount <= 0:
        raise HTTPException(status_code=400, detail="Amount must be positive")

    db_income = DBIncome(**income.model_dump(), user_id=current_user.id)
    db.add(db_income)
    db.commit()
    db.refresh(db_income)
    return {"data": {"income": db_income}}


@app.delete("/api/incomes/{income_id}")
async def delete_income(
    income_id: int,
    db: Session = Depends(get_db),
    current_user: DBUser = Depends(get_current_user),
):
    db_income = (
        db.query(DBIncome)
        .filter(DBIncome.id == income_id, DBIncome.user_id == current_user.id)
        .first()
    )
    if not db_income:
        raise HTTPException(status_code=404, detail="Income not found")
    db.delete(db_income)
    db.commit()
    return {"message": "Income deleted successfully"}


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


# ============================================================
# Dashboard Endpoint
# ============================================================

class DashboardSummary(BaseModel):
    current_month_total: float
    daily_average: float
    days_elapsed: int
    days_in_month: int
    last_month_total: float
    mom_change_pct: Optional[float] = None  # month-over-month (环比)
    same_month_last_year_total: float
    yoy_change_pct: Optional[float] = None  # year-over-year (同比)
    budget_total: Optional[float] = None
    budget_remaining: Optional[float] = None
    budget_usage_pct: Optional[float] = None
    income_total: float = 0.0
    net_balance: float = 0.0


@app.get("/api/dashboard/summary", response_model=DashboardSummary)
async def get_dashboard_summary(
    month: Optional[int] = None,
    year: Optional[int] = None,
    db: Session = Depends(get_db),
    current_user: DBUser = Depends(get_current_user),
):
    today = date.today()
    target_month = month or today.month
    target_year = year or today.year

    # Current month date range
    _, last_day = monthrange(target_year, target_month)
    month_start = date(target_year, target_month, 1)
    month_end = date(target_year, target_month, last_day)

    # Days elapsed in current month
    if target_year == today.year and target_month == today.month:
        days_elapsed = today.day
    else:
        days_elapsed = last_day

    # Current month total
    current_total = (
        db.query(func.coalesce(func.sum(DBExpense.amount), 0))
        .filter(
            DBExpense.user_id == current_user.id,
            DBExpense.date >= month_start,
            DBExpense.date <= month_end,
        )
        .scalar()
    )
    current_total = float(current_total)

    # Daily average
    daily_average = current_total / days_elapsed if days_elapsed > 0 else 0.0

    # Last month total (环比)
    prev_month = target_month - 1
    prev_year = target_year
    if prev_month < 1:
        prev_month = 12
        prev_year -= 1
    _, prev_last_day = monthrange(prev_year, prev_month)
    prev_start = date(prev_year, prev_month, 1)
    prev_end = date(prev_year, prev_month, prev_last_day)

    last_month_total = float(
        db.query(func.coalesce(func.sum(DBExpense.amount), 0))
        .filter(
            DBExpense.user_id == current_user.id,
            DBExpense.date >= prev_start,
            DBExpense.date <= prev_end,
        )
        .scalar()
    )

    mom_change_pct = None
    if last_month_total > 0:
        mom_change_pct = round((current_total - last_month_total) / last_month_total * 100, 1)

    # Same month last year (同比)
    ly_year = target_year - 1
    _, ly_last_day = monthrange(ly_year, target_month)
    ly_start = date(ly_year, target_month, 1)
    ly_end = date(ly_year, target_month, ly_last_day)

    same_month_last_year_total = float(
        db.query(func.coalesce(func.sum(DBExpense.amount), 0))
        .filter(
            DBExpense.user_id == current_user.id,
            DBExpense.date >= ly_start,
            DBExpense.date <= ly_end,
        )
        .scalar()
    )

    yoy_change_pct = None
    if same_month_last_year_total > 0:
        yoy_change_pct = round(
            (current_total - same_month_last_year_total) / same_month_last_year_total * 100, 1
        )

    # Budget remaining (overall budget for this month, category_id IS NULL)
    overall_budget = (
        db.query(DBBudget)
        .filter(
            DBBudget.user_id == current_user.id,
            DBBudget.month == target_month,
            DBBudget.year == target_year,
            DBBudget.category_id.is_(None),
        )
        .first()
    )

    budget_total = None
    budget_remaining = None
    budget_usage_pct = None
    if overall_budget:
        budget_total = overall_budget.amount
        budget_remaining = overall_budget.amount - current_total
        budget_usage_pct = round(current_total / overall_budget.amount * 100, 1) if overall_budget.amount > 0 else 0.0

    # Income total for current month
    income_total = float(
        db.query(func.coalesce(func.sum(DBIncome.amount), 0))
        .filter(
            DBIncome.user_id == current_user.id,
            DBIncome.date >= month_start,
            DBIncome.date <= month_end,
        )
        .scalar()
    )

    # Net balance = income - expenses
    net_balance = income_total - current_total

    return DashboardSummary(
        current_month_total=current_total,
        daily_average=round(daily_average, 2),
        days_elapsed=days_elapsed,
        days_in_month=last_day,
        last_month_total=last_month_total,
        mom_change_pct=mom_change_pct,
        same_month_last_year_total=same_month_last_year_total,
        yoy_change_pct=yoy_change_pct,
        budget_total=budget_total,
        budget_remaining=budget_remaining,
        budget_usage_pct=budget_usage_pct,
        income_total=income_total,
        net_balance=net_balance,
    )


# ============================================================
# Export Endpoints (CSV / PDF)
# ============================================================

from fastapi.responses import StreamingResponse
import csv
import io


@app.get("/api/export/csv")
async def export_csv(
    date_from: Optional[date] = None,
    date_to: Optional[date] = None,
    db: Session = Depends(get_db),
    current_user: DBUser = Depends(get_current_user),
):
    """Export user's expenses and incomes as a CSV file."""
    # Query expenses
    expense_query = db.query(DBExpense).filter(DBExpense.user_id == current_user.id)
    if date_from:
        expense_query = expense_query.filter(DBExpense.date >= date_from)
    if date_to:
        expense_query = expense_query.filter(DBExpense.date <= date_to)
    expenses = expense_query.order_by(DBExpense.date.desc()).all()

    # Query incomes
    income_query = db.query(DBIncome).filter(DBIncome.user_id == current_user.id)
    if date_from:
        income_query = income_query.filter(DBIncome.date >= date_from)
    if date_to:
        income_query = income_query.filter(DBIncome.date <= date_to)
    incomes = income_query.order_by(DBIncome.date.desc()).all()

    # Build category lookup
    categories = db.query(DBCategory).filter(DBCategory.user_id == current_user.id).all()
    cat_map = {c.id: c.name for c in categories}

    # Generate CSV
    output = io.StringIO()
    writer = csv.writer(output)

    # Expenses section
    writer.writerow(["=== Expenses ==="])
    writer.writerow(["Date", "Location", "Category", "Amount"])
    for e in expenses:
        writer.writerow([
            e.date.isoformat(),
            e.location,
            cat_map.get(e.category_id, "Unknown"),
            f"{e.amount:.2f}",
        ])

    writer.writerow([])

    # Incomes section
    writer.writerow(["=== Incomes ==="])
    writer.writerow(["Date", "Source", "Amount"])
    for i in incomes:
        writer.writerow([i.date.isoformat(), i.source, f"{i.amount:.2f}"])

    writer.writerow([])

    # Summary
    total_expenses = sum(e.amount for e in expenses)
    total_incomes = sum(i.amount for i in incomes)
    writer.writerow(["=== Summary ==="])
    writer.writerow(["Total Expenses", f"{total_expenses:.2f}"])
    writer.writerow(["Total Incomes", f"{total_incomes:.2f}"])
    writer.writerow(["Net Balance", f"{total_incomes - total_expenses:.2f}"])

    output.seek(0)
    filename = f"pennypath_export_{date.today().isoformat()}.csv"

    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename={filename}"},
    )


@app.get("/api/export/pdf")
async def export_pdf(
    date_from: Optional[date] = None,
    date_to: Optional[date] = None,
    db: Session = Depends(get_db),
    current_user: DBUser = Depends(get_current_user),
):
    """Export user's expenses and incomes as a PDF report."""
    from reportlab.lib.pagesizes import A4
    from reportlab.lib import colors
    from reportlab.lib.units import mm
    from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer
    from reportlab.lib.styles import getSampleStyleSheet

    # Query expenses
    expense_query = db.query(DBExpense).filter(DBExpense.user_id == current_user.id)
    if date_from:
        expense_query = expense_query.filter(DBExpense.date >= date_from)
    if date_to:
        expense_query = expense_query.filter(DBExpense.date <= date_to)
    expenses = expense_query.order_by(DBExpense.date.desc()).all()

    # Query incomes
    income_query = db.query(DBIncome).filter(DBIncome.user_id == current_user.id)
    if date_from:
        income_query = income_query.filter(DBIncome.date >= date_from)
    if date_to:
        income_query = income_query.filter(DBIncome.date <= date_to)
    incomes = income_query.order_by(DBIncome.date.desc()).all()

    # Build category lookup
    categories = db.query(DBCategory).filter(DBCategory.user_id == current_user.id).all()
    cat_map = {c.id: c.name for c in categories}

    # Generate PDF
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=A4, topMargin=20 * mm, bottomMargin=20 * mm)
    styles = getSampleStyleSheet()
    elements = []

    # Title
    elements.append(Paragraph("PennyPath Financial Report", styles["Title"]))
    date_range_text = ""
    if date_from and date_to:
        date_range_text = f"Period: {date_from.isoformat()} to {date_to.isoformat()}"
    elif date_from:
        date_range_text = f"From: {date_from.isoformat()}"
    elif date_to:
        date_range_text = f"Up to: {date_to.isoformat()}"
    else:
        date_range_text = "All records"
    elements.append(Paragraph(date_range_text, styles["Normal"]))
    elements.append(Spacer(1, 10 * mm))

    # Summary section
    total_expenses = sum(e.amount for e in expenses)
    total_incomes = sum(i.amount for i in incomes)
    net_balance = total_incomes - total_expenses

    summary_data = [
        ["Total Income", f"${total_incomes:,.2f}"],
        ["Total Expenses", f"${total_expenses:,.2f}"],
        ["Net Balance", f"${net_balance:,.2f}"],
    ]
    elements.append(Paragraph("Summary", styles["Heading2"]))
    summary_table = Table(summary_data, colWidths=[80 * mm, 60 * mm])
    summary_table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), colors.whitesmoke),
        ("GRID", (0, 0), (-1, -1), 0.5, colors.grey),
        ("FONTNAME", (0, 0), (-1, -1), "Helvetica"),
        ("FONTSIZE", (0, 0), (-1, -1), 10),
        ("PADDING", (0, 0), (-1, -1), 6),
    ]))
    elements.append(summary_table)
    elements.append(Spacer(1, 8 * mm))

    # Expenses table
    if expenses:
        elements.append(Paragraph("Expenses", styles["Heading2"]))
        expense_data = [["Date", "Location", "Category", "Amount"]]
        for e in expenses:
            expense_data.append([
                e.date.isoformat(),
                e.location or "",
                cat_map.get(e.category_id, "Unknown"),
                f"${e.amount:,.2f}",
            ])
        expense_table = Table(expense_data, colWidths=[30 * mm, 50 * mm, 40 * mm, 30 * mm])
        expense_table.setStyle(TableStyle([
            ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#1e293b")),
            ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
            ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
            ("FONTSIZE", (0, 0), (-1, -1), 9),
            ("GRID", (0, 0), (-1, -1), 0.5, colors.grey),
            ("PADDING", (0, 0), (-1, -1), 5),
            ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, colors.whitesmoke]),
        ]))
        elements.append(expense_table)
        elements.append(Spacer(1, 8 * mm))

    # Incomes table
    if incomes:
        elements.append(Paragraph("Incomes", styles["Heading2"]))
        income_data = [["Date", "Source", "Amount"]]
        for i in incomes:
            income_data.append([
                i.date.isoformat(),
                i.source,
                f"${i.amount:,.2f}",
            ])
        income_table = Table(income_data, colWidths=[40 * mm, 70 * mm, 40 * mm])
        income_table.setStyle(TableStyle([
            ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#166534")),
            ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
            ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
            ("FONTSIZE", (0, 0), (-1, -1), 9),
            ("GRID", (0, 0), (-1, -1), 0.5, colors.grey),
            ("PADDING", (0, 0), (-1, -1), 5),
            ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, colors.whitesmoke]),
        ]))
        elements.append(income_table)

    doc.build(elements)
    buffer.seek(0)
    filename = f"pennypath_report_{date.today().isoformat()}.pdf"

    return StreamingResponse(
        buffer,
        media_type="application/pdf",
        headers={"Content-Disposition": f"attachment; filename={filename}"},
    )


@app.get("/")
async def root():
    return {"message": "PennyPath Backend API Running"}
