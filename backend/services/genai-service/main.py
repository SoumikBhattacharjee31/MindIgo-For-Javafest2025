from fastapi import FastAPI
from app import include_routers, settings, eureka_client
import signal
import logging
from contextlib import asynccontextmanager

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Handle application startup and shutdown"""
    # Startup
    logger.info("Starting FastAPI application...")
    
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
    
app: FastAPI = FastAPI(title="GenAI Service", lifespan=lifespan)
include_routers(app)

if __name__ == "__main__":
    import uvicorn
    
    # Handle graceful shutdown
    def signal_handler(signum, frame):
        logger.info(f"Received signal {signum}, initiating graceful shutdown...")
    
    signal.signal(signal.SIGINT, signal_handler)
    signal.signal(signal.SIGTERM, signal_handler)
    
    uvicorn.run(app="main:app", 
                host="0.0.0.0", 
                port=settings.SERVER_PORT, 
                reload=False,
                log_level="info")  