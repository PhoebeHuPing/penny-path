"""Tests for expense endpoints."""
import pytest
from httpx import AsyncClient, ASGITransport

from server.main import app


@pytest.mark.asyncio
async def test_get_expenses_empty(client):
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        response = await ac.get(
            "/api/expenses",
            headers={"Authorization": f"Bearer {client['token']}"},
        )
    assert response.status_code == 200
    data = response.json()
    assert data["data"]["expenses"] == []
    assert data["data"]["total_count"] == 0


@pytest.mark.asyncio
async def test_create_expense(client, db_session):
    from server.db.database import DBCategory

    cat = db_session.query(DBCategory).filter(
        DBCategory.user_id == client["user"].id
    ).first()

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        response = await ac.post(
            "/api/expenses",
            json={
                "date": "2026-07-15",
                "location": "Coffee Shop",
                "amount": 4.50,
                "category_id": cat.id,
            },
            headers={"Authorization": f"Bearer {client['token']}"},
        )
    assert response.status_code == 200
    data = response.json()
    expense = data["data"]["expense"]
    assert expense["location"] == "Coffee Shop"
    assert expense["amount"] == 4.50
    assert expense["category_id"] == cat.id


@pytest.mark.asyncio
async def test_create_expense_invalid_category(client):
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        response = await ac.post(
            "/api/expenses",
            json={
                "date": "2026-07-15",
                "location": "Test",
                "amount": 10.00,
                "category_id": 99999,
            },
            headers={"Authorization": f"Bearer {client['token']}"},
        )
    assert response.status_code == 400
    assert "Invalid category" in response.json()["detail"]


@pytest.mark.asyncio
async def test_delete_expense(client, db_session):
    from server.db.database import DBCategory, DBExpense
    from datetime import date

    cat = db_session.query(DBCategory).filter(
        DBCategory.user_id == client["user"].id
    ).first()

    expense = DBExpense(
        date=date(2026, 7, 15),
        location="To Delete",
        amount=20.0,
        category_id=cat.id,
        user_id=client["user"].id,
    )
    db_session.add(expense)
    db_session.commit()
    db_session.refresh(expense)

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        response = await ac.delete(
            f"/api/expenses/{expense.id}",
            headers={"Authorization": f"Bearer {client['token']}"},
        )
    assert response.status_code == 200
    assert "deleted" in response.json()["message"].lower()


@pytest.mark.asyncio
async def test_delete_nonexistent_expense(client):
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        response = await ac.delete(
            "/api/expenses/99999",
            headers={"Authorization": f"Bearer {client['token']}"},
        )
    assert response.status_code == 404


@pytest.mark.asyncio
async def test_get_expenses_with_filters(client, db_session):
    from server.db.database import DBCategory, DBExpense
    from datetime import date

    cat = db_session.query(DBCategory).filter(
        DBCategory.user_id == client["user"].id,
        DBCategory.name == "Food",
    ).first()

    for i in range(3):
        db_session.add(DBExpense(
            date=date(2026, 7, 10 + i),
            location=f"Place {i}",
            amount=10.0 + i * 5,
            category_id=cat.id,
            user_id=client["user"].id,
        ))
    db_session.commit()

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        response = await ac.get(
            f"/api/expenses?category_id={cat.id}",
            headers={"Authorization": f"Bearer {client['token']}"},
        )
    assert response.status_code == 200
    data = response.json()
    assert data["data"]["total_count"] == 3
