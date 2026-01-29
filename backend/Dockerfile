# Use Python 3.12 slim for a small, clean base
FROM python:3.12-slim

# Install g++ and Go (needed for the execution engine)
RUN apt-get update && apt-get install -y --no-install-recommends \
    g++ \
    golang \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# Copy uv binary directly from the official image
COPY --from=ghcr.io/astral-sh/uv:latest /uv /uvx /bin/

# Set the working directory inside the container
WORKDIR /app

# Copy dependency files first to leverage Docker caching
COPY pyproject.toml uv.lock ./

# Install project dependencies
RUN uv sync --frozen --no-dev

# Copy the rest of your backend code
COPY . .

# Create and set permissions for the temp folder where code runs
RUN mkdir -p temp_code && chmod 777 temp_code

# FastAPI port
EXPOSE 8000

# Run the app. uv run ensures the virtualenv is used correctly.
CMD ["uv", "run", "python", "-m", "uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]