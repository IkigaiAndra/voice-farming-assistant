# Architecture and Design

## System Overview

Voice Farming Assistant is a voice-first agricultural advisory system designed for rural farmers in India. It removes barriers of literacy and smartphone complexity by providing intelligent farming advice through simple phone calls or voice messages.

## Key Principles

1. **Voice-Native**: Optimized for voice interactions, not text-based UI
2. **Inclusive**: Works on any phone (2G, 3G, 4G) without requiring internet literacy
3. **Intelligent**: Uses LLMs for contextual agricultural reasoning
4. **Scalable**: Serverless architecture handles millions of farmers
5. **Cost-Effective**: Pay-per-use pricing model

## Component Architecture

### 1. Call Ingress Layer

**Amazon Connect**
- Manages incoming phone calls from farmers
- Provides Interactive Voice Response (IVR) for call routing
- Handles missed call callbacks
- Records call analytics and quality metrics

**WhatsApp Integration**
- Accepts voice messages and queries
- Routes to same processing pipeline as phone calls
- Enables asynchronous interactions

### 2. Natural Language Understanding

**Amazon Lex**
- Recognizes farmer intent from voice input
- Extracts relevant information (crop type, issue description)
- Manages multi-turn conversations
- Supports regional languages

**Intent Recognition**
```
Input: "मेरे टमाटर की पत्तियां पीली पड़ रही हैं"
↓
Lex Intent Matching
↓
Intent: CropAdvice
Slots: {cropType: "tomato", issue: "yellowing leaves"}
```

### 3. Business Logic and Intelligence

**Lambda Functions**
- `connect-handler`: Processes inbound calls
- `lex-fulfillment`: Executes intent logic
- `bedrock-agent`: Calls LLM for recommendations
- `data-processor`: Analyzes uploaded images

**Processing Pipeline**
```
Query → Farmer Profile Lookup → Intent Classification 
→ Context Building → LLM Reasoning → Response Generation
```

### 4. Reasoning Engine

**Amazon Bedrock**
- Runs Claude LLM for agricultural reasoning
- Generates personalized farming advice
- Considers farmer's crop type and location
- Provides step-by-step recommendations

**Bedrock Prompts**
- Agricultural advisor system prompt
- Few-shot examples for different crops
- Local language responses
- Culturally appropriate recommendations

### 5. Data Storage

**DynamoDB Tables**

| Table | Purpose | Key | TTL |
|-------|---------|-----|-----|
| FarmerProfile | Farmer info & preferences | farmerId | None |
| CropData | Crop-specific information | cropId + timestamp | None |
| ConversationHistory | Call logs & interactions | conversationId + timestamp | 90 days |

**S3 Buckets**

| Bucket | Purpose | Content |
|--------|---------|---------|
| vfa-media | Crop photos | Image files from farmers |
| vfa-models | ML models | Pre-trained crop detection models |

### 6. Voice Generation

**Amazon Polly**
- Converts text recommendations to speech
- Supports 6 Indian languages (Hindi, Tamil, Telugu, Kannada, Malayalam, Marathi)
- Neural voices for natural-sounding responses
- Optimized for low-bandwidth connections

**Multi-Language Support**
```
Response Text (Hindi)
↓
Amazon Polly (Neural Aditi)
↓
MP3 Audio (128 kbps)
↓
Delivered via phone/WhatsApp
```

## Data Flow

### Call Flow Diagram

```
┌─────────────┐
│   Farmer    │ (calls or sends WhatsApp)
└──────┬──────┘
       │
       ▼
┌──────────────────┐
│ Amazon Connect   │ (IVR routing)
└──────┬───────────┘
       │
       ▼
┌──────────────────────────┐
│ Lambda: connect-handler  │ (identify farmer)
└──────┬───────────────────┘
       │
       ▼
┌──────────────────────┐
│ Amazon Lex           │ (NLU & intent recognition)
└──────┬───────────────┘
       │
       ▼
┌──────────────────────────┐
│ Lambda: lex-fulfillment  │ (business logic)
└──┬──────────────────────┬┘
   │ (queries context)    │ (for complex advice)
   │                      │
   ▼                      ▼
┌──────────────┐  ┌──────────────────────┐
│ DynamoDB     │  │ Lambda: bedrock-agent│
│ (farmer data)│  │ (LLM reasoning)      │
└──────────────┘  └──────────┬───────────┘
                             │
                             ▼
                  ┌──────────────────────┐
                  │ Amazon Bedrock       │
                  │ (Claude LLM)         │
                  └──────────┬───────────┘
                             │
                             ▼
                  ┌──────────────────────┐
                  │ Amazon Polly         │
                  │ (Text-to-Speech)     │
                  └──────────┬───────────┘
                             │
                             ▼
                  ┌──────────────────────┐
                  │ Response to Farmer   │
                  │ (Voice + Optional SMS)
                  └──────────────────────┘
```

### Image Analysis Flow

```
Farmer uploads crop photo
         │
         ▼
S3 Upload Trigger
         │
         ▼
┌──────────────────────────┐
│ Lambda: data-processor   │
└──────┬───────────────────┘
       │
       ▼
┌──────────────────────┐
│ AWS Rekognition      │
│ - detectLabels       │
│ - detectText         │
└──────┬───────────────┘
       │
       ▼
┌──────────────────────┐
│ Analysis Results     │
│ - Crop type         │
│ - Issues detected   │
│ - Labels & confidence
└──────┬───────────────┘
       │
       ▼
┌──────────────────────┐
│ DynamoDB Storage     │
│ (CropData table)     │
└──────────────────────┘
```

## Security Architecture

### Authentication & Authorization

```
┌─────────────────────────────────────────┐
│ IAM Roles                               │
├─────────────────────────────────────────┤
│ Lambda Execution Role                   │
│ - DynamoDB: Read/Write FarmerProfile    │
│ - DynamoDB: Read/Write CropData         │
│ - S3: Read/Write vfa-media              │
│ - Bedrock: InvokeModel                  │
│ - Polly: SynthesizeSpeech                │
│ - Rekognition: DetectLabels/Text        │
└─────────────────────────────────────────┘
```

### Data Protection

- **Encryption**: AES-256 for data at rest (DynamoDB, S3)
- **Encryption in Transit**: TLS 1.3 for API calls
- **PII Handling**: Phone numbers and farmer IDs in separate indexes
- **Access Logs**: CloudWatch logs with 30-day retention

## Scalability Design

### Horizontal Scaling

- **Lambda**: Auto-scales to handle thousands of concurrent calls
- **DynamoDB**: On-demand billing scales automatically
- **Bedrock**: Rate limiting can be adjusted for capacity
- **Polly**: Scales transparently

### Performance Optimization

```
Caching Strategy:
┌──────────────────────────────┐
│ Farmer Profile (DynamoDB)    │ 1-hour TTL
├──────────────────────────────┤
│ Common Recommendations       │ 24-hour TTL
│ (ElastiCache - optional)     │
├──────────────────────────────┤
│ Market Prices                │ 6-hour TTL
│ (External API Cache)         │
└──────────────────────────────┘
```

### Latency Targets

- IVR Response: <1 second
- Lex NLU: <2 seconds
- Bedrock LLM: <5 seconds
- Polly TTS: <2 seconds
- **Total E2E**: <10 seconds

## Cost Model

### Per-Farmer-Interaction Costs

| Component | Cost | Duration |
|-----------|------|----------|
| Amazon Connect | $0.0075 | per minute |
| Lex Fulfillment | $0.00075 | per request |
| Bedrock Claude | $0.0025 | per 1K input tokens |
| Lambda | $0.0000167 | per GB-second |
| Polly | $0.0001 | per 1K characters |
| DynamoDB | $0.0000125 | per write unit |
| **Total per interaction** | ~$0.05 | |

## Disaster Recovery

### RTO & RPO

- **RTO** (Recovery Time Objective): 15 minutes
- **RPO** (Recovery Point Objective): 1 hour

### Backup Strategy

```
DynamoDB
├── Point-in-time recovery: 35 days
├── On-demand backups
└── Cross-region replication (optional)

S3
├── Versioning: Enabled
├── Cross-region replication
└── Lifecycle policies: 7-year retention
```

### Failover Mechanism

- Multi-region deployment ready
- Lambda functions duplicated in backup region
- DynamoDB Global Tables for data sync
- Route 53 health checks for automatic failover

## Future Enhancements

### Phase 2: Advanced Features
- Crop pest detection via image
- Weather integration with actual APIs
- Government subsidy recommendations
- Soil testing kit integration
- Equipment rental marketplace

### Phase 3: ML Optimization
- Personalized recommendations based on farming history
- Predictive alerts for disease/pest outbreaks
- Optimal planting calendar per region
- Smart irrigation scheduling

### Phase 4: Ecosystem
- Farmer community platform
- Peer-to-peer knowledge sharing
- Supply chain integration
- Direct buyer connections

## Monitoring & Observability

```
CloudWatch Dashboard
├── Call Metrics
│   ├── Total calls
│   ├── Call duration
│   ├── Success rate
│   └── Language breakdown
├── System Metrics
│   ├── Lambda duration/errors
│   ├── DynamoDB throttles
│   ├── Bedrock errors
│   └── Polly latency
└── Business Metrics
    ├── Farmers per region
    ├── Top crops asked about
    ├── Top issues detected
    └── CSAT scores
```

## Regulatory Compliance

- **GDPR**: Not directly applicable but privacy by design
- **India Data Protection**: Farmer data stored in India region
- **Telecom**: Connect compliant with TRAI regulations
- **Accessibility**: WCAG 2.1 AA standards for web components
