import React from 'react';
import { useAppContext } from '../store';

function ScoreCard() {
  const { uiState, setUi, updateProgress } = useAppContext();
  const { quizResults, selectedChapter } = uiState;
  
  if (!quizResults) return null;

  const { type, score, total, data, answers } = quizResults;
  
  const percentage = (score / total) * 100;
  let perf = '';
  let perfColor = '';

  if (percentage === 100) { perf = '🏆 Perfect!'; perfColor = '#34D399'; }
  else if (percentage >= 80) { perf = '⭐ Excellent!'; perfColor = '#34D399'; }
  else if (percentage >= 60) { perf = '👍 Good Job!'; perfColor = '#0EA5E9'; }
  else if (percentage >= 40) { perf = '📚 Keep Practicing'; perfColor = '#F59E0B'; }
  else { perf = '💪 Try Again'; perfColor = '#EF4444'; }

  const handleRetake = () => {
    setUi({ currentStep: 'quiz' });
  };

  // Update HUD progress when scorecard mounts (since score was saved)
  React.useEffect(() => {
    updateProgress();
  }, []);

  return (
    <div className="fade-in max-w-2xl mx-auto">
      <div className="text-[28px] font-black text-[#F1F5F9] mb-2 text-center">Score Card</div>
      <div className="text-[14px] text-[#64748B] mb-8 text-center">{selectedChapter}</div>
      
      <div className="bg-[#1E293B] border border-white/5 rounded-3xl p-8 mb-6 text-center shadow-xl">
        <div 
          className="w-32 h-32 rounded-full border-8 flex items-center justify-center mx-auto mb-5"
          style={{ borderColor: `${perfColor}40` }}
        >
          <div className="text-4xl font-black" style={{ color: perfColor }}>
            {score}<span className="text-2xl text-opacity-50">/{total}</span>
          </div>
        </div>
        <div className="text-2xl font-black text-[#F1F5F9] mb-2" style={{ color: perfColor }}>{perf}</div>
        <div className="text-[#94A3B8] font-medium">You scored {score} out of {total} points possible.</div>
      </div>

      <div className="bg-[#1E293B] border border-white/5 rounded-3xl p-8 mb-8">
        <div className="text-lg font-black text-[#F1F5F9] mb-6">Question Summary</div>
        
        <div className="space-y-4">
          {type === 'mcq' ? (
            data.map((q, i) => {
              const isCorrect = answers[i] === q.answer;
              return (
                <div key={i} className="flex gap-4 p-4 rounded-xl bg-[#0F172A] border border-white/5">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold shrink-0 ${isCorrect ? 'bg-[#34D399]/20 text-[#34D399]' : 'bg-[#EF4444]/20 text-[#EF4444]'}`}>
                    {isCorrect ? '✓' : '✗'}
                  </div>
                  <div>
                    <div className="text-[#E2E8F0] font-medium mb-1 text-[15px]">{q.question}</div>
                    {!isCorrect && (
                      <div className="text-[13px] text-[#64748B]">
                        Your answer: <span className="line-through mr-2">{answers[i]}</span>
                        Correct: <span className="text-[#34D399]">{q.answer}</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          ) : (
            data.map((res, i) => (
              <div key={i} className="p-5 rounded-xl bg-[#0F172A] border border-white/5 mb-4">
                <div className="flex justify-between items-start mb-3">
                  <div className="text-[15px] font-bold text-[#E2E8F0] pr-4">{res.question}</div>
                  <div className="bg-[#0EA5E9]/20 text-[#0EA5E9] font-bold px-3 py-1 rounded-lg shrink-0">
                    {res.evaluation.score}/{res.evaluation.max_score}
                  </div>
                </div>
                <div className="text-[14px] text-[#94A3B8] mb-3 p-3 bg-white/5 rounded-lg border border-white/5">
                  <span className="font-bold text-[#CBD5E1]">Your Answer:</span> {res.student_answer}
                </div>
                <div className="text-[13px] text-[#34D399] mb-2 font-medium">
                  <span className="font-bold">Corrected:</span> {res.evaluation.corrected_answer}
                </div>
                <div className="text-[13px] text-[#F59E0B] bg-[#F59E0B]/10 p-3 rounded-lg">
                  <span className="font-bold">AI Feedback:</span> {res.evaluation.feedback}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <button 
          className="bg-[#0EA5E9] hover:bg-[#0284C7] text-white font-bold py-3 px-8 rounded-xl transition-all shadow-lg"
          onClick={handleRetake}
        >
          Retake Quiz
        </button>
        <button 
          className="bg-transparent text-[#94A3B8] border border-[#94A3B8]/30 hover:border-[#F1F5F9] hover:text-[#F1F5F9] font-bold py-3 px-8 rounded-xl transition-all"
          onClick={() => setUi({ currentStep: 'chapter', selectedChapter: null, activeMode: null, quizResults: null })}
        >
          Back to Chapters
        </button>
      </div>
    </div>
  );
}

export default ScoreCard;
