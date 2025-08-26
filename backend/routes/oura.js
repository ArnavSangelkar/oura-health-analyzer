const express = require('express');
const router = express.Router();
const ouraService = require('../services/ouraService');

// Get user profile
router.get('/profile', async (req, res) => {
  try {
    const profile = await ouraService.getUserProfile();
    res.json(profile);
  } catch (error) {
    console.error('Error fetching Oura profile:', error);
    res.status(500).json({ error: 'Failed to fetch profile data' });
  }
});

// Get sleep data
router.get('/sleep', async (req, res) => {
  try {
    const { start_date, end_date } = req.query;
    const sleepData = await ouraService.getSleepData(start_date, end_date);
    res.json(sleepData);
  } catch (error) {
    console.error('Error fetching sleep data:', error);
    res.status(500).json({ error: 'Failed to fetch sleep data' });
  }
});

// Get detailed sleep data
router.get('/sleep/detailed', async (req, res) => {
  try {
    const { start_date, end_date } = req.query;
    const detailedSleepData = await ouraService.getDetailedSleepData(start_date, end_date);
    res.json(detailedSleepData);
  } catch (error) {
    console.error('Error fetching detailed sleep data:', error);
    res.status(500).json({ error: 'Failed to fetch detailed sleep data' });
  }
});

// Get daily sleep scores
router.get('/sleep/scores', async (req, res) => {
  try {
    const { start_date, end_date } = req.query;
    const dailySleepScores = await ouraService.getDailySleepScores(start_date, end_date);
    res.json(dailySleepScores);
  } catch (error) {
    console.error('Error fetching daily sleep scores:', error);
    res.status(500).json({ error: 'Failed to fetch daily sleep scores' });
  }
});

// Get activity data
router.get('/activity', async (req, res) => {
  try {
    const { start_date, end_date } = req.query;
    const activityData = await ouraService.getActivityData(start_date, end_date);
    res.json(activityData);
  } catch (error) {
    console.error('Error fetching activity data:', error);
    res.status(500).json({ error: 'Failed to fetch activity data' });
  }
});

// Get readiness data
router.get('/readiness', async (req, res) => {
  try {
    const { start_date, end_date } = req.query;
    const readinessData = await ouraService.getReadinessData(start_date, end_date);
    res.json(readinessData);
  } catch (error) {
    console.error('Error fetching readiness data:', error);
    res.status(500).json({ error: 'Failed to fetch readiness data' });
  }
});

// Get heart rate data
router.get('/heart-rate', async (req, res) => {
  try {
    const { start_date, end_date } = req.query;
    const heartRateData = await ouraService.getHeartRateData(start_date, end_date);
    res.json(heartRateData);
  } catch (error) {
    console.error('Error fetching heart rate data:', error);
    res.status(500).json({ error: 'Failed to fetch heart rate data' });
  }
});

// Get all health data summary
router.get('/summary', async (req, res) => {
  try {
    const { start_date, end_date } = req.query;
    const summary = await ouraService.getHealthSummary(start_date, end_date);
    res.json(summary);
  } catch (error) {
    console.error('Error fetching health summary:', error);
    res.status(500).json({ error: 'Failed to fetch health summary' });
  }
});

// Get latest data
router.get('/latest', async (req, res) => {
  try {
    const latestData = await ouraService.getLatestData();
    res.json(latestData);
  } catch (error) {
    console.error('Error fetching latest data:', error);
    res.status(500).json({ error: 'Failed to fetch latest data' });
  }
});

// Get SpO2 data
router.get('/spo2', async (req, res) => {
  try {
    const { start_date, end_date } = req.query;
    const spo2Data = await ouraService.getSpO2Data(start_date, end_date);
    res.json(spo2Data);
  } catch (error) {
    console.error('Error fetching SpO2 data:', error);
    res.status(500).json({ error: 'Failed to fetch SpO2 data' });
  }
});

// Get stress data
router.get('/stress', async (req, res) => {
  try {
    const { start_date, end_date } = req.query;
    const stressData = await ouraService.getStressData(start_date, end_date);
    res.json(stressData);
  } catch (error) {
    console.error('Error fetching stress data:', error);
    res.status(500).json({ error: 'Failed to fetch stress data' });
  }
});

// Get resilience data
router.get('/resilience', async (req, res) => {
  try {
    const { start_date, end_date } = req.query;
    const resilienceData = await ouraService.getResilienceData(start_date, end_date);
    res.json(resilienceData);
  } catch (error) {
    console.error('Error fetching resilience data:', error);
    res.status(500).json({ error: 'Failed to fetch resilience data' });
  }
});

// Get cardiovascular age data
router.get('/cardiovascular-age', async (req, res) => {
  try {
    const { start_date, end_date } = req.query;
    const cardiovascularAgeData = await ouraService.getCardiovascularAgeData(start_date, end_date);
    res.json(cardiovascularAgeData);
  } catch (error) {
    console.error('Error fetching cardiovascular age data:', error);
    res.status(500).json({ error: 'Failed to fetch cardiovascular age data' });
  }
});

// Get VO2 max data
router.get('/vo2max', async (req, res) => {
  try {
    const { start_date, end_date } = req.query;
    const vo2maxData = await ouraService.getVO2MaxData(start_date, end_date);
    res.json(vo2maxData);
  } catch (error) {
    console.error('Error fetching VO2 max data:', error);
    res.status(500).json({ error: 'Failed to fetch VO2 max data' });
  }
});

// Get workout data
router.get('/workout', async (req, res) => {
  try {
    const { start_date, end_date } = req.query;
    const workoutData = await ouraService.getWorkoutData(start_date, end_date);
    res.json(workoutData);
  } catch (error) {
    console.error('Error fetching workout data:', error);
    res.status(500).json({ error: 'Failed to fetch workout data' });
  }
});

// Get session data
router.get('/session', async (req, res) => {
  try {
    const { start_date, end_date } = req.query;
    const sessionData = await ouraService.getSessionData(start_date, end_date);
    res.json(sessionData);
  } catch (error) {
    console.error('Error fetching session data:', error);
    res.status(500).json({ error: 'Failed to fetch session data' });
  }
});

module.exports = router;
