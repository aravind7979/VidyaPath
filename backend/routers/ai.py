import os
import json
from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from pydantic import BaseModel
from google import genai
from google.genai import types
from dotenv import load_dotenv

import models, auth
from database import get_db
import traceback

load_dotenv()
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

router = APIRouter(prefix="/ai", tags=["ai"])

class AIRequest(BaseModel):
    chapter_id: int

class DescriptiveEvalRequest(BaseModel):
    chapter_id: int
    question: str
    student_answer: str

async def get_chapter_info(chapter_id: int, db: AsyncSession):
    result = await db.execute(select(models.Chapter).filter(models.Chapter.id == chapter_id))
    chapter = result.scalars().first()
    if not chapter:
        raise HTTPException(status_code=404, detail="Chapter not found")
    return chapter

@router.post("/explanation")
async def generate_explanation(req: AIRequest, current_user: models.User = Depends(auth.get_current_user), db: AsyncSession = Depends(get_db)):
    chapter = await get_chapter_info(req.chapter_id, db)
    
    # Get PDF if available
    pdf_result = await db.execute(select(models.ContentAsset).filter(
        models.ContentAsset.chapter_id == req.chapter_id,
        models.ContentAsset.asset_type == 'pdf'
    ))
    pdf_asset = pdf_result.scalars().first()
    
    if not GEMINI_API_KEY or GEMINI_API_KEY == "your-gemini-api-key":
        async def mock_stream():
            yield "### Introduction\n\nThis is a mock explanation because GEMINI_API_KEY is not configured.\n\n"
            yield "### Key Concepts\n\n- Concept 1\n- Concept 2\n\n"
        return StreamingResponse(mock_stream(), media_type="text/plain")

    client = genai.Client(api_key=GEMINI_API_KEY)
    
    prompt = f"You are a school teacher. Explain the chapter '{chapter.chapter_name}' from {chapter.subject} for Class {chapter.class_number} students in India. Structure your response with these sections using ###: Introduction, Key Concepts, Important Points, Summary. Keep it clear and educational."
    contents = [prompt]
    
    gemini_file = None
    if pdf_asset and os.path.exists(pdf_asset.file_path):
        try:
            print(f"Uploading {pdf_asset.file_path} to Gemini...")
            gemini_file = client.files.upload(file=pdf_asset.file_path)
            contents.append("Base your explanation strictly on the attached textbook chapter PDF.")
            contents.insert(0, gemini_file)
        except Exception as e:
            print(f"Failed to upload PDF to Gemini: {e}")
            
    response = client.models.generate_content_stream(
        model='gemini-2.5-flash',
        contents=contents,
    )
    
    async def stream_generator():
        try:
            for chunk in response:
                if chunk.text:
                    yield chunk.text
        finally:
            if gemini_file:
                try:
                    client.files.delete(name=gemini_file.name)
                except:
                    pass
                
    return StreamingResponse(stream_generator(), media_type="text/plain")

@router.post("/generate-mcq")
async def generate_mcq(req: AIRequest, current_user: models.User = Depends(auth.get_current_user), db: AsyncSession = Depends(get_db)):
    chapter = await get_chapter_info(req.chapter_id, db)
    
    pdf_result = await db.execute(select(models.ContentAsset).filter(
        models.ContentAsset.chapter_id == req.chapter_id,
        models.ContentAsset.asset_type == 'pdf'
    ))
    pdf_asset = pdf_result.scalars().first()
    
    if not GEMINI_API_KEY or GEMINI_API_KEY == "your-gemini-api-key":
        return [
            {"question": f"Mock Question 1 for {chapter.chapter_name}?", "options": ["A) Opt 1", "B) Opt 2", "C) Opt 3", "D) Opt 4"], "answer": "A) Opt 1", "explanation": "Mock explanation."}
        ] * 5

    client = genai.Client(api_key=GEMINI_API_KEY)
    prompt = f"Generate 5 multiple choice questions for Class {chapter.class_number} {chapter.subject} chapter '{chapter.chapter_name}'. Return ONLY a JSON array with this exact structure: [{{\"question\":\"...\",\"options\":[\"A) ...\",\"B) ...\",\"C) ...\",\"D) ...\"],\"answer\":\"A) ...\",\"explanation\":\"...\"}}]. No markdown, no extra text, no backticks."
    contents = [prompt]
    
    gemini_file = None
    if pdf_asset and os.path.exists(pdf_asset.file_path):
        try:
            gemini_file = client.files.upload(file=pdf_asset.file_path)
            contents.append("Base these MCQs strictly on the content of the attached PDF.")
            contents.insert(0, gemini_file)
        except Exception as e:
            pass

    try:
        response = client.models.generate_content(
            model='gemini-2.5-flash',
            contents=contents,
        )
        if gemini_file:
            client.files.delete(name=gemini_file.name)
            
        text = response.text.replace("```json", "").replace("```", "").strip()
        data = json.loads(text)
        return data
    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail="Failed to parse AI response")

@router.post("/generate-descriptive")
async def generate_descriptive(req: AIRequest, current_user: models.User = Depends(auth.get_current_user), db: AsyncSession = Depends(get_db)):
    chapter = await get_chapter_info(req.chapter_id, db)
    
    pdf_result = await db.execute(select(models.ContentAsset).filter(
        models.ContentAsset.chapter_id == req.chapter_id,
        models.ContentAsset.asset_type == 'pdf'
    ))
    pdf_asset = pdf_result.scalars().first()
    
    if not GEMINI_API_KEY or GEMINI_API_KEY == "your-gemini-api-key":
        return [
            {"question": f"Explain the main concept of {chapter.chapter_name}."},
            {"question": "Describe the key features."},
            {"question": "What is the conclusion?"}
        ]

    client = genai.Client(api_key=GEMINI_API_KEY)
    prompt = f"Generate 3 descriptive questions for Class {chapter.class_number} {chapter.subject} chapter '{chapter.chapter_name}'. Return ONLY a JSON array with this exact structure: [{{\"question\":\"...\"}}]. No markdown, no extra text, no backticks."
    contents = [prompt]
    
    gemini_file = None
    if pdf_asset and os.path.exists(pdf_asset.file_path):
        try:
            gemini_file = client.files.upload(file=pdf_asset.file_path)
            contents.append("Base these descriptive questions strictly on the content of the attached PDF.")
            contents.insert(0, gemini_file)
        except Exception as e:
            pass

    try:
        response = client.models.generate_content(
            model='gemini-2.5-flash',
            contents=contents,
        )
        if gemini_file:
            client.files.delete(name=gemini_file.name)
            
        text = response.text.replace("```json", "").replace("```", "").strip()
        data = json.loads(text)
        return data
    except Exception as e:
        raise HTTPException(status_code=500, detail="Failed to parse AI response")

@router.post("/evaluate-descriptive")
async def evaluate_descriptive(req: DescriptiveEvalRequest, current_user: models.User = Depends(auth.get_current_user), db: AsyncSession = Depends(get_db)):
    chapter = await get_chapter_info(req.chapter_id, db)
    
    pdf_result = await db.execute(select(models.ContentAsset).filter(
        models.ContentAsset.chapter_id == req.chapter_id,
        models.ContentAsset.asset_type == 'pdf'
    ))
    pdf_asset = pdf_result.scalars().first()
    
    if not GEMINI_API_KEY or GEMINI_API_KEY == "your-gemini-api-key":
        return {
            "score": 3,
            "max_score": 5,
            "feedback": "This is a mock evaluation because GEMINI_API_KEY is not configured.",
            "corrected_answer": "This would be the correct answer."
        }

    client = genai.Client(api_key=GEMINI_API_KEY)
    prompt = f"""
    Evaluate the student's answer to the following descriptive question for Class {chapter.class_number} {chapter.subject} chapter '{chapter.chapter_name}'.
    Question: {req.question}
    Student Answer: {req.student_answer}
    
    Handle spelling mistakes gracefully - give partial credit for partially correct answers.
    Return ONLY a JSON object with this exact structure: {{"score": [0 to 5], "max_score": 5, "feedback": "...", "corrected_answer": "..."}}. No markdown, no backticks.
    """
    contents = [prompt]
    
    gemini_file = None
    if pdf_asset and os.path.exists(pdf_asset.file_path):
        try:
            gemini_file = client.files.upload(file=pdf_asset.file_path)
            contents.append("Evaluate the student's answer strictly based on the facts in the attached PDF.")
            contents.insert(0, gemini_file)
        except Exception as e:
            pass

    try:
        response = client.models.generate_content(
            model='gemini-2.5-flash',
            contents=contents,
        )
        if gemini_file:
            client.files.delete(name=gemini_file.name)
            
        text = response.text.replace("```json", "").replace("```", "").strip()
        data = json.loads(text)
        return data
    except Exception as e:
        raise HTTPException(status_code=500, detail="Failed to parse AI response")

@router.post("/video-script")
async def generate_video_script(req: AIRequest, current_user: models.User = Depends(auth.get_current_user), db: AsyncSession = Depends(get_db)):
    chapter = await get_chapter_info(req.chapter_id, db)
    
    pdf_result = await db.execute(select(models.ContentAsset).filter(
        models.ContentAsset.chapter_id == req.chapter_id,
        models.ContentAsset.asset_type == 'pdf'
    ))
    pdf_asset = pdf_result.scalars().first()
    
    if not GEMINI_API_KEY or GEMINI_API_KEY == "your-gemini-api-key":
        async def mock_stream():
            yield "### AI Video Script\n\nNo API key found.\n\n"
        return StreamingResponse(mock_stream(), media_type="text/plain")

    client = genai.Client(api_key=GEMINI_API_KEY)
    prompt = f"You are a master educator. Create a 'Video Script' for the chapter '{chapter.chapter_name}' from {chapter.subject} for Class {chapter.class_number}. Make it engaging like an educational YouTube video. Also suggest 3 YouTube search terms to find relevant videos at the very end."
    contents = [prompt]
    
    gemini_file = None
    if pdf_asset and os.path.exists(pdf_asset.file_path):
        try:
            gemini_file = client.files.upload(file=pdf_asset.file_path)
            contents.append("Base this video script strictly on the attached PDF.")
            contents.insert(0, gemini_file)
        except Exception as e:
            pass

    response = client.models.generate_content_stream(
        model='gemini-2.5-flash',
        contents=contents,
    )
    
    async def stream_generator():
        try:
            for chunk in response:
                if chunk.text:
                    yield chunk.text
        finally:
            if gemini_file:
                try:
                    client.files.delete(name=gemini_file.name)
                except:
                    pass
                
    return StreamingResponse(stream_generator(), media_type="text/plain")
