#!/bin/bash

echo "🚀 Frontend Deployment Options for Oura Health Analyzer"
echo ""

echo "📋 Current Status:"
echo "✅ Backend: Deployed to Supabase Edge Functions"
echo "✅ Database: Schema applied to Supabase"
echo "✅ Frontend: Built and ready for deployment"
echo ""

echo "🌐 Choose your deployment platform:"
echo ""
echo "1. Vercel (Recommended - Free tier available)"
echo "2. Netlify (Free tier available)"
echo "3. Supabase Hosting"
echo "4. Manual deployment"
echo ""

read -p "Enter your choice (1-4): " choice

case $choice in
  1)
    echo ""
    echo "🚀 Deploying to Vercel..."
    echo ""
    echo "📋 Steps:"
    echo "1. Push your code to GitHub:"
    echo "   git add ."
    echo "   git commit -m 'Supabase integration complete'"
    echo "   git push origin main"
    echo ""
    echo "2. Go to https://vercel.com and import your repository"
    echo ""
    echo "3. Set these environment variables:"
    echo "   REACT_APP_SUPABASE_URL=https://lgjjzpgnrjzbdcxbkcxh.supabase.co"
    echo "   REACT_APP_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxnamp6cGducmp6YmRjeGJrY3hoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYxNzIzMzksImV4cCI6MjA3MTc0ODMzOX0.FOnIUD0qdWNicrtxv82qXVdK6w45bgMQLlYmPhQXVAw"
    echo ""
    echo "4. Deploy!"
    ;;
  2)
    echo ""
    echo "🚀 Deploying to Netlify..."
    echo ""
    echo "📋 Steps:"
    echo "1. Push your code to GitHub (same as Vercel)"
    echo ""
    echo "2. Go to https://netlify.com and import your repository"
    echo ""
    echo "3. Build settings:"
    echo "   Build command: npm run build"
    echo "   Publish directory: build"
    echo ""
    echo "4. Set environment variables (same as Vercel)"
    echo "5. Deploy!"
    ;;
  3)
    echo ""
    echo "🚀 Deploying to Supabase Hosting..."
    echo ""
    echo "📋 Steps:"
    echo "1. Ensure you're linked to your Supabase project"
    echo "2. Run this command:"
    echo "   supabase hosting deploy frontend/build"
    echo ""
    echo "3. Your site will be available at:"
    echo "   https://lgjjzpgnrjzbdcxbkcxh.supabase.co"
    ;;
  4)
    echo ""
    echo "📁 Manual Deployment"
    echo ""
    echo "Your built frontend is in: frontend/build/"
    echo ""
    echo "You can serve it with:"
    echo "cd frontend && npx serve -s build"
    echo ""
    echo "Or upload the build folder to any web hosting service."
    ;;
  *)
    echo "Invalid choice. Please run the script again."
    exit 1
    ;;
esac

echo ""
echo "🔧 Don't forget to set environment variables in Supabase dashboard:"
echo "   https://supabase.com/dashboard/project/lgjjzpgnrjzbdcxbkcxh/settings/functions"
echo ""
echo "📚 For detailed instructions, see DEPLOYMENT_STATUS.md"
echo ""
echo "🎉 Good luck with your deployment!"
