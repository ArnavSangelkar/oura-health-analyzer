# 🚀 Deploying Oura Health Analyzer on Render

This guide will walk you through deploying your Oura Health Analyzer application on Render, a modern cloud platform that offers free hosting for static sites.

## 📋 Prerequisites

- [ ] Render account (free tier available)
- [ ] GitHub repository with your code
- [ ] Supabase project already set up (✅ Done!)

## 🔧 Quick Start (Recommended)

### 1. Run the Deployment Script
```bash
./deploy-render.sh
```

This script will:
- Check if git is initialized
- Install Render CLI if needed
- Guide you through the deployment process

### 2. Manual Deployment Steps

#### Step 1: Create Render Account
1. Go to [render.com](https://render.com)
2. Sign up with GitHub (recommended) or email
3. Verify your email address

#### Step 2: Connect Your Repository
1. In Render dashboard, click **"New +"**
2. Select **"Static Site"**
3. Connect your GitHub repository
4. Choose the repository: `your-username/oura-health-analyzer`

#### Step 3: Configure Build Settings
- **Name**: `oura-health-analyzer` (or your preferred name)
- **Build Command**: `cd frontend && npm install && npm run build`
- **Publish Directory**: `frontend/build`
- **Branch**: `main` (or your default branch)

#### Step 4: Add Environment Variables
Click **"Environment"** and add:

| Key | Value |
|-----|-------|
| `REACT_APP_SUPABASE_URL` | `https://lgjjzpgnrjzbdcxh.supabase.co` |
| `REACT_APP_SUPABASE_ANON_KEY` | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxnamp6cGducmp6YmRjeGJrY3hoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYxNzIzMzksImV4cCI6MjA3MTc0ODMzOX0.FOnIUD0qdWNicrtxv82qXV0K6w45bgMQLlYmPhQXVAw` |

#### Step 5: Deploy
1. Click **"Create Static Site"**
2. Wait for build to complete (usually 2-5 minutes)
3. Your app will be available at: `https://your-app-name.onrender.com`

## 🎯 Using render.yaml (Advanced)

If you prefer infrastructure as code, use the `render.yaml` file:

```bash
# Install Render CLI
curl -sL https://render.com/download.sh | sh

# Login to Render
render login

# Deploy using the blueprint
render blueprint apply
```

## 🔄 Auto-Deploy Setup

1. **Enable Auto-Deploy**: In your Render dashboard, enable auto-deploy from your main branch
2. **Push Changes**: Every time you push to main, Render will automatically rebuild and deploy
3. **Preview Deploys**: Create pull requests to get preview deployments

## 🌐 Custom Domain (Optional)

1. **Add Domain**: In Render dashboard, go to your site → Settings → Custom Domains
2. **DNS Configuration**: Add CNAME record pointing to your Render URL
3. **SSL Certificate**: Render automatically provides free SSL certificates

## 📱 Testing Your Deployment

After deployment, test these features:

- [ ] **Authentication**: Sign up/sign in works
- [ ] **Dashboard**: Health data displays correctly
- [ ] **AI Insights**: AI generates insights properly
- [ ] **Settings**: Oura token can be saved
- [ ] **Health Data**: Tables show data correctly

## 🐛 Troubleshooting

### Build Failures
- **Node Version**: Ensure you're using Node.js 16+ in package.json
- **Dependencies**: Check that all packages are in package.json
- **Build Command**: Verify the build command works locally

### Runtime Errors
- **Environment Variables**: Check that Supabase URLs are correct
- **CORS Issues**: Verify Supabase CORS settings include your Render domain
- **API Calls**: Check browser console for network errors

### Common Issues
```bash
# If build fails, try locally first:
cd frontend
npm install
npm run build

# Check for missing dependencies:
npm ls --depth=0

# Verify environment variables:
echo $REACT_APP_SUPABASE_URL
```

## 💰 Pricing

- **Free Tier**: 750 hours/month, 100GB bandwidth
- **Paid Plans**: Start at $7/month for unlimited usage
- **Custom Domains**: Free with SSL certificates

## 🔒 Security Notes

- **Environment Variables**: Never commit sensitive keys to git
- **Supabase RLS**: Ensure Row Level Security is properly configured
- **HTTPS**: Render provides free SSL certificates

## 📚 Additional Resources

- [Render Documentation](https://render.com/docs)
- [Static Site Deployment](https://render.com/docs/deploy-create-a-static-site)
- [Environment Variables](https://render.com/docs/environment-variables)
- [Custom Domains](https://render.com/docs/custom-domains)

## 🎉 Success!

Once deployed, your Oura Health Analyzer will be:
- ✅ **Publicly accessible** via Render URL
- ✅ **Auto-deploying** from your GitHub repository
- ✅ **SSL secured** with free certificates
- ✅ **Scalable** and reliable hosting

Your app will be available at: `https://your-app-name.onrender.com`

---

**Need help?** Check the troubleshooting section or visit Render's support documentation.
