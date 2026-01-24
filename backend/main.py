from fastapi import FastAPI
from app.database import engine, Base
from app.routes import auth_routes

app = FastAPI()

@app.on_event("startup")
async def init_db():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

app.include_router(auth_routes.router)
