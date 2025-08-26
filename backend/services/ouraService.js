const axios = require('axios');

class OuraService {
  constructor() {
    this.baseURL = 'https://api.ouraring.com/v2/usercollection';
    this.token = process.env.OURA_TOKEN || process.env.OURA_PERSONAL_ACCESS_TOKEN;
    
    if (!this.token) {
      console.warn('⚠️  OURA_TOKEN or OURA_PERSONAL_ACCESS_TOKEN environment variable is not set. Oura API features will be disabled.');
      this.token = null;
      this.api = null;
    } else {
      this.api = axios.create({
        baseURL: this.baseURL,
        headers: {
          'Authorization': `Bearer ${this.token}`,
          'Content-Type': 'application/json'
        }
      });
    }
  }

  async getUserProfile() {
    if (!this.api) {
      throw new Error('Oura API is not configured. Please set YOURA_TOKEN in your environment variables.');
    }
    
    try {
      const response = await this.api.get('/personal_info');
      return response.data;
    } catch (error) {
      console.error('Error fetching user profile:', error.response?.data || error.message);
      throw new Error('Failed to fetch user profile');
    }
  }

  async getSleepData(startDate, endDate) {
    try {
      const params = new URLSearchParams();
      if (startDate) params.append('start_date', startDate);
      if (endDate) params.append('end_date', endDate);
      
      const response = await this.api.get(`/sleep?${params.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching sleep data:', error.response?.data || error.message);
      throw new Error('Failed to fetch sleep data');
    }
  }

  async getDetailedSleepData(startDate, endDate) {
    if (!this.api) {
      throw new Error('Oura API is not configured. Please set YOURA_TOKEN in your environment variables.');
    }
    
    try {
      const params = new URLSearchParams();
      if (startDate) params.append('start_date', startDate);
      if (endDate) params.append('end_date', endDate);
      
      // Get both detailed sleep data and daily sleep scores
      const [sleepData, dailySleepScores] = await Promise.all([
        this.api.get(`/sleep?${params.toString()}`).catch(() => ({ data: { data: [] } })),
        this.api.get(`/daily_sleep?${params.toString()}`).catch(() => ({ data: { data: [] } }))
      ]);

      return {
        sleep_data: sleepData.data,
        daily_sleep_scores: dailySleepScores.data
      };
    } catch (error) {
      console.error('Error fetching detailed sleep data:', error.response?.data || error.message);
      throw new Error('Failed to fetch detailed sleep data');
    }
  }

  async getDailySleepScores(startDate, endDate) {
    if (!this.api) {
      throw new Error('Oura API is not configured. Please set YOURA_TOKEN in your environment variables.');
    }
    
    try {
      const params = new URLSearchParams();
      if (startDate) params.append('start_date', startDate);
      if (endDate) params.append('end_date', endDate);
      
      const response = await this.api.get(`/daily_sleep?${params.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching daily sleep scores:', error.response?.data || error.message);
      throw new Error('Failed to fetch daily sleep scores');
    }
  }

  async getActivityData(startDate, endDate) {
    try {
      const params = new URLSearchParams();
      if (startDate) params.append('start_date', startDate);
      if (endDate) params.append('end_date', endDate);
      
      const response = await this.api.get(`/daily_activity?${params.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching activity data:', error.response?.data || error.message);
      throw new Error('Failed to fetch activity data');
    }
  }

  async getReadinessData(startDate, endDate) {
    try {
      const params = new URLSearchParams();
      if (startDate) params.append('start_date', startDate);
      if (endDate) params.append('end_date', endDate);
      
      const response = await this.api.get(`/daily_readiness?${params.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching readiness data:', error.response?.data || error.message);
      throw new Error('Failed to fetch readiness data');
    }
  }

  async getHeartRateData(startDate, endDate) {
    try {
      const params = new URLSearchParams();
      if (startDate) params.append('start_datetime', startDate);
      if (endDate) params.append('end_datetime', endDate);
      
      const response = await this.api.get(`/heartrate?${params.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching heart rate data:', error.response?.data || error.message);
      throw new Error('Failed to fetch heart rate data');
    }
  }

  async getSpO2Data(startDate, endDate) {
    if (!this.api) {
      throw new Error('Oura API is not configured. Please set YOURA_TOKEN in your environment variables.');
    }
    
    try {
      const params = new URLSearchParams();
      if (startDate) params.append('start_date', startDate);
      if (endDate) params.append('end_date', endDate);
      
      const response = await this.api.get(`/daily_spo2?${params.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching SpO2 data:', error.response?.data || error.message);
      throw new Error('Failed to fetch SpO2 data');
    }
  }

  async getStressData(startDate, endDate) {
    if (!this.api) {
      throw new Error('Oura API is not configured. Please set YOURA_TOKEN in your environment variables.');
    }
    
    try {
      const params = new URLSearchParams();
      if (startDate) params.append('start_date', startDate);
      if (endDate) params.append('end_date', endDate);
      
      const response = await this.api.get(`/daily_stress?${params.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching stress data:', error.response?.data || error.message);
      throw new Error('Failed to fetch stress data');
    }
  }

  async getResilienceData(startDate, endDate) {
    if (!this.api) {
      throw new Error('Oura API is not configured. Please set YOURA_TOKEN in your environment variables.');
    }
    
    try {
      const params = new URLSearchParams();
      if (startDate) params.append('start_date', startDate);
      if (endDate) params.append('end_date', endDate);
      
      const response = await this.api.get(`/daily_resilience?${params.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching resilience data:', error.response?.data || error.message);
      throw new Error('Failed to fetch resilience data');
    }
  }

  async getCardiovascularAgeData(startDate, endDate) {
    if (!this.api) {
      throw new Error('Oura API is not configured. Please set YOURA_TOKEN in your environment variables.');
    }
    
    try {
      const params = new URLSearchParams();
      if (startDate) params.append('start_date', startDate);
      if (endDate) params.append('end_date', endDate);
      
      const response = await this.api.get(`/daily_cardiovascular_age?${params.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching cardiovascular age data:', error.response?.data || error.message);
      throw new Error('Failed to fetch cardiovascular age data');
    }
  }

  async getVO2MaxData(startDate, endDate) {
    if (!this.api) {
      throw new Error('Oura API is not configured. Please set YOURA_TOKEN in your environment variables.');
    }
    
    try {
      const params = new URLSearchParams();
      if (startDate) params.append('start_date', startDate);
      if (endDate) params.append('end_date', endDate);
      
      const response = await this.api.get(`/vO2_max?${params.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching VO2 max data:', error.response?.data || error.message);
      throw new Error('Failed to fetch VO2 max data');
    }
  }

  async getWorkoutData(startDate, endDate) {
    if (!this.api) {
      throw new Error('Oura API is not configured. Please set YOURA_TOKEN in your environment variables.');
    }
    
    try {
      const params = new URLSearchParams();
      if (startDate) params.append('start_date', startDate);
      if (endDate) params.append('end_date', endDate);
      
      const response = await this.api.get(`/workout?${params.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching workout data:', error.response?.data || error.message);
      throw new Error('Failed to fetch workout data');
    }
  }

  async getSessionData(startDate, endDate) {
    if (!this.api) {
      throw new Error('Oura API is not configured. Please set YOURA_TOKEN in your environment variables.');
    }
    
    try {
      const params = new URLSearchParams();
      if (startDate) params.append('start_date', startDate);
      if (endDate) params.append('end_date', endDate);
      
      const response = await this.api.get(`/session?${params.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching session data:', error.response?.data || error.message);
      throw new Error('Failed to fetch session data');
    }
  }

  async getHealthSummary(startDate, endDate) {
    try {
      const [sleep, activity, readiness, dailySleepScores] = await Promise.all([
        this.getSleepData(startDate, endDate),
        this.getActivityData(startDate, endDate),
        this.getReadinessData(startDate, endDate),
        this.getDailySleepScores(startDate, endDate)
      ]);

      // Combine sleep data with scores and deduplicate by day (keep longest sleep session)
      const sleepWithScores = (sleep.data || [])
        .map(sleepItem => {
          const scoreItem = (dailySleepScores.data || []).find(scoreItem => scoreItem.day === sleepItem.day);
          return {
            ...sleepItem,
            score: scoreItem?.score || null
          };
        })
        .reduce((acc, current) => {
          const existing = acc.find(item => item.day === current.day);
          if (!existing || current.total_sleep_duration > existing.total_sleep_duration) {
            // Remove existing entry for this day and add the current one
            const filtered = acc.filter(item => item.day !== current.day);
            return [...filtered, current];
          }
          return acc;
        }, []);

      return {
        sleep: sleepWithScores,
        activity: activity.data || [],
        readiness: readiness.data || [],
        summary: this.calculateSummary(sleepWithScores, activity.data, readiness.data)
      };
    } catch (error) {
      console.error('Error fetching health summary:', error);
      throw new Error('Failed to fetch health summary');
    }
  }

  async getLatestData() {
    try {
      const today = new Date().toISOString().split('T')[0];
      const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      
      const [sleep, activity, readiness, dailySleepScores] = await Promise.all([
        this.getSleepData(yesterday, today),
        this.getActivityData(yesterday, today),
        this.getReadinessData(yesterday, today),
        this.getDailySleepScores(yesterday, today)
      ]);

      return {
        sleep: {
          ...sleep.data?.[0],
          score: dailySleepScores.data?.[0]?.score || null
        } || null,
        activity: activity.data?.[0] || null,
        readiness: readiness.data?.[0] || null,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error fetching latest data:', error);
      throw new Error('Failed to fetch latest data');
    }
  }

  calculateSummary(sleepData, activityData, readinessData) {
    if (!sleepData?.length && !activityData?.length && !readinessData?.length) {
      return null;
    }

    const sleepScores = sleepData?.map(d => d.score) || [];
    const activityScores = activityData?.map(d => d.score) || [];
    const readinessScores = readinessData?.map(d => d.score) || [];

    return {
      averageSleepScore: sleepScores.length ? sleepScores.reduce((a, b) => a + b, 0) / sleepScores.length : 0,
      averageActivityScore: activityScores.length ? activityScores.reduce((a, b) => a + b, 0) / activityScores.length : 0,
      averageReadinessScore: readinessScores.length ? readinessScores.reduce((a, b) => a + b, 0) / readinessScores.length : 0,
      totalDays: Math.max(sleepData?.length || 0, activityData?.length || 0, readinessData?.length || 0)
    };
  }
}

module.exports = new OuraService();

