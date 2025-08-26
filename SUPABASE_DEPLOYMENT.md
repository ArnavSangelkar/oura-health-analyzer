# 🚀 Deploying Oura Health Analyzer to Supabase

This guide will walk you through deploying your Oura Health Analyzer application to Supabase, including the database, Edge Functions, and frontend deployment options.

## 📋 Prerequisites

1. **Supabase Account**: Sign up at [supabase.com](https://supabase.com)
2. **Supabase CLI**: Install globally with `npm install -g supabase`
3. **Node.js**: Version 18 or higher
4. **Git**: For version control

## 🗄️ Database Setup

### 1. Initialize Supabase Project

```bash
# Login to Supabase
supabase login

# Initialize the project (if not already done)
supabase init

# Link to your remote project
supabase link --project-ref YOUR_PROJECT_REF
```

### 2. Apply Database Schema

```bash
# Push the database schema
supabase db push
```

This will create:
- `profiles` table for user management
- `sleep_data` table for sleep metrics
- `activity_data` table for activity metrics
- `readiness_data` table for readiness metrics
- `ai_insights` table for AI-generated insights
- Row Level Security (RLS) policies
- Automatic user profile creation triggers

## 🔧 Edge Functions Deployment

### 1. Deploy All Functions

```bash
# Deploy all Edge Functions
supabase functions deploy
```

This deploys:
- **`oura-service`**: Handles Oura API calls and data processing
- **`ai-insights`**: Generates AI insights using OpenAI
- **`auth`**: Manages user profiles and Oura token updates

### 2. Set Environment Variables

In your Supabase dashboard, go to **Settings > Edge Functions** and set:

```bash
# Required
SUPABASE_URL=your_supabase_project_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
OPENAI_API_KEY=your_openai_api_key

# Optional (for additional features)
OURA_API_BASE_URL=https://api.ouraring.com/v2
```

## 🌐 Frontend Deployment

### Option 1: Vercel (Recommended)

1. **Connect Repository**:
   ```bash
   # Push your code to GitHub/GitLab
   git add .
   git commit -m "Add Supabase deployment configuration"
   git push origin main
   ```

2. **Deploy to Vercel**:
   - Go to [vercel.com](https://vercel.com)
   - Import your repository
   - Set environment variables:
     ```bash
     VITE_SUPABASE_URL=your_supabase_url
     VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
     ```

### Option 2: Netlify

1. **Build Command**: `npm run build`
2. **Publish Directory**: `frontend/build`
3. **Environment Variables**: Same as Vercel

### Option 3: Supabase Hosting

```bash
# Deploy to Supabase Hosting
supabase hosting deploy frontend/build
```

## 🔑 Authentication Setup

### 1. Enable Auth Providers

In Supabase dashboard, go to **Authentication > Providers** and enable:
- **Email**: For user registration/login
- **Google/GitHub**: Optional social login

### 2. Configure Auth Settings

- **Site URL**: Your frontend domain
- **Redirect URLs**: Add your frontend URLs
- **JWT Expiry**: Default 1 hour (configurable)

## 📱 Frontend Configuration Updates

### 1. Update API Configuration

Update `frontend/src/utils/api.ts`:

```typescript
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Update API endpoints to use Supabase Edge Functions
export const API_BASE_URL = `${supabaseUrl}/functions/v1`
```

### 2. Update API Calls

Replace existing API calls with Supabase Edge Functions:

```typescript
// Before (local backend)
const response = await fetch('/api/oura/latest')

// After (Supabase Edge Functions)
const response = await fetch(`${API_BASE_URL}/oura-service/latest`, {
  headers: {
    'Authorization': `Bearer ${session?.access_token}`,
    'apikey': supabaseAnonKey
  }
})
```

## 🧪 Testing Your Deployment

### 1. Test Database Connection

```bash
# Test local connection
supabase db reset

# Test remote connection
supabase db pull
```

### 2. Test Edge Functions

```bash
# Test locally
supabase functions serve

# Test deployed functions
curl -X POST "https://your-project.supabase.co/functions/v1/oura-service/latest" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### 3. Test Frontend

- Deploy frontend
- Test user registration/login
- Test Oura data fetching
- Test AI insights generation

## 🔍 Monitoring & Debugging

### 1. Supabase Dashboard

- **Database**: Monitor table data and performance
- **Edge Functions**: View function logs and execution times
- **Authentication**: Monitor user signups and logins
- **Storage**: Monitor file uploads (if using)

### 2. Function Logs

```bash
# View function logs
supabase functions logs --function-name oura-service
```

### 3. Database Queries

Use Supabase Studio to run SQL queries and monitor performance.

## 🚨 Common Issues & Solutions

### 1. CORS Errors

Ensure your Edge Functions have proper CORS headers:

```typescript
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}
```

### 2. Authentication Errors

- Verify JWT token is valid
- Check RLS policies are correct
- Ensure user profile exists

### 3. Environment Variables

- Verify all required variables are set
- Check variable names match exactly
- Restart Edge Functions after changes

## 📈 Performance Optimization

### 1. Database Indexes

The schema includes optimized indexes for:
- User-specific queries
- Date-based filtering
- Common data access patterns

### 2. Edge Function Optimization

- Use connection pooling
- Implement caching strategies
- Monitor function execution times

### 3. Frontend Optimization

- Implement lazy loading
- Use React.memo for expensive components
- Optimize bundle size

## 🔒 Security Considerations

### 1. Row Level Security (RLS)

- All tables have RLS enabled
- Users can only access their own data
- Service role key has full access (keep secure)

### 2. API Security

- JWT token validation
- Rate limiting (implement in Edge Functions)
- Input validation and sanitization

### 3. Environment Variables

- Never commit sensitive keys
- Use Supabase dashboard for secrets
- Rotate keys regularly

## 📚 Additional Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Edge Functions Guide](https://supabase.com/docs/guides/functions)
- [Database Schema Design](https://supabase.com/docs/guides/database)
- [Authentication Best Practices](https://supabase.com/docs/guides/auth)

## 🎯 Next Steps

After successful deployment:

1. **Monitor Performance**: Use Supabase analytics
2. **Scale Up**: Upgrade plan if needed
3. **Add Features**: Implement additional health metrics
4. **User Feedback**: Collect and implement improvements
5. **Backup Strategy**: Set up regular database backups

---

**Need Help?** Check the [Supabase Community](https://github.com/supabase/supabase/discussions) or create an issue in this repository.
