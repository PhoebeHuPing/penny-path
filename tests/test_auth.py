"""Tests for authentication endpoints."""
import pytest
from httpx import AsyncClient, ASGITransport

from server.main import app


@pytest.mark.asyncio
async def test_register_success(unauthenticated_client):
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        response = await ac.post("/api/auth/register", json={
            "email": "new@example.com",
            "username": "newuser",
            "password": "securepass123",
        })
    assert response.status_code == 200
    data = response.json()
    assert "token" in data
    assert data["user"]["email"] == "new@example.com"
    assert data["user"]["username"] == "newuser"


@pytest.mark.asyncio
async def test_register_duplicate_email(unauthenticated_client):
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        # Register first user
        await ac.post("/api/auth/register", json={
            "email": "dupe@example.com",
            "username": "user1",
            "password": "pass123",
        })
        # Try duplicate email
        response = await ac.post("/api/auth/register", json={
            "email": "dupe@example.com",
            "username": "user2",
            "password": "pass123",
        })
    assert response.status_code == 400
    assert "already registered" in response.json()["detail"]


@pytest.mark.asyncio
async def test_login_success(unauthenticated_client):
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        # Register first
        await ac.post("/api/auth/register", json={
            "email": "login@example.com",
            "username": "loginuser",
            "password": "mypassword",
        })
        # Login
        response = await ac.post("/api/auth/login", json={
            "email": "login@example.com",
            "password": "mypassword",
        })
    assert response.status_code == 200
    data = response.json()
    assert "token" in data
    assert data["user"]["email"] == "login@example.com"


@pytest.mark.asyncio
async def test_login_invalid_credentials(unauthenticated_client):
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        response = await ac.post("/api/auth/login", json={
            "email": "nobody@example.com",
            "password": "wrongpass",
        })
    assert response.status_code == 401
    assert "Invalid" in response.json()["detail"]


@pytest.mark.asyncio
async def test_get_me_with_token(client):
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        response = await ac.get(
            "/api/auth/me",
            headers={"Authorization": f"Bearer {client['token']}"},
        )
    assert response.status_code == 200
    data = response.json()
    assert data["email"] == "test@example.com"
    assert data["username"] == "testuser"


@pytest.mark.asyncio
async def test_get_me_without_token(unauthenticated_client):
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        response = await ac.get("/api/auth/me")
    assert response.status_code == 401
