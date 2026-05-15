from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import List, Optional
import os
import uuid
import models, schemas, auth
from database import get_db
from pydantic import BaseModel
import os
from google import genai

router = APIRouter(prefix="/content", tags=["content"])

UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

class AIMetadataRequest(BaseModel):
    filename: str

class AIMetadataResponse(BaseModel):
    suggested_title: str
    suggested_tags: str
    suggested_subject: str
    suggested_chapter: str
    description: str

@router.get("/{chapter_id}/assets", response_model=List[schemas.AssetBase])
async def get_chapter_assets(chapter_id: int, current_user: models.User = Depends(auth.get_current_user), db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(models.ContentAsset).filter(models.ContentAsset.chapter_id == chapter_id)
    )
    assets = result.scalars().all()
    return assets

@router.post("/upload")
async def upload_content(
    chapter_id: int = Form(...),
    asset_type: str = Form(...),
    title: str = Form(...),
    description: Optional[str] = Form(None),
    tags: Optional[str] = Form(None),
    file: UploadFile = File(...),
    current_user: models.User = Depends(auth.get_current_user),
    db: AsyncSession = Depends(get_db)
):
    # Removed strict email check as frontend handles teacher protection

    file_extension = file.filename.split('.')[-1] if '.' in file.filename else ''
    new_filename = f"{uuid.uuid4().hex}.{file_extension}"
    file_path = os.path.join(UPLOAD_DIR, new_filename)

    with open(file_path, "wb") as f:
        f.write(await file.read())
    
    # We store the relative URL
    file_url = f"/uploads/{new_filename}"

    asset = models.ContentAsset(
        chapter_id=chapter_id,
        asset_type=asset_type,
        title=title,
        file_path=file_path,
        url=file_url,
        description=description,
        tags=tags
    )
    db.add(asset)
    await db.commit()
    await db.refresh(asset)
    return {"status": "success", "asset_id": asset.id, "file_url": file_url}

@router.post("/ai-metadata", response_model=AIMetadataResponse)
async def generate_ai_metadata(req: AIMetadataRequest, current_user: models.User = Depends(auth.get_current_user)):
    try:
        GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
        if not GEMINI_API_KEY or GEMINI_API_KEY == "your-gemini-api-key":
            return {
                "suggested_title": req.filename.split('.')[0].replace('_', ' '),
                "suggested_tags": "General",
                "suggested_subject": "General",
                "suggested_chapter": "Chapter 1",
                "description": "Mock description since API key is not set."
            }

        client = genai.Client(api_key=GEMINI_API_KEY)
        prompt = f"""
        You are an AI assistant for a school curriculum system.
        The teacher is uploading a file named: '{req.filename}'
        
        Based on this filename, suggest the following metadata in JSON format:
        {{
            "suggested_title": "A clean title for the file",
            "suggested_tags": "Comma separated tags (e.g., Algebra, Math)",
            "suggested_subject": "Likely subject (e.g., Maths, Science, English)",
            "suggested_chapter": "Likely chapter name",
            "description": "A 2-sentence auto-generated description of what this content might be about"
        }}
        
        Respond ONLY with valid JSON.
        """
        response = client.models.generate_content(
            model='gemini-2.5-flash',
            contents=prompt,
        )
        text = response.text.strip()
        if text.startswith("```json"):
            text = text.replace("```json", "", 1)
        if text.endswith("```"):
            text = text[:-3]
            
        import json
        data = json.loads(text.strip())
        return data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
