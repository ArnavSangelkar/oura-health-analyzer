import { createClient } from '@supabase/supabase-js';

// Temporary hardcoded values until environment variables are properly configured
const supabaseUrl = 'https://lgjjzpgnrjzbdcxh.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxnamp6cGducmp6YmRjeGJrY3hoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYxNzIzMzksImV4cCI6MjA3MTc0ODMzOX0.FOnIUD0qdWNicrtxv82qXV0K6w45bgMQLlYmPhQXVAw';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Helper function to get auth headers for Edge Functions
const getAuthHeaders = async () => {
  const { data: { session } } = await supabase.auth.getSession();
  return {
    'Authorization': `Bearer ${session?.access_token}`,
    'apikey': supabaseAnonKey,
    'Content-Type': 'application/json'
  };
};

// Oura API functions using Supabase Edge Functions
export const ouraApi = {
  // Get latest health data
  async getLatestData() {
    const headers = await getAuthHeaders();
    const response = await fetch(`${supabaseUrl}/functions/v1/oura-service/latest`, { headers });
    if (!response.ok) throw new Error('Failed to fetch latest data');
    return response.json();
  },

  // Get health summary
  async getHealthSummary(startDate: string, endDate: string) {
    const headers = await getAuthHeaders();
    const response = await fetch(
      `${supabaseUrl}/functions/v1/oura-service/summary?start_date=${startDate}&end_date=${endDate}`,
      { headers }
    );
    if (!response.ok) throw new Error('Failed to fetch health summary');
    return response.json();
  },

  // Get sleep data
  async getSleepData(startDate: string, endDate: string) {
    const headers = await getAuthHeaders();
    const response = await fetch(
      `${supabaseUrl}/functions/v1/oura-service/sleep?start_date=${startDate}&end_date=${endDate}`,
      { headers }
    );
    if (!response.ok) throw new Error('Failed to fetch sleep data');
    return response.json();
  },

  // Get activity data
  async getActivityData(startDate: string, endDate: string) {
    const headers = await getAuthHeaders();
    const response = await fetch(
      `${supabaseUrl}/functions/v1/oura-service/activity?start_date=${startDate}&end_date=${endDate}`,
      { headers }
    );
    if (!response.ok) throw new Error('Failed to fetch activity data');
    return response.json();
  },

  // Get readiness data
  async getReadinessData(startDate: string, endDate: string) {
    const headers = await getAuthHeaders();
    const response = await fetch(
      `${supabaseUrl}/functions/v1/oura-service/readiness?start_date=${startDate}&end_date=${endDate}`,
      { headers }
    );
    if (!response.ok) throw new Error('Failed to fetch readiness data');
    return response.json();
  }
};

// AI insights API using Supabase Edge Functions
export const aiApi = {
  async generateInsight(insightType: string, healthData: any, customQuestion?: string) {
    const headers = await getAuthHeaders();
    const body: any = { insightType, healthData };
    
    // Add custom question if provided
    if (customQuestion) {
      body.customQuestion = customQuestion;
    }
    
    const response = await fetch(`${supabaseUrl}/functions/v1/ai-insights`, {
      method: 'POST',
      headers,
      body: JSON.stringify(body)
    });
    if (!response.ok) throw new Error('Failed to generate insight');
    return response.json();
  }
};

// Auth API using Supabase
export const authApi = {
  async getProfile() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');
    
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();
    
    if (error) throw error;
    return { user, profile };
  },

  async updateOuraToken(ouraToken: string) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { error } = await supabase
      .from('profiles')
      .upsert({
        id: user.id,
        oura_token: ouraToken,
        updated_at: new Date().toISOString()
      });

    if (error) throw error;
    return { success: true };
  }
};

