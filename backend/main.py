from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .core.database import close_db, init_db
from .routers import auth, bot_proxy, health, metrics, services, ssl  # noqa: gallery 비활성화
from .services.health import close_client


@asynccontextmanager
async def lifespan(_app: FastAPI):
    await init_db()
    yield
    await close_client()
    await close_db()


app = FastAPI(title="SyOps API", version="0.2.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://syworkspace.cloud", "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PATCH"],
    allow_headers=["*"],
)

app.include_router(auth.router)
## app.include_router(gallery.router)  # 갤러리 비활성화
app.include_router(health.router)
app.include_router(metrics.router)
app.include_router(services.router)
app.include_router(ssl.router)
app.include_router(bot_proxy.router)


@app.get("/")
def root():
    return {"service": "syops-api", "status": "ok"}
