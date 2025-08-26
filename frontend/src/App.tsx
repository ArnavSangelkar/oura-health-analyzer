import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { supabase } from './utils/api';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import HealthData from './pages/HealthData';
import AIInsights from './pages/AIInsights';
import Settings from './pages/Settings';
import Auth from './components/Auth';

function App() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get current user from Supabase
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      setLoading(false);
    };

    getUser();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleAuthSuccess = () => {
    // This will trigger the useEffect to update the user state
    // No need to do anything here as Supabase handles the session
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        {user && <Navbar onLogout={handleLogout} />}
        <main className={user ? "container mx-auto px-4 py-8" : ""}>
          <Routes>
            <Route 
              path="/auth" 
              element={user ? <Navigate to="/" /> : <Auth onAuthSuccess={handleAuthSuccess} />} 
            />
            <Route 
              path="/" 
              element={user ? <Dashboard /> : <Navigate to="/auth" />} 
            />
            <Route 
              path="/health-data" 
              element={user ? <HealthData /> : <Navigate to="/auth" />} 
            />
            <Route 
              path="/ai-insights" 
              element={user ? <AIInsights /> : <Navigate to="/auth" />} 
            />
            <Route 
              path="/settings" 
              element={user ? <Settings /> : <Navigate to="/auth" />} 
            />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;

