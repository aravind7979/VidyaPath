import asyncio
import os
from database import engine, Base
from models import User

async def main():
    async with engine.begin() as conn:
        print("Starting create...")
        # We can just test if the db works
        try:
            await conn.run_sync(Base.metadata.create_all)
            print("DB tables created successfully.")
        except Exception as e:
            print("Error:", e)

if __name__ == "__main__":
    asyncio.run(main())
