<div align="center">
  <h1>📘 VidyaPath: Enterprise AI Curriculum Engine</h1>
  <p><strong>A Next-Generation, Autonomous Hybrid Intelligence Learning Platform</strong></p>
  
  <p>
    <a href="https://vidyapath-delta.vercel.app"><b>Live App: vidyapath-delta.vercel.app</b></a>
  </p>
</div>

---

## 🌟 Overview
**VidyaPath** is fundamentally more than a Curriculum Management System (CMS). It is a highly scalable, autonomous **Hybrid Intelligence Learning Engine** designed to bridge the gap between traditional education systems and cutting-edge AI-driven personalized learning. 

This platform aims to contribute to schools worldwide who want to integrate AI in parallel with their academics, providing a seamless, gamified, and highly personalized learning environment for primary and secondary students.

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
To optimize for younger demographics, VidyaPath bypasses complex OAuth or email validation flows. Students simply click their assigned Roll Number to authenticate instantly via JWT, creating a highly friction-free onboarding experience.

## 💻 Technology Stack

- **Backend:** Python, FastAPI, SQLAlchemy, SQLite (AWS EC2)
- **Frontend:** React, Vite, TailwindCSS, Context API (Vercel)
- **Desktop Application:** Tauri (Rust) for cross-platform desktop native execution.
- **AI Integration:** Google GenAI SDK (Gemini 2.5 Flash)

## 📚 Curriculum Management System

### How It Works
VidyaPath features a **customizable, institution-specific curriculum upload system** designed for maximum flexibility. Each school can independently upload and manage their own curriculum structure, ensuring alignment with their academic standards and requirements.

**Teachers can:**
- Upload textbook indices as images for automatic curriculum extraction
- Upload PDF chapters for AI grounding and content generation
- Create custom assessments and learning materials
- Manage student roll numbers and learning pathways

### 🧪 Live Demo & Testing

For **live demonstration and evaluation purposes**, the platform currently includes a fully functional **Class 1 English** curriculum that has been pre-configured as a sample subject. This demo curriculum demonstrates all core features of the platform including:
- AI-powered lesson generation grounded in actual textbook content
- Interactive assessments with AI-based grading
- Gamified learning progress visualization via the "Knowledge Brain"
- Complete student learning workflows

**To test the live application:**
1. Visit the [live app](https://vidyapath-delta.vercel.app)
2. Navigate to **Class 1 → English** to explore the fully configured demo curriculum
3. Use the student roll number authentication to access the learning interface

> **Note:** The Class 1 English curriculum is a sample for demonstration. In production, schools will upload their own curriculum using the teacher upload system. The platform's architecture is designed to support unlimited custom curricula simultaneously.

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
