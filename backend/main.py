from contextlib import asynccontextmanager
from fastapi import FastAPI
from app.database import engine, Base
from app.routes import auth_routes

@asynccontextmanager
async def lifespan(app: FastAPI):
    # This runs on startup
    # It creates the tables in Postgres if they don't exist
    print("ok")
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    
    yield
    
    # This runs on shutdown
    # Closes the connection pool to the database
    await engine.dispose()

app = FastAPI(lifespan=lifespan)

# Include our modular routes
app.include_router(auth_routes.router)

@app.get("/")
async def root():
    return {"message": "Auth API is up and running"}
