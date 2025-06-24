import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './hooks/useAuth';
import { ThemeProvider } from './hooks/useTheme';
import { Navigation } from './components/Navigation';
import { HomePage } from './components/HomePage';
import { Dashboard } from './components/Dashboard';
import { VoiceChat } from './components/VoiceChat';

function AppContent() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <>
      {user && <Navigation />}
      <Routes>
        <Route 
          path="/" 
          element={user ? <Navigate to="/dashboard" replace /> : <HomePage />} 
        />
        <Route 
          path="/dashboard" 
          element={user ? <Dashboard /> : <Navigate to="/" replace />} 
        />
        <Route 
          path="/goals" 
          element={user ? <Dashboard /> : <Navigate to="/" replace />} 
        />
        <Route 
          path="/chat" 
          element={user ? <VoiceChat /> : <Navigate to="/" replace />} 
        />
        <Route 
          path="*" 
          element={<Navigate to={user ? "/dashboard" : "/"} replace />} 
        />
      </Routes>
    </>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <div className="min-h-screen flex flex-col justify-between bg-gray-50 dark:bg-gray-900 transition-colors">
            <main className="flex-grow">
              <AppContent />
            </main>
          </div>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;