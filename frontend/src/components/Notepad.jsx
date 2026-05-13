import React, { useEffect, useState, useRef } from 'react';
import { useAppContext } from '../store';
import { X, Save } from 'lucide-react';
import api from '../api';

function Notepad() {
  const { uiState, setUi } = useAppContext();
  const [content, setContent] = useState('');
  const [saving, setSaving] = useState(false);
  const saveTimeoutRef = useRef(null);

  useEffect(() => {
    const fetchNote = async () => {
      try {
        const res = await api.get(`/notes/${uiState.selectedChapterId}`);
        setContent(res.data.content);
      } catch (e) {
        console.error("Failed to load note", e);
      }
    };
    if (uiState.selectedChapterId) fetchNote();
  }, [uiState.selectedChapterId]);

  const saveNote = async (text) => {
    setSaving(true);
    try {
      await api.put(`/notes/${uiState.selectedChapterId}`, { content: text });
    } catch (e) {
      console.error("Failed to save note", e);
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (e) => {
    const newContent = e.target.value;
    setContent(newContent);
    
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    saveTimeoutRef.current = setTimeout(() => {
      saveNote(newContent);
    }, 1000); // Auto-save after 1 second of typing
  };

  const handleBlur = () => {
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    saveNote(content);
  };

  return (
    <div className="flex flex-col h-full bg-[#0F172A] relative">
      <div className="flex justify-between items-center p-5 border-b border-[#0EA5E9]/20 bg-[#1E293B]">
        <div className="flex items-center gap-3">
          <span className="text-2xl">📝</span>
          <div>
            <div className="font-black text-[#F1F5F9]">My Notes</div>
            <div className="text-xs text-[#64748B] flex items-center gap-1">
              {saving ? <span className="text-[#0EA5E9]">Saving...</span> : <span>All changes saved</span>}
            </div>
          </div>
        </div>
        <button 
          onClick={() => setUi({ showNotepad: false })}
          className="text-[#94A3B8] hover:text-white transition-colors p-1"
        >
          <X size={20} />
        </button>
      </div>
      
      <div className="flex-1 p-5">
        <textarea
          className="w-full h-full bg-transparent text-[#CBD5E1] font-nunito leading-relaxed resize-none focus:outline-none placeholder:text-[#475569]"
          placeholder="Start typing your notes here..."
          value={content}
          onChange={handleChange}
          onBlur={handleBlur}
        />
      </div>
    </div>
  );
}

export default Notepad;
