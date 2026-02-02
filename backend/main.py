"""Main application module for the Auth API.

This module initializes the FastAPI application, configures middleware (CORS),
manages the database connection lifespan, and integrates modular routing.
"""

# Built-In Imports.
from typing import AsyncGenerator
from contextlib import asynccontextmanager

# External Imports.
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Local Imports.
from app.database import engine, Base
from app.routes import auth_routes, problem_routes, execute_routes, ai_review_routes


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator[None, None]:
    """Manages the startup and shutdown events of the FastAPI application.

    On startup:
        - Establishes a connection to the database.
        - Synchronizes SQLAlchemy metadata to create tables if they do not exist.

    On shutdown:
        - Disposes of the database engine and closes connection pools.

    Args:
        app: The FastAPI instance.
    """
    # This runs on startup
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    yield

    # This runs on shutdown
    await engine.dispose()


app = FastAPI(lifespan=lifespan)

# Configure Cross-Origin Resource Sharing (CORS)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include modular routes
app.include_router(auth_routes.router)
app.include_router(problem_routes.router)
app.include_router(execute_routes.router)
app.include_router(ai_review_routes.router)


@app.get("/")
async def root() -> dict[str, str]:
    """Root endpoint to verify the API status.

    Returns:
        A dictionary containing a status message.
    """
    return {"message": "Auth API is up and running"}
