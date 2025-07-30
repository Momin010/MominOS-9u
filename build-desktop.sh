#!/bin/bash

echo "🏗️  Building MominOS Desktop Application..."

# Install dependencies
echo "📦 Installing dependencies..."
npm install
npm install --save-dev electron electron-builder

# Build Next.js app
echo "🌐 Building Next.js application..."
npm run build

# Build Electron app
echo "🖥️  Building desktop application..."
npx electron-builder

echo "✅ Desktop application built successfully!"
echo "📁 Check the 'dist' folder for the built application."
