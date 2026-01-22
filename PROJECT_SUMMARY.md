# Voice Farming Assistant - Project Summary

## 🌾 Vision

**India's first voice-native agricultural intelligence system** - Removing barriers of literacy, smartphone complexity, and English language by bringing intelligent farming advice directly through voice to every farmer in India.

## ✨ What Makes This Special

### The Problem It Solves
- **60%+ of Indian farmers are non-literate** - Can't use app UIs or type text
- **Smartphone complexity** - IVR and voice-based systems are more natural
- **Language barriers** - Support for 6 Indian regional languages out of the box
- **Internet limitation** - Works on 2G networks and basic phones
- **Scalability** - Serverless architecture can handle millions of farmers

### Why This Wins Hackathons
✅ Immediately understandable impact  
✅ Works on basic phones and WhatsApp  
✅ Easily demonstrable live  
✅ Uses latest AWS AI services  
✅ Solves real India-specific problem  
✅ Scalable with minimal infrastructure  

## 🏗️ Project Structure

```
voice-farming-assistant/
├── 📄 Core Configuration
│   ├── README.md                    (Project overview)
│   ├── QUICKSTART.md                (Quick reference)
│   ├── CONTRIBUTING.md              (Contribution guide)
│   ├── LICENSE                      (MIT License)
│   ├── package.json                 (Dependencies)
│   ├── template.yaml                (CloudFormation IaC)
│   ├── setup.sh                     (Setup automation)
│   └── .env.example                 (Environment template)
│
├── 🔌 Backend Services
│   └── backend/
│       ├── lambda/                  (AWS Lambda functions)
│       │   ├── connect-handler/     ▸ Call ingestion & routing
│       │   ├── lex-fulfillment/     ▸ Intent processing
│       │   ├── bedrock-agent/       ▸ LLM reasoning
│       │   └── data-processor/      ▸ Image analysis
│       ├── services/                (Business logic)
│       │   ├── database.service.js  ▸ DynamoDB operations
│       │   ├── voice.service.js     ▸ Polly integration
│       │   └── bedrock-prompts.js   ▸ LLM prompts
│       └── tests/                   (Unit & integration tests)
│           ├── lex.test.js
│           └── integration.test.js
│
├── 🎤 Voice Configuration
│   └── voice/
│       ├── lex-intents/             (NLU Intent definitions)
│       │   ├── crop-advice.json
│       │   └── pest-detection.json
│       ├── prompts/                 (Bedrock system prompts)
│       │   └── agricultural-advisor.txt
│       └── polly-config/            (Voice settings)
│           └── voice-settings.json
│
└── 📚 Documentation
    └── docs/
        ├── api.md                   (API reference)
        ├── deployment.md            (Step-by-step setup)
        └── architecture.md          (Technical architecture)
```

## 🚀 Key Features

### 1. Voice-First Interface
- **Amazon Connect**: IVR for inbound calls
- **Support for**: Regular calls, missed call callbacks, WhatsApp voice
- **Languages**: Hindi, Tamil, Telugu, Kannada, Malayalam, Marathi, English

### 2. Natural Language Understanding
- **Amazon Lex**: Intent recognition and slot extraction
- **5 Core Intents**:
  - CropAdvice: Farming recommendations
  - PestDetection: Pest identification
  - WeatherAdvice: Weather-based guidance
  - MarketPrice: Crop prices
  - SoilHealth: Soil analysis

### 3. Intelligent Recommendations
- **Amazon Bedrock (Claude)**: LLM-powered agricultural reasoning
- **Context-Aware**: Farmer location, crop history, weather patterns
- **Practical Advice**: Step-by-step actionable recommendations
- **Organic-First**: Prioritizes sustainable farming methods

### 4. Voice Output
- **Amazon Polly**: Text-to-speech in regional languages
- **Neural Voices**: Natural-sounding responses
- **Low Bandwidth**: Optimized for 2G networks

### 5. Image Analysis
- **AWS Rekognition**: Crop detection and issue identification
- **Automated**: S3 trigger-based processing
- **Intelligence**: Labels, confidence scores, issue detection

### 6. Data Management
- **Farmer Profiles**: DynamoDB for farmer data
- **Crop History**: Track crops and treatments
- **Conversation Logs**: Call history and interactions
- **Media Storage**: S3 for uploaded images

## 📊 AWS Technology Stack

| Layer | Service | Purpose |
|-------|---------|---------|
| **Ingress** | Amazon Connect | IVR call handling |
| **NLU** | Amazon Lex | Intent recognition |
| **Logic** | Lambda | Serverless compute |
| **AI** | Bedrock (Claude) | LLM reasoning |
| **Vision** | Rekognition | Image analysis |
| **Voice** | Polly | Text-to-speech |
| **Storage** | DynamoDB | Farmer/crop data |
| **Files** | S3 | Images & models |
| **Monitoring** | CloudWatch | Logs & metrics |

## 💰 Cost Model

**Estimated cost per farmer interaction: ~$0.05**

```
Connect: $0.0075/min
Lex: $0.00075/request
Bedrock: $0.0025/1K tokens
Lambda: $0.0000167/GB-sec
Polly: $0.0001/1K chars
DynamoDB: $0.0000125/write
S3: Negligible for this use case
────────────────────────
TOTAL: ~$0.05/interaction
```

**Scalability**: 1 million farmer interactions = ~$50,000/month

## 🔄 Data Flow

```
Farmer calls or sends WhatsApp
         ↓
Amazon Connect (IVR)
         ↓
Amazon Lex (Intent recognition)
         ↓
Lambda (Business logic)
         ↓
Amazon Bedrock (LLM reasoning)
         ↓
DynamoDB (Store context)
         ↓
Amazon Polly (Voice generation)
         ↓
Response via call or WhatsApp
```

## 🎯 Use Cases

1. **"Tell me what to do for my tomato plants"**
   → Crop advice intent → Bedrock analyzes crop history → Polly speaks recommendations

2. **"Pests on my wheat"**
   → Send photo → Rekognition identifies pest → Bedrock suggests organic solutions

3. **"Should I irrigate?"**
   → Weather context → Bedrock provides schedule → SMS + voice response

4. **"What's the price of cotton?"**
   → Market data lookup → Current price + trend analysis

5. **"My soil is yellow, what's wrong?"**
   → Soil health intent → Nutrient analysis → Recommendations

## 📈 Metrics & Monitoring

Track these KPIs in CloudWatch:
- **Call metrics**: Total calls, duration, success rate, language breakdown
- **System metrics**: Lambda duration/errors, DynamoDB throttles, Bedrock latency
- **Business metrics**: Farmers registered, top crops, top issues, CSAT

## 🔒 Security & Compliance

- ✅ IAM roles for least privilege
- ✅ Encryption at rest (S3, DynamoDB)
- ✅ TLS for all API calls
- ✅ Point-in-time recovery (DynamoDB)
- ✅ CloudTrail audit logging
- ✅ No hardcoded credentials
- ✅ VPC endpoints ready

## 🚀 Deployment

### Quick Start
```bash
# 1. Clone and install
git clone https://github.com/IkigaiAndra/voice-farming-assistant.git
cd voice-farming-assistant
npm install

# 2. Configure
aws configure
cp .env.example .env

# 3. Deploy
sam deploy --guided
```

### Full Setup: See [QUICKSTART.md](./QUICKSTART.md)
Detailed: See [Deployment Guide](./docs/deployment.md)

## 🛠️ Development

### Local Testing
```bash
sam local start-api
npm run test:lex
npm run test:integration
```

### Adding Features
1. Create intent in Lex
2. Add fulfillment logic in Lambda
3. Add Bedrock prompt
4. Write tests
5. Update documentation
6. Create PR

## 📚 Documentation

- **[README.md](./README.md)** - Project overview
- **[QUICKSTART.md](./QUICKSTART.md)** - Quick reference guide
- **[CONTRIBUTING.md](./CONTRIBUTING.md)** - Contribution guide
- **[docs/deployment.md](./docs/deployment.md)** - Deployment instructions
- **[docs/api.md](./docs/api.md)** - API reference
- **[docs/architecture.md](./docs/architecture.md)** - Technical architecture

## 🌍 Supported Languages

| Language | Voice | Code |
|----------|-------|------|
| Hindi | Aditi (Neural) | hin |
| Tamil | Tamizh (Neural) | tam |
| Telugu | Telugu (Neural) | tel |
| Kannada | Kannada (Neural) | kan |
| Malayalam | Malayalam (Neural) | mal |
| Marathi | Marathi (Neural) | mar |
| English | Joanna (Neural) | eng |

## 🎓 Learning Resources

- [AWS Connect Documentation](https://docs.aws.amazon.com/connect/)
- [Amazon Lex Guide](https://docs.aws.amazon.com/lex/)
- [Amazon Bedrock](https://docs.aws.amazon.com/bedrock/)
- [AWS SAM](https://docs.aws.amazon.com/serverless-application-model/)

## 🤝 Contributing

We welcome contributions! See [CONTRIBUTING.md](./CONTRIBUTING.md) for:
- Development setup
- Code style guidelines
- Testing requirements
- Pull request process
- Areas needing help

## 📋 Roadmap

### Phase 1: MVP (Current)
- ✅ Voice call integration
- ✅ Multi-language support
- ✅ Crop advisory
- ✅ Image analysis
- ✅ Farmer profiles

### Phase 2: Enhancement
- 🔄 Advanced pest detection
- 🔄 Real weather API integration
- 🔄 Government subsidy recommendations
- 🔄 Equipment rental marketplace

### Phase 3: Scale
- 🔄 Multi-region deployment
- 🔄 Community platform
- 🔄 Direct buyer connections
- 🔄 Supply chain integration

### Phase 4: Intelligence
- 🔄 Personalized recommendations
- 🔄 Predictive alerts
- 🔄 Smart irrigation scheduling
- 🔄 Crop yield optimization

## 📞 Support

- **Issues**: GitHub Issues for bugs and features
- **Discussions**: GitHub Discussions for questions
- **Email**: contact@example.com
- **Community**: Join our Slack workspace

## 📄 License

MIT License - See [LICENSE](./LICENSE) file for details

## 🙏 Acknowledgments

- Built for AWS India Community
- Designed for Indian farmers
- Inspired by agricultural innovation
- Powered by AWS AI services

---

## 🎯 Why This Project Matters

**61% of India's population depends on agriculture.** Many are small farmers with limited literacy. Traditional digital agriculture solutions fail because:
- ❌ Require reading/writing
- ❌ Complex mobile interfaces
- ❌ English language barrier
- ❌ Need reliable internet

**Voice Farming Assistant solves this** by:
- ✅ Working through simple phone calls
- ✅ Supporting regional languages
- ✅ Providing intelligent recommendations
- ✅ Accessible from any phone

**This isn't just an app - it's a movement to democratize agricultural intelligence.**

---

**🌾 Building India's Agricultural Future - One Voice at a Time** 🚀

Repository: [github.com/IkigaiAndra/voice-farming-assistant](https://github.com/IkigaiAndra/voice-farming-assistant)
