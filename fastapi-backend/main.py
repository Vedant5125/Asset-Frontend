from fastapi import FastAPI
from dotenv import load_dotenv
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from db.mongodb import connect_to_mongo, close_mongo_connection
from routes import auth, assets, finance
from core.config import settings
load_dotenv()

@asynccontextmanager
async def lifespan(app: FastAPI):
    try:
        print("Connecting to MongoDB...")
        await connect_to_mongo()
        print("MongoDB connected ✅")
    except Exception as e:
        print("MongoDB connection failed ❌", e)
    yield
    await close_mongo_connection()

app = FastAPI(title=settings.PROJECT_NAME, lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/api/auth", tags=["auth"])
app.include_router(assets.router, prefix="/api/assets", tags=["assets"])
app.include_router(finance.router, prefix="/api/finance", tags=["finance"])

@app.get("/")
async def root():
    return {"message": "Asset Management API is running"}
