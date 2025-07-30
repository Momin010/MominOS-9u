#!/bin/bash

echo "🚀 Building MominOS Desktop App..."

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
  echo "📦 Installing dependencies..."
  npm install
fi

# Install Electron dependencies
echo "⚡ Installing Electron..."
npm install --save-dev electron electron-builder

# Build the Next.js app
echo "🔨 Building Next.js app..."
npm run build

# Build the Electron app
echo "🖥️  Building desktop app..."
npm run dist

echo "✅ Desktop app built successfully!"
echo "📁 Check the 'dist-electron' folder for your app"
