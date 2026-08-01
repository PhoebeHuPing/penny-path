"""Tests for income endpoints."""
import pytest
from httpx import AsyncClient, ASGITransport

from server.main import app


@pytest.mark.asyncio
async def test_get_incomes_empty(client):
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        response = await ac.get(
            "/api/incomes",
            headers={"Authorization": f"Bearer {client['token']}"},
        )
    assert response.status_code == 200
    data = response.json()
    assert data["data"]["incomes"] == []
    assert data["data"]["total_count"] == 0


@pytest.mark.asyncio
async def test_create_income(client):
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        response = await ac.post(
            "/api/incomes",
            json={
                "date": "2026-07-01",
                "source": "Salary",
                "amount": 5000.00,
            },
            headers={"Authorization": f"Bearer {client['token']}"},
        )
    assert response.status_code == 200
    data = response.json()
    income = data["data"]["income"]
    assert income["source"] == "Salary"
    assert income["amount"] == 5000.00


@pytest.mark.asyncio
async def test_create_income_invalid_amount(client):
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        response = await ac.post(
            "/api/incomes",
            json={
                "date": "2026-07-01",
                "source": "Bad",
                "amount": -100.00,
            },
            headers={"Authorization": f"Bearer {client['token']}"},
        )
    assert response.status_code == 400
    assert "positive" in response.json()["detail"].lower()


@pytest.mark.asyncio
async def test_delete_income(client, db_session):
    from server.db.database import DBIncome
    from datetime import date

    income = DBIncome(
        date=date(2026, 7, 15),
        source="Freelance",
        amount=1200.0,
        user_id=client["user"].id,
    )
    db_session.add(income)
    db_session.commit()
    db_session.refresh(income)

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        response = await ac.delete(
            f"/api/incomes/{income.id}",
            headers={"Authorization": f"Bearer {client['token']}"},
        )
    assert response.status_code == 200
    assert "deleted" in response.json()["message"].lower()


@pytest.mark.asyncio
async def test_delete_nonexistent_income(client):
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        response = await ac.delete(
            "/api/incomes/99999",
            headers={"Authorization": f"Bearer {client['token']}"},
        )
    assert response.status_code == 404
