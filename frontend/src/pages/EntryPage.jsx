import React, { useState } from 'react';
import { useAppContext } from '../store';

function EntryPage() {
  const { setUi, studentAutoLogin } = useAppContext();
  const [showClassroom, setShowClassroom] = useState(false);
  const [loadingRoll, setLoadingRoll] = useState(null);

  const handleStudentClick = async (rollNumber) => {
    setLoadingRoll(rollNumber);
    try {
      await studentAutoLogin(rollNumber);
    } catch (e) {
      console.error("Student entry failed", e);
      alert("Failed to enter classroom. Please check connection.");
      setLoadingRoll(null);
    }
  };

  if (!showClassroom) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#0F172A] p-4 text-center font-nunito">
        <div className="max-w-2xl">
          <div className="text-5xl md:text-7xl font-black tracking-tight mb-6">
            <span className="text-[#0EA5E9]">Vidya</span><span className="text-[#F8FAFC]">Path</span>
          </div>
          <p className="text-[#94A3B8] text-lg md:text-xl font-medium mb-12">
            The next generation classroom learning platform. Select your roll number to begin learning instantly.
          </p>
          <button 
            onClick={() => setShowClassroom(true)}
            className="bg-[#0EA5E9] hover:bg-[#0284C7] text-white font-black text-xl py-4 px-12 rounded-2xl transition-all transform hover:-translate-y-1 hover:shadow-[0_12px_30px_rgba(14,165,233,0.4)]"
          >
            Get Started
          </button>
        </div>
      </div>
    );
  }

  // Classroom Access View
  return (
    <div className="min-h-screen bg-[#0F172A] p-6 md:p-12 font-nunito flex flex-col relative">
      {/* Teacher Button Top Right */}
      <div className="absolute top-6 right-6">
        <button 
          onClick={() => setUi({ currentStep: 'login' })}
          className="bg-[#1E293B] border border-[#334155] hover:border-[#8B5CF6] hover:bg-[#8B5CF6]/10 text-[#CBD5E1] hover:text-[#8B5CF6] font-bold py-2.5 px-6 rounded-xl transition-all flex items-center gap-2"
        >
          <span>👨‍🏫 Teacher Access</span>
        </button>
      </div>

      <div className="max-w-6xl mx-auto w-full mt-12 flex-1 flex flex-col">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-black text-[#F8FAFC] mb-3">Classroom Access</h1>
          <p className="text-[#94A3B8] text-lg">Please select your assigned Roll Number to enter the learning module.</p>
        </div>

        <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-5 lg:grid-cols-10 gap-4 flex-1 content-start">
          {Array.from({ length: 20 }, (_, i) => i + 1).map((roll) => (
            <button
              key={roll}
              onClick={() => handleStudentClick(roll)}
              disabled={loadingRoll !== null}
              className={`aspect-square rounded-2xl flex flex-col items-center justify-center text-2xl font-black transition-all border
                ${loadingRoll === roll 
                  ? 'bg-[#0EA5E9] border-[#0EA5E9] text-white animate-pulse' 
                  : 'bg-[#1E293B] border-white/5 text-[#F8FAFC] hover:-translate-y-1 hover:border-[#0EA5E9]/50 hover:bg-[#0EA5E9]/10 hover:shadow-[0_8px_20px_rgba(14,165,233,0.15)]'
                }
                ${loadingRoll !== null && loadingRoll !== roll ? 'opacity-50 cursor-not-allowed' : ''}
              `}
            >
              {loadingRoll === roll ? (
                <div className="w-8 h-8 border-4 border-white/20 border-t-white rounded-full animate-spin"></div>
              ) : (
                roll
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default EntryPage;
