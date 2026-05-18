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
from pydantic import BaseModel

router = APIRouter(prefix="/curriculum", tags=["curriculum"])

@router.get("/classes", response_model=List[schemas.ClassBase])
async def get_classes(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(models.ClassModel).order_by(models.ClassModel.class_number))
    return result.scalars().all()

@router.get("/classes/{class_id}/subjects", response_model=List[schemas.SubjectProgressResponse])
async def get_subjects(class_id: int, current_user: models.User = Depends(auth.get_current_user), db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(models.Subject).filter(models.Subject.class_id == class_id))
    subjects = result.scalars().all()
    
    response_data = []
    for sub in subjects:
        # Get total chapters for this subject
        ch_result = await db.execute(select(models.Chapter).filter(models.Chapter.subject_id == sub.id))
        chapters = ch_result.scalars().all()
        total_chapters = len(chapters)
        
        # Get completed chapters for this subject and this user
        completed_chapters = 0
        total_progress_sum = 0
        if chapters:
            chapter_ids = [c.id for c in chapters]
            prog_result = await db.execute(
                select(models.ChapterProgress)
                .filter(models.ChapterProgress.user_id == current_user.id)
                .filter(models.ChapterProgress.chapter_id.in_(chapter_ids))
            )
            prog_records = prog_result.scalars().all()
            
            prog_dict = {p.chapter_id: p for p in prog_records}

            # Quiz scores (70%)
            quiz_result = await db.execute(
                select(models.QuizAttempt)
                .filter(models.QuizAttempt.user_id == current_user.id)
                .filter(models.QuizAttempt.chapter_id.in_(chapter_ids))
            )
            quiz_records = quiz_result.scalars().all()
            
            quiz_scores = {}
            for q in quiz_records:
                if q.max_score > 0:
                    percentage = (q.score / q.max_score) * 70
                    if q.chapter_id not in quiz_scores or percentage > quiz_scores[q.chapter_id]:
                        quiz_scores[q.chapter_id] = percentage
                        
            for ch_id in chapter_ids:
                p = prog_dict.get(ch_id)
                vid_prog = 10 if (p and p.video_completed) else 0
                exp_prog = 10 if (p and p.explanation_completed) else 0
                pdf_prog = 10 if (p and p.pdf_completed) else 0
                
                # Backwards compat: if 'completed' is true, give 30
                if p and p.completed:
                    view_prog = 30
                else:
                    view_prog = vid_prog + exp_prog + pdf_prog
                    
                quiz_prog = quiz_scores.get(ch_id, 0)
                
                ch_total = view_prog + quiz_prog
                total_progress_sum += ch_total
                
                if ch_total >= 100 or (p and p.completed and quiz_prog > 0): # rough completion definition
                    completed_chapters += 1
                
        avg_progress = int(total_progress_sum / total_chapters) if total_chapters > 0 else 0

        response_data.append({
            "id": sub.id,
            "class_id": sub.class_id,
            "subject_name": sub.subject_name,
            "total_chapters": total_chapters,
            "completed_chapters": completed_chapters,
            "progress_percentage": avg_progress
        })
        
    return response_data

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
    prog_dict = {p.chapter_id: p for p in progress_records}

    # Get quiz attempts for progress calculation
    quiz_result = await db.execute(
        select(models.QuizAttempt)
        .filter(models.QuizAttempt.user_id == current_user.id)
        .filter(models.QuizAttempt.chapter_id.in_(chapter_ids))
    )
    quiz_records = quiz_result.scalars().all()
    
    quiz_scores = {}
    for q in quiz_records:
        if q.max_score > 0:
            percentage = (q.score / q.max_score) * 70
            if q.chapter_id not in quiz_scores or percentage > quiz_scores[q.chapter_id]:
                quiz_scores[q.chapter_id] = percentage

    response_data = []
    for c in chapters:
        p = prog_dict.get(c.id)
        vid_prog = 10 if (p and p.video_completed) else 0
        exp_prog = 10 if (p and p.explanation_completed) else 0
        pdf_prog = 10 if (p and p.pdf_completed) else 0
        
        # Backwards compat
        if p and p.completed:
            view_prog = 30
        else:
            view_prog = vid_prog + exp_prog + pdf_prog
            
        quiz_prog = quiz_scores.get(c.id, 0)
        total_prog = int(view_prog + quiz_prog)
        
        chapter_dict = {
            "id": c.id,
            "subject_id": c.subject_id,
            "chapter_number": c.chapter_number,
            "chapter_name": c.chapter_name,
            "completed": p.completed if p else False,
            "progress_percentage": total_prog,
            "video_completed": p.video_completed if p else False,
            "explanation_completed": p.explanation_completed if p else False,
            "pdf_completed": p.pdf_completed if p else False
        }
        response_data.append(chapter_dict)
        
    return response_data

@router.post("/progress/mark")
async def mark_section_progress(req: schemas.MarkProgressRequest, current_user: models.User = Depends(auth.get_current_user), db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(models.ChapterProgress).filter(
            models.ChapterProgress.user_id == current_user.id,
            models.ChapterProgress.chapter_id == req.chapter_id
        )
    )
    progress = result.scalars().first()
    
    if not progress:
        progress = models.ChapterProgress(user_id=current_user.id, chapter_id=req.chapter_id)
        db.add(progress)
        
    if req.section == 'video':
        progress.video_completed = True
    elif req.section == 'explanation':
        progress.explanation_completed = True
    elif req.section == 'pdf':
        progress.pdf_completed = True
        
    # Check if all 3 are done, mark whole chapter view completed
    if progress.video_completed and progress.explanation_completed and progress.pdf_completed:
        progress.completed = True

    await db.commit()
    return {"status": "success"}

@router.post("/upload-index")
async def upload_index(
    class_id: int = Form(...),
    subject_id: int = Form(...),
    file: UploadFile = File(...),
    current_user: models.User = Depends(auth.get_current_user),
    db: AsyncSession = Depends(get_db)
):
    # Removed strict email check as frontend handles teacher protection

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

class ChapterCreateRequest(BaseModel):
    chapter_number: int
    chapter_name: str
    subject_id: int

@router.post("/subjects/{subject_id}/chapters", response_model=schemas.ChapterBase)
async def create_chapter(
    subject_id: int, 
    chapter: ChapterCreateRequest, 
    current_user: models.User = Depends(auth.get_current_user), 
    db: AsyncSession = Depends(get_db)
):
    db_chapter = models.Chapter(
        subject_id=subject_id,
        chapter_number=chapter.chapter_number,
        chapter_name=chapter.chapter_name
    )
    db.add(db_chapter)
    await db.commit()
    await db.refresh(db_chapter)
    return db_chapter

@router.get("/global-stats")
async def get_global_stats(current_user: models.User = Depends(auth.get_current_user), db: AsyncSession = Depends(get_db)):
    # Chapters done
    prog_result = await db.execute(
        select(models.ChapterProgress).filter(
            models.ChapterProgress.user_id == current_user.id,
            models.ChapterProgress.completed == True
        )
    )
    completed_count = len(prog_result.scalars().all())
    
    # Avg score
    quiz_result = await db.execute(
        select(models.QuizAttempt).filter(
            models.QuizAttempt.user_id == current_user.id
        )
    )
    attempts = quiz_result.scalars().all()
    
    # Best score per chapter
    best_scores = {}
    for a in attempts:
        if a.max_score > 0:
            pct = (a.score / a.max_score) * 100
            if a.chapter_id not in best_scores or pct > best_scores[a.chapter_id]:
                best_scores[a.chapter_id] = pct
                
    avg_score = 0
    if best_scores:
        avg_score = int(sum(best_scores.values()) / len(best_scores))
        
    return {
        "chapters_done": completed_count,
        "avg_score": avg_score
    }
