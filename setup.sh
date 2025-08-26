#!/bin/bash

echo "🚀 Setting up Oura Health Analyzer..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js version 18+ is required. Current version: $(node -v)"
    exit 1
fi

echo "✅ Node.js version: $(node -v)"

# Install backend dependencies
echo "📦 Installing backend dependencies..."
npm install

# Install frontend dependencies
echo "📦 Installing frontend dependencies..."
cd frontend
npm install
cd ..

# Create environment file if it doesn't exist
if [ ! -f .env ]; then
    echo "📝 Creating .env file from template..."
    cp env.example .env
    echo "⚠️  Please edit .env file with your API keys before starting the application."
fi

echo ""
echo "🎉 Setup complete!"
echo ""
echo "Next steps:"
echo "1. Edit .env file with your API keys:"
echo "   - OURA_TOKEN (from Oura Cloud dashboard)"
echo "   - OPENAI_API_KEY (from OpenAI dashboard)"
echo ""
echo "2. Start the application:"
echo "   - Backend: npm run dev"
echo "   - Frontend: cd frontend && npm start"
echo ""
echo "3. Access the application:"
echo "   - Frontend: http://localhost:3001"
echo "   - Backend API: http://localhost:3000"
echo ""
echo "📚 For more information, see README.md"

