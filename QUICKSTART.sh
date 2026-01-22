#!/bin/bash
# 🌾 Voice Farming Assistant - Quick Start Guide

echo "
╔════════════════════════════════════════════════════════════════╗
║      🌾 Voice Farming Assistant - Quick Start Guide 🌾        ║
║                                                                ║
║   Beautiful WhatsApp Voice Interface for Indian Farmers       ║
║   AWS-Powered • Multi-Language • Production-Ready             ║
╚════════════════════════════════════════════════════════════════╝
"

# Color codes
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}📋 STEP 1: Prerequisites Check${NC}"
echo "Checking if required software is installed..."

# Check Node.js
if ! command -v node &> /dev/null; then
    echo -e "${YELLOW}❌ Node.js not found. Please install Node.js 16+${NC}"
    echo "   Download from: https://nodejs.org"
    exit 1
fi
echo -e "${GREEN}✅ Node.js $(node --version)${NC}"

# Check npm
if ! command -v npm &> /dev/null; then
    echo -e "${YELLOW}❌ npm not found${NC}"
    exit 1
fi
echo -e "${GREEN}✅ npm $(npm --version)${NC}"

# Check git
if ! command -v git &> /dev/null; then
    echo -e "${YELLOW}❌ Git not found${NC}"
else
    echo -e "${GREEN}✅ Git $(git --version | awk '{print $3}')${NC}"
fi

echo ""
echo -e "${BLUE}📦 STEP 2: Install Dependencies${NC}"

# Backend
echo "Installing backend dependencies..."
cd backend
npm install --legacy-peer-deps > /dev/null 2>&1
echo -e "${GREEN}✅ Backend dependencies installed${NC}"

# Frontend
echo "Installing frontend dependencies..."
cd ../frontend
npm install > /dev/null 2>&1
echo -e "${GREEN}✅ Frontend dependencies installed${NC}"

cd ..
echo ""
echo -e "${BLUE}⚙️ STEP 3: Environment Configuration${NC}"

# Backend .env
if [ ! -f backend/.env ]; then
    echo "Creating backend/.env from template..."
    cp backend/.env.example backend/.env 2>/dev/null || \
    cat > backend/.env << 'EOF'
# AWS Configuration
AWS_REGION=ap-south-1
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key

# Bedrock & Polly
BEDROCK_MODEL_ID=anthropic.claude-3-haiku-20240307-v1:0
POLLY_VOICE_IDS={"hin":"Aditi","tam":"Tamizh","tel":"Chitra","kan":"Oha","mal":"Meera","mar":"Arjun","eng":"Joanna"}

# DynamoDB
DYNAMODB_TABLE_FARMERS=voice-farming-farmers
DYNAMODB_TABLE_MESSAGES=voice-farming-messages

# Twilio WhatsApp
TWILIO_ACCOUNT_SID=your-sid
TWILIO_AUTH_TOKEN=your-token
TWILIO_PHONE_NUMBER=+1234567890
WHATSAPP_PHONE_NUMBER=+1234567890
WHATSAPP_VERIFY_TOKEN=your-verify-token

# Server
NODE_ENV=development
PORT=3000
DEBUG=voice-farming:*

# CORS
FRONTEND_URL=http://localhost:5173
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000
EOF
    echo -e "${GREEN}✅ backend/.env created${NC}"
    echo -e "${YELLOW}⚠️  Update with your AWS credentials before running!${NC}"
else
    echo -e "${GREEN}✅ backend/.env already exists${NC}"
fi

# Frontend .env
if [ ! -f frontend/.env.local ]; then
    echo "Creating frontend/.env.local..."
    echo "REACT_APP_API_URL=http://localhost:3000/api" > frontend/.env.local
    echo "REACT_APP_ENVIRONMENT=development" >> frontend/.env.local
    echo -e "${GREEN}✅ frontend/.env.local created${NC}"
else
    echo -e "${GREEN}✅ frontend/.env.local already exists${NC}"
fi

echo ""
echo -e "${BLUE}🚀 STEP 4: Ready to Start!${NC}"
echo ""
echo -e "${GREEN}Backend server (Terminal 1):${NC}"
echo "  cd backend && npm run dev"
echo "  Runs on: http://localhost:3000"
echo ""
echo -e "${GREEN}Frontend dev server (Terminal 2):${NC}"
echo "  cd frontend && npm run dev"
echo "  Runs on: http://localhost:5173"
echo ""
echo -e "${YELLOW}Before starting:${NC}"
echo "  1. ⚙️  Configure AWS credentials in backend/.env"
echo "  2. 🔑 Get Twilio WhatsApp credentials (optional)"
echo "  3. 💾 Create DynamoDB tables (see SETUP.md)"
echo "  4. 🛍️  Create S3 bucket for media (see SETUP.md)"
echo ""
echo -e "${BLUE}📚 Documentation:${NC}"
echo "  • Setup Guide: docs/SETUP.md"
echo "  • API Reference: README.md → API Endpoints"
echo "  • Architecture: README.md → Architecture"
echo "  • Implementation: IMPLEMENTATION_SUMMARY.md"
echo ""
echo -e "${BLUE}🧪 Test API:${NC}"
echo "  curl http://localhost:3000/health"
echo "  curl http://localhost:3000/docs"
echo ""
echo -e "${GREEN}✨ Setup complete! Happy farming! 🌾${NC}"
echo ""
