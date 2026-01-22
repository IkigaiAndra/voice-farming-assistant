# Voice Farming Assistant - Deployment Guide

## Prerequisites

- AWS Account with appropriate permissions
- AWS CLI v2 installed and configured
- SAM CLI installed
- Node.js 18+
- Git

## Architecture Overview

The Voice Farming Assistant uses a serverless architecture on AWS:

```
┌─────────────────────────────────────────────────────────────────┐
│                     Farmer                                       │
│              (Voice Call / WhatsApp)                            │
└────────────────────┬────────────────────────────────────────────┘
                     │
        ┌────────────▼────────────┐
        │ Amazon Connect (IVR)    │
        │ - Call routing          │
        │ - Session management    │
        └────────────┬────────────┘
                     │
        ┌────────────▼──────────────┐
        │ Amazon Lex (NLU)          │
        │ - Intent recognition      │
        │ - Slot extraction         │
        └────────────┬──────────────┘
                     │
        ┌────────────▼──────────────────┐
        │ Lambda Functions              │
        │ - lex-fulfillment             │
        │ - bedrock-agent               │
        │ - data-processor              │
        └─┬──────────────────┬──────────┘
          │                  │
          ▼                  ▼
    ┌──────────────┐  ┌──────────────────┐
    │ DynamoDB     │  │ Amazon Bedrock   │
    │ - Profiles   │  │ - Claude model   │
    │ - Crop data  │  │ - Recommendations│
    │ - History    │  │                  │
    └──────────────┘  └──────────────────┘
          │                  │
          └────────┬─────────┘
                   │
        ┌──────────▼──────────────┐
        │ Amazon Polly            │
        │ - Text-to-Speech        │
        │ - Multi-language        │
        └────────────┬────────────┘
                     │
        ┌────────────▼────────────┐
        │ Response to Farmer      │
        │ (Voice + SMS)           │
        └────────────────────────┘
```

## Step 1: Configure AWS Credentials

```bash
aws configure

# Enter your AWS credentials
# AWS Access Key ID: [your-access-key]
# AWS Secret Access Key: [your-secret-key]
# Default region name: us-east-1
# Default output format: json
```

## Step 2: Clone and Setup Repository

```bash
git clone https://github.com/IkigaiAndra/voice-farming-assistant.git
cd voice-farming-assistant
npm install
```

## Step 3: Deploy Infrastructure

### Option A: Using SAM (Recommended)

```bash
# Build the application
sam build

# Deploy (guided mode)
sam deploy --guided

# You'll be prompted for:
# Stack name: voice-farming-assistant
# Region: us-east-1
# Capabilities: CAPABILITY_IAM, CAPABILITY_NAMED_IAM
```

### Option B: Using Terraform

```bash
cd infrastructure/terraform
terraform init
terraform plan
terraform apply
```

## Step 4: Configure Amazon Connect

1. Go to AWS Console → Amazon Connect
2. Create or select your instance
3. Create a phone number for incoming calls
4. Set up contact flows that invoke the Lambda functions
5. Test with the provided test scripts

```bash
npm run test:integration
```

## Step 5: Setup Amazon Lex

1. Import the intents from `voice/lex-intents/`
2. Configure intents:
   - CropAdvice
   - PestDetection
   - WeatherAdvice
   - MarketPrice
   - SoilHealth

3. Train the Lex bot
4. Create an alias and publish

## Step 6: Configure Amazon Bedrock

1. Go to AWS Console → Amazon Bedrock
2. Request access to Claude model (if needed)
3. Create a bedrock runtime profile
4. Update Lambda environment variables with model ID

## Step 7: Setup WhatsApp Integration (Optional)

1. Get Twilio account
2. Create webhook endpoint for incoming messages
3. Update webhook in Twilio console
4. Deploy webhooks Lambda function

```bash
sam deploy --template-file infrastructure/cloudformation/webhooks.yaml
```

## Step 8: Testing

### Local Testing

```bash
# Start SAM local API
sam local start-api

# In another terminal, test endpoints
curl -X POST http://localhost:3000/call \
  -H "Content-Type: application/json" \
  -d '{"phoneNumber": "+91XXXXXXXXXX"}'
```

### Integration Testing

```bash
npm run test:integration
```

### Manual Testing

1. Call your Amazon Connect phone number
2. Complete IVR flow
3. Provide crop information
4. Receive voice response with recommendations

## Monitoring and Debugging

### CloudWatch Logs

```bash
# View Connect handler logs
aws logs tail /aws/lambda/vfa-connect-handler-dev --follow

# View Lex fulfillment logs
aws logs tail /aws/lambda/vfa-lex-fulfillment-dev --follow

# View Bedrock agent logs
aws logs tail /aws/lambda/vfa-bedrock-agent-dev --follow
```

### CloudWatch Dashboard

Navigate to CloudWatch → Dashboards → vfa-dashboard to view:
- Call metrics (volume, duration, success rate)
- Lambda performance (duration, errors, throttles)
- DynamoDB performance (read/write capacity)

## Cost Optimization

### Recommended Settings

- **Amazon Connect**: Set call duration limits
- **Lambda**: Use provisioned concurrency for peak hours
- **DynamoDB**: Use on-demand billing initially, switch to provisioned when usage stabilizes
- **S3**: Set lifecycle policies for media cleanup

### Monitoring Costs

```bash
# Set up cost alerts
aws budgets create-budget \
  --account-id $(aws sts get-caller-identity --query Account --output text) \
  --budget file://cost-budget.json
```

## Production Deployment

### Prerequisites Checklist

- [ ] Test thoroughly in dev environment
- [ ] Set up monitoring and alerting
- [ ] Configure CloudWatch alarms
- [ ] Set up log retention policies
- [ ] Document API endpoints
- [ ] Plan disaster recovery
- [ ] Setup authentication (if needed)

### Deployment Steps

```bash
# Create production stack
sam deploy --template-file template.yaml \
  --stack-name voice-farming-assistant-prod \
  --s3-bucket vfa-prod-bucket \
  --parameter-overrides Environment=prod \
  --capabilities CAPABILITY_IAM CAPABILITY_NAMED_IAM

# Verify deployment
aws cloudformation describe-stacks \
  --stack-name voice-farming-assistant-prod
```

## Troubleshooting

### Lambda Function Not Triggering

1. Check Connect contact flow configuration
2. Verify Lambda function permissions
3. Check CloudWatch logs for errors

```bash
aws logs filter-log-events \
  --log-group-name /aws/lambda/vfa-connect-handler-dev \
  --start-time $(date -d '1 hour ago' +%s)000
```

### Lex Intent Not Recognizing Utterances

1. Check utterance examples in intent configuration
2. Train the bot after making changes
3. Check sentiment detection logs

### Audio Quality Issues

1. Adjust Polly voice settings in `voice/polly-config/voice-settings.json`
2. Check internet connection (2G: reduce bitrate)
3. Monitor Amazon Connect audio metrics

### High Latency

1. Enable Lambda provisioned concurrency
2. Check DynamoDB throttling
3. Optimize Bedrock model calls

## Rollback Procedure

```bash
# If deployment fails or needs to be rolled back
aws cloudformation cancel-update-stack \
  --stack-name voice-farming-assistant-dev

# Or restore previous version
aws cloudformation set-stack-policy \
  --stack-name voice-farming-assistant-dev \
  --stack-policy-body file://stack-policy.json
```

## Support and Resources

- [AWS Connect Documentation](https://docs.aws.amazon.com/connect/)
- [Amazon Lex Documentation](https://docs.aws.amazon.com/lex/)
- [Amazon Bedrock Documentation](https://docs.aws.amazon.com/bedrock/)
- [AWS SAM Documentation](https://docs.aws.amazon.com/serverless-application-model/)

## Next Steps

After successful deployment:

1. Collect initial feedback from test farmers
2. Refine Bedrock prompts based on responses
3. Add more crop types and intents
4. Implement additional languages
5. Setup mobile app for image uploads
6. Scale to more regions in India
