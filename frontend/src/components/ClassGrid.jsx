import React, { useState, useEffect } from 'react';
import { useAppContext } from '../store';
import api from '../api';

const CLASS_INFO = [
  {n:1,emoji:"🌱",label:"Primary"},{n:2,emoji:"🌼",label:"Primary"},{n:3,emoji:"🦋",label:"Primary"},
  {n:4,emoji:"🚀",label:"Primary"},{n:5,emoji:"⭐",label:"Upper Primary"},{n:6,emoji:"🔬",label:"Middle School"},
  {n:7,emoji:"🌍",label:"Middle School"},{n:8,emoji:"💡",label:"Middle School"},{n:9,emoji:"🎯",label:"High School"},
  {n:10,emoji:"🏆",label:"High School"}
];

function ClassGrid() {
  const { setUi } = useAppContext();
  const [classes, setClasses] = useState([]);

  useEffect(() => {
    api.get('/curriculum/classes').then(res => setClasses(res.data)).catch(console.error);
  }, []);

  const getEmoji = (num) => {
    const emojis = ["🌱", "🌼", "🦋", "🚀", "⭐", "🔬", "🌍", "💡", "🎯", "🏆"];
    return emojis[(num - 1) % emojis.length] || "📚";
  };

  return (
    <div className="fade-in">
      <div className="text-[28px] font-black text-[#F1F5F9] mb-2">Choose Your Class</div>
      <div className="text-[14px] text-[#64748B] mb-7">Select your class to start learning</div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {classes.map(c => (
          <div 
            key={c.id} 
            className="card bg-[#1E293B] border border-white/5 rounded-2xl p-5 cursor-pointer transition-all relative overflow-hidden"
            onClick={() => setUi({selectedClassId: c.id, selectedClassName: c.class_name, currentStep: 'subject'})}
          >
            <div className="card-glow"></div>
            <div className="text-4xl mb-3">{getEmoji(c.class_number)}</div>
            <div className="text-base font-extrabold text-[#F1F5F9]">{c.class_name}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ClassGrid;
