from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import or_
from typing import List, Dict
import models, schemas, auth
from database import get_db
from fastapi import UploadFile, File, Form
import os
import json
from google import genai
from google.genai import types

router = APIRouter(prefix="/curriculum", tags=["curriculum"])

@router.get("/classes", response_model=List[schemas.ClassBase])
async def get_classes(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(models.ClassModel).order_by(models.ClassModel.class_number))
    return result.scalars().all()

@router.get("/classes/{class_id}/subjects", response_model=List[schemas.SubjectBase])
async def get_subjects(class_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(models.Subject).filter(models.Subject.class_id == class_id))
    return result.scalars().all()

@router.get("/subjects/{subject_id}/chapters", response_model=List[schemas.ChapterBase])
async def get_chapters(subject_id: int, current_user: models.User = Depends(auth.get_current_user), db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(models.Chapter)
        .filter(models.Chapter.subject_id == subject_id)
        .order_by(models.Chapter.chapter_number)
    )
    chapters = result.scalars().all()

    # Get user progress for these chapters
    chapter_ids = [c.id for c in chapters]
    progress_result = await db.execute(
        select(models.ChapterProgress)
        .filter(models.ChapterProgress.user_id == current_user.id)
        .filter(models.ChapterProgress.chapter_id.in_(chapter_ids))
    )
    progress_records = progress_result.scalars().all()
    completed_set = {p.chapter_id for p in progress_records if p.completed}

    response_data = []
    for c in chapters:
        chapter_dict = {
            "id": c.id,
            "subject_id": c.subject_id,
            "chapter_number": c.chapter_number,
            "chapter_name": c.chapter_name,
            "completed": c.id in completed_set
        }
        response_data.append(chapter_dict)
        
    return response_data

@router.post("/upload-index")
async def upload_index(
    class_id: int = Form(...),
    subject_id: int = Form(...),
    file: UploadFile = File(...),
    current_user: models.User = Depends(auth.get_current_user),
    db: AsyncSession = Depends(get_db)
):
    if current_user.email != "admin@vidyapath.local" and "teacher" not in current_user.email:
        raise HTTPException(status_code=403, detail="Not authorized")

    GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
    if not GEMINI_API_KEY or GEMINI_API_KEY == "your-gemini-api-key":
        raise HTTPException(status_code=500, detail="GEMINI_API_KEY is not configured on the server.")

    client = genai.Client(api_key=GEMINI_API_KEY)
    
    image_bytes = await file.read()
    
    prompt = """
    Extract all the chapters from this textbook index image.
    Return ONLY a JSON array with this exact structure:
    [
        {"chapter_number": 1, "chapter_name": "Chapter Title"},
        {"chapter_number": 2, "chapter_name": "Next Title"}
    ]
    Do not use markdown formatting. Just output the raw JSON array.
    """
    
    try:
        response = client.models.generate_content(
            model='gemini-2.5-flash',
            contents=[
                types.Part.from_bytes(data=image_bytes, mime_type=file.content_type),
                prompt
            ]
        )
        
        text = response.text.strip()
        if text.startswith("```json"):
            text = text.replace("```json", "", 1)
        if text.endswith("```"):
            text = text[:-3]
            
        data = json.loads(text.strip())
        
        # Save to database
        created_chapters = []
        for ch in data:
            db_chapter = models.Chapter(
                subject_id=subject_id,
                chapter_number=int(ch.get("chapter_number", 0)),
                chapter_name=ch.get("chapter_name", "Unknown Chapter")
            )
            db.add(db_chapter)
            created_chapters.append(db_chapter)
            
        await db.commit()
        return {"status": "success", "message": f"Successfully created {len(created_chapters)} chapters."}
        
    except Exception as e:
        print("AI Processing Error:", str(e))
        raise HTTPException(status_code=500, detail=f"Failed to process image: {str(e)}")
