import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || 'https://lgjjzpgnrjzbdcxbkcxh.supabase.co'
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxnamp6cGducmp6YmRjeGJrY3hoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYxNzIzMzksImV4cCI6MjA3MTc0ODMzOX0.FOnIUD0qdWNicrtxv82qXVdK6w45bgMQLlYmPhQXVAw'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// API base URL for Supabase Edge Functions
export const API_BASE_URL = `${supabaseUrl}/functions/v1`

// Helper function to get auth headers
const getAuthHeaders = async () => {
  const { data: { session } } = await supabase.auth.getSession()
  return {
    'Authorization': `Bearer ${session?.access_token}`,
    'apikey': supabaseAnonKey,
    'Content-Type': 'application/json'
  }
}

// Oura API functions
export const ouraApi = {
  // Get latest health data
  async getLatestData() {
    const headers = await getAuthHeaders()
    const response = await fetch(`${API_BASE_URL}/oura-service/latest`, { headers })
    if (!response.ok) throw new Error('Failed to fetch latest data')
    return response.json()
  },

  // Get health summary
  async getHealthSummary(startDate: string, endDate: string) {
    const headers = await getAuthHeaders()
    const response = await fetch(
      `${API_BASE_URL}/oura-service/summary?start_date=${startDate}&end_date=${endDate}`,
      { headers }
    )
    if (!response.ok) throw new Error('Failed to fetch health summary')
    return response.json()
  },

  // Get sleep data
  async getSleepData(startDate: string, endDate: string) {
    const headers = await getAuthHeaders()
    const response = await fetch(
      `${API_BASE_URL}/oura-service/sleep?start_date=${startDate}&end_date=${endDate}`,
      { headers }
    )
    if (!response.ok) throw new Error('Failed to fetch sleep data')
    return response.json()
  },

  // Get activity data
  async getActivityData(startDate: string, endDate: string) {
    const headers = await getAuthHeaders()
    const response = await fetch(
      `${API_BASE_URL}/oura-service/activity?start_date=${startDate}&end_date=${endDate}`,
      { headers }
    )
    if (!response.ok) throw new Error('Failed to fetch activity data')
    return response.json()
  },

  // Get readiness data
  async getReadinessData(startDate: string, endDate: string) {
    const headers = await getAuthHeaders()
    const response = await fetch(
      `${API_BASE_URL}/oura-service/readiness?start_date=${startDate}&end_date=${endDate}`,
      { headers }
    )
    if (!response.ok) throw new Error('Failed to fetch readiness data')
    return response.json()
  }
}

// AI insights API
export const aiApi = {
  async generateInsight(insightType: string, healthData: any, customQuestion?: string) {
    const headers = await getAuthHeaders()
    const body: any = { insightType, healthData }
    
    // Add custom question if provided
    if (customQuestion) {
      body.customQuestion = customQuestion
    }
    
    const response = await fetch(`${API_BASE_URL}/ai-insights`, {
      method: 'POST',
      headers,
      body: JSON.stringify(body)
    })
    if (!response.ok) throw new Error('Failed to generate insight')
    return response.json()
  }
}

// Auth API
export const authApi = {
  async getProfile() {
    const headers = await getAuthHeaders()
    const response = await fetch(`${API_BASE_URL}/auth/profile`, { headers })
    if (!response.ok) throw new Error('Failed to fetch profile')
    return response.json()
  },

  async updateOuraToken(ouraToken: string) {
    const headers = await getAuthHeaders()
    const response = await fetch(`${API_BASE_URL}/auth/update-oura-token`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ oura_token: ouraToken })
    })
    if (!response.ok) throw new Error('Failed to update Oura token')
    return response.json()
  }
}

