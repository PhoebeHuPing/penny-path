"""Tests for category and budget endpoints."""
import pytest
from httpx import AsyncClient, ASGITransport

from server.main import app


# ============================================================
# Category Tests
# ============================================================

@pytest.mark.asyncio
async def test_get_categories(client):
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        response = await ac.get(
            "/api/categories",
            headers={"Authorization": f"Bearer {client['token']}"},
        )
    assert response.status_code == 200
    data = response.json()
    categories = data["data"]["categories"]
    assert len(categories) == 3  # Food, Transport, Shopping from fixture
    names = [c["name"] for c in categories]
    assert "Food" in names
    assert "Transport" in names


@pytest.mark.asyncio
async def test_create_category(client):
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        response = await ac.post(
            "/api/categories",
            json={"name": "Entertainment"},
            headers={"Authorization": f"Bearer {client['token']}"},
        )
    assert response.status_code == 200
    data = response.json()
    assert data["data"]["category"]["name"] == "Entertainment"


@pytest.mark.asyncio
async def test_create_duplicate_category(client):
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        response = await ac.post(
            "/api/categories",
            json={"name": "Food"},  # Already exists from fixture
            headers={"Authorization": f"Bearer {client['token']}"},
        )
    assert response.status_code == 400
    assert "already exists" in response.json()["detail"]


# ============================================================
# Budget Tests
# ============================================================

@pytest.mark.asyncio
async def test_get_budgets_empty(client):
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        response = await ac.get(
            "/api/budgets?month=7&year=2026",
            headers={"Authorization": f"Bearer {client['token']}"},
        )
    assert response.status_code == 200
    assert response.json() == []


@pytest.mark.asyncio
async def test_create_budget(client):
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        response = await ac.post(
            "/api/budgets",
            json={
                "category_id": None,
                "amount": 2000.0,
                "month": 7,
                "year": 2026,
            },
            headers={"Authorization": f"Bearer {client['token']}"},
        )
    assert response.status_code == 200
    data = response.json()
    assert data["amount"] == 2000.0
    assert data["month"] == 7
    assert data["year"] == 2026


@pytest.mark.asyncio
async def test_create_budget_invalid_month(client):
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        response = await ac.post(
            "/api/budgets",
            json={
                "category_id": None,
                "amount": 1000.0,
                "month": 13,
                "year": 2026,
            },
            headers={"Authorization": f"Bearer {client['token']}"},
        )
    assert response.status_code == 400


@pytest.mark.asyncio
async def test_create_budget_invalid_amount(client):
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        response = await ac.post(
            "/api/budgets",
            json={
                "category_id": None,
                "amount": -100.0,
                "month": 7,
                "year": 2026,
            },
            headers={"Authorization": f"Bearer {client['token']}"},
        )
    assert response.status_code == 400


@pytest.mark.asyncio
async def test_budget_upsert(client):
    """Creating a budget for the same category/month/year should update."""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        # Create
        await ac.post(
            "/api/budgets",
            json={"category_id": None, "amount": 1000.0, "month": 8, "year": 2026},
            headers={"Authorization": f"Bearer {client['token']}"},
        )
        # Update (same category/month/year)
        response = await ac.post(
            "/api/budgets",
            json={"category_id": None, "amount": 1500.0, "month": 8, "year": 2026},
            headers={"Authorization": f"Bearer {client['token']}"},
        )
    assert response.status_code == 200
    assert response.json()["amount"] == 1500.0


@pytest.mark.asyncio
async def test_delete_budget(client):
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        # Create budget
        create_resp = await ac.post(
            "/api/budgets",
            json={"category_id": None, "amount": 500.0, "month": 7, "year": 2026},
            headers={"Authorization": f"Bearer {client['token']}"},
        )
        budget_id = create_resp.json()["id"]

        # Delete it
        response = await ac.delete(
            f"/api/budgets/{budget_id}",
            headers={"Authorization": f"Bearer {client['token']}"},
        )
    assert response.status_code == 200


@pytest.mark.asyncio
async def test_budget_status(client, db_session):
    from server.db.database import DBBudget, DBExpense, DBCategory
    from datetime import date

    cat = db_session.query(DBCategory).filter(
        DBCategory.user_id == client["user"].id,
        DBCategory.name == "Food",
    ).first()

    # Create budget for Food category
    budget = DBBudget(
        user_id=client["user"].id,
        category_id=cat.id,
        amount=500.0,
        month=7,
        year=2026,
    )
    db_session.add(budget)

    # Create some expenses
    db_session.add(DBExpense(
        date=date(2026, 7, 10),
        location="Restaurant",
        amount=150.0,
        category_id=cat.id,
        user_id=client["user"].id,
    ))
    db_session.commit()

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        response = await ac.get(
            "/api/budgets/status?month=7&year=2026",
            headers={"Authorization": f"Bearer {client['token']}"},
        )
    assert response.status_code == 200
    data = response.json()
    assert len(data["budgets"]) == 1
    status = data["budgets"][0]
    assert status["amount"] == 500.0
    assert status["spent"] == 150.0
    assert status["remaining"] == 350.0
    assert status["is_over_budget"] is False
