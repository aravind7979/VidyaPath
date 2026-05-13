from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from datetime import datetime
import models, schemas, auth
from database import get_db

router = APIRouter(prefix="/progress", tags=["progress"])

@router.post("/complete")
async def mark_complete(req: schemas.CompleteChapter, current_user: models.User = Depends(auth.get_current_user), db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(models.ChapterProgress)
        .filter(models.ChapterProgress.user_id == current_user.id)
        .filter(models.ChapterProgress.chapter_id == req.chapter_id)
    )
    progress = result.scalars().first()
    
    if progress:
        if not progress.completed:
            progress.completed = True
            progress.completed_at = datetime.utcnow()
    else:
        progress = models.ChapterProgress(
            user_id=current_user.id,
            chapter_id=req.chapter_id,
            completed=True,
            completed_at=datetime.utcnow()
        )
        db.add(progress)
        
    await db.commit()
    return {"status": "success"}

@router.get("/summary")
async def get_summary(current_user: models.User = Depends(auth.get_current_user), db: AsyncSession = Depends(get_db)):
    # Completed chapters
    progress_result = await db.execute(
        select(models.ChapterProgress)
        .filter(models.ChapterProgress.user_id == current_user.id)
        .filter(models.ChapterProgress.completed == True)
    )
    completed_count = len(progress_result.scalars().all())
    
    # Average score from quizzes
    quiz_result = await db.execute(
        select(models.QuizAttempt)
        .filter(models.QuizAttempt.user_id == current_user.id)
    )
    attempts = quiz_result.scalars().all()
    avg_score = 0
    if attempts:
        scores = [a.score for a in attempts]
        avg_score = sum(scores) / len(scores)
        
    return {
        "completed_chapters": completed_count,
        "average_score": round(avg_score, 1)
    }
