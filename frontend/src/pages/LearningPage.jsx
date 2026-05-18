import React, { useState, useEffect } from 'react';
import { useAppContext } from '../store';
import api from '../api';
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
  const { uiState, setUi, logout, user, setUser } = useAppContext();
  
  const [showNameModal, setShowNameModal] = useState(false);
  const [tempName, setTempName] = useState('');

  useEffect(() => {
    if (user && user.name && user.name.startsWith("Roll Number") && uiState.currentStep === 'class') {
      setShowNameModal(true);
    }
  }, [user, uiState.currentStep]);

  const handleSaveName = async () => {
    if (!tempName.trim()) return;
    try {
      const res = await api.put('/auth/me', { name: tempName });
      setUser(res.data);
      setShowNameModal(false);
    } catch (e) {
      console.error("Failed to update name", e);
    }
  };

  const handleBack = () => {
    switch (uiState.currentStep) {
      case 'subject': setUi({ currentStep: 'class' }); break;
      case 'chapter': setUi({ currentStep: 'subject' }); break;
      case 'learn':
      case 'quiz':
      case 'score': setUi({ currentStep: 'chapter' }); break;
      case 'upload': setUi({ currentStep: 'class' }); break;
      case 'class': logout(); break;
      default: break;
    }
  };

  const canGoBack = ['class', 'subject', 'chapter', 'learn', 'quiz', 'score', 'upload'].includes(uiState.currentStep);

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
          {canGoBack && (
            <button 
              onClick={handleBack}
              className="mb-6 flex items-center gap-2 text-[#94A3B8] hover:text-[#F8FAFC] font-bold text-sm bg-white/5 hover:bg-white/10 px-4 py-2 rounded-lg transition-all"
            >
              ← Back
            </button>
          )}
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

      {/* Name Personalization Modal */}
      {showNameModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 fade-in">
          <div className="bg-[#1E293B] border border-white/10 rounded-2xl p-8 w-full max-w-md shadow-2xl">
            <h2 className="text-2xl font-black text-white mb-2">Welcome to VidyaPath! 👋</h2>
            <p className="text-[#94A3B8] mb-6 text-sm">Please enter your name so we can personalize your dashboard.</p>
            
            <input 
              type="text" 
              value={tempName} 
              onChange={e => setTempName(e.target.value)}
              placeholder="Your Full Name"
              className="w-full bg-[#0F172A] border border-white/10 rounded-xl px-4 py-3 text-[#F8FAFC] focus:border-[#8B5CF6] outline-none mb-6"
              autoFocus
            />
            
            <button 
              onClick={handleSaveName}
              disabled={!tempName.trim()}
              className="w-full bg-[#0EA5E9] hover:bg-[#0284C7] text-white font-bold py-3 px-4 rounded-xl transition-all disabled:opacity-50"
            >
              Continue
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default LearningPage;
