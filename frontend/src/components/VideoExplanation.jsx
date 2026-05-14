import React from 'react';
import { useAppContext } from '../store';

function VideoExplanation({ assets }) {
  const { uiState } = useAppContext();
  const videoAsset = assets.find(a => a.asset_type === 'video');

  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
  const isUploadedVideo = videoAsset?.url?.startsWith('/uploads/');
  const videoUrl = isUploadedVideo ? `${apiUrl}${videoAsset.url}` : videoAsset?.url;

  return (
    <div className="bg-[#1E293B] border border-white/5 rounded-2xl p-8 text-center">
      <div className="text-5xl mb-4">🎬</div>
      <div className="text-xl font-black text-[#F1F5F9] mb-2">{videoAsset?.title || 'Watch Video Lesson'}</div>
      <div className="text-[14px] text-[#64748B] mb-8">Class {uiState.selectedClassName} · {uiState.selectedSubjectName} · {uiState.selectedChapterName}</div>
      
      {isUploadedVideo ? (
        <div className="mb-8 max-w-3xl mx-auto rounded-2xl overflow-hidden shadow-2xl border border-white/10 bg-black">
          <video controls className="w-full aspect-video" src={videoUrl}>
            Your browser does not support the video tag.
          </video>
        </div>
      ) : (
        <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-12 mb-8 max-w-lg mx-auto flex flex-col items-center justify-center">
          <div className="text-5xl text-red-500 mb-3">▶</div>
          <div className="text-sm font-semibold text-[#94A3B8]">External Video Player</div>
          {videoUrl && (
            <a 
              href={videoUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="mt-6 inline-flex items-center gap-2 bg-[#EF4444] hover:bg-[#DC2626] text-white font-bold py-3 px-8 rounded-xl transition-all"
            >
              <span>▶</span> Watch Video
            </a>
          )}
        </div>
      )}
    </div>
  );
}

export default VideoExplanation;
