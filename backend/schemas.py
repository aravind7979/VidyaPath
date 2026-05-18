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

class ClassBase(BaseModel):
    id: int
    class_name: str
    class_number: int

    class Config:
        from_attributes = True

class SubjectBase(BaseModel):
    id: int
    class_id: int
    subject_name: str

    class Config:
        from_attributes = True

class SubjectProgressResponse(SubjectBase):
    total_chapters: int
    completed_chapters: int
    progress_percentage: int = 0

class ChapterBase(BaseModel):
    id: int
    subject_id: int
    chapter_number: int
    chapter_name: str
    completed: bool = False
    progress_percentage: int = 0

    class Config:
        from_attributes = True

class AssetBase(BaseModel):
    id: int
    chapter_id: int
    asset_type: str
    title: Optional[str] = None
    file_path: Optional[str] = None
    url: Optional[str] = None
    description: Optional[str] = None
    tags: Optional[str] = None

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
