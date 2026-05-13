import React, { useState } from 'react';
import MCQQuiz from './MCQQuiz';
import DescriptiveQuiz from './DescriptiveQuiz';

function Assessment() {
  const [activeTab, setActiveTab] = useState('mcq');

  return (
    <div className="fade-in max-w-3xl">
      <div className="flex items-center gap-4 mb-6 border-b border-white/10 pb-4">
        <button 
          className={`font-bold px-4 py-2 rounded-lg transition-all ${activeTab === 'mcq' ? 'bg-[#0EA5E9] text-white' : 'text-[#94A3B8] hover:bg-white/5'}`}
          onClick={() => setActiveTab('mcq')}
        >
          Multiple Choice
        </button>
        <button 
          className={`font-bold px-4 py-2 rounded-lg transition-all ${activeTab === 'desc' ? 'bg-[#0EA5E9] text-white' : 'text-[#94A3B8] hover:bg-white/5'}`}
          onClick={() => setActiveTab('desc')}
        >
          Descriptive
        </button>
      </div>

      {activeTab === 'mcq' ? <MCQQuiz /> : <DescriptiveQuiz />}
    </div>
  );
}

export default Assessment;
