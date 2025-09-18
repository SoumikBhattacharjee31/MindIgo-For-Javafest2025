from fastapi import FastAPI
import signal
from contextlib import asynccontextmanager

from app.route_helper import include_routers
from app.config.settings import settings
from app.config.eureka_client import eureka_client
from app.config.logger_config import get_logger
from app.db.db_manager import initialize_all_databases, cleanup_all_databases


logger = get_logger(__name__)

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Handle application startup and shutdown"""
    # Startup
    logger.info("Starting FastAPI application...")
    
    # Initialize all databases
    try:
        await initialize_all_databases()
        logger.info("Database initialization completed")
    except Exception as e:
        logger.error(f"Database initialization failed: {e}")
        raise
    
    # Register with Eureka
    success = await eureka_client.register()
    if success:
        # Start sending heartbeats
        await eureka_client.start_heartbeat()
    else:
        logger.warning("Failed to register with Eureka, but continuing...")
    
    yield
    
    # Shutdown
    logger.info("Shutting down FastAPI application...")
    
    # Stop heartbeat
    await eureka_client.stop_heartbeat()
    
    # Deregister from Eureka
    await eureka_client.deregister()
    
    # Close all database connections
    await cleanup_all_databases()
    logger.info("Application shutdown completed")
    
app: FastAPI = FastAPI(title="GenAI Service", lifespan=lifespan)
include_routers(app)

if __name__ == "__main__":
    import uvicorn
    
    def signal_handler(signum, frame):
        logger.info(f"Received signal {signum}, initiating graceful shutdown...")
    
    signal.signal(signal.SIGINT, signal_handler)
    signal.signal(signal.SIGTERM, signal_handler)
    
    uvicorn.run(app="main:app", 
                host="0.0.0.0", 
                port=settings.SERVER_PORT, 
                reload=False,
                log_level="info")  