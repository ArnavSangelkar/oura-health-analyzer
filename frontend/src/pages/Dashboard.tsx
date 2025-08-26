import React, { useState, useEffect } from 'react';
import { Activity, Moon, Zap } from 'lucide-react';
import HealthMetricCard from '../components/HealthMetricCard';
import { ouraApi } from '../utils/api';

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

  useEffect(() => {
    const loadData = async () => {
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
    };

    loadData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-600 mb-4">{error}</div>
        <button 
          onClick={() => window.location.reload()} 
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          Try Again
        </button>
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


    </div>
  );
};

export default Dashboard;

