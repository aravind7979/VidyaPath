from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import or_
from typing import List, Dict
import models, schemas, auth
from database import get_db

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
