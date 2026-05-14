import asyncio
from sqlalchemy.ext.asyncio import AsyncSession
from database import engine, AsyncSessionLocal
from models import ClassModel, Subject

from sqlalchemy.future import select

async def seed_db():
    async with AsyncSessionLocal() as db:
        # Check if already seeded
        result = await db.execute(select(ClassModel).limit(1))
        if result.scalars().first():
            print("Database is already seeded!")
            return
            
        for class_num in range(1, 11):
            class_obj = ClassModel(class_name=f"Class {class_num}", class_number=class_num)
            db.add(class_obj)
            await db.flush()
            
            subjects = ["Maths", "Science", "English", "Social Studies"]
            for subj in subjects:
                db.add(Subject(class_id=class_obj.id, subject_name=subj))
        
        await db.commit()
        print("Database seeded with Classes and Subjects.")

if __name__ == "__main__":
    asyncio.run(seed_db())
