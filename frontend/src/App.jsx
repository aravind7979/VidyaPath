import React, { useEffect } from 'react';
import { useAppContext } from './store';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import LearningPage from './pages/LearningPage';
import DownloadPage from './pages/DownloadPage';

function App() {
  const { uiState, setUi } = useAppContext();

  // Simple routing for /download
  useEffect(() => {
    if (window.location.pathname === '/download') {
      setUi({ currentStep: 'download' });
    }
  }, []);

  if (uiState.currentStep === 'download') return <DownloadPage />;
  if (uiState.currentStep === 'login') return <LoginPage />;
  if (uiState.currentStep === 'register') return <RegisterPage />;
  
  return <LearningPage />;
}

export default App;
