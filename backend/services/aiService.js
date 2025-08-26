const OpenAI = require('openai');

class AIService {
  constructor() {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      console.warn('⚠️  OPENAI_API_KEY environment variable is not set. AI features will be disabled.');
      this.openai = null;
    } else {
      this.openai = new OpenAI({
        apiKey: apiKey,
      });
    }
  }

  async analyzeHealthData(healthData, analysisType = 'general') {
    if (!this.openai) {
      throw new Error('OpenAI API is not configured. Please set OPENAI_API_KEY in your environment variables.');
    }
    
    try {
      const prompt = this.buildAnalysisPrompt(healthData, analysisType);
      
      const completion = await this.openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: "You are a health and wellness expert specializing in analyzing Oura Ring data. Provide actionable insights, trends, and recommendations based on the health data provided. Be encouraging, specific, and practical in your advice."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        max_tokens: 1000,
        temperature: 0.7,
      });

      return {
        analysis: completion.choices[0].message.content,
        type: analysisType,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error analyzing health data:', error);
      throw new Error('Failed to analyze health data');
    }
  }

  async generateHealthRecommendations(healthData) {
    try {
      const prompt = this.buildRecommendationsPrompt(healthData);
      
      const completion = await this.openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: "You are a health coach specializing in sleep, activity, and recovery optimization. Provide specific, actionable recommendations based on Oura Ring data. Focus on practical steps that can be implemented immediately."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        max_tokens: 800,
        temperature: 0.6,
      });

      return {
        recommendations: completion.choices[0].message.content,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error generating recommendations:', error);
      throw new Error('Failed to generate recommendations');
    }
  }

  async detectHealthTrends(healthData) {
    try {
      const prompt = this.buildTrendsPrompt(healthData);
      
      const completion = await this.openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: "You are a data analyst specializing in health metrics. Identify patterns, trends, and correlations in the provided health data. Focus on meaningful insights that could impact health outcomes."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        max_tokens: 600,
        temperature: 0.5,
      });

      return {
        trends: completion.choices[0].message.content,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error detecting trends:', error);
      throw new Error('Failed to detect health trends');
    }
  }

  buildAnalysisPrompt(healthData, analysisType) {
    const { sleep, activity, readiness, summary } = healthData;
    
    let prompt = `Analyze the following Oura Ring health data and provide insights:\n\n`;
    
    if (sleep?.length) {
      prompt += `Sleep Data (${sleep.length} days):\n`;
      sleep.slice(-7).forEach(day => {
        prompt += `- Date: ${day.day}, Score: ${day.score}, Duration: ${day.sleep_duration}hrs, Efficiency: ${day.sleep_efficiency}%\n`;
      });
    }
    
    if (activity?.length) {
      prompt += `\nActivity Data (${activity.length} days):\n`;
      activity.slice(-7).forEach(day => {
        prompt += `- Date: ${day.day}, Score: ${day.score}, Steps: ${day.steps}, Calories: ${day.calories}\n`;
      });
    }
    
    if (readiness?.length) {
      prompt += `\nReadiness Data (${readiness.length} days):\n`;
      readiness.slice(-7).forEach(day => {
        prompt += `- Date: ${day.day}, Score: ${day.score}, HRV: ${day.hrv_rmssd}ms\n`;
      });
    }
    
    if (summary) {
      prompt += `\nSummary:\n`;
      prompt += `- Average Sleep Score: ${summary.averageSleepScore.toFixed(1)}\n`;
      prompt += `- Average Activity Score: ${summary.averageActivityScore.toFixed(1)}\n`;
      prompt += `- Average Readiness Score: ${summary.averageReadinessScore.toFixed(1)}\n`;
    }
    
    prompt += `\nPlease provide a ${analysisType} analysis focusing on:`;
    
    switch (analysisType) {
      case 'sleep':
        prompt += ' sleep quality, patterns, and optimization opportunities';
        break;
      case 'activity':
        prompt += ' activity levels, exercise patterns, and movement optimization';
        break;
      case 'recovery':
        prompt += ' recovery patterns, stress levels, and readiness optimization';
        break;
      default:
        prompt += ' overall health trends, correlations between metrics, and areas for improvement';
    }
    
    return prompt;
  }

  buildRecommendationsPrompt(healthData) {
    const { sleep, activity, readiness, summary } = healthData;
    
    let prompt = `Based on the following health data, provide specific, actionable recommendations:\n\n`;
    
    if (summary) {
      prompt += `Current Averages:\n`;
      prompt += `- Sleep Score: ${summary.averageSleepScore.toFixed(1)}/100\n`;
      prompt += `- Activity Score: ${summary.averageActivityScore.toFixed(1)}/100\n`;
      prompt += `- Readiness Score: ${summary.averageReadinessScore.toFixed(1)}/100\n\n`;
    }
    
    if (sleep?.length) {
      const recentSleep = sleep.slice(-3);
      prompt += `Recent Sleep Patterns:\n`;
      recentSleep.forEach(day => {
        prompt += `- ${day.day}: ${day.score}/100 score, ${day.sleep_duration}hrs, ${day.sleep_efficiency}% efficiency\n`;
      });
    }
    
    prompt += `\nPlease provide 3-5 specific, actionable recommendations for improving health metrics. Focus on practical steps that can be implemented immediately.`;
    
    return prompt;
  }

  buildTrendsPrompt(healthData) {
    const { sleep, activity, readiness } = healthData;
    
    let prompt = `Analyze the following health data for trends and patterns:\n\n`;
    
    if (sleep?.length) {
      prompt += `Sleep Trends (${sleep.length} days):\n`;
      sleep.forEach(day => {
        prompt += `- ${day.day}: Score ${day.score_sleep}, Duration ${day.sleep_duration}hrs, Efficiency ${day.sleep_efficiency}%\n`;
      });
    }
    
    if (activity?.length) {
      prompt += `\nActivity Trends (${activity.length} days):\n`;
      activity.forEach(day => {
        prompt += `- ${day.day}: Score ${day.score_activity}, Steps ${day.steps}, Calories ${day.calories}\n`;
      });
    }
    
    if (readiness?.length) {
      prompt += `\nReadiness Trends (${readiness.length} days):\n`;
      readiness.forEach(day => {
        prompt += `- ${day.day}: Score ${day.score_readiness}, HRV ${day.hrv_rmssd}ms\n`;
      });
    }
    
    prompt += `\nIdentify key trends, patterns, and correlations in this data. Focus on meaningful insights that could impact health outcomes.`;
    
    return prompt;
  }
}

module.exports = new AIService();

