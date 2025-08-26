import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface HealthMetricCardProps {
  title: string;
  value: number;
  unit?: string;
  trend?: number;
  color?: 'blue' | 'green' | 'yellow' | 'red';
  icon?: React.ReactNode;
}

const HealthMetricCard: React.FC<HealthMetricCardProps> = ({
  title,
  value,
  unit = '',
  trend,
  color = 'blue',
  icon
}) => {
  const getScoreClass = (score: number) => {
    if (score >= 80) return 'excellent';
    if (score >= 60) return 'good';
    if (score >= 40) return 'fair';
    return 'poor';
  };

  const getColorClasses = (color: string) => {
    switch (color) {
      case 'green':
        return 'from-green-50 to-emerald-50 border-green-100';
      case 'yellow':
        return 'from-yellow-50 to-amber-50 border-yellow-100';
      case 'red':
        return 'from-red-50 to-pink-50 border-red-100';
      default:
        return 'from-blue-50 to-indigo-50 border-blue-100';
    }
  };

  const getTrendIcon = (trend: number) => {
    if (trend > 0) return <TrendingUp className="h-4 w-4 text-green-600" />;
    if (trend < 0) return <TrendingDown className="h-4 w-4 text-red-600" />;
    return <Minus className="h-4 w-4 text-gray-400" />;
  };

  const scoreClass = getScoreClass(value);
  const colorClasses = getColorClasses(color);

  return (
    <div className={`metric-card ${colorClasses}`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          {icon && <div className="text-blue-600">{icon}</div>}
          <h3 className="text-sm font-medium text-gray-700">{title}</h3>
        </div>
        {trend !== undefined && (
          <div className="flex items-center space-x-1">
            {getTrendIcon(trend)}
            <span className={`text-xs font-medium ${trend > 0 ? 'text-green-600' : trend < 0 ? 'text-red-600' : 'text-gray-500'}`}>
              {Math.abs(trend)}%
            </span>
          </div>
        )}
      </div>
      
      <div className="flex items-baseline space-x-2">
        <span className={`health-score ${scoreClass}`}>
          {value}
        </span>
        {unit && <span className="text-lg text-gray-600">{unit}</span>}
      </div>
      
      <div className="mt-2">
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className={`h-2 rounded-full transition-all duration-300 ${
              scoreClass === 'excellent' ? 'bg-green-500' :
              scoreClass === 'good' ? 'bg-blue-500' :
              scoreClass === 'fair' ? 'bg-yellow-500' : 'bg-red-500'
            }`}
            style={{ width: `${value}%` }}
          />
        </div>
      </div>
    </div>
  );
};

export default HealthMetricCard;

