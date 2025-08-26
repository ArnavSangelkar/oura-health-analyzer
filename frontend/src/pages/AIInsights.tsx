import React, { useState } from 'react';
import { Brain, Calendar, Sparkles, MessageCircle, Send } from 'lucide-react';
import { aiApi, ouraApi } from '../utils/api';

const AIInsights: React.FC = () => {
  const [insights, setInsights] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState({
    startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });
  const [selectedAspect, setSelectedAspect] = useState('general');
  const [customQuestion, setCustomQuestion] = useState('');
  const [customAnswer, setCustomAnswer] = useState<string | null>(null);
  const [askingQuestion, setAskingQuestion] = useState(false);

  const generateInsights = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔍 Generating insights for date range:', dateRange);
      
      // First get health data, then generate insights
      const healthData = await ouraApi.getHealthSummary(dateRange.startDate, dateRange.endDate);
      console.log('📊 Health data received:', healthData);
      
      // Log the structure of the data being sent to AI
      console.log('📋 Data structure being sent to AI:');
      console.log('- Sleep data:', healthData.sleep);
      console.log('- Activity data:', healthData.activity);
      console.log('- Readiness data:', healthData.readiness);
      console.log('- Summary:', healthData.summary);
      
      const data = await aiApi.generateInsight('general', healthData);
      console.log('🤖 AI insight received:', data);
      
      // The API returns { insight: "..." }, so we need to structure it properly
      setInsights({
        general: { analysis: data.insight },
        healthData: healthData
      });
    } catch (err: any) {
      console.error('❌ Error generating insights:', err);
      setError(`Failed to generate insights: ${err.message || 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const analyzeAspect = async (aspect: string) => {
    try {
      setLoading(true);
      setError(null);
      
      console.log(`🔍 Analyzing ${aspect} aspect...`);
      
      // First get health data, then generate insights for specific aspect
      const healthData = await ouraApi.getHealthSummary(dateRange.startDate, dateRange.endDate);
      const data = await aiApi.generateInsight(aspect, healthData);
      
      console.log(`🤖 ${aspect} analysis received:`, data);
      
      // Update insights with the new aspect analysis
      setInsights((prev: any) => ({
        ...prev,
        [aspect]: { analysis: data.insight }
      }));
    } catch (err: any) {
      console.error(`❌ Error analyzing ${aspect}:`, err);
      setError(`Failed to analyze ${aspect}: ${err.message || 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const askCustomQuestion = async () => {
    if (!customQuestion.trim()) {
      setError('Please enter a question');
      return;
    }

    try {
      setAskingQuestion(true);
      setError(null);
      
      console.log('❓ Asking custom question:', customQuestion);
      
      // Get health data and send custom question
      const healthData = await ouraApi.getHealthSummary(dateRange.startDate, dateRange.endDate);
      const data = await aiApi.generateInsight('custom', healthData, customQuestion);
      
      console.log('🤖 Custom answer received:', data);
      
      setCustomAnswer(data.insight);
    } catch (err: any) {
      console.error('❌ Error asking custom question:', err);
      setError(`Failed to get answer: ${err.message || 'Unknown error'}`);
    } finally {
      setAskingQuestion(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center justify-center">
          <Brain className="h-8 w-8 mr-3 text-blue-600" />
          AI Health & Recovery Assistant
        </h1>
        <p className="text-gray-600 mb-4">
          Get personalized health analysis focusing on trends, anomalies, and actionable insights
        </p>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 max-w-2xl mx-auto">
          <p className="text-sm text-blue-800">
            <strong>Your AI Assistant:</strong> Analyzes Oura Ring data to identify trends, connect patterns with lifestyle factors, 
            and provide practical recommendations for health optimization and recovery.
          </p>
        </div>
      </div>

      {/* Controls */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between space-y-4 lg:space-y-0">
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
          <button
            onClick={generateInsights}
            disabled={loading}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
          >
            {loading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            ) : (
              <Sparkles className="h-4 w-4" />
            )}
            <span>{loading ? 'Generating...' : 'Generate Insights'}</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="text-red-600">{error}</div>
        </div>
      )}

      {insights && (
        <div className="space-y-6">
          {/* Aspect Analysis Tabs */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Analysis Focus</h2>
            <div className="flex flex-wrap gap-2">
              {['general', 'sleep', 'activity', 'readiness'].map((aspect) => (
                <button
                  key={aspect}
                  onClick={() => {
                    setSelectedAspect(aspect);
                    analyzeAspect(aspect);
                  }}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
                    selectedAspect === aspect
                      ? 'bg-blue-100 text-blue-700'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {aspect.charAt(0).toUpperCase() + aspect.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Health Analysis */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <Brain className="h-5 w-5 mr-2 text-blue-600" />
              Health Analysis
            </h2>
            {insights[selectedAspect]?.analysis ? (
              <div className="prose max-w-none">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-gray-800 whitespace-pre-wrap">{insights[selectedAspect].analysis}</p>
                </div>
              </div>
            ) : (
              <p className="text-gray-500">No analysis available for {selectedAspect}. Click the button above to generate insights.</p>
            )}
          </div>
        </div>
      )}

      {/* Custom Question Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
          <MessageCircle className="h-5 w-5 mr-2 text-green-600" />
          Ask Your Own Question
        </h2>
        <p className="text-gray-600 mb-4">
          Ask the AI anything specific about your health data, patterns, or get personalized advice.
        </p>
        
        <div className="space-y-4">
          <div className="flex space-x-3">
            <input
              type="text"
              value={customQuestion}
              onChange={(e) => setCustomQuestion(e.target.value)}
              placeholder="e.g., 'Why am I feeling tired despite good sleep scores?' or 'How can I improve my recovery?'"
              className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
              onKeyPress={(e) => e.key === 'Enter' && askCustomQuestion()}
            />
            <button
              onClick={askCustomQuestion}
              disabled={askingQuestion || !customQuestion.trim()}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              {askingQuestion ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (
                <Send className="h-4 w-4" />
              )}
              <span>{askingQuestion ? 'Asking...' : 'Ask'}</span>
            </button>
          </div>

          {customAnswer && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h3 className="font-semibold text-green-800 mb-2">AI Answer:</h3>
              <p className="text-green-700 whitespace-pre-wrap">{customAnswer}</p>
            </div>
          )}
        </div>
      </div>

      {/* Instructions */}
      {!insights && !loading && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center">
          <Sparkles className="h-12 w-12 text-blue-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Ready to Get Insights?</h3>
          <p className="text-gray-600 mb-4">
            Select a date range and click "Generate Insights" to get AI-powered analysis of your health data.
          </p>
          <button onClick={generateInsights} className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
            Generate Insights
          </button>
        </div>
      )}
    </div>
  );
};

export default AIInsights;

