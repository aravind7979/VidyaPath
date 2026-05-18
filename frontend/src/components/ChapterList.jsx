import React, { useEffect, useState } from 'react';
import { useAppContext } from '../store';
import api from '../api';
import KnowledgeBrain from './KnowledgeBrain';

const SUBJECT_ICONS = {
  "Telugu": { emoji: "📜" },
  "Hindi": { emoji: "🕉️" },
  "English": { emoji: "📚" },
  "Maths": { emoji: "📐" },
  "Science": { emoji: "🔭" },
  "Social Studies": { emoji: "🗺️" },
  "Computer Science": { emoji: "💻" }
};

function ChapterList() {
  const { uiState, setUi } = useAppContext();
  const [chapters, setChapters] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchChapters = async () => {
      try {
        const res = await api.get(`/curriculum/subjects/${uiState.selectedSubjectId}/chapters`);
        setChapters(res.data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchChapters();
  }, [uiState.selectedSubjectId]);

  if (loading) return <div className="spinner"></div>;

  const icon = SUBJECT_ICONS[uiState.selectedSubjectName]?.emoji || "📘";

  return (
    <div className="fade-in">
      <div className="text-[28px] font-black text-[#F1F5F9] mb-2">{icon} {uiState.selectedSubjectName}</div>
      <div className="text-[14px] text-[#64748B] mb-7">{uiState.selectedClassName} — Select a chapter to begin</div>
      
      <div className="flex flex-col gap-3">
        {chapters.map((ch) => (
          <div 
            key={ch.id} 
            className="bg-[#1E293B] border border-white/5 rounded-xl px-5 py-4 cursor-pointer transition-all flex items-center gap-4 hover:border-[#0EA5E9]/40 hover:translate-x-1 hover:shadow-[0_4px_20px_rgba(14,165,233,0.1)]"
            onClick={() => setUi({selectedChapterName: ch.chapter_name, selectedChapterId: ch.id, currentStep: 'learn', activeMode: null})}
          >
            <div className="w-9 h-9 rounded-lg bg-[#0EA5E9]/15 text-[#0EA5E9] font-extrabold text-sm flex items-center justify-center shrink-0">
              {ch.chapter_number}
            </div>
            <div className="flex-1 font-bold text-sm text-[#E2E8F0]">
              {ch.chapter_name}
            </div>
            {ch.completed ? (
              <div className="ml-auto bg-[#34D399]/15 text-[#34D399] text-[11px] font-bold px-3 py-1 rounded-full whitespace-nowrap">
                ✓ Done
              </div>
            ) : (
              <div className="ml-auto">
                <KnowledgeBrain percentage={ch.progress_percentage || 0} size="w-8 h-8" />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default ChapterList;
