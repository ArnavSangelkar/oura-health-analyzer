import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Create Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Get user from auth header
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'No authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Get request body
    const { insightType, healthData, customQuestion } = await req.json()

    if (!insightType || !healthData) {
      return new Response(
        JSON.stringify({ error: 'Missing insightType or healthData' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Get OpenAI API key
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY')
    if (!openaiApiKey) {
      return new Response(
        JSON.stringify({ error: 'OpenAI API key not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Generate AI insight
    const insight = await generateInsight(openaiApiKey, insightType, healthData, customQuestion)

    // Store insight in database
    const { error: insertError } = await supabase
      .from('ai_insights')
      .insert({
        user_id: user.id,
        insight_type: insightType,
        content: insight
      })

    if (insertError) {
      console.error('Error storing insight:', insertError)
    }

    return new Response(
      JSON.stringify({ insight }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})

async function generateInsight(apiKey: string, insightType: string, healthData: any, customQuestion?: string): Promise<string> {
  const prompt = createPrompt(insightType, healthData, customQuestion)

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: `You are a health and recovery assistant that analyzes Oura Ring data. Focus on trends, anomalies, and actionable insights.

Your responsibilities:
1. Flag significant changes or trends (e.g., "HRV dropped 20% from baseline")
2. Connect patterns with possible causes (e.g., late bedtime, intense workout, alcohol, travel)
3. Provide practical, goal-aligned recommendations (e.g., suggest recovery day, adjust bedtime, hydrate more, mindfulness for stress)
4. Keep explanations clear and motivational, avoiding medical diagnoses

Be encouraging, specific, and actionable in your advice. Focus on patterns and trends that can help improve health outcomes.`
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      max_tokens: 500,
      temperature: 0.7
    })
  })

  if (!response.ok) {
    throw new Error(`OpenAI API error: ${response.status}`)
  }

  const data = await response.json()
  return data.choices[0].message.content
}

function createPrompt(insightType: string, healthData: any, customQuestion?: string): string {
  const basePrompt = `Analyze the following Oura Ring health data focusing on trends, anomalies, and actionable insights. Look for significant changes, patterns, and connections that can inform health decisions.`

  // Extract the most recent data for each category
  const latestSleep = healthData.sleep && healthData.sleep.length > 0 ? healthData.sleep[0] : null;
  const latestActivity = healthData.activity && healthData.activity.length > 0 ? healthData.activity[0] : null;
  const latestReadiness = healthData.readiness && healthData.readiness.length > 0 ? healthData.readiness[0] : null;
  const summary = healthData.summary || {};

  // Calculate trends by comparing recent vs older data
  const sleepTrend = healthData.sleep && healthData.sleep.length > 1 ? 
    (latestSleep?.score || 0) - (healthData.sleep[1]?.score || 0) : 0;
  const activityTrend = healthData.activity && healthData.activity.length > 1 ? 
    (latestActivity?.score || 0) - (healthData.activity[1]?.score || 0) : 0;
  const readinessTrend = healthData.readiness && healthData.readiness.length > 1 ? 
    (latestReadiness?.score || 0) - (healthData.readiness[1]?.score || 0) : 0;

  // Handle custom questions
  if (insightType === 'custom' && customQuestion) {
    return `${basePrompt}

User's Specific Question: "${customQuestion}"

Health Data Context:
- Sleep Records: ${healthData.sleep ? healthData.sleep.length : 0} entries
- Activity Records: ${healthData.activity ? healthData.activity.length : 0} entries
- Readiness Records: ${healthData.readiness ? healthData.readiness.length : 0} entries

Latest Data & Trends:
- Sleep Score: ${latestSleep?.score || 'N/A'}/100 (${sleepTrend > 0 ? '+' : ''}${sleepTrend} from previous day)
- Activity Score: ${latestActivity?.score || 'N/A'}/100 (${activityTrend > 0 ? '+' : ''}${activityTrend} from previous day)
- Readiness Score: ${latestReadiness?.score || 'N/A'}/100 (${readinessTrend > 0 ? '+' : ''}${readinessTrend} from previous day)

Period Averages:
- Average Sleep Score: ${summary.averageSleepScore || 'N/A'}/100
- Average Activity Score: ${summary.averageActivityScore || 'N/A'}/100
- Average Readiness Score: ${summary.averageReadinessScore || 'N/A'}/100

Please provide a detailed, personalized answer to the user's specific question based on their health data. Focus on:
1. Identifying any significant changes or trends
2. Connecting patterns with possible causes
3. Providing practical, actionable recommendations
4. Keeping advice motivational and clear`
  }

  switch (insightType) {
    case 'sleep':
      return `${basePrompt}

Sleep Data Analysis:
- Current Sleep Score: ${latestSleep?.score || 'N/A'}/100
- Score Trend: ${sleepTrend > 0 ? '+' : ''}${sleepTrend} from previous day
- Total Sleep: ${latestSleep?.total_sleep_duration ? (latestSleep.total_sleep_duration / 3600).toFixed(1) + ' hours' : 'N/A'}
- Deep Sleep: ${latestSleep?.deep_sleep_duration ? (latestSleep.deep_sleep_duration / 3600).toFixed(1) + ' hours' : 'N/A'}
- REM Sleep: ${latestSleep?.rem_sleep_duration ? (latestSleep.rem_sleep_duration / 3600).toFixed(1) + ' hours' : 'N/A'}
- Sleep Efficiency: ${latestSleep?.efficiency || 'N/A'}%
- Average Sleep Score (Period): ${summary.averageSleepScore || 'N/A'}/100

Focus on:
1. Sleep quality trends and changes
2. Factors affecting sleep (timing, duration, efficiency)
3. Practical recommendations for improvement
4. Recovery optimization strategies`

    case 'activity':
      return `${basePrompt}

Activity Data Analysis:
- Current Activity Score: ${latestActivity?.score || 'N/A'}/100
- Score Trend: ${activityTrend > 0 ? '+' : ''}${activityTrend} from previous day
- Steps: ${latestActivity?.steps?.toLocaleString() || 'N/A'}
- Calories Burned: ${latestActivity?.total_calories?.toLocaleString() || 'N/A'}
- Active Calories: ${latestActivity?.active_calories?.toLocaleString() || 'N/A'}
- Rest Time: ${latestActivity?.resting_time ? (latestActivity.resting_time / 3600).toFixed(1) + ' hours' : 'N/A'}
- Average Activity Score (Period): ${summary.averageActivityScore || 'N/A'}/100
- Total Steps (Period): ${summary.totalSteps?.toLocaleString() || 'N/A'}
- Total Calories (Period): ${summary.totalCalories?.toLocaleString() || 'N/A'}

Focus on:
1. Activity level trends and patterns
2. Energy expenditure and recovery balance
3. Practical recommendations for fitness improvement
4. Workout timing and intensity optimization`

    case 'readiness':
      return `${basePrompt}

Readiness Data Analysis:
- Current Readiness Score: ${latestReadiness?.score || 'N/A'}/100
- Score Trend: ${readinessTrend > 0 ? '+' : ''}${readinessTrend} from previous day
- Resting Heart Rate: ${latestReadiness?.contributors?.resting_heart_rate || 'N/A'} bpm
- HRV RMSSD: ${latestReadiness?.contributors?.hrv_rmssd || 'N/A'} ms
- Temperature Deviation: ${latestReadiness?.contributors?.temperature_deviation || 'N/A'}°C
- Average Readiness Score (Period): ${summary.averageReadinessScore || 'N/A'}/100

Focus on:
1. Recovery status and readiness trends
2. Stress and recovery balance indicators
3. Practical recommendations for recovery optimization
4. Training load and rest day planning`

    case 'general':
      return `${basePrompt}

Overall Health Summary:
Latest Scores & Trends:
- Sleep: ${latestSleep?.score || 'N/A'}/100 (${sleepTrend > 0 ? '+' : ''}${sleepTrend})
- Activity: ${latestActivity?.score || 'N/A'}/100 (${activityTrend > 0 ? '+' : ''}${activityTrend})
- Readiness: ${latestReadiness?.score || 'N/A'}/100 (${readinessTrend > 0 ? '+' : ''}${readinessTrend})

Period Averages:
- Sleep: ${summary.averageSleepScore || 'N/A'}/100
- Activity: ${summary.averageActivityScore || 'N/A'}/100
- Readiness: ${summary.averageReadinessScore || 'N/A'}/100

Activity Totals:
- Steps: ${summary.totalSteps?.toLocaleString() || 'N/A'}
- Calories: ${summary.totalCalories?.toLocaleString() || 'N/A'}

Data Coverage:
- Sleep: ${summary.dataPoints?.sleep || 0} data points
- Activity: ${summary.dataPoints?.activity || 0} data points
- Readiness: ${summary.dataPoints?.readiness || 0} data points

Focus on:
1. Overall health trends and patterns
2. Connections between sleep, activity, and recovery
3. Holistic recommendations for improvement
4. Goal-aligned health optimization strategies`

    default:
      return `${basePrompt}

Health Data Structure:
- Sleep Records: ${healthData.sleep ? healthData.sleep.length : 0} entries
- Activity Records: ${healthData.activity ? healthData.activity.length : 0} entries
- Readiness Records: ${healthData.readiness ? healthData.readiness.length : 0} entries

Summary Data: ${JSON.stringify(summary, null, 2)}

Focus on:
1. Identifying key trends and patterns
2. Connecting data points to lifestyle factors
3. Providing actionable health recommendations
4. Supporting recovery and performance goals`
  }
}
