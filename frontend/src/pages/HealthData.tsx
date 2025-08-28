import React, { useState, useEffect, useCallback } from 'react';
import { Calendar } from 'lucide-react';
import { ouraApi, supabase } from '../utils/api';

const HealthData: React.FC = () => {
  const [healthData, setHealthData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasOuraToken, setHasOuraToken] = useState<boolean | null>(null);
  const [dateRange, setDateRange] = useState({
    startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });

  const loadHealthData = useCallback(async () => {
    try {
      setLoading(true);
      const data = await ouraApi.getHealthSummary(dateRange.startDate, dateRange.endDate);
      setHealthData(data);
    } catch (err: any) {
      console.error('Error loading health data:', err);
      setError('Failed to load health data. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [dateRange.startDate, dateRange.endDate]);

  useEffect(() => {
    checkOuraToken();
  }, []);

  useEffect(() => {
    if (hasOuraToken === false) {
      setLoading(false);
    } else if (hasOuraToken === true) {
      loadHealthData();
    }
  }, [hasOuraToken, loadHealthData]);

  const calculateDays = () => {
    const start = new Date(dateRange.startDate);
    const end = new Date(dateRange.endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays; // Removed +1 to fix the off-by-one error
  };

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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Health Data</h1>
          <p className="text-gray-600 mt-2">Detailed health metrics and trends</p>
        </div>

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

      {/* Date Range Filter */}
      {hasOuraToken !== false && (
        <div className="card">
          <div className="flex items-center space-x-4">
            <Calendar className="h-5 w-5 text-gray-500 flex-shrink-0" />
            <div className="flex items-end space-x-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                <input
                  type="date"
                  value={dateRange.startDate}
                  onChange={(e) => setDateRange(prev => ({ ...prev, startDate: e.target.value }))}
                  className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent w-40"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                <input
                  type="date"
                  value={dateRange.endDate}
                  onChange={(e) => setDateRange(prev => ({ ...prev, endDate: e.target.value }))}
                  className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent w-40"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Summary Stats */}
      {healthData?.summary && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Average Sleep Score</h3>
            <p className="text-3xl font-bold text-blue-600">
              {healthData.summary.averageSleepScore.toFixed(1)}
            </p>
            <p className="text-sm text-gray-500">Over {healthData.summary.totalDays || calculateDays()} days</p>
          </div>
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Average Activity Score</h3>
            <p className="text-3xl font-bold text-green-600">
              {healthData.summary.averageActivityScore.toFixed(1)}
            </p>
            <p className="text-sm text-gray-500">Over {healthData.summary.totalDays || calculateDays()} days</p>
          </div>
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Average Readiness Score</h3>
            <p className="text-3xl font-bold text-yellow-600">
              {healthData.summary.averageReadinessScore.toFixed(1)}
            </p>
            <p className="text-sm text-gray-500">Over {healthData.summary.totalDays || calculateDays()} days</p>
          </div>
        </div>
      )}

      {/* Data Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Sleep Data */}
            <div className="card">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Sleep Data</h2>
              {healthData?.sleep?.length > 0 ? (
                <div className="overflow-x-auto">
                  <div className="max-h-96 overflow-y-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50 sticky top-0 z-10">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50">Date</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50">Score</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50">Total Sleep (hrs)</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50">Efficiency</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {healthData.sleep.reverse().map((day: any, index: number) => (
                          <tr key={index}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{day.day}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{day.score}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{(day.total_sleep_duration / 3600).toFixed(1)}h</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{day.efficiency || 0}%</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                <p className="text-gray-500">No sleep data available</p>
              )}
            </div>

            {/* Activity Data */}
            <div className="card">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Activity Data</h2>
              {healthData?.activity?.length > 0 ? (
                <div className="overflow-x-auto">
                  <div className="max-h-96 overflow-y-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50 sticky top-0 z-10">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50">Date</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50">Score</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50">Steps</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50">Calories</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {healthData.activity.reverse().map((day: any, index: number) => (
                          <tr key={index}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{day.day}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{day.score}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{day.steps?.toLocaleString()}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{day.total_calories?.toLocaleString()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
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
          <button onClick={loadHealthData} className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors">
            Try Again
          </button>
        </div>
      ) : null}

    </div>
  );
};

export default HealthData;

