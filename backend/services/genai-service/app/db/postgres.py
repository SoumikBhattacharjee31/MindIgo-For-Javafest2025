import psycopg2
from app.config.settings import settings
from app.config.logger_config import get_logger

logger = get_logger(__name__)
_postgres_connection = None


def get_postgres_connection():
    global _postgres_connection
    if _postgres_connection is None:
        try:
            _postgres_connection = psycopg2.connect(
                host=settings.DB_HOST,
                port=settings.DB_PORT,
                database=settings.DB_NAME,
                user=settings.DB_USERNAME,
                password=settings.DB_PASSWORD,
                options="-c search_path=ai_service"
            )
            logger.info("PostgreSQL connection established.")
        except Exception as e:
            logger.error(f"Error connecting to PostgreSQL: {e}")
            _postgres_connection = None
    return _postgres_connection


def get_postgres_cursor():
    conn = get_postgres_connection()
    if conn:
        logger.info("PostgreSQL cursor created.")
        return conn.cursor()
    else:
        logger.error("No PostgreSQL connection available.")
        raise ConnectionError("Unable to establish PostgreSQL connection.")


def init_postgres_tables():
    """Initialize required PostgreSQL tables if they do not exist."""
    conn = get_postgres_connection()
    if conn:
        try:
            cursor = conn.cursor()
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS FILE_TABLE (
                    file_id SERIAL PRIMARY KEY,
                    link TEXT NOT NULL UNIQUE,
                    local_path TEXT NOT NULL,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                );
            """)
            conn.commit()
            cursor.close()
            logger.info("FILE_TABLE initialized (if not exists).")
        except Exception as e:
            logger.error(f"Error initializing FILE_TABLE: {e}")
            conn.rollback()


def close_postgres_connection():
    """Close PostgreSQL connection if it exists."""
    global _postgres_connection
    if _postgres_connection is not None:
        try:
            _postgres_connection.close()
            logger.info("PostgreSQL connection closed.")
        except Exception as e:
            logger.error(f"Error closing PostgreSQL connection: {e}")
        finally:
            _postgres_connection = None
