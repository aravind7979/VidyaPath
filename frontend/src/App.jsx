import React from 'react';
import { useAppContext } from './store';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import LearningPage from './pages/LearningPage';

function App() {
  const { uiState } = useAppContext();

  if (uiState.currentStep === 'login') return <LoginPage />;
  if (uiState.currentStep === 'register') return <RegisterPage />;
  
  return <LearningPage />;
}

export default App;
