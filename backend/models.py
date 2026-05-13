import datetime
from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, DateTime, Text, JSON
from sqlalchemy.orm import relationship
from database import Base

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    class_number = Column(Integer)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    progress = relationship("ChapterProgress", back_populates="user")
    quiz_attempts = relationship("QuizAttempt", back_populates="user")
    notes = relationship("Note", back_populates="user")

class Chapter(Base):
    __tablename__ = "chapters"
    id = Column(Integer, primary_key=True, index=True)
    class_number = Column(Integer, index=True)
    subject = Column(String, index=True)
    chapter_number = Column(Integer)
    chapter_name = Column(String)

    assets = relationship("ContentAsset", back_populates="chapter")
    progress = relationship("ChapterProgress", back_populates="chapter")
    quiz_attempts = relationship("QuizAttempt", back_populates="chapter")
    notes = relationship("Note", back_populates="chapter")

class ContentAsset(Base):
    __tablename__ = "content_assets"
    id = Column(Integer, primary_key=True, index=True)
    chapter_id = Column(Integer, ForeignKey("chapters.id"))
    asset_type = Column(String) # video/ppt/pdf
    file_path = Column(String, nullable=True)
    url = Column(String, nullable=True)

    chapter = relationship("Chapter", back_populates="assets")

class ChapterProgress(Base):
    __tablename__ = "chapter_progress"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    chapter_id = Column(Integer, ForeignKey("chapters.id"))
    completed = Column(Boolean, default=False)
    completed_at = Column(DateTime, nullable=True)

    user = relationship("User", back_populates="progress")
    chapter = relationship("Chapter", back_populates="progress")

class QuizAttempt(Base):
    __tablename__ = "quiz_attempts"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    chapter_id = Column(Integer, ForeignKey("chapters.id"))
    quiz_type = Column(String) # mcq/descriptive
    score = Column(Integer)
    max_score = Column(Integer)
    attempt_data = Column(JSON)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    user = relationship("User", back_populates="quiz_attempts")
    chapter = relationship("Chapter", back_populates="quiz_attempts")

class Note(Base):
    __tablename__ = "notes"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    chapter_id = Column(Integer, ForeignKey("chapters.id"))
    content = Column(Text, default="")
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    user = relationship("User", back_populates="notes")
    chapter = relationship("Chapter", back_populates="notes")
