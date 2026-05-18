import React, { useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { useAppContext } from '../store';
import api from '../api';

function GeneralExplanation() {
  const { uiState } = useAppContext();
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchExplanation = async () => {
    setLoading(true);
    setError(null);
    setContent('');
    try {
      // 1. Check for manual explanation first
      const assetsRes = await api.get(`/content/${uiState.selectedChapterId}/assets`);
      const manualAsset = assetsRes.data.find(a => a.asset_type === 'explanation');
      
      if (manualAsset) {
        // Fetch raw text from the URL
        const textRes = await fetch(`${api.defaults.baseURL}${manualAsset.url}`);
        if (!textRes.ok) throw new Error("Failed to load manual explanation");
        const text = await textRes.text();
        setContent(text);
        setLoading(false);
        return;
      }

      // 2. Fallback to AI generation
      const response = await fetch(`${api.defaults.baseURL}/ai/explanation`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': api.defaults.headers.common['Authorization']
        },
        body: JSON.stringify({ chapter_id: uiState.selectedChapterId })
      });

      if (!response.ok) throw new Error('Network response was not ok');

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        setContent(prev => prev + decoder.decode(value, { stream: true }));
      }
    } catch (e) {
      setError('Failed to generate explanation. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExplanation();
  }, [uiState.selectedChapterId]);

  return (
    <div className="bg-[#1E293B] border border-white/5 rounded-2xl p-6 md:p-8">
      {loading && !content && (
        <div className="text-center py-10">
          <div className="text-[#64748B] mb-4 text-sm font-semibold tracking-wide uppercase">AI is drafting your explanation…</div>
          <div className="spinner"></div>
        </div>
      )}
      
      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-5 rounded-xl text-center">
          <div className="font-bold mb-2">Oops!</div>
          <div className="text-sm">{error}</div>
          <button onClick={fetchExplanation} className="mt-4 bg-[#0EA5E9] hover:bg-[#0284C7] text-white font-bold py-2 px-6 rounded-lg text-sm transition-all">Retry</button>
        </div>
      )}
      
      {content && (
        <div className="prose prose-invert prose-p:text-[#CBD5E1] prose-p:leading-relaxed prose-headings:text-[#0EA5E9] prose-h3:text-lg prose-h3:font-black prose-li:text-[#CBD5E1] max-w-none text-[15px]">
          <ReactMarkdown>{content}</ReactMarkdown>
        </div>
      )}
    </div>
  );
}

export default GeneralExplanation;
