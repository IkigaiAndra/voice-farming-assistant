# Voice Farming Assistant - Quick Reference

## Project Initialized ✅

Your Voice Farming Assistant project is ready to deploy!

### What's Been Setup

```
✅ Project Structure
   - Lambda functions for call handling, NLU, LLM reasoning, and image processing
   - DynamoDB schemas for farmer profiles, crop data, and conversations
   - S3 configuration for media storage
   - Lex intents for agricultural queries
   - Bedrock prompts for intelligent recommendations
   - Polly voice configuration for multi-language support

✅ Infrastructure as Code
   - CloudFormation template (template.yaml)
   - Complete AWS serverless stack
   - Environment-based configuration (dev/staging/prod)
   - Monitoring and logging setup

✅ Documentation
   - Architecture guide with diagrams
   - Deployment instructions
   - API reference
   - Configuration guide

✅ Backend Services
   - Database service for DynamoDB operations
   - Voice service for Polly and audio handling
   - Connect handler for IVR routing
   - Lex fulfillment for intent processing
   - Bedrock integration for LLM reasoning
   - Data processor for image analysis
```

## Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure AWS
```bash
aws configure
```

### 3. Deploy
```bash
sam deploy --guided
```

### 4. Test Locally
```bash
sam local start-api
```

## Project Structure

```
voice-farming-assistant/
├── README.md                      # Project overview
├── package.json                   # Dependencies and scripts
├── template.yaml                  # CloudFormation template
├── .env.example                   # Environment variables template
│
├── backend/
│   ├── lambda/
│   │   ├── connect-handler/       # Call entry point
│   │   ├── lex-fulfillment/       # Intent processing
│   │   ├── bedrock-agent/         # LLM reasoning
│   │   └── data-processor/        # Image analysis
│   ├── services/
│   │   ├── database.service.js    # DynamoDB utilities
│   │   └── voice.service.js       # Polly utilities
│   └── tests/
│       ├── lex.test.js            # Lex unit tests
│       └── integration.test.js    # Integration tests
│
├── voice/
│   ├── lex-intents/               # Intent definitions
│   │   ├── crop-advice.json
│   │   └── pest-detection.json
│   ├── prompts/
│   │   └── agricultural-advisor.txt
│   └── polly-config/
│       └── voice-settings.json
│
├── db/
│   └── schemas/                   # DynamoDB schemas
│
└── docs/
    ├── api.md                     # API documentation
    ├── deployment.md              # Deployment guide
    └── architecture.md            # Architecture details
```

## Key AWS Services Used

| Service | Purpose | Cost |
|---------|---------|------|
| **Amazon Connect** | Call-in IVR system | $0.0075/min |
| **Amazon Lex** | Natural language understanding | $0.00075/request |
| **Amazon Bedrock (Claude)** | LLM-powered reasoning | $0.0025/1K tokens |
| **Lambda** | Serverless compute | $0.0000167/GB-sec |
| **Amazon Polly** | Text-to-speech in local languages | $0.0001/1K chars |
| **DynamoDB** | NoSQL database | $1.25/million writes |
| **S3** | Media storage | $0.023/GB/month |

**Estimated cost per farmer interaction: ~$0.05**

## Intents Currently Configured

1. **CropAdvice** - Get farming recommendations
2. **PestDetection** - Identify and treat pests
3. **WeatherAdvice** - Weather-based farming guidance
4. **MarketPrice** - Current crop prices
5. **SoilHealth** - Soil analysis and recommendations

## Supported Languages

- 🇮🇳 Hindi (hin) - Aditi voice
- 🇮🇳 Tamil (tam) - Tamizh voice
- 🇮🇳 Telugu (tel) - Telugu voice
- 🇮🇳 Kannada (kan) - Kannada voice
- 🇮🇳 Malayalam (mal) - Malayalam voice
- 🇮🇳 Marathi (mar) - Marathi voice
- 🇬🇧 English (eng) - Joanna voice

## Deployment Checklist

### Pre-Deployment
- [ ] AWS account with appropriate permissions
- [ ] AWS CLI configured with credentials
- [ ] Node.js 18+ installed
- [ ] SAM CLI installed
- [ ] `.env` file configured
- [ ] CloudFormation parameters reviewed

### Deployment
- [ ] Run `sam deploy --guided`
- [ ] Verify stack creation in CloudFormation
- [ ] Check Lambda functions are active
- [ ] Verify DynamoDB tables created
- [ ] Test S3 bucket access

### Post-Deployment
- [ ] Test Connect flow manually
- [ ] Verify Lex bot trained and published
- [ ] Check Polly voices available
- [ ] Monitor CloudWatch logs
- [ ] Setup alarms for critical metrics

## Testing

### Unit Tests
```bash
npm run test:lex
```

### Integration Tests
```bash
npm run test:integration
```

### Manual Testing
```bash
# Local API
sam local start-api

# In another terminal
curl -X POST http://localhost:3000/fulfillment \
  -H "Content-Type: application/json" \
  -d '{
    "currentIntent": {
      "name": "CropAdvice",
      "slots": {"cropType": "tomato", "issue": "yellow leaves"}
    },
    "invocationSource": "FulfillmentCodeHook",
    "userId": "farmer_test"
  }'
```

## Monitoring & Debugging

### CloudWatch Logs
```bash
# Watch Connect handler logs
aws logs tail /aws/lambda/vfa-connect-handler-dev --follow

# Watch Lex logs
aws logs tail /aws/lambda/vfa-lex-fulfillment-dev --follow
```

### Lambda Console
- Check for errors and throttling
- Monitor duration and memory usage
- Review concurrent executions

### DynamoDB Console
- Monitor write/read capacity
- Check for throttled operations
- Review stored farmer profiles

## Scaling Considerations

- **Concurrent Calls**: Adjust Lambda concurrency in console
- **Database**: Switch from on-demand to provisioned for consistent traffic
- **Bedrock**: Request higher token limits if needed
- **Polly**: Automatically scales, no configuration needed

## Security Best Practices

1. ✅ Use IAM roles for Lambda
2. ✅ Enable encryption at rest (S3, DynamoDB)
3. ✅ Use TLS for all API calls
4. ✅ Implement DynamoDB point-in-time recovery
5. ✅ Enable CloudTrail for audit logging
6. ✅ Rotate AWS credentials regularly
7. ✅ Use VPC endpoints for private connectivity

## Next Steps

1. **Deploy**: Follow deployment guide in `docs/deployment.md`
2. **Configure**: Setup Amazon Connect with provided contact flows
3. **Test**: Test with sample farmer scenarios
4. **Monitor**: Setup CloudWatch dashboards
5. **Iterate**: Collect feedback and improve prompts
6. **Scale**: Add more crops, languages, and features

## Support Resources

- 📚 [Architecture Guide](./docs/architecture.md)
- 🚀 [Deployment Guide](./docs/deployment.md)
- 📖 [API Documentation](./docs/api.md)
- 🤝 [Contributing Guidelines](./CONTRIBUTING.md)

## Contact

- **Project**: Voice Farming Assistant
- **Repository**: github.com/IkigaiAndra/voice-farming-assistant
- **License**: MIT

---

**🌾 Bringing agricultural intelligence to every farmer in India through voice.** 🚀
