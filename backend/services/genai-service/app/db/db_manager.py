"""
Database Manager Module

This module handles the initialization and cleanup of all database connections
for the MindIgo GenAI service.
"""
from app.config.logger_config import get_logger
from app.db.postgres import init_postgres_tables, close_postgres_connection
from app.db.mongo import get_database, close_database
from app.db.chroma import initialize_chroma, close_chroma

logger = get_logger(__name__)


async def initialize_all_databases():
    """Initialize all database connections and create necessary tables/collections."""
    logger.info("Starting database initialization...")
    
    try:
        # Initialize PostgreSQL
        logger.info("Initializing PostgreSQL...")
        init_postgres_tables()
        logger.info("PostgreSQL initialized successfully")
        
        # Initialize MongoDB
        logger.info("Initializing MongoDB...")
        get_database()  # This will create the connection and indexes
        logger.info("MongoDB initialized successfully")
        
        # Initialize Chroma vector store
        logger.info("Initializing Chroma vector store...")
        initialize_chroma()
        logger.info("Chroma vector store initialized successfully")
        
        logger.info("All databases initialized successfully")
        
    except Exception as e:
        logger.error(f"Failed to initialize databases: {e}")
        # Try to cleanup any partially initialized connections
        await cleanup_all_databases()
        raise


async def cleanup_all_databases():
    """Close all database connections gracefully."""
    logger.info("Starting database cleanup...")
    
    # Close PostgreSQL connection
    try:
        logger.info("Closing PostgreSQL connection...")
        close_postgres_connection()
        logger.info("PostgreSQL connection closed successfully")
    except Exception as e:
        logger.error(f"Error closing PostgreSQL connection: {e}")
    
    # Close MongoDB connection
    try:
        logger.info("Closing MongoDB connection...")
        close_database()
        logger.info("MongoDB connection closed successfully")
    except Exception as e:
        logger.error(f"Error closing MongoDB connection: {e}")
    
    # Close Chroma vector store
    try:
        logger.info("Closing Chroma vector store...")
        close_chroma()
        logger.info("Chroma vector store closed successfully")
    except Exception as e:
        logger.error(f"Error closing Chroma vector store: {e}")
    
    logger.info("Database cleanup completed")