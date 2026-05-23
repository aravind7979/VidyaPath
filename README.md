<div align="center">
  <img src="https://via.placeholder.com/150/0F172A/0EA5E9?text=VidyaPath" alt="VidyaPath Logo" width="120" height="120" style="border-radius: 20px;">
  
  <h1>📘 VidyaPath: Enterprise AI Curriculum Engine</h1>
  <p><strong>A Next-Generation, Autonomous Hybrid Intelligence Learning Platform</strong></p>
  
  <p>
    <a href="https://vidyapath-delta.vercel.app"><b>Live App: vidyapath-delta.vercel.app</b></a>
  </p>

  <p>
    <img src="https://img.shields.io/badge/Status-Active-success.svg" alt="Status" />
    <img src="https://img.shields.io/badge/Backend-FastAPI-009688?logo=fastapi" alt="FastAPI" />
    <img src="https://img.shields.io/badge/Frontend-React%20%7C%20Vite-61DAFB?logo=react" alt="React" />
    <img src="https://img.shields.io/badge/AI-Gemini%202.5-4285F4?logo=google" alt="Gemini" />
    <img src="https://img.shields.io/badge/Desktop-Tauri-FFC131?logo=tauri" alt="Tauri" />
  </p>
</div>

---

## 🌟 Overview
**VidyaPath** is fundamentally more than a Curriculum Management System (CMS). It is a highly scalable, autonomous **Hybrid Intelligence Learning Engine** designed to bridge the gap between traditional teacher-led instruction and autonomous LLM-driven personalized learning. 

This platform aims to contribute to schools worldwide who want to integrate AI in parallel with their academics, providing a seamless, gamified, and highly personalized learning environment for primary and middle school students.

## 🚀 Key Features

### 🧠 The "Knowledge Brain" UI & Gamification
Instead of standard progress bars, VidyaPath maps data to visual cognitive growth using an anatomical "Brain" silhouette. 
Progress is algorithmic and deeply granular:
- 📺 **Video Consumption:** 10%
- 📖 **Reading Explanations:** 10%
- 📄 **Document Review:** 10%
- 📝 **Assessment Validation:** 70%

### 🤖 Hybrid-AI Pipeline & RAG Architecture
VidyaPath uses **Google Gemini 2.5 Flash** as its cognitive engine, intelligently grounded using real textbook documents to eliminate hallucinations.
- **Visual Indexing:** Teachers upload an image of a textbook's index, and the Vision model autonomously extracts and seeds the entire database schema.
- **PDF Grounding:** Generative outputs (Explanations, Video Scripts, Quizzes) are strictly grounded on uploaded chapter PDFs.
- **Evaluative Grading:** The AI acts as a grading engine for subjective, descriptive questions, providing constructive feedback and handling spelling mistakes gracefully.
- **Cost-Optimized Fallback:** The backend natively checks for human-verified, manually uploaded assets (videos, PDFs, custom MCQs) before burning AI inference tokens.

### 🔐 Frictionless "Transparent" Auth
To optimize for younger demographics, VidyaPath bypasses complex OAuth or email validation flows. Students simply click their assigned Roll Number to authenticate instantly via JWT, creating a highly personalized dashboard without the friction of traditional sign-ups.

## 💻 Technology Stack

- **Backend:** Python, FastAPI, SQLAlchemy, SQLite (AWS EC2)
- **Frontend:** React, Vite, TailwindCSS, Context API (Vercel)
- **Desktop Application:** Tauri (Rust) for cross-platform desktop native execution.
- **AI Integration:** Google GenAI SDK (Gemini 2.5 Flash)

## 📦 Installation & Deployment

### Local Development Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/aravind7979/VidyaPath.git
   cd VidyaPath
   ```

2. **Backend Setup:**
   ```bash
   cd backend
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   pip install -r requirements.txt
   uvicorn main:app --reload
   ```

3. **Frontend Setup:**
   ```bash
   cd ../frontend
   npm install
   npm run dev
   ```

### Desktop App (Tauri)
VidyaPath includes a native desktop application powered by **Tauri**. To build the desktop application:
```bash
cd frontend
npm run tauri build
```
*(Requires Rust toolchain to be installed on your system).*

---
<div align="center">
  <i>Built with ❤️ for the future of AI-driven education.</i>
</div>
