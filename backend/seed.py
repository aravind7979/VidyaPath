import asyncio
from sqlalchemy.ext.asyncio import AsyncSession
from database import engine, AsyncSessionLocal
from models import ClassModel, Subject

from sqlalchemy.future import select

async def seed_db():
    async with AsyncSessionLocal() as db:
        for class_num in range(1, 11):
            class_obj = ClassModel(class_name=f"Class {class_num}", class_number=class_num)
            db.add(class_obj)
            await db.flush()
            
            subjects = ["Telugu", "Hindi", "English", "Maths", "Science", "Social Studies"]
            for subj in subjects:
                db.add(Subject(class_id=class_obj.id, subject_name=subj))
        
        await db.commit()
        print("Database seeded with Classes and new Subjects.")

if __name__ == "__main__":
    asyncio.run(seed_db())
