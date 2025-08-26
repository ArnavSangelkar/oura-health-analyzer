import React, { useState, useEffect } from 'react';
import { Calendar, Download, Filter } from 'lucide-react';
import { ouraApi } from '../utils/api';

const HealthData: React.FC = () => {
  const [healthData, setHealthData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState({
    startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    loadHealthData();
  }, [dateRange]);

  const loadHealthData = async () => {
    try {
      setLoading(true);
      const data = await ouraApi.getHealthSummary(dateRange.startDate, dateRange.endDate);
      setHealthData(data);
    } catch (err) {
      setError('Failed to load health data');
      console.error('Error loading health data:', err);
    } finally {
      setLoading(false);
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
        <div className="flex items-center space-x-4">
          <button className="btn-secondary flex items-center space-x-2">
            <Download className="h-4 w-4" />
            <span>Export</span>
          </button>
        </div>
      </div>

      {/* Date Range Filter */}
      <div className="card">
        <div className="flex items-center space-x-4">
          <Calendar className="h-5 w-5 text-gray-500" />
          <div className="flex items-center space-x-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
              <input
                type="date"
                value={dateRange.startDate}
                onChange={(e) => setDateRange(prev => ({ ...prev, startDate: e.target.value }))}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
              <input
                type="date"
                value={dateRange.endDate}
                onChange={(e) => setDateRange(prev => ({ ...prev, endDate: e.target.value }))}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>
      </div>

      {error ? (
        <div className="text-center py-12">
          <div className="text-red-600 mb-4">{error}</div>
          <button onClick={loadHealthData} className="btn-primary">
            Try Again
          </button>
        </div>
      ) : (
        <>
          {/* Summary Stats */}
          {healthData?.summary && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="card">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Average Sleep Score</h3>
                <p className="text-3xl font-bold text-blue-600">
                  {healthData.summary.averageSleepScore.toFixed(1)}
                </p>
                <p className="text-sm text-gray-500">Over {healthData.summary.totalDays} days</p>
              </div>
              <div className="card">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Average Activity Score</h3>
                <p className="text-3xl font-bold text-green-600">
                  {healthData.summary.averageActivityScore.toFixed(1)}
                </p>
                <p className="text-sm text-gray-500">Over {healthData.summary.totalDays} days</p>
              </div>
              <div className="card">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Average Readiness Score</h3>
                <p className="text-3xl font-bold text-yellow-600">
                  {healthData.summary.averageReadinessScore.toFixed(1)}
                </p>
                <p className="text-sm text-gray-500">Over {healthData.summary.totalDays} days</p>
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
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Score</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Sleep (hrs)</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Efficiency</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {healthData.sleep.slice(-10).reverse().map((day: any, index: number) => (
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
              ) : (
                <p className="text-gray-500">No sleep data available</p>
              )}
            </div>

            {/* Activity Data */}
            <div className="card">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Activity Data</h2>
              {healthData?.activity?.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Score</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Steps</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Calories</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {healthData.activity.slice(-10).reverse().map((day: any, index: number) => (
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
              ) : (
                <p className="text-gray-500">No activity data available</p>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default HealthData;

