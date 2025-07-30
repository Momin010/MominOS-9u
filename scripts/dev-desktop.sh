#!/bin/bash

echo "🚀 Starting MominOS in development mode..."

# Start Next.js dev server in background
npm run dev &
NEXT_PID=$!

# Wait for Next.js to start
echo "⏳ Waiting for Next.js to start..."
sleep 5

# Start Electron
echo "⚡ Starting Electron..."
npm run electron-dev

# Kill Next.js when Electron closes
kill $NEXT_PID
