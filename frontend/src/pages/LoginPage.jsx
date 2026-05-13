import React, { useState } from 'react';
import { useAppContext } from '../store';

function LoginPage() {
  const { login, setUi } = useAppContext();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      await login(email, password);
    } catch (err) {
      setError(err.response?.data?.detail || 'Login failed');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-[#0F172A] p-4">
      <div className="bg-[#1E293B] border border-white/5 rounded-2xl p-8 w-full max-w-md shadow-2xl">
        <div className="text-center mb-8">
          <div className="text-3xl font-black text-[#0EA5E9] tracking-tight mb-2">
            📘 Vidya<span className="text-[#F8FAFC]">Path</span>
          </div>
          <p className="text-[#94A3B8] font-medium">Welcome back! Please login to your account.</p>
        </div>
        
        {error && <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-lg mb-6 text-sm text-center">{error}</div>}
        
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-[#CBD5E1] mb-1">Email Address</label>
            <input 
              type="email" 
              className="w-full bg-[#0F172A] border border-white/10 rounded-xl px-4 py-3 text-[#F8FAFC] focus:outline-none focus:border-[#0EA5E9] focus:ring-1 focus:ring-[#0EA5E9] transition-all"
              placeholder="student@vidyapath.com"
              value={email} onChange={e=>setEmail(e.target.value)} required
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-[#CBD5E1] mb-1">Password</label>
            <input 
              type="password" 
              className="w-full bg-[#0F172A] border border-white/10 rounded-xl px-4 py-3 text-[#F8FAFC] focus:outline-none focus:border-[#0EA5E9] focus:ring-1 focus:ring-[#0EA5E9] transition-all"
              placeholder="••••••••"
              value={password} onChange={e=>setPassword(e.target.value)} required
            />
          </div>
          <button type="submit" className="w-full bg-[#0EA5E9] hover:bg-[#0284C7] text-white font-bold py-3 px-4 rounded-xl transition-all transform hover:-translate-y-0.5 hover:shadow-[0_8px_20px_rgba(14,165,233,0.3)] mt-6">
            Sign In
          </button>
        </form>
        
        <div className="text-center mt-6 text-[#94A3B8] text-sm font-semibold">
          Don't have an account? <span className="text-[#0EA5E9] cursor-pointer hover:underline" onClick={() => setUi({currentStep: 'register'})}>Create one</span>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
