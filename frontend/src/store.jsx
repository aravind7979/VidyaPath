import React, { createContext, useContext, useState, useEffect } from 'react';
import api, { setAuthToken } from './api';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);
  const [completedCount, setCompletedCount] = useState(0);
  const [averageScore, setAverageScore] = useState(0);
  
  const [uiState, setUiState] = useState({
    selectedClass: null,
    selectedSubject: null,
    selectedChapter: null,
    currentStep: 'login', // login, register, class, subject, chapter, learn, quiz, score
    activeMode: null, // explain, video, ppt, pdf
    showNotepad: false
  });

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    const { access_token } = res.data;
    setToken(access_token);
    setAuthToken(access_token);
    
    const userRes = await api.get('/auth/me');
    setUser(userRes.data);
    updateProgress();
    setUiState(prev => ({ ...prev, currentStep: 'class' }));
  };

  const register = async (name, email, password, classNumber) => {
    await api.post('/auth/register', { name, email, password, class_number: classNumber });
    await login(email, password);
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    setAuthToken(null);
    setUiState({
      selectedClass: null,
      selectedSubject: null,
      selectedChapter: null,
      currentStep: 'login',
      activeMode: null,
      showNotepad: false
    });
  };

  const updateProgress = async () => {
    try {
      const res = await api.get('/progress/summary');
      setCompletedCount(res.data.completed_chapters);
      setAverageScore(res.data.average_score);
    } catch (e) {
      console.error("Failed to load progress summary", e);
    }
  };

  const setUi = (updates) => {
    setUiState(prev => ({ ...prev, ...updates }));
  };

  return (
    <AppContext.Provider value={{
      token, user, login, register, logout,
      completedCount, averageScore, updateProgress,
      uiState, setUi
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => useContext(AppContext);
