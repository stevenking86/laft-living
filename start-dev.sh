#!/bin/bash

# Start development servers for Rails + Next.js app

echo "🚀 Starting Rails + Next.js Development Environment"
echo "=================================================="

# Check if we're in the right directory
if [ ! -d "backend" ] || [ ! -d "frontend" ]; then
    echo "❌ Error: Please run this script from the project root directory"
    echo "   Expected structure:"
    echo "   laft/"
    echo "   ├── backend/"
    echo "   └── frontend/"
    exit 1
fi

# Function to check if a command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Add PostgreSQL to PATH if installed via Homebrew
if [ -d "/opt/homebrew/opt/postgresql@15/bin" ]; then
    export PATH="/opt/homebrew/opt/postgresql@15/bin:$PATH"
elif [ -d "/usr/local/opt/postgresql@15/bin" ]; then
    export PATH="/usr/local/opt/postgresql@15/bin:$PATH"
fi

# Check prerequisites
echo "🔍 Checking prerequisites..."

if ! command_exists ruby; then
    echo "❌ Ruby is not installed. Please install Ruby 3.2+ first."
    exit 1
fi

if ! command_exists node; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

if ! command_exists psql; then
    echo "❌ PostgreSQL is not installed. Please install PostgreSQL first."
    exit 1
fi

echo "✅ Prerequisites check passed"

# Setup backend
echo ""
echo "🔧 Setting up Rails backend..."
cd backend

# Install gems if needed
if [ ! -d "vendor/bundle" ]; then
    echo "📦 Installing Rails dependencies..."
    bundle install
fi

# Setup database
echo "🗄️  Setting up database..."
rails db:create 2>/dev/null || echo "Database might already exist"
rails db:migrate
rails db:seed

echo "✅ Rails backend ready"

# Start Rails server in background
echo "🚀 Starting Rails server on port 3001..."
rails server -p 3001 &
RAILS_PID=$!

# Go back to root and setup frontend
cd ../frontend

echo ""
echo "🔧 Setting up Next.js frontend..."

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing Next.js dependencies..."
    npm install
fi

echo "✅ Next.js frontend ready"

# Start Next.js server
echo "🚀 Starting Next.js server on port 3000..."
npm run dev &
NEXT_PID=$!

echo ""
echo "🎉 Development servers started!"
echo "=================================================="
echo "📱 Frontend: http://localhost:3000"
echo "🔧 Backend API: http://localhost:3001"
echo ""
echo "Press Ctrl+C to stop both servers"

# Function to cleanup on exit
cleanup() {
    echo ""
    echo "🛑 Stopping servers..."
    kill $RAILS_PID 2>/dev/null
    kill $NEXT_PID 2>/dev/null
    echo "✅ Servers stopped"
    exit 0
}

# Set trap to cleanup on script exit
trap cleanup SIGINT SIGTERM

# Wait for both processes
wait
