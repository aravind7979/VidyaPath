import os
import shutil
import asyncio
import sys

sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))
from database import AsyncSessionLocal, engine, Base
from models import Chapter, ContentAsset
from sqlalchemy.future import select

INPUT_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "input")
STORAGE_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "storage")

async def ingest():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    if not os.path.exists(INPUT_DIR):
        print(f"Input directory {INPUT_DIR} does not exist.")
        return

    os.makedirs(STORAGE_DIR, exist_ok=True)

    ingested_count = 0

    async with AsyncSessionLocal() as session:
        for class_dir in os.listdir(INPUT_DIR):
            if not class_dir.startswith("class_"): continue
            class_num = int(class_dir.split("_")[1])
            class_path = os.path.join(INPUT_DIR, class_dir)

            for subject in os.listdir(class_path):
                subject_path = os.path.join(class_path, subject)
                if not os.path.isdir(subject_path): continue

                for chapter_dir in os.listdir(subject_path):
                    if not chapter_dir.startswith("chapter_"): continue
                    chapter_num = int(chapter_dir.split("_")[1])
                    chapter_path = os.path.join(subject_path, chapter_dir)

                    # Find chapter in DB
                    result = await session.execute(
                        select(Chapter)
                        .filter(Chapter.class_number == class_num)
                        .filter(Chapter.subject == subject)
                        .filter(Chapter.chapter_number == chapter_num)
                    )
                    chapter = result.scalars().first()
                    if not chapter:
                        print(f"Chapter not found for Class {class_num}, Subject {subject}, Chapter {chapter_num}")
                        continue

                    # Process files
                    for filename in os.listdir(chapter_path):
                        filepath = os.path.join(chapter_path, filename)
                        
                        asset_type = None
                        if filename.endswith(".mp4"):
                            asset_type = "video"
                        elif filename.endswith(".pptx"):
                            asset_type = "ppt"
                        elif filename.endswith(".pdf"):
                            asset_type = "pdf"
                        elif filename == "video.url":
                            asset_type = "video"
                        
                        if not asset_type: continue

                        # Check if asset already exists
                        existing_result = await session.execute(
                            select(ContentAsset)
                            .filter(ContentAsset.chapter_id == chapter.id)
                            .filter(ContentAsset.asset_type == asset_type)
                        )
                        existing_asset = existing_result.scalars().first()
                        
                        if existing_asset:
                            print(f"Asset {asset_type} for Chapter {chapter.id} already exists. Skipping.")
                            continue

                        # Handle URL vs File
                        if filename == "video.url":
                            with open(filepath, "r") as f:
                                url = f.read().strip()
                            new_asset = ContentAsset(chapter_id=chapter.id, asset_type=asset_type, url=url)
                        else:
                            # Move file to storage
                            dest_dir = os.path.join(STORAGE_DIR, f"class_{class_num}", subject, f"chapter_{chapter_num:02d}")
                            os.makedirs(dest_dir, exist_ok=True)
                            dest_path = os.path.join(dest_dir, filename)
                            shutil.copy2(filepath, dest_path)
                            
                            # Relative path for frontend
                            rel_path = f"class_{class_num}/{subject}/chapter_{chapter_num:02d}/{filename}"
                            new_asset = ContentAsset(chapter_id=chapter.id, asset_type=asset_type, file_path=rel_path)

                        session.add(new_asset)
                        ingested_count += 1

        await session.commit()
        print(f"Successfully ingested {ingested_count} assets.")

if __name__ == "__main__":
    asyncio.run(ingest())
