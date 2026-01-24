# Online Judge Platform

A minimalist online judge system built with a modern asynchronous stack.

## Tech Stack

### Backend

* **Framework:** FastAPI (Python 3.11+)
* **Package Manager:** `uv` for extremely fast dependency management
* **Database:** PostgreSQL with `asyncpg`
* **ORM:** SQLAlchemy 2.0 (Full Async)
* **Security:** JWT authentication with `bcrypt` password hashing

### Frontend

* **Framework:** React 18+ with Vite
* **Styling:** Tailwind CSS
* **API Client:** Axios

---

## Getting Started

### Backend Setup

1. Navigate to the backend folder:
```bash
cd backend
```


2. Create environment file:
Create a `.env` file and add your `POSTGRES_USER`, `POSTGRES_PASSWORD`, and `SECRET_KEY`.
3. Install dependencies and run:
```bash
uv run uvicorn main:app --reload
```



### Frontend Setup

1. Navigate to the frontend folder:
```bash
cd frontend
```


2. Install dependencies:
```bash
npm install
```


3. Start the development server:
```bash
npm run dev
```



---

## Project Structure

* `app/auth`: Security logic and JWT handling.
* `app/routes`: API endpoints for authentication and judge logic.
* `app/models.py`: SQLAlchemy database models.
* `app/schemas.py`: Pydantic data validation schemas.
* `src/components`: Minimalist React UI components.