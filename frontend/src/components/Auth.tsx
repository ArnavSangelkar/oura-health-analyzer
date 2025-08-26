import React, { useState } from 'react';
import { authApi } from '../utils/api';
import { User, Lock, Mail, Eye, EyeOff } from 'lucide-react';

interface AuthProps {
  onAuthSuccess: (user: any, token: string) => void;
}

const Auth: React.FC<AuthProps> = ({ onAuthSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  // Get the current domain to determine API base URL
  const getApiBaseUrl = () => {
    if (process.env.NODE_ENV === 'production') {
      // In production, use the current domain
      return window.location.origin;
    }
    // In development, use localhost
    return 'http://localhost:3000';
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      const apiBaseUrl = getApiBaseUrl();
      console.log('API Base URL:', apiBaseUrl);

      if (isLogin) {
        // Sign in through backend API
        console.log('Attempting sign in...');
        const response = await fetch(`${apiBaseUrl}/api/auth/signin`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email, password }),
        });

        console.log('Sign in response status:', response.status);
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ message: 'Sign in failed' }));
          throw new Error(errorData.message || `Sign in failed: ${response.status}`);
        }

        const data = await response.json();
        console.log('Sign in successful:', data);
        setMessage('Successfully signed in!');
        // Call onAuthSuccess with user data and token
        onAuthSuccess(data.user, data.token);
      } else {
        // Sign up through backend API
        console.log('Attempting sign up...');
        console.log('Sign up data:', { email, password });
        console.log('API Base URL:', apiBaseUrl);
        console.log('Full signup URL:', `${apiBaseUrl}/api/auth/signup`);
        
        const requestBody = { email, password };
        console.log('Request body to be sent:', requestBody);
        console.log('JSON stringified body:', JSON.stringify(requestBody));
        
        const response = await fetch(`${apiBaseUrl}/api/auth/signup`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestBody),
        });

        console.log('Sign up response status:', response.status);
        console.log('Sign up response headers:', response.headers);
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ message: 'Sign up failed' }));
          console.error('Sign up error response:', errorData);
          
          // Show specific error message from backend
          const errorMessage = errorData.error || errorData.message || `Sign up failed: ${response.status}`;
          throw new Error(errorMessage);
        }

        const data = await response.json();
        console.log('Sign up successful:', data);
        setMessage('Account created successfully! Please sign in.');
        setIsLogin(true);
      }
    } catch (error: any) {
      console.error('Authentication error:', error);
      setError(error.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <User className="h-12 w-12 text-blue-600" />
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          {isLogin ? 'Sign in to your account' : 'Create a new account'}
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="font-medium text-blue-600 hover:text-blue-500"
          >
            {isLogin ? 'Sign up' : 'Sign in'}
          </button>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <form className="space-y-6" onSubmit={handleAuth}>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email address
              </label>
              <div className="mt-1 relative">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Enter your email"
                />
                <Mail className="h-5 w-5 text-gray-400 absolute right-3 top-2.5" />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <div className="mt-1 relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              {!isLogin && (
                <p className="mt-1 text-xs text-gray-500">
                  Password must be at least 6 characters long
                </p>
              )}
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-md p-4">
                <div className="text-sm text-red-600">{error}</div>
              </div>
            )}

            {message && (
              <div className="bg-green-50 border border-green-200 rounded-md p-4">
                <div className="text-sm text-green-600">{message}</div>
              </div>
            )}

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                ) : (
                  <Lock className="h-4 w-4 mr-2" />
                )}
                {loading ? 'Processing...' : (isLogin ? 'Sign in' : 'Sign up')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Auth;
