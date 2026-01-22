/**
 * Bedrock Prompt Examples
 * These are the system and user prompts used to interact with Claude LLM
 */

export const BedrockPrompts = {
  // System prompt - sets the context for the LLM
  system: `You are an expert agricultural advisor for Indian farmers with deep knowledge of:
- Crop management (wheat, rice, cotton, tomatoes, potatoes, chili, onions, sugarcane, corn)
- Pest and disease identification and organic treatment
- Soil health and nutrient management
- Weather patterns and irrigation schedules
- Government schemes and subsidies
- Sustainable farming practices
- Regional farming variations across India

Your responses should:
1. Be practical and actionable for a small farmer
2. Prioritize organic/traditional methods first
3. Consider local climate and resources
4. Use simple language avoiding technical jargon
5. Provide step-by-step instructions
6. Include prevention tips
7. Mention when to contact local agricultural extension

Always respond in the farmer's preferred language with cultural sensitivity.`,

  // Intent-specific prompts
  intents: {
    cropAdvice: (cropType, issue, context) => ({
      user: `I have a ${cropType} crop that is experiencing: ${issue}.

Context:
- Farmer location: ${context.state || 'India'}
- Recent images show: ${context.recentAnalysis || 'Not provided'}
- Previous issues: ${context.previousIssues?.join(', ') || 'None'}

Please provide:
1. What is causing this problem?
2. Step-by-step solution (3-5 steps)
3. How to prevent it in the future
4. When to seek expert help

Keep response concise and practical.`
    }),

    pestDetection: (cropType, imageAnalysis) => ({
      user: `I found pests/insects on my ${cropType} crop.

Image analysis detected:
- Labels: ${imageAnalysis?.labels?.map(l => l.name).join(', ') || 'Unknown'}
- Confidence: ${imageAnalysis?.maxConfidence || 'N/A'}%

Please provide:
1. What pest is this likely to be?
2. Organic pest control methods (3-4 options)
3. Chemical options (if organic fails)
4. Prevention for the future
5. Safe harvest timeline

Focus on affordable solutions.`
    }),

    weatherAdvice: (cropType, state, weatherData) => ({
      user: `I grow ${cropType} in ${state}.

Current weather situation: ${weatherData?.conditions || 'Checking weather patterns for your region'}

Please advise:
1. Should I irrigate today? Why/why not?
2. Optimal irrigation schedule for next 2 weeks
3. Any disease risks based on weather?
4. Best timing for any agricultural activities?
5. Water conservation tips`
    }),

    marketPrice: (crop, state) => ({
      user: `What is the current market price for ${crop} in ${state}?

Please provide:
1. Current market price per quintal
2. Price trend (up/down/stable)
3. Best time to sell
4. Storage recommendations
5. Direct buyer contacts/markets if available`
    }),

    soilHealth: (soilColor, soilTexture, cropType) => ({
      user: `My soil appears to be ${soilColor} colored and has a ${soilTexture} texture. 
I want to grow ${cropType}.

Please analyze:
1. What does this soil composition tell you?
2. What nutrients are likely deficient?
3. How can I improve it?
4. What amendments to add?
5. Timeline for improvement
6. Is it suitable for ${cropType}?`
    })
  },

  // Few-shot examples for better responses
  examples: [
    {
      crop: 'Tomato',
      issue: 'Yellowing leaves with brown spots',
      response: `This is likely early blight disease caused by fungus.

Steps to solve:
1. Remove affected leaves immediately (wear gloves)
2. Spray neem oil solution weekly for 3-4 weeks
3. Ensure good air circulation - remove dense foliage
4. Don't water from above - water at soil level only
5. Spray baking soda solution (1 tbsp per liter water) every 10 days

Prevention:
- Crop rotation - don't plant tomatoes in same spot for 2 years
- Use disease-resistant varieties
- Maintain healthy spacing between plants
- Clean tools between plants

Contact local agriculture officer if condition worsens.`
    },
    {
      crop: 'Rice',
      issue: 'Brown spots and stem rot',
      response: `This looks like rice blast disease - very common in wet conditions.

Immediate action:
1. Drain standing water if possible
2. Apply Bordeaux mixture (1%) solution
3. Spray twice - 7-10 days apart
4. Remove affected plants at field edges
5. Don't over-fertilize with nitrogen

Long-term prevention:
- Use resistant rice varieties (ask your seed supplier)
- Plant at proper spacing
- Maintain field hygiene
- Rotate with other crops
- Use certified disease-free seeds`
    }
  ],

  // Response formatting
  formatting: {
    startWith: "🌾 Agriculture Advisor Response:",
    formatting: "Use simple numbered lists, bullet points, and short paragraphs",
    language: "Respond in the farmer's preferred language",
    tone: "Friendly, knowledgeable, and respectful",
    endWith: "Do you need any other farming help?"
  }
};

/**
 * Build a complete prompt for Bedrock
 */
export function buildBedrockPrompt(intent, farmingContext) {
  const { cropType, issue, state, language } = farmingContext;

  let userPrompt;
  switch (intent) {
    case 'CropAdvice':
      userPrompt = BedrockPrompts.intents.cropAdvice(
        cropType,
        issue,
        farmingContext
      ).user;
      break;
    case 'PestDetection':
      userPrompt = BedrockPrompts.intents.pestDetection(
        cropType,
        farmingContext.imageAnalysis
      ).user;
      break;
    case 'WeatherAdvice':
      userPrompt = BedrockPrompts.intents.weatherAdvice(
        cropType,
        state,
        farmingContext.weatherData
      ).user;
      break;
    case 'MarketPrice':
      userPrompt = BedrockPrompts.intents.marketPrice(
        cropType,
        state
      ).user;
      break;
    case 'SoilHealth':
      userPrompt = BedrockPrompts.intents.soilHealth(
        farmingContext.soilColor,
        farmingContext.soilTexture,
        cropType
      ).user;
      break;
    default:
      userPrompt = `Help me with my farming: ${issue}`;
  }

  return {
    systemPrompt: BedrockPrompts.system,
    userPrompt,
    maxTokens: 500,
    temperature: 0.7,
    topP: 0.9
  };
}

/**
 * Parse Bedrock response
 */
export function parseBedrockResponse(response, intent) {
  // Clean response
  let cleaned = response.trim();

  // Extract key sections
  const sections = cleaned.split(/\n\n+/);

  return {
    fullResponse: cleaned,
    sections: sections,
    keyPoints: sections.slice(0, 3),
    actionItems: extractActionItems(cleaned),
    timestamp: new Date().toISOString()
  };
}

/**
 * Extract actionable items from response
 */
function extractActionItems(text) {
  const actionRegex = /^\d+\.\s+(.+?)$/gm;
  const matches = [...text.matchAll(actionRegex)];
  return matches.map(m => m[1]);
}

export default BedrockPrompts;
