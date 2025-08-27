#!/bin/bash

echo "🏥 Hospital Readmission Tracker - Frontend Setup"
echo "================================================"

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 16+ first."
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 16 ]; then
    echo "❌ Node.js version 16+ is required. Current version: $(node -v)"
    exit 1
fi

echo "✅ Node.js version: $(node -v)"

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Create environment file
echo "🔧 Creating environment configuration..."
cat > .env.local << EOF
# Supabase Configuration
VITE_SUPABASE_URL=http://localhost:8000
VITE_SUPABASE_ANON_KEY=your-anon-key-here

# API Configuration
VITE_API_BASE_URL=/api

# App Configuration
VITE_APP_NAME=Hospital Readmission Tracker
VITE_APP_VERSION=1.0.0
EOF

echo "✅ Environment file created: .env.local"
echo ""
echo "🚀 Setup complete! To start the development server:"
echo "   npm run dev"
echo ""
echo "📝 Don't forget to:"
echo "   1. Update .env.local with your actual Supabase credentials"
echo "   2. Ensure your Django backend is running on localhost:8000"
echo "   3. Configure CORS in your Django settings"
echo ""
echo "🌐 The app will be available at: http://localhost:5173"
