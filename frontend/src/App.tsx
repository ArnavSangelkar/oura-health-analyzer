import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
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
    // Check if user is logged in by looking for JWT token in localStorage
    const token = localStorage.getItem('authToken');
    if (token) {
      // Verify token with backend
      verifyToken(token);
    } else {
      setLoading(false);
    }
  }, []);

  const verifyToken = async (token: string) => {
    try {
      const apiBaseUrl = process.env.NODE_ENV === 'development' 
        ? 'http://localhost:3000' 
        : window.location.origin;
      
      const response = await fetch(`${apiBaseUrl}/api/auth/profile`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
        localStorage.setItem('authToken', token);
      } else {
        // Token is invalid, remove it
        localStorage.removeItem('authToken');
        setUser(null);
      }
    } catch (error) {
      console.error('Token verification failed:', error);
      localStorage.removeItem('authToken');
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const handleAuthSuccess = (userData: any, token: string) => {
    setUser(userData);
    localStorage.setItem('authToken', token);
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('authToken');
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

