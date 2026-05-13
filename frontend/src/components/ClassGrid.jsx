import React from 'react';
import { useAppContext } from '../store';

const CLASS_INFO = [
  {n:1,emoji:"🌱",label:"Primary"},{n:2,emoji:"🌼",label:"Primary"},{n:3,emoji:"🦋",label:"Primary"},
  {n:4,emoji:"🚀",label:"Primary"},{n:5,emoji:"⭐",label:"Upper Primary"},{n:6,emoji:"🔬",label:"Middle School"},
  {n:7,emoji:"🌍",label:"Middle School"},{n:8,emoji:"💡",label:"Middle School"},{n:9,emoji:"🎯",label:"High School"},
  {n:10,emoji:"🏆",label:"High School"}
];

function ClassGrid() {
  const { setUi } = useAppContext();

  return (
    <div className="fade-in">
      <div className="text-[28px] font-black text-[#F1F5F9] mb-2">Choose Your Class</div>
      <div className="text-[14px] text-[#64748B] mb-7">Select your class to start learning</div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {CLASS_INFO.map(c => (
          <div 
            key={c.n} 
            className="card bg-[#1E293B] border border-white/5 rounded-2xl p-5 cursor-pointer transition-all relative overflow-hidden"
            onClick={() => setUi({selectedClass: c.n, currentStep: 'subject'})}
          >
            <div className="card-glow"></div>
            <div className="text-4xl mb-3">{c.emoji}</div>
            <div className="text-base font-extrabold text-[#F1F5F9]">Class {c.n}</div>
            <div className="text-xs text-[#64748B] mt-1 font-semibold uppercase tracking-wider">{c.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ClassGrid;
