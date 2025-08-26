const express = require('express');
const router = express.Router();
const aiService = require('../services/aiService');
const ouraService = require('../services/ouraService');

// Analyze health data with AI
router.post('/analyze', async (req, res) => {
  try {
    const { start_date, end_date, analysis_type = 'general' } = req.body;
    
    // Get health data from Oura
    const healthData = await ouraService.getHealthSummary(start_date, end_date);
    
    // Analyze with AI
    const analysis = await aiService.analyzeHealthData(healthData, analysis_type);
    
    res.json(analysis);
  } catch (error) {
    console.error('Error analyzing health data:', error);
    res.status(500).json({ error: 'Failed to analyze health data' });
  }
});

// Generate health recommendations
router.post('/recommendations', async (req, res) => {
  try {
    const { start_date, end_date } = req.body;
    
    // Get health data from Oura
    const healthData = await ouraService.getHealthSummary(start_date, end_date);
    
    // Generate recommendations
    const recommendations = await aiService.generateHealthRecommendations(healthData);
    
    res.json(recommendations);
  } catch (error) {
    console.error('Error generating recommendations:', error);
    res.status(500).json({ error: 'Failed to generate recommendations' });
  }
});

// Detect health trends
router.post('/trends', async (req, res) => {
  try {
    const { start_date, end_date } = req.body;
    
    // Get health data from Oura
    const healthData = await ouraService.getHealthSummary(start_date, end_date);
    
    // Detect trends
    const trends = await aiService.detectHealthTrends(healthData);
    
    res.json(trends);
  } catch (error) {
    console.error('Error detecting trends:', error);
    res.status(500).json({ error: 'Failed to detect trends' });
  }
});

// Comprehensive health insights
router.post('/insights', async (req, res) => {
  try {
    const { start_date, end_date } = req.body;
    
    // Get health data from Oura
    const healthData = await ouraService.getHealthSummary(start_date, end_date);
    
    // Generate comprehensive insights
    const [analysis, recommendations, trends] = await Promise.all([
      aiService.analyzeHealthData(healthData, 'general'),
      aiService.generateHealthRecommendations(healthData),
      aiService.detectHealthTrends(healthData)
    ]);
    
    res.json({
      analysis,
      recommendations,
      trends,
      healthData: healthData.summary,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error generating insights:', error);
    res.status(500).json({ error: 'Failed to generate insights' });
  }
});

// Analyze specific health aspect
router.post('/analyze/:aspect', async (req, res) => {
  try {
    const { aspect } = req.params;
    const { start_date, end_date } = req.body;
    
    // Validate aspect
    const validAspects = ['sleep', 'activity', 'recovery', 'general'];
    if (!validAspects.includes(aspect)) {
      return res.status(400).json({ error: 'Invalid aspect. Must be sleep, activity, recovery, or general' });
    }
    
    // Get health data from Oura
    const healthData = await ouraService.getHealthSummary(start_date, end_date);
    
    // Analyze specific aspect
    const analysis = await aiService.analyzeHealthData(healthData, aspect);
    
    res.json(analysis);
  } catch (error) {
    console.error('Error analyzing health aspect:', error);
    res.status(500).json({ error: 'Failed to analyze health aspect' });
  }
});

module.exports = router;

