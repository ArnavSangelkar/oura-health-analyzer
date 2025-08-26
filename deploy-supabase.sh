#!/bin/bash

echo "🚀 Deploying Oura Health Analyzer to Supabase..."

# Check if Supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    echo "❌ Supabase CLI not found. Please install it first:"
    echo "   npm install -g supabase"
    exit 1
fi

# Check if we're in the right directory
if [ ! -f "supabase/config.toml" ]; then
    echo "❌ Please run this script from the project root directory"
    exit 1
fi

# Build the frontend
echo "📦 Building frontend..."
cd frontend
npm run build
cd ..

# Deploy to Supabase
echo "🌐 Deploying to Supabase..."
supabase db push
supabase functions deploy

echo "✅ Deployment complete!"
echo ""
echo "🔗 Your Supabase project is now live!"
echo "📱 Frontend: Deploy to Vercel/Netlify or use Supabase Hosting"
echo "🔧 Backend: Edge Functions are now active"
echo "🗄️  Database: Schema has been applied"
echo ""
echo "📋 Next steps:"
echo "1. Set up environment variables in Supabase dashboard"
echo "2. Deploy frontend to your preferred hosting platform"
echo "3. Update frontend API endpoints to use Supabase Edge Functions"
echo "4. Test the application!"
