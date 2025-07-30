#!/bin/bash

echo "🚀 Starting MominOS Desktop Application..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

# Install dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
    npm install --save-dev electron electron-builder
fi

# Start Next.js development server in background
echo "🌐 Starting Next.js development server..."
npm run dev &
NEXT_PID=$!

# Wait for Next.js to start
echo "⏳ Waiting for Next.js to start..."
sleep 5

# Start Electron
echo "🖥️  Launching MominOS Desktop..."
ELECTRON_IS_DEV=true npx electron electron/main.js

# Cleanup: Kill Next.js process when Electron closes
echo "🧹 Cleaning up..."
kill $NEXT_PID 2>/dev/null

echo "✅ MominOS Desktop closed successfully!"
