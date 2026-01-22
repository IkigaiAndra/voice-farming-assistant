# 🌾 Voice Farming Assistant - Deep Thinking AI Advisory System

## 🎯 What This System Does

This is an **AI-powered agricultural advisory platform** specifically designed for Indian farmers. It provides **ChatGPT-style deep analysis** considering:

- **Location**: District, state, region, altitude
- **Weather**: Real-time + 7-day forecast + seasonal alerts
- **Soil**: Type, pH, nutrients, deficiencies with improvement plans
- **Crops**: Current, recommended, alternatives with profitability data
- **Market**: Prices, trends, demand, supply, MSP, nearby markets
- **Profitability**: Income, costs, profit margin, ROI, maximization strategies
- **Seasonal**: Current tasks, upcoming season preparation
- **Risks**: Weather, pest, disease, market risks with mitigation
- **Opportunities**: Cost reduction, yield increase, diversification, value-addition

## 🚀 Key Features

### 1. **ChatGPT-Style Interface** 
- Beautiful dark-mode UI matching modern AI apps
- Message history with context awareness
- 7 Indian language support (Hindi, Tamil, Telugu, Kannada, Malayalam, Marathi, English)
- Mobile-optimized responsive design

### 2. **Voice Input & Output**
- Speak your question in any Indian language
- Get AI response with audio playback
- Convert voice to text using speech recognition
- Convert AI response to speech in your language

### 3. **Deep Context Analysis**
- Aggregates 9 different dimensions of farmer's situation
- Automatically fetches location-specific data
- Real-time weather + seasonal forecasts
- Soil analysis and improvement recommendations
- Market price trends and demand analysis
- Government scheme identification

### 4. **Intelligent Prompt Routing**
System automatically detects query intent and uses specialized prompt:
- **"Profit"** → Profit maximization analysis (immediate, short, medium, long-term)
- **"Crop"** → Crop selection with rotation strategy
- **"Pest"** → Pest identification + 3 treatment options
- **"Water"** → Irrigation optimization + water conservation
- **"Scheme"** → Government subsidies + application process
- **Default** → Comprehensive multi-aspect advisory

### 5. **Action Plan Generation**
- Step-by-step actionable recommendations
- Priority levels (High/Medium/Low)
- Expandable details with reasoning
- Implementation timeline

### 6. **Scenario Analysis**
- What-if analysis for different situations
- Water shortage impact modeling
- Price drop contingency planning
- Pest outbreak mitigation
- Yield improvement opportunities

### 7. **Farmer Insights Dashboard**
- Visual display of all 9 context dimensions
- Real-time market data
- Soil health indicators
- Weather alerts
- Profitability metrics
- Opportunity cards with potential savings

## 📊 System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│           AdvancedFarmerInterface (React Component)          │
│  (ChatGPT-style UI with voice, text, insights, profile)      │
└────────────────┬────────────────────────────────────────────┘
                 │
         ┌───────▼────────┐
         │  API Calls     │
         └───────┬────────┘
                 │
    ┌────────────┼────────────┐
    │            │            │
    ▼            ▼            ▼
┌────────┐  ┌─────────┐  ┌────────────┐
│ Deep   │  │ Farmer  │  │ Deep Chat  │
│ Chat   │  │Context  │  │ Routes     │
│ Routes │  │ Service │  │ (API)      │
└─┬──────┘  └────┬────┘  └────────────┘
  │             │
  └─────┬───────┘
        │
        ▼
  ┌──────────────────────┐
  │ Deep Thinking        │
  │ Prompts Generator    │
  │ (6 specialized       │
  │  prompt types)       │
  └──────┬───────────────┘
         │
         ▼
  ┌──────────────────────┐
  │ AWS Bedrock          │
  │ (Claude 3 Haiku)     │
  │ Extended Thinking    │
  └──────┬───────────────┘
         │
         ▼
  ┌──────────────────────┐
  │ AWS Polly            │
  │ (Speech Synthesis)   │
  │ 7 Languages          │
  └──────────────────────┘
```

## 💻 Technology Stack

### Frontend
- **React 17+** - UI framework
- **Axios** - HTTP client
- **Web Audio API** - Voice recording
- **CSS3** - Animations & responsive design

### Backend
- **Node.js + Express.js** - API server
- **AWS SDK v3** - Cloud services
- **AWS Bedrock** - AI inference (Claude 3)
- **AWS Polly** - Text-to-speech
- **AWS S3** - Audio storage
- **AWS DynamoDB** - Farmer data
- **Twilio** - WhatsApp integration

### Data Sources (Mock/Real)
- **Weather API** - OpenWeatherMap / IMD
- **Market Data** - AGRIMARKET / Mandi databases
- **Government Schemes** - Ministry of Agriculture
- **Soil Data** - ICAR recommendations

## 📁 Project Structure

```
/workspaces/voice-farming-assistant/
├── frontend/
│   ├── components/
│   │   ├── AdvancedFarmerInterface.jsx      ← Main ChatGPT-style UI
│   │   ├── AdvancedFarmerInterface.css      ← Beautiful styling
│   │   ├── FarmerInterface.jsx              ← Legacy interface
│   │   └── FarmerInterface.css
│   └── src/
│       ├── App.jsx
│       └── App.css
│
├── backend/
│   ├── server.js                           ← Express server
│   ├── services/
│   │   ├── farmer-context.js               ← 9D context aggregation
│   │   ├── deep-thinking-prompts.js        ← Prompt engineering
│   │   ├── response-formatter.js           ← Response formatting
│   │   └── voice-processor.js              ← Audio handling
│   │
│   ├── routes/
│   │   ├── deep-chat.api.js                ← ChatGPT endpoints
│   │   ├── chat.api.js                     ← Legacy chat routes
│   │   └── ...other routes
│   │
│   └── webhooks/
│       └── whatsapp-handler.js             ← WhatsApp integration
│
├── DEEP_THINKING_INTEGRATION.md            ← Integration guide
└── README.md                               ← This file
```

## 🔧 API Endpoints

### Main Endpoint: Deep Chat
```http
POST /api/deep-chat
Content-Type: application/json

{
  "query": "कैसे अपनी आय बढ़ा सकता हूँ?",
  "farmerId": "farmer_001",
  "language": "hin"
}
```

**Response:**
```json
{
  "success": true,
  "response": {
    "text": "Comprehensive analysis based on all 9 context dimensions...",
    "audioUrl": "https://s3.amazonaws.com/polly-response.mp3",
    "context": {
      "location": { "state": "Haryana", "district": "Hisar", ... },
      "weather": { "current": { "temperature": 28, ... }, ... },
      "soil": { "type": "Loamy", "pH": 6.8, ... },
      "market": { "price": 2500, "trend": "stable", ... },
      "profitability": { "currentProfit": 105000, "roi": 84, ... }
    },
    "actionPlan": [
      { "step": 1, "action": "Apply zinc-enriched fertilizer", "priority": "High" },
      { "step": 2, "action": "Reduce labor cost", "priority": "Medium" }
    ],
    "opportunities": {
      "costReduction": [{ "opportunity": "Organic fertilizer", "savings": "₹1,000" }],
      "yieldIncrease": [{ "opportunity": "Better seeds", "savings": "₹12,500" }]
    }
  }
}
```

### Other Key Endpoints
- `POST /api/profile-setup` - Set up farmer profile
- `GET /api/farmer-insights/:farmerId` - Get comprehensive insights
- `POST /api/scenario-analysis` - What-if analysis
- `POST /api/transcribe` - Voice to text

## 🎤 Voice Features

### Recording
```javascript
// Start recording (5 seconds max)
const response = await fetch('/api/transcribe', {
  method: 'POST',
  body: JSON.stringify({
    audioBase64: audioBlob,
    language: 'hin',
    farmerId: 'farmer_001'
  })
});
```

### Playback
```javascript
// Play AI response in farmer's language
const audio = new Audio(audioUrl);
audio.play();
```

### Supported Languages
- 🇮🇳 Hindi (हिंदी)
- 🇮🇳 Tamil (தமிழ்)
- 🇮🇳 Telugu (తెలుగు)
- 🇮🇳 Kannada (ಕನ್ನಡ)
- 🇮🇳 Malayalam (മലയാളം)
- 🇮🇳 Marathi (मराठी)
- 🇬🇧 English

## 📈 How It Works - Complete Flow

### Step 1: Farmer Opens App
1. App loads farmer's profile from localStorage/database
2. Calls `GET /api/farmer-insights/:farmerId`
3. Receives all 9 context dimensions
4. Displays insights dashboard with current situation

### Step 2: Farmer Asks Question
**Via Text:**
```
User: "कैसे अपनी आय बढ़ा सकता हूँ?"
```

**Via Voice:**
```
User: [Speaks for 5 seconds]
↓
Web Audio API captures audio
↓
Sent to `/api/transcribe`
↓
Converted to: "कैसे अपनी आय बढ़ा सकता हूँ?"
```

### Step 3: Backend Deep Analysis
```
1. Query received: "कैसे अपनी आय बढ़ा सकता हूँ?"

2. FarmerContextAggregator builds 9D context:
   - buildFarmerContext() → fetches all dimensions
   - Returns: { location, weather, soil, crops, market, profitability, seasonal, risks, opportunities }

3. DeepThinkingPrompts selects prompt type:
   - Detects keyword "आय" (income/profit)
   - Routes to: generateProfitMaximizationPrompt()

4. Specialized prompt generated with full context:
   System: "You are expert Indian agricultural advisor. Here's farmer context: [9D context]"
   User: "हो सकता हूँ? Profit analysis for immediate (this month), short-term (3mo), medium-term (6mo), long-term (1yr) actions."

5. AWS Bedrock (Claude 3 Haiku) processes:
   - Uses extended thinking for deep analysis
   - Considers all 9 context dimensions
   - Generates comprehensive profit strategies

6. Response includes:
   - Text: "Based on your Haryana location, loamy soil with zinc deficiency..."
   - Action Plan: [Step-by-step recommendations]
   - Opportunities: [Cost reduction, yield increase, diversification]

7. AWS Polly converts to audio in Hindi
   - Saves MP3 to S3
   - Returns URL for playback

8. Response sent to frontend with:
   - Full text explanation
   - Audio URL
   - Context used (9 dimensions)
   - Action plan
   - Opportunities
```

### Step 4: Farmer Sees Response
```
Display shows:
├─ AI Response Text (with audio play button)
├─ Context Used (expandable - shows all 9 dimensions)
├─ Action Plan (expandable - with priorities)
└─ Profit Opportunities (expandable - with savings)

Farmer can:
✓ Listen to audio response in their language
✓ Expand to understand reasoning
✓ Follow action plan step-by-step
✓ Ask follow-up questions
✓ View scenario analysis (what-if)
```

## 💡 Example Conversations

### Example 1: Profit Maximization
```
Farmer: "कैसे अपनी गेहूं की खेती से ज्यादा लाभ कर सकता हूँ?"
(How can I earn more profit from wheat farming?)

AI Analysis considers:
- Your Hisar location (semi-arid, temperature 28°C)
- Your loamy soil with zinc deficiency
- Current market: ₹2,500/quintal
- Current profit: ₹105,000 (84% ROI)
- 7-day forecast: No rain expected
- Current season: Harvesting phase

Action Plan:
1. [IMMEDIATE] Apply zinc-enriched fertilizer (₹1,000 cost)
   → Increases yield 5-10% = ₹6,250-₹12,500 extra profit
   
2. [THIS WEEK] Reduce labor cost with shared machinery rental
   → Saves ₹2,000 on hiring
   
3. [NEXT MONTH] Apply for govt fertilizer subsidy
   → Additional ₹2,500 support

Opportunities:
- Cost Reduction: ₹3,000 savings through organic methods
- Yield Increase: ₹12,500 additional with better seeds
- Diversification: Plant chickpea next season = ₹140,000 vs ₹105,000

Audio Response: [Play button] ▶️ Listen in हिंदी (60 seconds)
```

### Example 2: Pest Management
```
Farmer: "मेरी फसल में भूरे प्लिंक्स हैं क्या करूँ?"
(My crop has brown spots, what to do?)

AI Analysis:
- Likely fungal disease (based on symptom description)
- Your weather: 28°C, 65% humidity (ideal for fungi)
- Current stage: Heading stage (vulnerable)
- Soil: Good drainage, reduces disease spread

Treatment Options (3 choices):
1. ORGANIC:
   - Sulfur dust spray (₹200/kg)
   - Cost: ₹1,000 for full field
   - Effectiveness: 70%
   
2. CHEMICAL (Recommended):
   - Carbendazim 12% WP (₹150/500ml)
   - Cost: ₹800 for 3 sprays
   - Effectiveness: 90%
   
3. INTEGRATED:
   - Remove infected leaves + spray
   - Cost: ₹1,200
   - Effectiveness: 95%

Risk Mitigation:
- Spray in early morning (6-8 AM)
- Weather forecast: No rain for 3 days (good for spray)
- Next preventive spray: In 2 weeks

Estimated impact if untreated:
- 20-30% yield loss = ₹5,000-₹7,500 loss

Audio Response: [Play button] ▶️ Listen in हिंदी (90 seconds)
```

### Example 3: Crop Selection
```
Farmer: "अगला सीज़न किस फसल को उगाऊँ?"
(What crop should I grow next season?)

AI Analysis based on your context:
- Location: Hisar, Haryana (wheat belt)
- Soil: Loamy (suitable for rotation)
- Next Season: Rabi (Oct-Mar)
- Market: Strong demand for legumes
- Water: 3 tubewell irrigations available

Top 3 Recommendations:

1. CHICKPEA (Recommended)
   - Profitability: ₹140,000 (33% better than wheat)
   - Soil: Repairs nitrogen depletion
   - Market: MSP ₹5,000/quintal (good demand)
   - Water: 2 irrigations needed
   - Rotation: Perfect after wheat

2. MUSTARD
   - Profitability: ₹120,000
   - Weather: Ideal for Haryana
   - Market: Oil extraction opportunity
   - Water: Rain-fed possible

3. GRAM
   - Profitability: ₹130,000
   - Soil: Improve fertility
   - Market: Pulses shortage in India
   - Risk: Lower yield

Why Chickpea is best for YOU:
✓ Soil recovery after wheat
✓ ₹35,000 more profit than wheat
✓ Government MSP guaranteed
✓ Less water requirement
✓ Market always available

Action Plan:
1. Order certified chickpea seeds (₹2,500)
2. Prepare field 2 weeks before sowing
3. Apply P-fertilizer for better nodulation
4. Sow in 4th week of October
5. Apply for crop insurance

Audio Response: [Play button] ▶️ Listen in हिंदी (120 seconds)
```

## 🚀 Getting Started

### Installation
```bash
# Clone repository
git clone <repo-url>
cd voice-farming-assistant

# Install dependencies
npm install
cd frontend && npm install

# Set environment variables
cp .env.example .env
# Edit .env with your AWS credentials
```

### Running Locally
```bash
# Start backend
npm start              # runs on :3000

# Start frontend (in another terminal)
cd frontend
npm run dev           # runs on :5173
```

### Deployment
```bash
# Build frontend
cd frontend
npm run build

# Deploy to AWS Lambda (backend)
npm run deploy:lambda

# Deploy frontend to S3 + CloudFront
npm run deploy:frontend
```

## 🔐 Environment Variables

```env
# AWS Configuration
AWS_REGION=ap-south-1
AWS_ACCESS_KEY_ID=<your-access-key>
AWS_SECRET_ACCESS_KEY=<your-secret-key>

# Bedrock
BEDROCK_MODEL_ID=anthropic.claude-3-haiku-20240307-v1:0

# Polly
POLLY_VOICE_ID_HI=Aditi
POLLY_VOICE_ID_TA=Kajal

# S3
S3_BUCKET_NAME=voice-farming-assistant

# DynamoDB
DYNAMODB_TABLE=FarmerData

# API Configuration
API_PORT=3000
REACT_APP_API_URL=http://localhost:3000/api
```

## 📚 Documentation

- [Deep Thinking Integration Guide](./DEEP_THINKING_INTEGRATION.md) - How to integrate components
- [API Documentation](./API.md) - Detailed endpoint specifications
- [Farmer Context Guide](./FARMER_CONTEXT.md) - 9D context dimensions

## 🎯 Use Cases

1. **Profit Maximization** - "How can I earn more?"
2. **Crop Selection** - "What should I grow?"
3. **Pest Management** - "What's wrong with my crop?"
4. **Irrigation** - "How much water to use?"
5. **Government Schemes** - "What subsidies am I eligible for?"
6. **Seasonal Planning** - "What tasks should I do this month?"
7. **Market Analysis** - "When should I sell?"
8. **Risk Management** - "How to prepare for climate risks?"
9. **Diversification** - "How to increase income sources?"
10. **Scenario Planning** - "What if prices drop 20%?"

## 📊 Success Metrics

Track these metrics to measure success:

1. **User Engagement**
   - Daily active users
   - Average session duration
   - Questions per session

2. **Income Impact**
   - Reported profit increase
   - Adoption of recommendations
   - Cost savings achieved

3. **Technical Performance**
   - API response time (target: <3 sec)
   - Audio quality (clarity score)
   - Mobile usability (core web vitals)

4. **Business Metrics**
   - User retention (monthly)
   - Languages adopted (expansion rate)
   - WhatsApp integration usage

## 🤝 Contributing

Contributions welcome! Areas to help:
- [ ] Real weather API integration
- [ ] Market data enrichment
- [ ] Government scheme database expansion
- [ ] Additional language support
- [ ] Mobile app (React Native)
- [ ] Offline mode support
- [ ] Farmer community features

## 📄 License

MIT License - See LICENSE file

## 📞 Support

- **Email**: support@voicefarmingassistant.com
- **WhatsApp**: +91-XXXXXXXXXX
- **Website**: www.voicefarmingassistant.com

## 🙏 Acknowledgments

- Built for AWS Hackathon 2024
- Designed for Indian farmers
- Powered by AI and AWS
- Made with ❤️ for agriculture

---

**Happy Farming! 🌾**
