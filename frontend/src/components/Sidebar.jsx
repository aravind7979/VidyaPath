import React from 'react';
import { useAppContext } from '../store';
import { LogOut } from 'lucide-react';

function Sidebar() {
  const { uiState, setUi, completedCount, averageScore, logout } = useAppContext();

  const getClassActive = (step) => uiState.currentStep === step ? 'bg-[#0EA5E9]/15 text-[#0EA5E9] font-bold' : 'hover:bg-[#0EA5E9]/10 hover:text-[#E2E8F0] text-[#94A3B8]';

  return (
    <div className="w-full md:w-[260px] bg-[#0F172A] border-r border-[#0EA5E9]/15 p-5 shrink-0 flex flex-col gap-2 md:sticky md:top-0 md:h-screen md:overflow-y-auto">
      <div className="text-xl font-black text-[#0EA5E9] mb-2 tracking-tight flex justify-between items-center">
        <div>📘 Vidya<span className="text-[#F8FAFC]">Path</span></div>
        <button onClick={logout} className="text-[#94A3B8] hover:text-[#EF4444] transition-colors" title="Logout">
          <LogOut size={18} />
        </button>
      </div>
      
      <div className="bg-[#0EA5E9]/10 border border-[#0EA5E9]/20 rounded-xl p-3 mb-3">
        <div className="text-[11px] uppercase tracking-widest text-[#94A3B8] mb-2">Progress</div>
        <div className="flex justify-between text-[13px] text-[#CBD5E1] mb-1">
          Chapters Done <span className="text-[#0EA5E9] font-bold">{completedCount}</span>
        </div>
        <div className="flex justify-between text-[13px] text-[#CBD5E1]">
          Avg Score <span className="text-[#0EA5E9] font-bold">{averageScore > 0 ? `${averageScore}/5` : '—'}</span>
        </div>
      </div>
      
      <div className="flex flex-row md:flex-col gap-1 flex-wrap">
        <div 
          className={`flex items-center gap-2 px-3 py-2 rounded-lg text-[13px] cursor-pointer transition-colors ${getClassActive('class')}`}
          onClick={() => setUi({currentStep: 'class', selectedClass: null, selectedSubject: null, selectedChapter: null, activeMode: null})}
        >
          <div className="w-1.5 h-1.5 rounded-full bg-current shrink-0"></div>
          {uiState.selectedClass ? `Class ${uiState.selectedClass}` : 'Select Class'}
        </div>

        {uiState.selectedClass && (
          <div 
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-[13px] cursor-pointer transition-colors md:pl-6 ${getClassActive('subject')}`}
            onClick={() => setUi({currentStep: 'subject', selectedSubject: null, selectedChapter: null, activeMode: null})}
          >
            <div className="w-1.5 h-1.5 rounded-full bg-current shrink-0"></div>
            {uiState.selectedSubject || 'Select Subject'}
          </div>
        )}

        {uiState.selectedSubject && (
          <div 
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-[13px] cursor-pointer transition-colors md:pl-9 ${getClassActive('chapter')}`}
            onClick={() => setUi({currentStep: 'chapter', selectedChapter: null, activeMode: null})}
          >
            <div className="w-1.5 h-1.5 rounded-full bg-current shrink-0"></div>
            {uiState.selectedChapter ? (uiState.selectedChapter.length > 20 ? uiState.selectedChapter.slice(0, 20) + '…' : uiState.selectedChapter) : 'Select Chapter'}
          </div>
        )}

        {uiState.selectedChapter && ['learn', 'quiz', 'score'].includes(uiState.currentStep) && (
          <div className={`flex items-center gap-2 px-3 py-2 rounded-lg text-[13px] transition-colors md:pl-12 bg-[#0EA5E9]/15 text-[#0EA5E9] font-bold`}>
            <div className="w-1.5 h-1.5 rounded-full bg-current shrink-0"></div>
            {uiState.currentStep === 'learn' ? 'Learning' : uiState.currentStep === 'quiz' ? 'Quiz' : 'Score Card'}
          </div>
        )}
      </div>
    </div>
  );
}

export default Sidebar;
