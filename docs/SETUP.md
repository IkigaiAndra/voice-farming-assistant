# 📖 Complete Setup Guide - Voice Farming Assistant

Complete step-by-step guide to get Voice Farming Assistant running locally or in production.

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Local Development Setup](#local-development-setup)
3. [AWS Configuration](#aws-configuration)
4. [Twilio WhatsApp Setup](#twilio-whatsapp-setup)
5. [Backend Setup](#backend-setup)
6. [Frontend Setup](#frontend-setup)
7. [Testing](#testing)
8. [Troubleshooting](#troubleshooting)

## Prerequisites

### Required Software
```bash
# Check versions
node --version          # Should be 16.0.0+
npm --version          # Should be 8.0.0+
git --version          # Should be 2.0.0+
```

### AWS Requirements
- AWS Account with:
  - Bedrock access (request access if needed)
  - DynamoDB permissions
  - Polly service enabled
  - S3 bucket created
  - CloudWatch access
  - Lambda permissions

### Twilio Requirements
- Twilio Account (free trial available)
- WhatsApp sandbox enabled
- Twilio phone number

## Local Development Setup

### 1. Clone Repository
```bash
git clone https://github.com/yourusername/voice-farming-assistant.git
cd voice-farming-assistant
```

### 2. Install Global Dependencies
```bash
# Install Node dependencies globally (optional but recommended)
npm install -g npm@latest
npm install -g aws-cli
```

### 3. Create Base Folders
```bash
mkdir -p backend frontend infrastructure logs
```

## AWS Configuration

### 1. Create AWS Profile
```bash
# Configure AWS CLI
aws configure --profile voice-farming

# Enter your credentials when prompted:
# AWS Access Key ID: [your-key]
# AWS Secret Access Key: [your-secret]
# Default region name: ap-south-1
# Default output format: json
```

### 2. Create S3 Bucket for Media Storage
```bash
# Create bucket with unique name
aws s3 mb s3://voice-farming-assistant-media-$(date +%s) \
  --region ap-south-1 \
  --profile voice-farming

# Enable versioning
aws s3api put-bucket-versioning \
  --bucket voice-farming-assistant-media-XXXXXX \
  --versioning-configuration Status=Enabled \
  --profile voice-farming

# Set lifecycle policy
aws s3api put-bucket-lifecycle-configuration \
  --bucket voice-farming-assistant-media-XXXXXX \
  --lifecycle-configuration file://infrastructure/s3-lifecycle.json \
  --profile voice-farming
```

### 3. Create DynamoDB Tables

#### Farmers Table
```bash
aws dynamodb create-table \
  --table-name voice-farming-farmers \
  --attribute-definitions \
    AttributeName=id,AttributeType=S \
    AttributeName=phone,AttributeType=S \
  --key-schema \
    AttributeName=id,KeyType=HASH \
    AttributeName=phone,KeyType=RANGE \
  --billing-mode PAY_PER_REQUEST \
  --region ap-south-1 \
  --profile voice-farming
```

#### Messages Table
```bash
aws dynamodb create-table \
  --table-name voice-farming-messages \
  --attribute-definitions \
    AttributeName=farmerId,AttributeType=S \
    AttributeName=timestamp,AttributeType=N \
  --key-schema \
    AttributeName=farmerId,KeyType=HASH \
    AttributeName=timestamp,KeyType=RANGE \
  --billing-mode PAY_PER_REQUEST \
  --region ap-south-1 \
  --profile voice-farming

# Set TTL for automatic cleanup (30 days)
aws dynamodb update-time-to-live \
  --table-name voice-farming-messages \
  --time-to-live-specification AttributeName=expiresAt,Enabled=true \
  --region ap-south-1 \
  --profile voice-farming
```

### 4. Request Bedrock Access
```bash
# Check if Bedrock is already available
aws bedrock list-foundation-models --region ap-south-1 --profile voice-farming

# If not available, request access:
# Go to: https://console.aws.amazon.com/bedrock/home
# Click "Request model access"
# Select Claude 3 Haiku
# Wait for approval (usually < 5 minutes)
```

## Twilio WhatsApp Setup

### 1. Create Twilio Account
- Go to [twilio.com](https://www.twilio.com)
- Sign up for free trial
- Verify phone number

### 2. Enable WhatsApp Sandbox
```bash
# In Twilio Console:
# 1. Navigate to Messaging > Sto Services
# 2. Create new Service (name: "voice-farming")
# 3. Add Whatsapp Channel
# 4. Join WhatsApp Sandbox:
#    - Send "join [word]" to sandbox number
#    - Get sandbox details
```

### 3. Get Credentials
```bash
# From Twilio Console, get:
# - Account SID
# - Auth Token
# - WhatsApp Phone Number (like +1-xxx-xxx-xxxx)
```

## Backend Setup

### 1. Navigate to Backend
```bash
cd backend
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Create Environment File
```bash
cp .env.example .env
```

### 4. Configure .env
Edit `backend/.env`:
```env
# AWS Configuration
AWS_REGION=ap-south-1
AWS_PROFILE=voice-farming
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key

# Bedrock
BEDROCK_REGION=ap-south-1
BEDROCK_MODEL_ID=anthropic.claude-3-haiku-20240307-v1:0

# Polly Voice IDs (Language mappings)
POLLY_VOICE_IDS={
  "hin": "Aditi",
  "tam": "Tamizh",
  "tel": "Chitra",
  "kan": "Oha",
  "mal": "Meera",
  "mar": "Arjun",
  "eng": "Joanna"
}

# DynamoDB
DYNAMODB_REGION=ap-south-1
DYNAMODB_TABLE_FARMERS=voice-farming-farmers
DYNAMODB_TABLE_MESSAGES=voice-farming-messages

# S3
S3_REGION=ap-south-1
S3_BUCKET=voice-farming-assistant-media-XXXXXX
S3_URL_EXPIRY=3600

# Twilio
TWILIO_ACCOUNT_SID=your-account-sid
TWILIO_AUTH_TOKEN=your-auth-token
TWILIO_PHONE_NUMBER=+1xxx-xxx-xxxx
WHATSAPP_PHONE_NUMBER=+1xxx-xxx-xxxx
WHATSAPP_VERIFY_TOKEN=secure-verify-token-123

# Server
NODE_ENV=development
PORT=3000
DEBUG=voice-farming:*

# CORS
FRONTEND_URL=http://localhost:5173
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000
```

### 5. Start Backend Server
```bash
# Development mode with auto-reload
npm run dev

# Expected output:
# ╔════════════════════════════════════════╗
# ║   Voice Farming Assistant Backend      ║
# ║   Server running on port 3000          ║
# ║   Environment: development             ║
# ╚════════════════════════════════════════╝
```

### 6. Verify Backend
```bash
# In another terminal, test API health
curl http://localhost:3000/health

# Expected response:
# {
#   "status": "healthy",
#   "timestamp": "2024-01-15T10:30:00Z",
#   "uptime": 5.234,
#   "environment": "development"
# }
```

## Frontend Setup

### 1. Navigate to Frontend
```bash
cd frontend
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Create Environment File
```bash
# Create .env.local
echo "REACT_APP_API_URL=http://localhost:3000/api" > .env.local
echo "REACT_APP_ENVIRONMENT=development" >> .env.local
```

### 4. Start Frontend Development Server
```bash
npm run dev

# Expected output:
# ➜ Local:   http://localhost:5173/
# ➜ press h + enter to show help
```

### 5. Access Application
Open browser and go to: `http://localhost:5173`

## Testing

### 1. Manual Testing - Web UI

```bash
# 1. Open http://localhost:5173
# 2. Test voice recording:
#    - Click microphone button
#    - Say something (e.g., "My wheat has yellow leaves")
#    - Wait for transcription and response
# 3. Test language switching:
#    - Select different language from dropdown
#    - Verify UI text changes
# 4. Test text input:
#    - Type a query
#    - Submit and wait for response
```

### 2. Test API Endpoints

```bash
# Test Chat Endpoint
curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "text": "My wheat crop has yellow leaves",
    "farmerId": "test-farmer-1",
    "language": "hin",
    "cropType": "Wheat"
  }'

# Expected response:
# {
#   "success": true,
#   "response": {
#     "text": "गेहूं की पीली पत्तियां...",
#     "audioUrl": "https://s3.amazonaws.com/...",
#     "sections": {...}
#   }
# }
```

```bash
# Test Profile Creation
curl -X PUT http://localhost:3000/api/profile/test-farmer-1 \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Rajesh Kumar",
    "language": "hin",
    "cropType": "Wheat",
    "location": "Haryana"
  }'
```

```bash
# Test Weather Advice
curl http://localhost:3000/api/weather/Haryana?farmerId=test-farmer-1
```

```bash
# Test Market Prices
curl "http://localhost:3000/api/market-prices/wheat?state=Haryana"
```

### 3. Run Automated Tests

```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd ../frontend
npm test

# Integration tests
npm run test:integration
```

## Troubleshooting

### Backend Issues

#### Port Already in Use
```bash
# Find process using port 3000
lsof -i :3000

# Kill the process
kill -9 <PID>
```

#### AWS Credentials Error
```bash
# Verify AWS credentials
aws sts get-caller-identity --profile voice-farming

# If error, reconfigure:
aws configure --profile voice-farming
```

#### Bedrock Access Denied
```bash
# Check if Bedrock is available
aws bedrock list-foundation-models --region ap-south-1 --profile voice-farming

# If not available:
# 1. Go to AWS Console > Bedrock
# 2. Click "Request model access"
# 3. Select "Claude 3 Haiku"
# 4. Wait for approval
```

#### DynamoDB Connection Error
```bash
# Verify DynamoDB tables exist
aws dynamodb list-tables --region ap-south-1 --profile voice-farming

# If tables don't exist, create them as shown in AWS Configuration section
```

### Frontend Issues

#### CORS Error
```bash
# Ensure backend is running
curl http://localhost:3000/health

# Check FRONTEND_URL in backend .env matches frontend URL
# Restart backend server if changed
```

#### Microphone Not Working
```bash
# Check browser permissions:
# 1. Check browser console for errors (F12)
# 2. Verify microphone permissions in browser settings
# 3. Allow camera/microphone access when prompted
# 4. Test microphone in browser: chrome://settings/privacy
```

#### No Response from Backend
```bash
# Check API URL in .env.local
cat frontend/.env.local

# Verify backend health
curl http://localhost:3000/health

# Check network tab in browser (F12)
# Ensure API calls are going to correct URL
```

### Twilio Integration Issues

#### WhatsApp Messages Not Received
```bash
# 1. Verify webhook URL in Twilio console:
#    https://console.twilio.com/console
# 2. Ensure webhook URL is publicly accessible
# 3. Test webhook:
curl -X GET "http://localhost:3000/webhooks/whatsapp?hub.challenge=test&hub.verify_token=your_token"

# Should return "test"
```

#### Polly Voice Generation Fails
```bash
# Check S3 bucket exists and is accessible
aws s3 ls s3://voice-farming-assistant-media-XXXXXX --profile voice-farming

# Verify IAM permissions for Lambda/EC2
aws iam get-role --role-name voice-farming-lambda-role --profile voice-farming
```

## Production Deployment

### 1. Build Frontend
```bash
cd frontend
npm run build

# Creates optimized production build in dist/
```

### 2. Deploy to S3 + CloudFront
```bash
# Upload to S3
aws s3 sync dist/ s3://voice-farming-frontend-prod/ \
  --delete \
  --profile voice-farming

# Invalidate CloudFront (if using CDN)
aws cloudfront create-invalidation \
  --distribution-id <DISTRIBUTION_ID> \
  --paths "/*" \
  --profile voice-farming
```

### 3. Deploy Backend to AWS Lambda
```bash
cd backend

# Build
sam build

# Deploy (will create CloudFormation stack)
sam deploy --guided --profile voice-farming
```

### 4. Configure Production Environment
```bash
# Set production environment variables in Lambda
# Update CORS to production domain
# Enable API Gateway authentication
```

## Monitoring in Production

```bash
# View Lambda logs
aws logs tail /aws/lambda/voice-farming-chat --follow --profile voice-farming

# View API Gateway metrics
aws cloudwatch get-metric-statistics \
  --namespace AWS/ApiGateway \
  --metric-name Count \
  --start-time 2024-01-15T00:00:00Z \
  --end-time 2024-01-15T23:59:59Z \
  --period 3600 \
  --profile voice-farming

# View DynamoDB metrics
aws cloudwatch get-metric-statistics \
  --namespace AWS/DynamoDB \
  --metric-name UserErrors \
  --start-time 2024-01-15T00:00:00Z \
  --end-time 2024-01-15T23:59:59Z \
  --period 3600 \
  --profile voice-farming
```

## Performance Optimization

### Frontend
- Enable gzip compression
- Optimize images
- Cache static assets
- Use CDN for media delivery

### Backend
- Enable Lambda reserved concurrency
- Use DynamoDB auto-scaling
- Implement API caching
- Optimize Bedrock prompts

### Database
- Enable point-in-time recovery
- Set up DynamoDB backups
- Implement data archival
- Use TTL for cleanup

## Security Best Practices

- ✅ Rotate AWS credentials regularly
- ✅ Use IAM roles instead of access keys
- ✅ Enable CloudTrail logging
- ✅ Implement API authentication
- ✅ Use VPC endpoints for AWS services
- ✅ Encrypt data in transit (HTTPS/TLS)
- ✅ Implement rate limiting on APIs

## Need Help?

- 📚 Check documentation: `/docs`
- 🐛 Report issues on GitHub
- 💬 Ask in discussion forum
- 📧 Email: support@voicefarmingassistant.com

---

Happy farming! 🌾
