import React, { useEffect, useState } from 'react';
import { useAppContext } from '../store';
import api from '../api';

function DescriptiveQuiz() {
  const { uiState, setUi } = useAppContext();
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [evaluating, setEvaluating] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchQuiz = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await api.post('/ai/generate-descriptive', { chapter_id: uiState.selectedChapterId });
        setQuestions(res.data);
      } catch (e) {
        setError('Failed to generate quiz. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    fetchQuiz();
  }, [uiState.selectedChapterId]);

  const handleSubmit = async () => {
    setEvaluating(true);
    try {
      const payload = {
        chapter_id: uiState.selectedChapterId,
        answers: questions.map((q, i) => ({
          question: q.question,
          student_answer: answers[i] || ""
        }))
      };
      const res = await api.post('/quiz/submit-descriptive', payload);
      setUi({ currentStep: 'score', quizResults: { type: 'desc', score: res.data.score, total: res.data.max_score, data: res.data.results } });
    } catch (e) {
      console.error(e);
      alert("Evaluation failed. Please try again.");
      setEvaluating(false);
    }
  };

  if (loading || evaluating) {
    return (
      <div className="text-center py-10">
        <div className="text-[#64748B] mb-4 text-sm font-semibold tracking-wide uppercase">
          {evaluating ? 'AI is reviewing your answers…' : 'AI is generating questions…'}
        </div>
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

  return (
    <div>
      <div className="space-y-6 mb-6">
        {questions.map((q, i) => (
          <div key={i} className="bg-[#1E293B] border border-white/5 rounded-2xl p-6 md:p-8">
            <div className="text-[15px] font-bold text-[#0EA5E9] mb-2 uppercase tracking-wide">Question {i + 1}</div>
            <div className="text-lg font-bold text-[#F1F5F9] mb-4 leading-relaxed">{q.question}</div>
            <textarea
              className="w-full bg-[#0F172A] border border-white/10 rounded-xl p-4 text-[#CBD5E1] min-h-[120px] focus:outline-none focus:border-[#0EA5E9] focus:ring-1 focus:ring-[#0EA5E9] transition-all"
              placeholder="Type your answer here..."
              value={answers[i] || ""}
              onChange={(e) => setAnswers({...answers, [i]: e.target.value})}
            ></textarea>
          </div>
        ))}
      </div>
      
      <div className="text-right">
        <button 
          className="bg-[#0EA5E9] hover:bg-[#0284C7] text-white font-bold py-3 px-8 rounded-xl transition-all shadow-[0_4px_15px_rgba(14,165,233,0.3)] hover:shadow-[0_8px_25px_rgba(14,165,233,0.4)] transform hover:-translate-y-1"
          onClick={handleSubmit}
        >
          Submit Answers
        </button>
      </div>
    </div>
  );
}

export default DescriptiveQuiz;
