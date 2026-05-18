import sqlite3

def alter_db():
    conn = sqlite3.connect('C:\\vidyapath\\backend\\vidyapath.db')
    c = conn.cursor()
    try:
        c.execute("ALTER TABLE chapter_progress ADD COLUMN video_completed BOOLEAN DEFAULT 0")
        c.execute("ALTER TABLE chapter_progress ADD COLUMN explanation_completed BOOLEAN DEFAULT 0")
        c.execute("ALTER TABLE chapter_progress ADD COLUMN pdf_completed BOOLEAN DEFAULT 0")
        conn.commit()
        print("Successfully added columns to chapter_progress.")
    except Exception as e:
        print(f"Error: {e}")
    finally:
        conn.close()

if __name__ == "__main__":
    alter_db()
