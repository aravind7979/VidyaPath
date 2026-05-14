import React from 'react';
import { useAppContext } from '../store';
import Sidebar from '../components/Sidebar';
import ClassGrid from '../components/ClassGrid';
import SubjectGrid from '../components/SubjectGrid';
import ChapterList from '../components/ChapterList';
import LearnMode from '../components/LearnMode';
import Assessment from '../components/Assessment';
import ScoreCard from '../components/ScoreCard';
import Notepad from '../components/Notepad';
import NotepadTrigger from '../components/NotepadTrigger';
import UploadDashboard from './UploadDashboard';

function LearningPage() {
  const { uiState } = useAppContext();

  const renderContent = () => {
    switch (uiState.currentStep) {
      case 'class': return <ClassGrid />;
      case 'subject': return <SubjectGrid />;
      case 'chapter': return <ChapterList />;
      case 'learn': return <LearnMode />;
      case 'quiz': return <Assessment />;
      case 'score': return <ScoreCard />;
      case 'upload': return <UploadDashboard />;
      default: return <ClassGrid />;
    }
  };

  const showTrigger = uiState.selectedChapterId && !uiState.showNotepad;

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-[#0F172A] font-nunito text-[#F8FAFC]">
      <Sidebar />
      <div className="flex-1 flex relative">
        {/* Main Content Area */}
        <div className={`p-6 md:p-8 flex-1 overflow-y-auto min-h-screen transition-all ${uiState.showNotepad ? 'md:w-[60%] md:flex-none' : 'w-full'}`}>
          {renderContent()}
        </div>
        
        {/* Split Screen Notepad */}
        {uiState.showNotepad && (
          <div className="hidden md:block w-[40%] border-l border-[#0EA5E9]/20 bg-[#0F172A] h-screen sticky top-0 overflow-hidden">
            <Notepad />
          </div>
        )}

        {/* Floating Trigger */}
        {showTrigger && <NotepadTrigger />}
      </div>
    </div>
  );
}

export default LearningPage;
