# Oura Health Analyzer

A comprehensive health data analysis platform that combines Oura Ring data with AI-powered insights using OpenAI. Get personalized health recommendations, trend analysis, and actionable insights from your wearable health data.

## 🚀 Features

- **Real-time Health Monitoring**: Connect your Oura Ring to get live health data
- **AI-Powered Insights**: Get personalized health analysis and recommendations using OpenAI
- **Comprehensive Dashboard**: View sleep, activity, readiness, and heart rate metrics
- **Trend Analysis**: Identify patterns and correlations in your health data
- **Personalized Recommendations**: Receive actionable health improvement suggestions
- **Data Export**: Download your health data for external analysis
- **Responsive Design**: Beautiful, modern UI that works on all devices

## 🛠️ Tech Stack

### Backend
- **Node.js** with Express.js
- **Oura Ring API** for health data
- **OpenAI API** for AI insights
- **Supabase** (optional) for data persistence
- **Security**: Helmet, CORS, Rate limiting

### Frontend
- **React** with TypeScript
- **Tailwind CSS** for styling
- **React Router** for navigation
- **Axios** for API calls
- **Lucide React** for icons

## 📋 Prerequisites

- Node.js 18+ 
- Oura Ring account with API access
- OpenAI API key
- (Optional) Supabase account

## 🚀 Quick Start

### 1. Clone the Repository
```bash
git clone <repository-url>
cd oura-health-analyzer
```

### 2. Install Dependencies
```bash
# Install backend dependencies
npm install

# Install frontend dependencies
cd frontend
npm install
cd ..
```

### 3. Environment Configuration
Copy the example environment file and configure your API keys:

```bash
cp env.example .env
```

Edit `.env` with your actual API keys:
```env
# Oura Ring API
OURA_TOKEN=your_oura_api_token_here

# OpenAI API
OPENAI_API_KEY=your_openai_api_key_here

# Optional: Supabase
SUPABASE_URL=your_supabase_url_here
SUPABASE_ANON_KEY=your_supabase_anon_key_here
```

### 4. Start the Application

#### Development Mode
```bash
# Start backend server
npm run dev

# In another terminal, start frontend
cd frontend
npm start
```

#### Production Mode
```bash
# Build frontend
npm run build

# Start production server
npm start
```

### 5. Access the Application
- Frontend: http://localhost:3001
- Backend API: http://localhost:3000

## 🔧 API Endpoints

### Health Data
- `GET /api/oura/profile` - Get user profile
- `GET /api/oura/sleep` - Get sleep data
- `GET /api/oura/activity` - Get activity data
- `GET /api/oura/readiness` - Get readiness data
- `GET /api/oura/heart-rate` - Get heart rate data
- `GET /api/oura/summary` - Get health summary
- `GET /api/oura/latest` - Get latest data

### AI Insights
- `POST /api/ai/analyze` - Analyze health data
- `POST /api/ai/recommendations` - Generate recommendations
- `POST /api/ai/trends` - Detect health trends
- `POST /api/ai/insights` - Get comprehensive insights
- `POST /api/ai/analyze/:aspect` - Analyze specific aspect

### Health Checks
- `GET /api/health` - Basic health check
- `GET /api/health/detailed` - Detailed health status
- `GET /api/health/api` - API status

## 📱 Usage

### Dashboard
- View your latest health metrics
- See sleep, activity, and readiness scores
- Quick access to detailed data and AI insights

### Health Data
- Browse historical health data
- Filter by date ranges
- Export data for external analysis

### AI Insights
- Generate personalized health analysis
- Get actionable recommendations
- Identify health trends and patterns
- Focus on specific aspects (sleep, activity, recovery)

### Settings
- Configure API keys
- Set preferences and notifications
- Manage data retention
- Export or clear data

## 🔐 Security

- API rate limiting to prevent abuse
- CORS configuration for secure cross-origin requests
- Helmet.js for security headers
- Environment variable protection for sensitive data

## 📊 Data Sources

### Oura Ring Data
- Sleep metrics (duration, efficiency, stages)
- Activity data (steps, calories, active time)
- Readiness scores and HRV
- Heart rate variability

### AI Analysis
- Sleep quality assessment
- Activity pattern recognition
- Recovery optimization suggestions
- Trend identification and correlation analysis

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

If you encounter any issues:

1. Check the [Issues](https://github.com/your-repo/issues) page
2. Ensure your API keys are correctly configured
3. Verify your Oura Ring is syncing data
4. Check the browser console for error messages

## 🔮 Roadmap

- [ ] Data visualization charts
- [ ] Mobile app
- [ ] Integration with other health platforms
- [ ] Advanced AI models
- [ ] Social features and sharing
- [ ] Custom health goals and tracking

## 🙏 Acknowledgments

- [Oura Ring](https://ouraring.com/) for health data API
- [OpenAI](https://openai.com/) for AI capabilities
- [Tailwind CSS](https://tailwindcss.com/) for styling
- [React](https://reactjs.org/) for the frontend framework

