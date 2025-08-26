#!/bin/bash

echo "🚀 Deploying Oura Health Analyzer to Render"
echo "=============================================="

# Check if git is initialized
if [ ! -d ".git" ]; then
    echo "❌ Git repository not found. Initializing git..."
    git init
    git add .
    git commit -m "Initial commit for Render deployment"
fi

# Check if render CLI is installed
if ! command -v render &> /dev/null; then
    echo "📦 Installing Render CLI..."
    curl -sL https://render.com/download.sh | sh
    echo "✅ Render CLI installed"
else
    echo "✅ Render CLI already installed"
fi

echo ""
echo "🔧 Next Steps:"
echo "==============="
echo ""
echo "1. 📝 Create a Render account at: https://render.com"
echo ""
echo "2. 🔑 Login to Render CLI:"
echo "   render login"
echo ""
echo "3. 🚀 Deploy using one of these methods:"
echo ""
echo "   Method A - Using render.yaml (Recommended):"
echo "   render blueprint apply"
echo ""
echo "   Method B - Manual deployment:"
echo "   - Go to https://render.com/dashboard"
echo "   - Click 'New +' → 'Static Site'"
echo "   - Connect your GitHub repository"
echo "   - Set build command: cd frontend && npm install && npm run build"
echo "   - Set publish directory: frontend/build"
echo "   - Add environment variables:"
echo "     REACT_APP_SUPABASE_URL=https://lgjjzpgnrjzbdcxh.supabase.co"
echo "     REACT_APP_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxnamp6cGducmp6YmRjeGJrY3hoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYxNzIzMzksImV4cCI6MjA3MTc0ODMzOX0.FOnIUD0qdWNicrtxv82qXV0K6w45bgMQLlYmPhQXVAw"
echo ""
echo "4. 🌐 Your app will be available at: https://your-app-name.onrender.com"
echo ""
echo "5. 🔄 Enable auto-deploy from your main branch"
echo ""
echo "📚 For more details, visit: https://render.com/docs/deploy-create-a-static-site"
echo ""
echo "🎯 Ready to deploy? Run 'render login' to get started!"
