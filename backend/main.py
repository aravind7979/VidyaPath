import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from database import engine, Base
from routers import auth, curriculum, content, ai, quiz, progress, notes
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(title="VidyaPath API")

origins = os.getenv("CORS_ORIGINS", "http://localhost:5173").split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

os.makedirs("./storage", exist_ok=True)
os.makedirs("./uploads", exist_ok=True)
app.mount("/static", StaticFiles(directory="./storage"), name="static")
app.mount("/uploads", StaticFiles(directory="./uploads"), name="uploads")

app.include_router(auth.router)
app.include_router(curriculum.router)
app.include_router(content.router)
app.include_router(ai.router)
app.include_router(quiz.router)
app.include_router(progress.router)
app.include_router(notes.router)

@app.on_event("startup")
async def on_startup():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

@app.get("/")
async def root():
    return {"message": "Welcome to VidyaPath API"}
