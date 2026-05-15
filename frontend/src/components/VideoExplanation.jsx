import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { useAppContext } from '../store';
import api from '../api';

function VideoExplanation({ assets }) {
  const { uiState } = useAppContext();
  const videoAsset = assets.find(a => a.asset_type === 'video');

  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
  const isUploadedVideo = videoAsset?.url?.startsWith('/uploads/');
  const videoUrl = isUploadedVideo ? `${apiUrl}${videoAsset.url}` : videoAsset?.url;

  const [scriptContent, setScriptContent] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!videoUrl) {
      const fetchScript = async () => {
        setLoading(true);
        setScriptContent('');
        try {
          const response = await fetch(`${api.defaults.baseURL}/ai/video-script`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': api.defaults.headers.common['Authorization']
            },
            body: JSON.stringify({ chapter_id: uiState.selectedChapterId })
          });

          if (!response.ok) throw new Error('Network error');

          const reader = response.body.getReader();
          const decoder = new TextDecoder();
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            setScriptContent(prev => prev + decoder.decode(value, { stream: true }));
          }
        } catch (e) {
          console.error(e);
        } finally {
          setLoading(false);
        }
      };
      fetchScript();
    }
  }, [videoUrl, uiState.selectedChapterId]);

  return (
    <div className="bg-[#1E293B] border border-white/5 rounded-2xl p-8">
      <div className="text-center mb-8">
        <div className="text-5xl mb-4">🎬</div>
        <div className="text-xl font-black text-[#F1F5F9] mb-2">{videoAsset?.title || 'Video Explanation'}</div>
        <div className="text-[14px] text-[#64748B]">Class {uiState.selectedClassName} · {uiState.selectedSubjectName} · {uiState.selectedChapterName}</div>
      </div>
      
      {videoUrl ? (
        isUploadedVideo ? (
          <div className="max-w-3xl mx-auto rounded-2xl overflow-hidden shadow-2xl border border-white/10 bg-black">
            <video controls className="w-full aspect-video" src={videoUrl}>
              Your browser does not support the video tag.
            </video>
          </div>
        ) : (
          <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-12 max-w-lg mx-auto flex flex-col items-center justify-center text-center">
            <div className="text-5xl text-red-500 mb-3">▶</div>
            <div className="text-sm font-semibold text-[#94A3B8]">External Video Player</div>
            <a 
              href={videoUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="mt-6 inline-flex items-center gap-2 bg-[#EF4444] hover:bg-[#DC2626] text-white font-bold py-3 px-8 rounded-xl transition-all"
            >
              <span>▶</span> Watch Video
            </a>
          </div>
        )
      ) : (
        <div className="bg-[#0F172A] border border-white/5 rounded-2xl p-6 md:p-8 mt-4">
          <div className="text-[#0EA5E9] font-bold mb-4 flex items-center gap-2">
            <span className="text-xl">✨</span> AI Video Script & Recommendations
          </div>
          {loading && !scriptContent && (
            <div className="text-center py-10">
              <div className="text-[#64748B] mb-4 text-sm font-semibold tracking-wide uppercase">AI is writing your video script...</div>
              <div className="spinner"></div>
            </div>
          )}
          {scriptContent && (
            <div className="prose prose-invert prose-p:text-[#CBD5E1] prose-p:leading-relaxed prose-headings:text-[#0EA5E9] prose-h3:text-lg prose-h3:font-black prose-li:text-[#CBD5E1] max-w-none text-[15px]">
              <ReactMarkdown>{scriptContent}</ReactMarkdown>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default VideoExplanation;
