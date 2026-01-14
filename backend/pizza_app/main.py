from fastapi import FastAPI, Request, status
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from uvicorn import run
from contextlib import asynccontextmanager
import logging
from pizza_app.router import pizza_route, chat_route
from pizza_app.models.pizza_models import init_db
from fastapi.staticfiles import StaticFiles

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    datefmt='%Y-%m-%d %H:%M:%S'
)

logger = logging.getLogger(__name__)

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    init_db()
    yield
    # Shutdown (if needed)

app = FastAPI(lifespan=lifespan)

# Add exception handler for validation errors
@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    """Log validation errors and return detailed error messages"""
    body = await request.body()
    logger.error(f"Validation error on {request.method} {request.url.path}")
    logger.error(f"Request body: {body.decode('utf-8') if body else 'Empty body'}")
    logger.error(f"Validation errors: {exc.errors()}")
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={
            "detail": exc.errors(),
            "body": body.decode('utf-8') if body else None
        },
    )

app.include_router(pizza_route.router)
app.include_router(chat_route.router)
# Mount dist directory at /dist so images are accessible at /dist/images/
# This also serves the React app at /dist/
# app.mount("/dist", StaticFiles(directory="../frontend/dist", html=True))
# Mount root to redirect or serve index from dist
app.mount("/", StaticFiles(directory="../frontend/dist", html=True))

# List the URLs where your React app is running
origins = [
    "http://localhost:5173", # Vite default
    "http://localhost:3000", # Create React App default
    "http://127.0.0.1:9002", # Direct access to API
    "http://localhost:9002", # Alternative localhost access
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # Allow all origins for development
    allow_credentials=True,  # Must be False when using wildcard origins
    allow_methods=["*"],
    allow_headers=["*"],
)


if __name__ == "__main__":
    run("pizza_app.main:app", host="127.0.0.1", reload=True, port=9002)