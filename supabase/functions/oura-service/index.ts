import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface OuraData {
  day: string
  score?: number
  total_sleep_duration?: number
  deep_sleep_duration?: number
  rem_sleep_duration?: number
  light_sleep_duration?: number
  efficiency?: number
  steps?: number
  total_calories?: number
  active_calories?: number
  resting_time?: number
  sedentary_time?: number
  active_time?: number
  target_calories?: number
  resting_heart_rate?: number
  hrv_rmssd?: number
  temperature_deviation?: number
  raw_data?: any
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

    // Get user's Oura token
    const { data: profile } = await supabase
      .from('profiles')
      .select('oura_token')
      .eq('id', user.id)
      .single()

    if (!profile?.oura_token) {
      return new Response(
        JSON.stringify({ error: 'Oura token not configured' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const url = new URL(req.url)
    const path = url.pathname.split('/').pop()
    const startDate = url.searchParams.get('start_date')
    const endDate = url.searchParams.get('end_date')

    let data: any = null

    switch (path) {
      case 'latest':
        data = await getLatestData(profile.oura_token, startDate, endDate)
        break
      case 'summary':
        data = await getHealthSummary(profile.oura_token, startDate, endDate)
        break
      case 'sleep':
        data = await getSleepData(profile.oura_token, startDate, endDate)
        break
      case 'activity':
        data = await getActivityData(profile.oura_token, startDate, endDate)
        break
      case 'readiness':
        data = await getReadinessData(profile.oura_token, startDate, endDate)
        break
      default:
        return new Response(
          JSON.stringify({ error: 'Invalid endpoint' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
    }

    // Store data in Supabase
    await storeData(supabase, user.id, data, path)

    return new Response(
      JSON.stringify(data),
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

async function getLatestData(ouraToken: string, startDate?: string | null, endDate?: string | null): Promise<any> {
  const yesterday = startDate || new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  const today = endDate || new Date().toISOString().split('T')[0]

  const [sleep, activity, readiness, dailySleepScores] = await Promise.all([
    getSleepData(ouraToken, yesterday, today),
    getActivityData(ouraToken, yesterday, today),
    getReadinessData(ouraToken, yesterday, today),
    getDailySleepScores(ouraToken, yesterday, today)
  ])

  return {
    sleep: {
      ...sleep.data?.[0],
      score: dailySleepScores.data?.[0]?.score || null
    } || null,
    activity: activity.data?.[0] || null,
    readiness: readiness.data?.[0] || null,
    timestamp: new Date().toISOString()
  }
}

async function getHealthSummary(ouraToken: string, startDate?: string | null, endDate?: string | null): Promise<any> {
  const [sleep, activity, readiness, dailySleepScores] = await Promise.all([
    getSleepData(ouraToken, startDate, endDate),
    getActivityData(ouraToken, startDate, endDate),
    getReadinessData(ouraToken, startDate, endDate),
    getDailySleepScores(ouraToken, startDate, endDate)
  ])

  // Combine sleep data with scores and deduplicate by day
  const sleepWithScores = (sleep.data || [])
    .map(sleepItem => {
      const scoreItem = (dailySleepScores.data || []).find(scoreItem => scoreItem.day === sleepItem.day)
      return {
        ...sleepItem,
        score: scoreItem?.score || null
      }
    })
    .reduce((acc, current) => {
      const existing = acc.find(item => item.day === current.day)
      if (!existing || current.total_sleep_duration > existing.total_sleep_duration) {
        return acc.filter(item => item.day !== current.day).concat(current)
      }
      return acc
    }, [] as any[])

  return {
    sleep: sleepWithScores,
    activity: activity.data || [],
    readiness: readiness.data || [],
    summary: calculateSummary(sleepWithScores, activity.data, readiness.data)
  }
}

async function getSleepData(ouraToken: string, startDate?: string | null, endDate?: string | null): Promise<any> {
  const params = new URLSearchParams()
  if (startDate) params.append('start_date', startDate)
  if (endDate) params.append('end_date', endDate)

  const response = await fetch(`https://api.ouraring.com/v2/usercollection/sleep?${params.toString()}`, {
    headers: {
      'Authorization': `Bearer ${ouraToken}`,
      'Content-Type': 'application/json'
    }
  })

  if (!response.ok) {
    throw new Error(`Oura API error: ${response.status}`)
  }

  return await response.json()
}

async function getActivityData(ouraToken: string, startDate?: string | null, endDate?: string | null): Promise<any> {
  const params = new URLSearchParams()
  if (startDate) params.append('start_date', startDate)
  if (endDate) params.append('end_date', endDate)

  const response = await fetch(`https://api.ouraring.com/v2/usercollection/daily_activity?${params.toString()}`, {
    headers: {
      'Authorization': `Bearer ${ouraToken}`,
      'Content-Type': 'application/json'
    }
  })

  if (!response.ok) {
    throw new Error(`Oura API error: ${response.status}`)
  }

  return await response.json()
}

async function getReadinessData(ouraToken: string, startDate?: string | null, endDate?: string | null): Promise<any> {
  const params = new URLSearchParams()
  if (startDate) params.append('start_date', startDate)
  if (endDate) params.append('end_date', endDate)

  const response = await fetch(`https://api.ouraring.com/v2/usercollection/daily_readiness?${params.toString()}`, {
    headers: {
      'Authorization': `Bearer ${ouraToken}`,
      'Content-Type': 'application/json'
    }
  })

  if (!response.ok) {
    throw new Error(`Oura API error: ${response.status}`)
  }

  return await response.json()
}

async function getDailySleepScores(ouraToken: string, startDate?: string | null, endDate?: string | null): Promise<any> {
  const params = new URLSearchParams()
  if (startDate) params.append('start_date', startDate)
  if (endDate) params.append('end_date', endDate)

  const response = await fetch(`https://api.ouraring.com/v2/usercollection/daily_sleep?${params.toString()}`, {
    headers: {
      'Authorization': `Bearer ${ouraToken}`,
      'Content-Type': 'application/json'
    }
  })

  if (!response.ok) {
    throw new Error(`Oura API error: ${response.status}`)
  }

  return await response.json()
}

function calculateSummary(sleep: any[], activity: any[], readiness: any[]): any {
  const averageSleepScore = sleep.length > 0 
    ? Math.round(sleep.reduce((sum, day) => sum + (day.score || 0), 0) / sleep.length)
    : null

  const averageActivityScore = activity.length > 0
    ? Math.round(activity.reduce((sum, day) => sum + (day.score || 0), 0) / activity.length)
    : null

  const averageReadinessScore = readiness.length > 0
    ? Math.round(readiness.reduce((sum, day) => sum + (day.score || 0), 0) / readiness.length)
    : null

  const totalSteps = activity.reduce((sum, day) => sum + (day.steps || 0), 0)
  const totalCalories = activity.reduce((sum, day) => sum + (day.total_calories || 0), 0)

  return {
    averageSleepScore,
    averageActivityScore,
    averageReadinessScore,
    totalSteps,
    totalCalories,
    dataPoints: {
      sleep: sleep.length,
      activity: activity.length,
      readiness: readiness.length
    }
  }
}

async function storeData(supabase: any, userId: string, data: any, dataType: string): Promise<void> {
  if (!data || !data.data) return

  const tableMap: { [key: string]: string } = {
    'sleep': 'sleep_data',
    'activity': 'activity_data',
    'readiness': 'readiness_data'
  }

  const table = tableMap[dataType]
  if (!table) return

  for (const item of data.data) {
    const processedData: OuraData = {
      day: item.day,
      raw_data: item
    }

    // Map fields based on data type
    switch (dataType) {
      case 'sleep':
        processedData.score = item.score
        processedData.total_sleep_duration = item.total_sleep_duration
        processedData.deep_sleep_duration = item.deep_sleep_duration
        processedData.rem_sleep_duration = item.rem_sleep_duration
        processedData.light_sleep_duration = item.light_sleep_duration
        processedData.efficiency = item.efficiency
        processedData.latency = item.latency
        processedData.type = item.type
        break
      case 'activity':
        processedData.score = item.score
        processedData.steps = item.steps
        processedData.total_calories = item.total_calories
        processedData.active_calories = item.active_calories
        processedData.resting_time = item.resting_time
        processedData.sedentary_time = item.sedentary_time
        processedData.active_time = item.active_time
        processedData.target_calories = item.target_calories
        break
      case 'readiness':
        processedData.score = item.score
        processedData.resting_heart_rate = item.contributors?.resting_heart_rate
        processedData.hrv_rmssd = item.contributors?.hrv_rmssd
        processedData.temperature_deviation = item.contributors?.temperature_deviation
        break
    }

    // Upsert data
    await supabase
      .from(table)
      .upsert({
        user_id: userId,
        ...processedData
      }, {
        onConflict: 'user_id,day'
      })
  }
}
