import React from 'react';
import { useAppContext } from '../store';
import { LogOut, UploadCloud } from 'lucide-react';

function Sidebar() {
  const { uiState, setUi, completedCount, averageScore, logout, role, user } = useAppContext();

  const getClassActive = (step) => uiState.currentStep === step ? 'bg-[#0EA5E9]/15 text-[#0EA5E9] font-bold' : 'hover:bg-[#0EA5E9]/10 hover:text-[#E2E8F0] text-[#94A3B8]';

  return (
    <div className="w-full md:w-[260px] bg-[#0F172A] border-r border-[#0EA5E9]/15 p-5 shrink-0 flex flex-col gap-2 md:sticky md:top-0 md:h-screen md:overflow-y-auto">
      <div className="text-xl font-black text-[#0EA5E9] mb-2 tracking-tight flex justify-between items-center">
        <div>📘 Vidya<span className="text-[#F8FAFC]">Path</span></div>
        <div className="flex gap-3">
          <a href="/download" className="text-[#8B5CF6] hover:text-[#A78BFA] transition-colors text-xs font-bold flex items-center" title="Download Desktop App">
            App ⬇
          </a>
          <button onClick={logout} className="text-[#94A3B8] hover:text-[#EF4444] transition-colors" title="Logout">
            <LogOut size={18} />
          </button>
        </div>
      </div>
      
      {user && user.name && !user.name.startsWith("Roll Number") && (
        <div className="text-center py-2 text-[#CBD5E1] text-sm font-bold bg-[#1E293B] rounded-xl border border-white/5 mb-3 shadow-sm">
          👋 Hi, {user.name}
        </div>
      )}

      <div className="bg-[#0EA5E9]/10 border border-[#0EA5E9]/20 rounded-xl p-3 mb-3">
        <div className="text-[11px] uppercase tracking-widest text-[#94A3B8] mb-2">Progress</div>
        <div className="flex justify-between text-[13px] text-[#CBD5E1] mb-1">
          Chapters Done <span className="text-[#0EA5E9] font-bold">{completedCount}</span>
        </div>
        <div className="flex justify-between text-[13px] text-[#CBD5E1]">
          Avg Score <span className="text-[#0EA5E9] font-bold">{averageScore > 0 ? `${averageScore}%` : '—'}</span>
        </div>
      </div>
      
      <div className="flex flex-row md:flex-col gap-1 flex-wrap">
        <div 
          className={`flex items-center gap-2 px-3 py-2 rounded-lg text-[13px] cursor-pointer transition-colors ${getClassActive('class')}`}
          onClick={() => setUi({currentStep: 'class', selectedClassId: null, selectedClassName: null, selectedSubjectId: null, selectedSubjectName: null, selectedChapterId: null, selectedChapterName: null, activeMode: null})}
        >
          <div className="w-1.5 h-1.5 rounded-full bg-current shrink-0"></div>
          {uiState.selectedClassName ? uiState.selectedClassName : 'Select Class'}
        </div>

        {uiState.selectedClassId && (
          <div 
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-[13px] cursor-pointer transition-colors md:pl-6 ${getClassActive('subject')}`}
            onClick={() => setUi({currentStep: 'subject', selectedSubjectId: null, selectedSubjectName: null, selectedChapterId: null, selectedChapterName: null, activeMode: null})}
          >
            <div className="w-1.5 h-1.5 rounded-full bg-current shrink-0"></div>
            {uiState.selectedSubjectName || 'Select Subject'}
          </div>
        )}

        {uiState.selectedSubjectId && (
          <div 
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-[13px] cursor-pointer transition-colors md:pl-9 ${getClassActive('chapter')}`}
            onClick={() => setUi({currentStep: 'chapter', selectedChapterId: null, selectedChapterName: null, activeMode: null})}
          >
            <div className="w-1.5 h-1.5 rounded-full bg-current shrink-0"></div>
            {uiState.selectedChapterName ? (uiState.selectedChapterName.length > 20 ? uiState.selectedChapterName.slice(0, 20) + '…' : uiState.selectedChapterName) : 'Select Chapter'}
          </div>
        )}

        {uiState.selectedChapterId && ['learn', 'quiz', 'score'].includes(uiState.currentStep) && (
          <div className={`flex items-center gap-2 px-3 py-2 rounded-lg text-[13px] transition-colors md:pl-12 bg-[#0EA5E9]/15 text-[#0EA5E9] font-bold`}>
            <div className="w-1.5 h-1.5 rounded-full bg-current shrink-0"></div>
            {uiState.currentStep === 'learn' ? 'Learning' : uiState.currentStep === 'quiz' ? 'Quiz' : 'Score Card'}
          </div>
        )}
      </div>

      <div className="mt-auto pt-4">
        {uiState.role === 'teacher' && (
          <button 
            onClick={() => setUi({ currentStep: 'upload' })}
            className={`w-full flex justify-center items-center gap-2 py-3 px-4 rounded-xl font-bold transition-all border ${uiState.currentStep === 'upload' ? 'bg-[#8B5CF6] text-white border-[#8B5CF6] shadow-[0_4px_15px_rgba(139,92,246,0.3)]' : 'bg-[#1E293B] text-[#CBD5E1] border-white/5 hover:border-[#8B5CF6]/50 hover:bg-[#8B5CF6]/10 hover:text-[#8B5CF6]'}`}
          >
            <UploadCloud size={18} />
            <span>Upload Content</span>
          </button>
        )}
      </div>
    </div>
  );
}

export default Sidebar;
