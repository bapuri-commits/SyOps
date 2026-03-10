from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .routers import health, metrics, services, ssl
from .services.health import close_client


@asynccontextmanager
async def lifespan(_app: FastAPI):
    yield
    await close_client()


app = FastAPI(title="SyOps API", version="0.1.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://syworkspace.cloud", "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["GET", "POST"],
    allow_headers=["*"],
)

app.include_router(health.router)
app.include_router(metrics.router)
app.include_router(services.router)
app.include_router(ssl.router)


@app.get("/")
def root():
    return {"service": "syops-api", "status": "ok"}
