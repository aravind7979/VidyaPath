import React, { useEffect, useState } from 'react';
import { useAppContext } from '../store';
import api from '../api';
import KnowledgeBrain from './KnowledgeBrain';

const SUBJECT_ICONS = {
  "Telugu": { emoji: "📜", color: "#F59E0B" },
  "Hindi": { emoji: "🕉️", color: "#EF4444" },
  "English": { emoji: "📚", color: "#3B82F6" },
  "Maths": { emoji: "📐", color: "#8B5CF6" },
  "Science": { emoji: "🔭", color: "#10B981" },
  "Social Studies": { emoji: "🗺️", color: "#F97316" },
  "Computer Science": { emoji: "💻", color: "#0EA5E9" }
};

function SubjectGrid() {
  const { uiState, setUi } = useAppContext();
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        const res = await api.get(`/curriculum/classes/${uiState.selectedClassId}/subjects`);
        setSubjects(res.data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchSubjects();
  }, [uiState.selectedClassId]);

  if (loading) return <div className="spinner"></div>;

  return (
    <div className="fade-in">
      <div className="text-[28px] font-black text-[#F1F5F9] mb-2">Select a Subject</div>
      <div className="text-[14px] text-[#64748B] mb-7">{uiState.selectedClassName} — Choose what you want to study</div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {subjects.map(sub => {
          const info = SUBJECT_ICONS[sub.subject_name] || { emoji: "📘", color: "#0EA5E9" };
          return (
            <div 
              key={sub.id} 
              className="card bg-[#1E293B] border border-white/5 rounded-2xl p-5 cursor-pointer transition-all relative overflow-hidden"
              onClick={() => setUi({selectedSubjectId: sub.id, selectedSubjectName: sub.subject_name, currentStep: 'chapter'})}
            >
              <div className="card-glow"></div>
              
              <div className="flex justify-between items-start mb-3 relative z-10">
                <div className="text-4xl">{info.emoji}</div>
                <KnowledgeBrain 
                  percentage={sub.total_chapters > 0 ? (sub.completed_chapters / sub.total_chapters) * 100 : 0} 
                  color={info.color} 
                  size="w-12 h-12"
                />
              </div>
              
              <div className="text-base font-extrabold text-[#F1F5F9] relative z-10">{sub.subject_name}</div>
              
              <div className="flex justify-between items-center mt-2 relative z-10">
                <div className="text-xs font-bold text-[#94A3B8]">
                  {sub.completed_chapters} / {sub.total_chapters} Chapters
                </div>
                <div className="w-8 h-1 rounded-full" style={{background: info.color}}></div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default SubjectGrid;
