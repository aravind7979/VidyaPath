from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import or_
from typing import List, Dict
import models, schemas, auth
from database import get_db

router = APIRouter(prefix="/curriculum", tags=["curriculum"])

SUBJECTS = [
    "Telugu", "Hindi", "English", "Maths", "Science", "Social Studies", "Computer Science"
]

@router.get("/classes")
async def get_classes():
    return list(range(1, 11))

@router.get("/{class_number}/subjects")
async def get_subjects(class_number: int):
    if class_number < 1 or class_number > 10:
        raise HTTPException(status_code=404, detail="Class not found")
    return SUBJECTS

@router.get("/{class_number}/{subject}/chapters", response_model=List[schemas.ChapterBase])
async def get_chapters(class_number: int, subject: str, current_user: models.User = Depends(auth.get_current_user), db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(models.Chapter)
        .filter(models.Chapter.class_number == class_number)
        .filter(models.Chapter.subject == subject)
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
            "class_number": c.class_number,
            "subject": c.subject,
            "chapter_number": c.chapter_number,
            "chapter_name": c.chapter_name,
            "completed": c.id in completed_set
        }
        response_data.append(chapter_dict)
        
    return response_data
