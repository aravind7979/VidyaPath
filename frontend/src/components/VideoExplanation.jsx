import React from 'react';
import { useAppContext } from '../store';

function VideoExplanation({ assets }) {
  const { uiState } = useAppContext();
  const videoAsset = assets.find(a => a.asset_type === 'video');

  const ytUrl = videoAsset?.url || `https://www.youtube.com/results?search_query=Class+${uiState.selectedClass}+${encodeURIComponent(uiState.selectedSubject)}+${encodeURIComponent(uiState.selectedChapter)}+explanation`;

  return (
    <div className="bg-[#1E293B] border border-white/5 rounded-2xl p-8 text-center">
      <div className="text-5xl mb-4">🎬</div>
      <div className="text-xl font-black text-[#F1F5F9] mb-2">Watch Video Lesson</div>
      <div className="text-[14px] text-[#64748B] mb-8">Class {uiState.selectedClass} · {uiState.selectedSubject} · {uiState.selectedChapter}</div>
      
      <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-12 mb-8 max-w-lg mx-auto flex flex-col items-center justify-center">
        <div className="text-5xl text-red-500 mb-3">▶</div>
        <div className="text-sm font-semibold text-[#94A3B8]">YouTube Video Player</div>
      </div>
      
      <a 
        href={ytUrl} 
        target="_blank" 
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 bg-[#EF4444] hover:bg-[#DC2626] text-white font-bold py-3 px-8 rounded-xl transition-all transform hover:-translate-y-0.5 hover:shadow-[0_8px_20px_rgba(239,68,68,0.3)]"
      >
        <span>▶</span> Watch on YouTube
      </a>
    </div>
  );
}

export default VideoExplanation;
