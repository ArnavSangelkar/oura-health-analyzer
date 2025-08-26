import React, { useState, useEffect } from 'react';
import { Settings as SettingsIcon, Key, Save, CheckCircle } from 'lucide-react';
import { supabase } from '../utils/api';

const Settings: React.FC = () => {
  const [ouraToken, setOuraToken] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  useEffect(() => {
    loadUserSettings();
  }, []);

  const loadUserSettings = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('oura_token')
          .eq('id', user.id)
          .single();
        
        if (profile?.oura_token) {
          setOuraToken(profile.oura_token);
        }
      }
    } catch (error) {
      console.error('Error loading user settings:', error);
    }
  };

  const saveSettings = async () => {
    if (!ouraToken.trim()) {
      setMessage({ type: 'error', text: 'Please enter your Oura API token' });
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Update the profile with the Oura token
      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          email: user.email,
          oura_token: ouraToken.trim(),
          updated_at: new Date().toISOString()
        });

      if (error) throw error;

      setMessage({ type: 'success', text: 'Settings saved successfully! Your Oura token is now configured.' });
      
      // Clear the message after 5 seconds
      setTimeout(() => setMessage(null), 5000);
    } catch (error: any) {
      setMessage({ type: 'error', text: `Failed to save settings: ${error.message}` });
    } finally {
      setLoading(false);
    }
  };

  const testConnection = async () => {
    if (!ouraToken.trim()) {
      setMessage({ type: 'error', text: 'Please enter your Oura API token first' });
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      // Test the Oura API connection by calling our Edge Function
      const response = await fetch(`${process.env.REACT_APP_SUPABASE_URL}/functions/v1/oura-service/latest`, {
        headers: {
          'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
          'apikey': process.env.REACT_APP_SUPABASE_ANON_KEY || '',
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        setMessage({ type: 'success', text: 'Connection successful! Oura API is working correctly.' });
      } else {
        const errorData = await response.json();
        setMessage({ type: 'error', text: `Connection failed: ${errorData.error || 'Unknown error'}` });
      }
    } catch (error: any) {
      setMessage({ type: 'error', text: `Connection test failed: ${error.message}` });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center justify-center">
          <SettingsIcon className="h-8 w-8 mr-3 text-blue-600" />
          Settings
        </h1>
        <p className="text-gray-600">
          Configure your Oura Ring API token
        </p>
      </div>

      {/* API Configuration */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
          <Key className="h-5 w-5 mr-2 text-blue-600" />
          Oura Ring API Configuration
        </h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Oura API Token
            </label>
            <input
              type="password"
              value={ouraToken}
              onChange={(e) => setOuraToken(e.target.value)}
              placeholder="Enter your Oura API token"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <p className="text-sm text-gray-500 mt-1">
              Get your token from the Oura Cloud dashboard
            </p>
          </div>
          
          {message && (
            <div className={`p-3 rounded-lg ${
              message.type === 'success' 
                ? 'bg-green-50 border border-green-200 text-green-700' 
                : 'bg-red-50 border border-red-200 text-red-700'
            }`}>
              <div className="flex items-center">
                {message.type === 'success' ? (
                  <CheckCircle className="h-4 w-4 mr-2" />
                ) : (
                  <span className="mr-2">⚠️</span>
                )}
                {message.text}
              </div>
            </div>
          )}
          
          <div className="flex space-x-3">
            <button 
              onClick={saveSettings}
              disabled={loading}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              <Save className="h-4 w-4" />
              <span>{loading ? 'Saving...' : 'Save Settings'}</span>
            </button>
            <button 
              onClick={testConnection}
              disabled={loading}
              className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Test Connection
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;

