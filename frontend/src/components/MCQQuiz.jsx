import React, { useEffect, useState } from 'react';
import { useAppContext } from '../store';
import api from '../api';

function MCQQuiz() {
  const { uiState, setUi } = useAppContext();
  const [quizData, setQuizData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState([]); // Array of selected options
  
  useEffect(() => {
    const fetchQuiz = async () => {
      setLoading(true);
      setError(null);
      try {
        // 1. Check for manual quiz first
        const assetsRes = await api.get(`/content/${uiState.selectedChapterId}/assets`);
        const manualAsset = assetsRes.data.find(a => a.asset_type === 'quiz');
        
        if (manualAsset) {
          const res = await fetch(`${api.defaults.baseURL}${manualAsset.url}`);
          if (!res.ok) throw new Error("Failed to load manual quiz");
          const jsonQuiz = await res.json();
          
          const formattedQuiz = jsonQuiz.map(q => ({
            question: q.question,
            options: q.options.filter(o => o.trim() !== ''),
            answer: q.options[q.correctIndex],
            explanation: "Correct answer selected by the teacher."
          }));
          
          setQuizData(formattedQuiz);
          setLoading(false);
          return;
        }

        // 2. Fallback to AI generation
        const res = await api.post('/ai/generate-mcq', { chapter_id: uiState.selectedChapterId });
        setQuizData(res.data);
      } catch (e) {
        setError('Failed to generate quiz. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    fetchQuiz();
  }, [uiState.selectedChapterId]);

  const answerQuestion = (opt) => {
    if (answers[currentIndex] !== undefined) return; // Already answered
    const newAnswers = [...answers];
    newAnswers[currentIndex] = opt;
    setAnswers(newAnswers);
  };

  const nextQuestion = async () => {
    if (currentIndex + 1 >= quizData.length) {
      // Finished
      const score = answers.filter((a, i) => a === quizData[i]?.answer).length;
      
      try {
        // Just save attempt. Score calculation is frontend-driven for MCQ based on AI payload.
        await api.post('/quiz/submit-mcq', {
          chapter_id: uiState.selectedChapterId,
          answers: answers.map((a, i) => ({ question_index: i, selected_option: a }))
        });
      } catch (e) {
        console.error("Failed to save score", e);
      }

      setUi({ currentStep: 'score', quizResults: { type: 'mcq', score, total: quizData.length, data: quizData, answers } });
    } else {
      setCurrentIndex(currentIndex + 1);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-10">
        <div className="text-[#64748B] mb-4 text-sm font-semibold tracking-wide uppercase">AI is generating your quiz…</div>
        <div className="spinner"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-5 rounded-xl text-center">
        <div className="font-bold mb-2">Oops!</div>
        <div className="text-sm">{error}</div>
      </div>
    );
  }

  const q = quizData[currentIndex];
  const ans = answers[currentIndex];
  const answered = ans !== undefined;
  const correctCount = answers.filter((a, i) => a === quizData[i]?.answer).length;

  return (
    <div>
      <div className="flex justify-between items-center mb-3">
        <div className="text-[13px] font-bold text-[#64748B]">Question {currentIndex + 1} of {quizData.length}</div>
        <div className="text-[13px] font-bold text-[#0EA5E9]">{correctCount} correct</div>
      </div>
      
      <div className="flex gap-1.5 mb-6">
        {quizData.map((_, i) => {
          let cls = "h-1.5 flex-1 rounded-full transition-colors ";
          if (answers[i] !== undefined) {
            cls += answers[i] === quizData[i]?.answer ? "bg-[#34D399]" : "bg-[#EF4444]";
          } else if (i <= currentIndex) {
            cls += "bg-[#0EA5E9]";
          } else {
            cls += "bg-white/10";
          }
          return <div key={i} className={cls}></div>;
        })}
      </div>

      <div className="bg-[#1E293B] border border-white/5 rounded-2xl p-6 md:p-8 mb-6">
        <div className="text-lg font-bold text-[#F1F5F9] mb-6 leading-relaxed">{q.question}</div>
        
        {q.options.map((opt, i) => {
          let cls = "quiz-opt";
          if (answered) {
            if (opt === q.answer) cls += " correct";
            else if (opt === ans && opt !== q.answer) cls += " wrong";
          }
          return (
            <div key={i} className={cls} onClick={() => answerQuestion(opt)}>
              {answered && opt === q.answer && <span className="font-bold">✓</span>}
              {answered && opt === ans && opt !== q.answer && <span className="font-bold">✗</span>}
              {opt}
            </div>
          );
        })}

        {answered && (
          <div className="bg-[#0EA5E9]/10 border border-[#0EA5E9]/20 rounded-xl p-4 mt-5 text-[14px] text-[#94A3B8]">
            <span className="font-bold text-[#0EA5E9]">💡 Explanation: </span>
            {q.explanation}
          </div>
        )}
      </div>

      {answered && (
        <div className="text-right">
          <button 
            className="bg-[#0EA5E9] hover:bg-[#0284C7] text-white font-bold py-3 px-6 rounded-xl transition-all"
            onClick={nextQuestion}
          >
            {currentIndex + 1 < quizData.length ? 'Next Question →' : 'View Score Card →'}
          </button>
        </div>
      )}
    </div>
  );
}

export default MCQQuiz;
