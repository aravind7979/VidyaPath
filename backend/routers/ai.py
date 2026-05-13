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
    
    if not GEMINI_API_KEY or GEMINI_API_KEY == "your-gemini-api-key":
        async def mock_stream():
            yield "### Introduction\n\nThis is a mock explanation because GEMINI_API_KEY is not configured.\n\n"
            yield "### Key Concepts\n\n- Concept 1\n- Concept 2\n\n"
            yield "### Important Points\n\nRemember these points.\n\n"
            yield "### Summary\n\nThis chapter is important.\n"
        return StreamingResponse(mock_stream(), media_type="text/plain")

    client = genai.Client(api_key=GEMINI_API_KEY)
    
    prompt = f"You are a school teacher. Explain the chapter '{chapter.chapter_name}' from {chapter.subject} for Class {chapter.class_number} students in India (CBSE/State board). Structure your response with these sections using ###: Introduction, Key Concepts, Important Points, Summary. Keep it clear and educational."
    
    response = client.models.generate_content_stream(
        model='gemini-2.5-flash',
        contents=prompt,
    )
    
    async def stream_generator():
        for chunk in response:
            if chunk.text:
                yield chunk.text
                
    return StreamingResponse(stream_generator(), media_type="text/plain")

@router.post("/generate-mcq")
async def generate_mcq(req: AIRequest, current_user: models.User = Depends(auth.get_current_user), db: AsyncSession = Depends(get_db)):
    chapter = await get_chapter_info(req.chapter_id, db)
    
    if not GEMINI_API_KEY or GEMINI_API_KEY == "your-gemini-api-key":
        return [
            {"question": f"Mock Question 1 for {chapter.chapter_name}?", "options": ["A) Opt 1", "B) Opt 2", "C) Opt 3", "D) Opt 4"], "answer": "A) Opt 1", "explanation": "Mock explanation."}
        ] * 5

    client = genai.Client(api_key=GEMINI_API_KEY)
    prompt = f"Generate 5 multiple choice questions for Class {chapter.class_number} {chapter.subject} chapter '{chapter.chapter_name}'. Return ONLY a JSON array with this exact structure: [{{\"question\":\"...\",\"options\":[\"A) ...\",\"B) ...\",\"C) ...\",\"D) ...\"],\"answer\":\"A) ...\",\"explanation\":\"...\"}}]. No markdown, no extra text, no backticks."
    
    response = client.models.generate_content(
        model='gemini-2.5-flash',
        contents=prompt,
    )
    
    try:
        text = response.text.replace("```json", "").replace("```", "").strip()
        data = json.loads(text)
        return data
    except Exception as e:
        raise HTTPException(status_code=500, detail="Failed to parse AI response")

@router.post("/generate-descriptive")
async def generate_descriptive(req: AIRequest, current_user: models.User = Depends(auth.get_current_user), db: AsyncSession = Depends(get_db)):
    chapter = await get_chapter_info(req.chapter_id, db)
    
    if not GEMINI_API_KEY or GEMINI_API_KEY == "your-gemini-api-key":
        return [
            {"question": f"Explain the main concept of {chapter.chapter_name}."},
            {"question": "Describe the key features."},
            {"question": "What is the conclusion?"}
        ]

    client = genai.Client(api_key=GEMINI_API_KEY)
    prompt = f"Generate 3 descriptive questions for Class {chapter.class_number} {chapter.subject} chapter '{chapter.chapter_name}'. Return ONLY a JSON array with this exact structure: [{{\"question\":\"...\"}}]. No markdown, no extra text, no backticks."
    
    response = client.models.generate_content(
        model='gemini-2.5-flash',
        contents=prompt,
    )
    
    try:
        text = response.text.replace("```json", "").replace("```", "").strip()
        data = json.loads(text)
        return data
    except Exception as e:
        raise HTTPException(status_code=500, detail="Failed to parse AI response")

@router.post("/evaluate-descriptive")
async def evaluate_descriptive(req: DescriptiveEvalRequest, current_user: models.User = Depends(auth.get_current_user), db: AsyncSession = Depends(get_db)):
    chapter = await get_chapter_info(req.chapter_id, db)
    
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
    
    response = client.models.generate_content(
        model='gemini-2.5-flash',
        contents=prompt,
    )
    
    try:
        text = response.text.replace("```json", "").replace("```", "").strip()
        data = json.loads(text)
        return data
    except Exception as e:
        raise HTTPException(status_code=500, detail="Failed to parse AI response")
