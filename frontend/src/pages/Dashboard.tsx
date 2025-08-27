import React, { useState, useEffect, useCallback } from 'react';
import { Activity, Moon, Zap } from 'lucide-react';
import HealthMetricCard from '../components/HealthMetricCard';
import { ouraApi, supabase } from '../utils/api';

interface LatestData {
  sleep: any;
  activity: any;
  readiness: any;
  timestamp: string;
}

const Dashboard: React.FC = () => {
  const [latestData, setLatestData] = useState<LatestData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasOuraToken, setHasOuraToken] = useState<boolean | null>(null);

  const checkOuraToken = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('oura_token')
          .eq('id', user.id)
          .single();
        
        setHasOuraToken(!!profile?.oura_token);
      }
    } catch (error) {
      console.error('Error checking Oura token:', error);
      setHasOuraToken(false);
    }
  };

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const data = await ouraApi.getLatestData();
      setLatestData(data);
    } catch (err) {
      setError('Failed to load health data');
      console.error('Error loading dashboard data:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    checkOuraToken();
  }, []);

  useEffect(() => {
    if (hasOuraToken === false) {
      setError('Oura API key not configured. Please go to Settings to add or update your Oura Ring API key.');
      setLoading(false);
    } else if (hasOuraToken === true) {
      loadData();
    }
  }, [hasOuraToken, loadData]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Health Dashboard</h1>
        <p className="text-gray-600">
          Your latest health insights from Oura Ring
          {latestData?.timestamp && (
            <span className="block text-sm text-gray-500 mt-1">
              Last updated: {new Date(latestData.timestamp).toLocaleString()}
            </span>
          )}
        </p>
      </div>

      {/* Oura Token Warning */}
      {hasOuraToken === false && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800">
                Oura Ring API Key Required
              </h3>
              <div className="mt-2 text-sm text-yellow-700">
                <p>You need to configure your Oura Ring API key to view health data.</p>
              </div>
              <div className="mt-4">
                <button
                  onClick={() => window.location.href = '/settings'}
                  className="bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700 transition-colors"
                >
                  Configure API Key
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Health Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <HealthMetricCard
          title="Sleep Score"
          value={latestData?.sleep?.score || 0}
          unit="/100"
          icon={<Moon className="h-5 w-5" />}
          color="blue"
        />
        <HealthMetricCard
          title="Activity Score"
          value={latestData?.activity?.score || 0}
          unit="/100"
          icon={<Activity className="h-5 w-5" />}
          color="green"
        />
        <HealthMetricCard
          title="Readiness Score"
          value={latestData?.readiness?.score || 0}
          unit="/100"
          icon={<Zap className="h-5 w-5" />}
          color="yellow"
        />
      </div>

      {/* Detailed Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Sleep Details */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
            <Moon className="h-5 w-5 mr-2 text-blue-600" />
            Sleep Details
          </h2>
          {latestData?.sleep ? (
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-gray-600">Total Sleep</span>
                <span className="font-medium">{(latestData.sleep.total_sleep_duration / 3600).toFixed(1)}h</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Deep Sleep</span>
                <span className="font-medium">{(latestData.sleep.deep_sleep_duration / 3600).toFixed(1)}h</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">REM Sleep</span>
                <span className="font-medium">{(latestData.sleep.rem_sleep_duration / 3600).toFixed(1)}h</span>
              </div>

            </div>
          ) : (
            <p className="text-gray-500">No sleep data available</p>
          )}
        </div>

        {/* Activity Details */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
            <Activity className="h-5 w-5 mr-2 text-green-600" />
            Activity Details
          </h2>
          {latestData?.activity ? (
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-gray-600">Steps</span>
                <span className="font-medium">{latestData.activity.steps?.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Total Calories</span>
                <span className="font-medium">{latestData.activity.total_calories?.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Active Calories</span>
                <span className="font-medium">{latestData.activity.active_calories?.toLocaleString() || 'N/A'}</span>
              </div>
            </div>
          ) : (
            <p className="text-gray-500">No activity data available</p>
          )}
        </div>
      </div>

      {error ? (
        <div className="text-center py-12">
          <div className="text-red-600 mb-4">{error}</div>
          <button onClick={loadData} className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors">
            Try Again
          </button>
        </div>
      ) : null}

    </div>
  );
};

export default Dashboard;

