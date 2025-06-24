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

            {/* Footer with badge and credit */}
            <footer className="w-full text-center py-4 border-t bg-white dark:bg-gray-800">
              <a
                href="https://bolt.build"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center px-4 py-2 bg-indigo-600 text-white rounded-full text-sm font-semibold hover:bg-indigo-700 transition duration-300"
              >
                🚀 Built on Bolt
              </a>
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
                MADE WITH <span className="text-red-500">❤</span> BY SAMYA ALI
              </p>
            </footer>
          </div>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;