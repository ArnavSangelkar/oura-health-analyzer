const { createClient } = require('@supabase/supabase-js');

// Your Supabase configuration
const supabaseUrl = 'https://lgjjzpgnrjzbdcxbkcxh.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxnamp6cGducmp6YmRjeGJrY3hoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYxNzIzMzksImV4cCI6MjA3MTc0ODMzOX0.FOnIUD0qdWNicrtxv82qXVdK6w45bgMQLlYmPhQXVAw';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testSupabase() {
  console.log('🧪 Testing Supabase Connection...\n');

  try {
    // Test 1: Basic connection
    console.log('1️⃣ Testing basic connection...');
    const { data, error } = await supabase.from('profiles').select('count').limit(1);
    
    if (error) {
      console.log('❌ Database connection error:', error.message);
    } else {
      console.log('✅ Database connection successful');
    }

    // Test 2: Edge Functions availability
    console.log('\n2️⃣ Testing Edge Functions...');
    
    const functions = [
      'oura-service/latest',
      'oura-service/summary',
      'ai-insights',
      'auth/profile'
    ];

    for (const func of functions) {
      try {
        const response = await fetch(`${supabaseUrl}/functions/v1/${func}`, {
          headers: {
            'apikey': supabaseAnonKey,
            'Content-Type': 'application/json'
          }
        });
        
        if (response.status === 401) {
          console.log(`✅ ${func}: Function accessible (requires auth)`);
        } else if (response.status === 200) {
          console.log(`✅ ${func}: Function accessible`);
        } else {
          console.log(`⚠️  ${func}: Status ${response.status}`);
        }
      } catch (err) {
        console.log(`❌ ${func}: Error - ${err.message}`);
      }
    }

    // Test 3: Environment variables check
    console.log('\n3️⃣ Checking environment variables...');
    console.log('ℹ️  Make sure these are set in Supabase dashboard:');
    console.log('   - SUPABASE_URL');
    console.log('   - SUPABASE_SERVICE_ROLE_KEY');
    console.log('   - OPENAI_API_KEY');

    console.log('\n🎯 Next Steps:');
    console.log('1. Open http://localhost:3001 in your browser');
    console.log('2. Try to register/login (this will test auth)');
    console.log('3. Test the dashboard and health data pages');
    console.log('4. Check browser console for any errors');

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testSupabase();
