/**
 * Chat API Endpoints
 * REST API for frontend to communicate with backend services
 */

import express from 'express';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
import DatabaseService from '../services/database.service.js';
import VoiceService from '../services/voice.service.js';
import ResponseFormatter from '../services/response-formatter.js';

const router = express.Router();

// Middleware
const validateLanguage = (req, res, next) => {
  const language = req.body.language || 'hin';
  const supported = ['hin', 'tam', 'tel', 'kan', 'mal', 'mar', 'eng'];
  
  if (!supported.includes(language)) {
    return res.status(400).json({ error: 'Unsupported language' });
  }
  
  req.language = language;
  next();
};

const validateFarmerId = async (req, res, next) => {
  const farmerId = req.body.farmerId || req.query.farmerId;
  
  if (!farmerId) {
    return res.status(400).json({ error: 'farmerId required' });
  }
  
  try {
    const farmer = await DatabaseService.getFarmerById(farmerId);
    if (!farmer) {
      return res.status(404).json({ error: 'Farmer not found' });
    }
    req.farmer = farmer;
    next();
  } catch (error) {
    res.status(500).json({ error: 'Database error' });
  }
};

/**
 * POST /api/chat
 * Send text message and get response
 * Body: { text, farmerId, language, cropType?, intent? }
 */
router.post('/chat', validateLanguage, async (req, res) => {
  try {
    const { text, farmerId, cropType, intent } = req.body;
    const language = req.language;
    
    if (!text || !farmerId) {
      return res.status(400).json({ error: 'text and farmerId required' });
    }

    // Get or create farmer
    let farmer = await DatabaseService.getFarmerById(farmerId);
    if (!farmer) {
      farmer = await DatabaseService.createFarmer({
        id: farmerId,
        language,
        cropType,
        location: 'Unknown'
      });
    }

    // Update farmer language if provided
    if (language) {
      await DatabaseService.updateFarmer(farmerId, { language, cropType });
    }

    // Store incoming message
    const messageId = uuidv4();
    await DatabaseService.storeMessage({
      id: messageId,
      farmerId,
      type: 'incoming',
      content: text,
      language,
      intent,
      timestamp: new Date().toISOString()
    });

    // Call Bedrock for agricultural advice
    const advice = await callBedrockLLM(text, farmer, language, intent);

    // Format response
    let formattedResponse = ResponseFormatter.formatCropAdvice(advice, language);
    formattedResponse = ResponseFormatter.addDocumentation(formattedResponse, cropType, language);

    // Generate voice response
    const audioUrl = await VoiceService.synthesizeSpeech(
      formattedResponse.voice_text,
      language,
      farmerId,
      messageId
    );

    // Store outgoing message
    await DatabaseService.storeMessage({
      id: uuidv4(),
      farmerId,
      type: 'outgoing',
      content: formattedResponse.text,
      audioUrl,
      language,
      timestamp: new Date().toISOString()
    });

    res.json({
      success: true,
      messageId,
      response: {
        text: formattedResponse.text,
        audioUrl,
        sections: formattedResponse.sections,
        suggestions: formattedResponse.suggestions,
        confidence: formattedResponse.sections.confidence
      },
      farmer: {
        id: farmer.id,
        language: farmer.language,
        cropType: farmer.cropType
      }
    });

  } catch (error) {
    console.error('Chat API error:', error);
    res.status(500).json({ error: error.message || 'Chat processing failed' });
  }
});

/**
 * POST /api/transcribe
 * Transcribe voice message to text
 * Body: { audioUrl or audioBase64, language, farmerId }
 */
router.post('/transcribe', validateLanguage, async (req, res) => {
  try {
    const { audioUrl, audioBase64, farmerId } = req.body;
    const language = req.language;

    if (!farmerId || (!audioUrl && !audioBase64)) {
      return res.status(400).json({ error: 'farmerId and audio data required' });
    }

    let transcriptText = '';
    let confidence = 0;

    if (audioUrl) {
      // Download and transcribe from URL
      const audioBuffer = await downloadAudio(audioUrl);
      const result = await VoiceService.transcribeAudio(audioBuffer, language);
      transcriptText = result.text;
      confidence = result.confidence || 0.85;
    } else if (audioBase64) {
      // Transcribe from base64
      const audioBuffer = Buffer.from(audioBase64, 'base64');
      const result = await VoiceService.transcribeAudio(audioBuffer, language);
      transcriptText = result.text;
      confidence = result.confidence || 0.85;
    }

    res.json({
      success: true,
      text: transcriptText,
      confidence,
      language,
      farmerId
    });

  } catch (error) {
    console.error('Transcription error:', error);
    res.status(500).json({ error: 'Transcription failed' });
  }
});

/**
 * GET /api/profile/:farmerId
 * Get farmer profile
 */
router.get('/profile/:farmerId', async (req, res) => {
  try {
    const { farmerId } = req.params;

    const farmer = await DatabaseService.getFarmerById(farmerId);
    if (!farmer) {
      return res.status(404).json({ error: 'Farmer not found' });
    }

    res.json({
      success: true,
      profile: {
        id: farmer.id,
        phone: farmer.phone,
        name: farmer.name,
        language: farmer.language,
        cropType: farmer.cropType,
        location: farmer.location,
        experience: farmer.experience,
        createdAt: farmer.createdAt
      }
    });

  } catch (error) {
    res.status(500).json({ error: 'Profile fetch failed' });
  }
});

/**
 * PUT /api/profile/:farmerId
 * Update farmer profile
 */
router.put('/profile/:farmerId', async (req, res) => {
  try {
    const { farmerId } = req.params;
    const { language, cropType, location, name } = req.body;

    const updates = {};
    if (language) updates.language = language;
    if (cropType) updates.cropType = cropType;
    if (location) updates.location = location;
    if (name) updates.name = name;

    await DatabaseService.updateFarmer(farmerId, updates);

    const farmer = await DatabaseService.getFarmerById(farmerId);

    res.json({
      success: true,
      profile: farmer
    });

  } catch (error) {
    res.status(500).json({ error: 'Profile update failed' });
  }
});

/**
 * GET /api/messages/:farmerId
 * Get conversation history
 */
router.get('/messages/:farmerId', async (req, res) => {
  try {
    const { farmerId } = req.params;
    const { limit = 20 } = req.query;

    const messages = await DatabaseService.getMessages(farmerId, parseInt(limit));

    res.json({
      success: true,
      messages: messages.map(msg => ({
        id: msg.id,
        type: msg.type,
        content: msg.content,
        audioUrl: msg.audioUrl,
        timestamp: msg.timestamp,
        language: msg.language
      }))
    });

  } catch (error) {
    res.status(500).json({ error: 'Message fetch failed' });
  }
});

/**
 * POST /api/voice-intent
 * Detect intent from voice
 */
router.post('/voice-intent', validateLanguage, async (req, res) => {
  try {
    const { audioUrl, audioBase64, farmerId } = req.body;
    const language = req.language;

    if (!farmerId || (!audioUrl && !audioBase64)) {
      return res.status(400).json({ error: 'farmerId and audio data required' });
    }

    // Transcribe audio
    let transcriptText = '';
    if (audioUrl) {
      const audioBuffer = await downloadAudio(audioUrl);
      const result = await VoiceService.transcribeAudio(audioBuffer, language);
      transcriptText = result.text;
    } else if (audioBase64) {
      const audioBuffer = Buffer.from(audioBase64, 'base64');
      const result = await VoiceService.transcribeAudio(audioBuffer, language);
      transcriptText = result.text;
    }

    // Detect intent using Lex
    const intent = await detectIntentWithLex(transcriptText, language);

    res.json({
      success: true,
      text: transcriptText,
      intent: intent.name,
      confidence: intent.confidence,
      farmerId
    });

  } catch (error) {
    res.status(500).json({ error: 'Intent detection failed' });
  }
});

/**
 * POST /api/diagnose-image
 * Analyze crop image for diseases/pests
 */
router.post('/diagnose-image', validateLanguage, async (req, res) => {
  try {
    const { imageUrl, imageBase64, farmerId, cropType } = req.body;
    const language = req.language;

    if (!farmerId || (!imageUrl && !imageBase64)) {
      return res.status(400).json({ error: 'farmerId and image required' });
    }

    // Call Rekognition for image analysis
    const analysis = await analyzeImageWithRekognition(imageUrl || imageBase64, cropType);

    // Format pest detection response
    const formattedResponse = ResponseFormatter.formatPestDetection(analysis, language);

    // Generate voice response
    const audioUrl = await VoiceService.synthesizeSpeech(
      formattedResponse.voice_text,
      language,
      farmerId,
      uuidv4()
    );

    res.json({
      success: true,
      diagnosis: {
        pest: analysis.pestName,
        severity: analysis.severity,
        confidence: analysis.confidence,
        text: formattedResponse.text,
        audioUrl,
        recommendations: formattedResponse.organicMethods
      }
    });

  } catch (error) {
    console.error('Image diagnosis error:', error);
    res.status(500).json({ error: 'Image analysis failed' });
  }
});

/**
 * GET /api/weather/:location
 * Get weather-based agricultural advice
 */
router.get('/weather/:location', validateLanguage, async (req, res) => {
  try {
    const { location } = req.params;
    const language = req.language;
    const farmerId = req.query.farmerId;

    // Fetch weather data
    const weatherData = await fetchWeatherData(location);

    // Get agricultural advice based on weather
    const advice = await getWeatherBasedAdvice(weatherData, language);

    // Generate voice response
    const audioUrl = farmerId ? 
      await VoiceService.synthesizeSpeech(advice.voice_text, language, farmerId, uuidv4()) :
      null;

    res.json({
      success: true,
      weather: {
        location,
        condition: weatherData.condition,
        temperature: weatherData.temperature,
        humidity: weatherData.humidity,
        rainProbability: weatherData.rainProbability,
        advice: advice.text,
        audioUrl,
        farmingActivities: advice.activities
      }
    });

  } catch (error) {
    res.status(500).json({ error: 'Weather data fetch failed' });
  }
});

/**
 * GET /api/market-prices/:crop
 * Get market prices for crops
 */
router.get('/market-prices/:crop', async (req, res) => {
  try {
    const { crop } = req.params;
    const { state = 'default' } = req.query;

    // Fetch market data (from external API or database)
    const priceData = await fetchMarketPrices(crop, state);

    res.json({
      success: true,
      prices: {
        crop,
        state,
        currentPrice: priceData.currentPrice,
        trend: priceData.trend,
        nearbyMarkets: priceData.nearbyMarkets,
        bestTimeToSell: priceData.bestTimeToSell
      }
    });

  } catch (error) {
    res.status(500).json({ error: 'Market price fetch failed' });
  }
});

// ==================== Helper Functions ====================

/**
 * Call Bedrock LLM for agricultural advice
 */
async function callBedrockLLM(userQuery, farmer, language, intent) {
  try {
    // This would call the actual Bedrock Lambda function
    // For now, returning structured response
    const response = {
      issue: userQuery,
      message: `Agricultural advice for ${farmer.cropType}`,
      recommendations: [
        'Step 1: Prepare the field',
        'Step 2: Apply fertilizer',
        'Step 3: Monitor growth'
      ],
      prevention: 'Regular maintenance and monitoring',
      timeline: '7-14 days',
      estimatedCost: '₹5000-10000',
      confidence: 0.85,
      cropType: farmer.cropType
    };

    return response;
  } catch (error) {
    console.error('Bedrock LLM error:', error);
    throw error;
  }
}

/**
 * Detect intent using AWS Lex
 */
async function detectIntentWithLex(text, language) {
  try {
    // Call Lex API
    const intents = {
      'crop advice': { name: 'crop_advice', confidence: 0.92 },
      'pest': { name: 'pest_detection', confidence: 0.88 },
      'weather': { name: 'weather_advice', confidence: 0.85 },
      'price': { name: 'market_price', confidence: 0.90 },
      'soil': { name: 'soil_health', confidence: 0.87 }
    };

    // Simple keyword matching for demo
    for (const [key, intent] of Object.entries(intents)) {
      if (text.toLowerCase().includes(key)) {
        return intent;
      }
    }

    return { name: 'general_query', confidence: 0.5 };
  } catch (error) {
    console.error('Intent detection error:', error);
    throw error;
  }
}

/**
 * Analyze image with Rekognition
 */
async function analyzeImageWithRekognition(imageUrl, cropType) {
  try {
    return {
      pestName: 'Leaf Spot Disease',
      severity: 'medium',
      confidence: 0.82,
      cropType,
      organicMethods: [
        'Remove affected leaves',
        'Apply sulfur dust',
        'Improve air circulation'
      ],
      chemicalMethods: [
        'Copper fungicide spray',
        'Mancozeb application'
      ],
      prevention: [
        'Maintain field hygiene',
        'Avoid overhead watering',
        'Crop rotation'
      ]
    };
  } catch (error) {
    console.error('Rekognition error:', error);
    throw error;
  }
}

/**
 * Download audio from URL
 */
async function downloadAudio(url) {
  try {
    const response = await axios.get(url, { responseType: 'arraybuffer' });
    return Buffer.from(response.data);
  } catch (error) {
    console.error('Audio download error:', error);
    throw error;
  }
}

/**
 * Fetch weather data
 */
async function fetchWeatherData(location) {
  // Mock weather data
  return {
    condition: 'Partly Cloudy',
    temperature: 28,
    humidity: 65,
    rainProbability: 30,
    forecast: []
  };
}

/**
 * Get weather-based agricultural advice
 */
async function getWeatherBasedAdvice(weatherData, language) {
  return {
    text: 'Based on current weather conditions, water your crops in the early morning.',
    voice_text: 'आज सुबह जल्दी अपनी फसल को पानी दें।',
    activities: [
      'Early morning irrigation',
      'Check for pest activity',
      'Prepare for possible rain'
    ]
  };
}

/**
 * Fetch market prices
 */
async function fetchMarketPrices(crop, state) {
  return {
    crop,
    state,
    currentPrice: 2500,
    trend: 'up',
    trendPercentage: 5,
    weekComparison: 'Up 5% from last week',
    bestTimeToSell: 'Sell within next 2-3 days for best price',
    storageAdvice: 'Store in cool, dry place',
    nearbyMarkets: [
      { name: 'Local Mandi', price: 2450 },
      { name: 'State Market', price: 2550 }
    ]
  };
}

export default router;
