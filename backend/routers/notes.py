from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from datetime import datetime
import models, schemas, auth
from database import get_db

router = APIRouter(prefix="/notes", tags=["notes"])

@router.get("/{chapter_id}")
async def get_note(chapter_id: int, current_user: models.User = Depends(auth.get_current_user), db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(models.Note)
        .filter(models.Note.user_id == current_user.id)
        .filter(models.Note.chapter_id == chapter_id)
    )
    note = result.scalars().first()
    return {"content": note.content if note else ""}

@router.put("/{chapter_id}")
async def update_note(chapter_id: int, req: schemas.NoteUpdate, current_user: models.User = Depends(auth.get_current_user), db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(models.Note)
        .filter(models.Note.user_id == current_user.id)
        .filter(models.Note.chapter_id == chapter_id)
    )
    note = result.scalars().first()
    
    if note:
        note.content = req.content
        note.updated_at = datetime.utcnow()
    else:
        note = models.Note(
            user_id=current_user.id,
            chapter_id=chapter_id,
            content=req.content,
            updated_at=datetime.utcnow()
        )
        db.add(note)
        
    await db.commit()
    return {"status": "success"}
