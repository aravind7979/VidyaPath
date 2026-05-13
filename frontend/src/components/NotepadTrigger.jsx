import React from 'react';
import { useAppContext } from '../store';

function NotepadTrigger() {
  const { setUi } = useAppContext();

  return (
    <div className="fixed top-6 right-6 z-50 hidden md:block">
      <button 
        onClick={() => setUi({ showNotepad: true })}
        className="bg-[#1E293B] border border-white/10 hover:border-[#0EA5E9] hover:text-[#0EA5E9] text-[#CBD5E1] shadow-2xl flex items-center gap-2 px-4 py-2.5 rounded-full font-bold text-sm transition-all hover:scale-105"
      >
        <span>📝</span> Notes
      </button>
    </div>
  );
}

export default NotepadTrigger;
