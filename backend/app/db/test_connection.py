from sqlalchemy import text

from app.db.database import engine


def test_connection():
    try:
        with engine.connect() as connection:
            result = connection.execute(text("SELECT 1"))
            print(f"MySQL connection successful: {result.scalar()}")
    except Exception as error:
        print(f"MySQL connection failed: {error}")


if __name__ == "__main__":
    test_connection()