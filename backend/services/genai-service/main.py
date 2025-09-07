# from app.config.eureka_client import init_eureka
# from contextlib import asynccontextmanager
# @asynccontextmanager
# async def lifespan(app: FastAPI):
#     await init_eureka()
#     yield


from fastapi import FastAPI
from app import include_routers, settings

app: FastAPI = FastAPI(title="GenAI Service")#, lifespan=lifespan)
include_routers(app)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app="main:app", 
                host="localhost", 
                port=settings.SERVER_PORT, 
                reload=True)  