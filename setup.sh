#!/bin/bash

# Voice Farming Assistant - Quick Start Guide

echo "🌾 Voice Farming Assistant - Setup Script"
echo "=========================================="

# Check prerequisites
echo "Checking prerequisites..."

if ! command -v node &> /dev/null; then
    echo "❌ Node.js not found. Please install Node.js 18+"
    exit 1
fi

if ! command -v aws &> /dev/null; then
    echo "❌ AWS CLI not found. Please install AWS CLI v2"
    exit 1
fi

if ! command -v sam &> /dev/null; then
    echo "⚠️  SAM CLI not found. Installing... (optional)"
    pip install aws-sam-cli
fi

echo "✅ Prerequisites checked"

# Install dependencies
echo ""
echo "Installing dependencies..."
npm install
echo "✅ Dependencies installed"

# Configure AWS
echo ""
echo "Configuring AWS..."
aws configure

# Copy environment file
echo ""
echo "Creating .env file..."
cp .env.example .env
echo "✅ .env file created. Please update it with your values."

# Build SAM application
echo ""
echo "Building SAM application..."
sam build
echo "✅ Build complete"

# Deploy
echo ""
echo "Deploy options:"
echo "1. Development (local testing)"
echo "2. Staging"
echo "3. Production"
read -p "Select deployment target (1-3): " DEPLOY_OPTION

case $DEPLOY_OPTION in
    1)
        echo "Starting local API..."
        sam local start-api
        ;;
    2)
        echo "Deploying to staging..."
        sam deploy --guided --profile staging
        ;;
    3)
        echo "Deploying to production..."
        read -p "Are you sure? (yes/no): " CONFIRM
        if [ "$CONFIRM" = "yes" ]; then
            sam deploy --guided --profile prod
        fi
        ;;
    *)
        echo "Invalid option"
        exit 1
        ;;
esac

echo ""
echo "🎉 Setup complete!"
echo "For more information, see docs/deployment.md"
