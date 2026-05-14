import React, { useEffect, useState } from 'react';
import { useAppContext } from '../store';
import api from '../api';
import GeneralExplanation from './GeneralExplanation';
import VideoExplanation from './VideoExplanation';
import PPTViewer from './PPTViewer';
import PDFViewer from './PDFViewer';
import Assessment from './Assessment';

const MODES = [
  { id: 'explain', icon: '📖', title: 'General Explanation', desc: 'AI-generated structured explanation of this chapter' },
  { id: 'video', icon: '🎬', title: 'Video Explanation', desc: 'Watch a curated video for this chapter' },
  { id: 'ppt', icon: '📊', title: 'PPT Presentation', desc: 'View a slideshow for this chapter' },
  { id: 'pdf', icon: '📄', title: 'PDF Document', desc: 'Access a PDF for this chapter' },
  { id: 'quiz', icon: '📝', title: 'Assessment', desc: 'Test your knowledge with MCQ or Descriptive Quiz' },
];

function LearnMode() {
  const { uiState, setUi, updateProgress } = useAppContext();
  const [completed, setCompleted] = useState(false);
  const [assets, setAssets] = useState([]);

  useEffect(() => {
    const fetchChapterDetails = async () => {
      try {
        const res = await api.get(`/curriculum/${uiState.selectedClass}/${uiState.selectedSubject}/chapters`);
        const ch = res.data.find(c => c.id === uiState.selectedChapterId);
        if (ch) setCompleted(ch.completed);

        const assetRes = await api.get(`/content/${uiState.selectedChapterId}/assets`);
        setAssets(assetRes.data);
      } catch (e) {
        console.error(e);
      }
    };
    if (uiState.selectedChapterId) fetchChapterDetails();
  }, [uiState.selectedChapterId, uiState.selectedClass, uiState.selectedSubject]);

  const markComplete = async () => {
    try {
      await api.post('/progress/complete', { chapter_id: uiState.selectedChapterId });
      setCompleted(true);
      updateProgress();
    } catch (e) {
      console.error(e);
    }
  };

  const renderActiveMode = () => {
    switch (uiState.activeMode) {
      case 'explain': return <GeneralExplanation />;
      case 'video': return <VideoExplanation assets={assets} />;
      case 'ppt': return <PPTViewer assets={assets} />;
      case 'pdf': return <PDFViewer assets={assets} />;
      case 'quiz': return <Assessment />;
      default: return null;
    }
  };

  return (
    <div className="fade-in">
      <div className="flex flex-wrap justify-between items-start mb-6 gap-3">
        <div>
          <div className="text-[22px] font-black text-[#F1F5F9] mb-1">{uiState.selectedChapter}</div>
          <div className="text-[14px] text-[#64748B]">Class {uiState.selectedClass} · {uiState.selectedSubject}</div>
        </div>
        {completed ? (
          <div className="flex items-center gap-2 bg-[#34D399]/10 border border-[#34D399]/30 rounded-xl px-4 py-2 text-[#34D399] text-[13px] font-bold">
            ✓ Chapter Completed
          </div>
        ) : (
          <button 
            onClick={markComplete}
            className="bg-[#059669] hover:bg-[#047857] text-white font-bold py-2 px-4 rounded-xl text-sm transition-all transform hover:-translate-y-0.5"
          >
            Mark as Complete ✓
          </button>
        )}
      </div>

      {!uiState.activeMode ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {MODES.filter(m => !(uiState.role === 'teacher' && m.id === 'quiz')).map(m => (
            <div 
              key={m.id} 
              className="bg-[#1E293B] border border-white/5 rounded-2xl p-6 cursor-pointer transition-all hover:-translate-y-1 hover:border-[#0EA5E9]/40 hover:shadow-[0_12px_40px_rgba(14,165,233,0.12)]"
              onClick={() => {
                setUi({ activeMode: m.id });
                if (m.id === 'quiz') setUi({ currentStep: 'quiz' });
              }}
            >
              <div className="text-[40px] mb-3">{m.icon}</div>
              <div className="text-[17px] font-extrabold text-[#F1F5F9] mb-1.5">{m.title}</div>
              <div className="text-[13px] text-[#64748B] leading-relaxed">{m.desc}</div>
            </div>
          ))}
        </div>
      ) : (
        <div className="mt-0">
          {uiState.activeMode !== 'quiz' && (
            <button 
              className="bg-transparent text-[#94A3B8] border border-white/10 hover:border-[#0EA5E9] hover:text-[#0EA5E9] font-bold py-2.5 px-5 rounded-xl text-sm transition-all mb-5 flex items-center gap-2"
              onClick={() => setUi({ activeMode: null })}
            >
              ← Back to Modes
            </button>
          )}
          {renderActiveMode()}
        </div>
      )}
    </div>
  );
}

export default LearnMode;
