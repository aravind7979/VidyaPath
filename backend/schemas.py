from pydantic import BaseModel
from typing import Optional, List, Dict, Any

class UserCreate(BaseModel):
    name: str
    email: str
    password: str
    class_number: int

class UserLogin(BaseModel):
    email: str
    password: str

class UserResponse(BaseModel):
    id: int
    name: str
    email: str
    class_number: int

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None

class ChapterBase(BaseModel):
    id: int
    class_number: int
    subject: str
    chapter_number: int
    chapter_name: str
    completed: bool = False

    class Config:
        from_attributes = True

class AssetResponse(BaseModel):
    asset_type: str
    file_path: Optional[str] = None
    url: Optional[str] = None

    class Config:
        from_attributes = True

class MCQAnswer(BaseModel):
    question_index: int
    selected_option: str

class MCQSubmit(BaseModel):
    chapter_id: int
    answers: List[MCQAnswer]

class DescriptiveAnswer(BaseModel):
    question: str
    student_answer: str

class DescriptiveSubmit(BaseModel):
    chapter_id: int
    answers: List[DescriptiveAnswer]

class CompleteChapter(BaseModel):
    chapter_id: int

class NoteUpdate(BaseModel):
    content: str
