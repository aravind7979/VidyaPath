from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import List
import models, schemas, auth
from database import get_db

router = APIRouter(prefix="/content", tags=["content"])

@router.get("/{chapter_id}/assets", response_model=List[schemas.AssetResponse])
async def get_chapter_assets(chapter_id: int, current_user: models.User = Depends(auth.get_current_user), db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(models.ContentAsset).filter(models.ContentAsset.chapter_id == chapter_id)
    )
    assets = result.scalars().all()
    return assets
