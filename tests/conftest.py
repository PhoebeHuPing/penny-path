"""Pytest fixtures for the PennyPath backend tests.

Uses SQLite in-memory database to avoid needing PostgreSQL for tests.
Uses httpx AsyncClient with ASGI transport for testing FastAPI.
"""
import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from server.db.database import Base, DBUser, DBCategory
from server.auth import hash_password, create_access_token, get_db, get_current_user
from server.main import app


# --- Test database setup ---
TEST_DATABASE_URL = "sqlite:///./test.db"
engine = create_engine(TEST_DATABASE_URL, connect_args={"check_same_thread": False})
TestSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def override_get_db():
    db = TestSessionLocal()
    try:
        yield db
    finally:
        db.close()


@pytest.fixture(autouse=True)
def setup_database():
    """Create tables before each test, drop after."""
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)


@pytest.fixture
def db_session():
    """Provide a database session for test helpers."""
    db = TestSessionLocal()
    try:
        yield db
    finally:
        db.close()


@pytest.fixture
def test_user(db_session):
    """Create and return a test user."""
    user = DBUser(
        email="test@example.com",
        username="testuser",
        hashed_password=hash_password("password123"),
    )
    db_session.add(user)
    db_session.commit()
    db_session.refresh(user)

    # Add default categories for the user
    for name in ["Food", "Transport", "Shopping"]:
        db_session.add(DBCategory(name=name, user_id=user.id))
    db_session.commit()

    return user


@pytest.fixture
def auth_token(test_user):
    """Generate a valid JWT token for the test user."""
    return create_access_token(test_user.id, test_user.username)


@pytest.fixture
def client(test_user, auth_token, db_session):
    """Provide an authenticated test context with DB overrides."""
    app.dependency_overrides[get_db] = override_get_db

    yield {
        "token": auth_token,
        "user": test_user,
    }

    app.dependency_overrides.clear()


@pytest.fixture
def unauthenticated_client():
    """Client without user (for auth endpoint tests)."""
    app.dependency_overrides[get_db] = override_get_db
    yield
    app.dependency_overrides.clear()
