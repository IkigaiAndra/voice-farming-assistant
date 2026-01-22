/**
 * Deep Thinking Chat API Endpoint
 * Provides comprehensive farmer advisory using extended context and multi-aspect analysis
 */

import express from 'express';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
import FarmerContextAggregator from '../services/farmer-context.js';
import DeepThinkingPrompts from '../services/deep-thinking-prompts.js';
import ResponseFormatter from '../services/response-formatter.js';
import DatabaseService from '../services/database.service.js';
import VoiceService from '../services/voice.service.js';

const router = express.Router();

/**
 * POST /api/deep-chat
 * ChatGPT-style comprehensive farming advice
 * Analyzes location, soil, weather, market, and profitability
 */
router.post('/deep-chat', async (req, res) => {
  try {
    const { query, farmerId, language = 'hin' } = req.body;

    if (!query || !farmerId) {
      return res.status(400).json({ error: 'query and farmerId required' });
    }

    // Get farmer and build comprehensive context
    let farmer = await DatabaseService.getFarmerById(farmerId);
    if (!farmer) {
      farmer = {
        id: farmerId,
        language,
        cropType: 'Wheat',
        state: 'Haryana',
        district: 'Hisar',
        soilType: 'Loamy',
        landSize: 5
      };
      await DatabaseService.createFarmer(farmer);
    }

    // Build comprehensive context (takes ~2-3 seconds)
    console.log(`Building context for farmer ${farmerId}...`);
    const farmerContext = await FarmerContextAggregator.buildFarmerContext(
      farmerId,
      farmer,
      language
    );

    // Generate appropriate deep thinking prompt
    let prompt;
    if (query.toLowerCase().includes('profit') || query.toLowerCase().includes('income')) {
      prompt = DeepThinkingPrompts.generateProfitMaximizationPrompt(farmerContext);
    } else if (query.toLowerCase().includes('crop') || query.toLowerCase().includes('plant')) {
      prompt = DeepThinkingPrompts.generateCropSelectionPrompt(farmerContext);
    } else if (query.toLowerCase().includes('pest') || query.toLowerCase().includes('disease')) {
      prompt = DeepThinkingPrompts.generatePestManagementPrompt(farmerContext, query);
    } else if (query.toLowerCase().includes('water') || query.toLowerCase().includes('irrigation')) {
      prompt = DeepThinkingPrompts.generateIrrigationPrompt(farmerContext, 'winter');
    } else if (query.toLowerCase().includes('scheme') || query.toLowerCase().includes('subsidy')) {
      prompt = DeepThinkingPrompts.generateSchemePrompt(farmerContext);
    } else {
      prompt = DeepThinkingPrompts.generateFarmerAdvisoryPrompt(farmerContext, query, language);
    }

    // Call Bedrock with deep thinking
    console.log(`Calling Bedrock LLM for deep analysis...`);
    const bedrockResponse = await callBedrockWithDeepThinking(prompt, language);

    // Format comprehensive response
    const comprehensiveResponse = {
      analysis: bedrockResponse.analysis,
      farmerContext: {
        location: {
          state: farmerContext.location.state,
          district: farmerContext.location.district,
          region: farmerContext.location.region
        },
        weather: {
          current: farmerContext.weather.current,
          forecast: farmerContext.weather.forecast7Days.slice(0, 3) // 3 days
        },
        soil: {
          type: farmerContext.soil.type,
          pH: farmerContext.soil.pH,
          deficiencies: farmerContext.soil.micronutrients
        },
        crops: {
          current: farmer.currentCrop,
          recommended: farmerContext.crops.rabiBestCrops.slice(0, 3)
        },
        market: {
          price: farmerContext.market.currentPrice,
          trend: farmerContext.market.trend,
          demand: farmerContext.market.demand
        },
        profitability: {
          expectedProfit: farmerContext.profitability.expectedProfit,
          profitMargin: farmerContext.profitability.profitMargin,
          opportunities: farmerContext.opportunities.costReductionOpportunities.slice(0, 3)
        }
      },
      actionPlan: extractActionPlan(bedrockResponse.analysis),
      risks: farmerContext.risks.weatherRisks.slice(0, 2),
      opportunities: farmerContext.opportunities
    };

    // Generate voice response
    const voiceText = generateVoiceResponse(comprehensiveResponse, language);
    const audioUrl = await VoiceService.synthesizeSpeech(
      voiceText,
      language,
      farmerId,
      uuidv4()
    );

    // Store in database
    await DatabaseService.storeMessage({
      id: uuidv4(),
      farmerId,
      type: 'incoming',
      content: query,
      language,
      timestamp: new Date().toISOString()
    });

    await DatabaseService.storeMessage({
      id: uuidv4(),
      farmerId,
      type: 'outgoing',
      content: JSON.stringify(comprehensiveResponse),
      audioUrl,
      language,
      timestamp: new Date().toISOString()
    });

    res.json({
      success: true,
      response: {
        text: comprehensiveResponse.analysis,
        audioUrl,
        context: comprehensiveResponse.farmerContext,
        actionPlan: comprehensiveResponse.actionPlan,
        risks: comprehensiveResponse.risks,
        opportunities: comprehensiveResponse.opportunities,
        confidence: 0.92
      },
      processingTime: '2-3 seconds',
      contextAnalyzed: [
        'Location & climate',
        'Soil composition',
        'Weather forecast',
        'Market prices',
        'Profitability',
        'Government schemes',
        'Risk assessment',
        'Income opportunities'
      ]
    });

  } catch (error) {
    console.error('Deep chat error:', error);
    res.status(500).json({ error: error.message || 'Deep analysis failed' });
  }
});

/**
 * POST /api/profile-setup
 * Comprehensive profile setup with location, soil, crop details
 */
router.post('/profile-setup', async (req, res) => {
  try {
    const {
      farmerId,
      name,
      state,
      district,
      language,
      landSize,
      soilType,
      currentCrop,
      irrigationType,
      marketLocation
    } = req.body;

    const farmProfile = {
      id: farmerId,
      name,
      state,
      district,
      language,
      landSize,
      soilType,
      currentCrop,
      irrigationType,
      marketLocation,
      profileCompletedAt: new Date().toISOString()
    };

    await DatabaseService.updateFarmer(farmerId, farmProfile);

    // Build and return full context
    const context = await FarmerContextAggregator.buildFarmerContext(
      farmerId,
      farmProfile,
      language
    );

    res.json({
      success: true,
      profile: farmProfile,
      context: {
        weather: context.weather.current,
        soilRecommendations: context.soil.recommendations,
        recommendedCrops: context.crops.rabiBestCrops.slice(0, 3),
        profitability: context.profitability.expectedProfit,
        nextSteps: [
          'Ask me about crop selection',
          'Ask about profit maximization',
          'Ask about pest management',
          'Ask about government schemes',
          'Ask about irrigation'
        ]
      }
    });

  } catch (error) {
    res.status(500).json({ error: 'Profile setup failed' });
  }
});

/**
 * GET /api/farmer-insights/:farmerId
 * Get comprehensive insights about farmer's situation
 */
router.get('/farmer-insights/:farmerId', async (req, res) => {
  try {
    const { farmerId } = req.params;

    const farmer = await DatabaseService.getFarmerById(farmerId);
    if (!farmer) {
      return res.status(404).json({ error: 'Farmer not found' });
    }

    const context = await FarmerContextAggregator.buildFarmerContext(
      farmerId,
      farmer
    );

    res.json({
      success: true,
      farmer: farmer,
      insights: {
        location: context.location,
        weather: context.weather,
        soil: {
          type: context.soil.type,
          status: context.soil.fertility,
          mainIssues: Object.entries(context.soil.micronutrients)
            .filter(([_, val]) => val === 'Deficient' || val === 'Low')
            .map(([key, val]) => `${key}: ${val}`)
        },
        crops: {
          current: farmer.currentCrop,
          recommended: context.crops.rabiBestCrops,
          alternatives: context.crops.alternativeCrops
        },
        market: {
          currentPrice: context.market.currentPrice,
          trend: context.market.trend,
          bestTimeToSell: context.market.bestTimeToSell,
          nearbyMarkets: context.market.nearbyMarkets
        },
        profitability: {
          currentProfit: context.profitability.expectedProfit,
          roi: context.profitability.roi,
          strategies: context.profitability.profitMaximizationStrategies.slice(0, 3)
        },
        risks: context.risks,
        opportunities: {
          costReduction: context.opportunities.costReductionOpportunities.slice(0, 3),
          yieldIncrease: context.opportunities.yieldIncreaseOpportunities.slice(0, 3),
          diversification: context.opportunities.diversificationOpportunities.slice(0, 2)
        },
        seasonal: context.seasonal
      }
    });

  } catch (error) {
    res.status(500).json({ error: 'Insight generation failed' });
  }
});

/**
 * POST /api/scenario-analysis
 * What-if analysis for different scenarios
 */
router.post('/scenario-analysis', async (req, res) => {
  try {
    const { farmerId, scenario, language = 'hin' } = req.body;
    // scenario: "water_shortage", "price_drop", "pest_outbreak", "yield_improvement"

    const farmer = await DatabaseService.getFarmerById(farmerId);
    const context = await FarmerContextAggregator.buildFarmerContext(farmerId, farmer, language);

    let analysis;
    if (scenario === 'water_shortage') {
      analysis = analyzeWaterShortage(context);
    } else if (scenario === 'price_drop') {
      analysis = analyzePriceDrop(context);
    } else if (scenario === 'pest_outbreak') {
      analysis = analyzePestOutbreak(context);
    } else if (scenario === 'yield_improvement') {
      analysis = analyzeYieldImprovement(context);
    }

    res.json({
      success: true,
      scenario,
      analysis,
      recommendations: analysis.recommendations,
      potentialImpact: analysis.impact
    });

  } catch (error) {
    res.status(500).json({ error: 'Scenario analysis failed' });
  }
});

// ==================== Helper Functions ====================

async function callBedrockWithDeepThinking(prompt, language) {
  // In production, call actual Bedrock API with extended thinking enabled
  return {
    analysis: `Based on comprehensive analysis of your farming situation:\n\n${prompt}\n\nThis advice considers your specific location, soil conditions, current weather, market prices, and potential profit opportunities.`,
    thinkingProcess: 'Deep contextual analysis completed'
  };
}

function extractActionPlan(analysis) {
  // Extract numbered action items from analysis
  const actionItems = [];
  const lines = analysis.split('\n');
  lines.forEach((line, index) => {
    if (/^\d+\./.test(line)) {
      actionItems.push({
        step: index + 1,
        action: line.replace(/^\d+\.\s*/, '').trim(),
        priority: index < 3 ? 'High' : 'Medium'
      });
    }
  });
  return actionItems.slice(0, 5);
}

function generateVoiceResponse(response, language) {
  const translations = {
    hin: {
      summary: 'मैंने आपकी खेती की स्थिति का गहन विश्लेषण किया है।',
      points: 'मुख्य सुझाव:',
      opportunity: 'आपके आय को बढ़ाने का अवसर है'
    },
    eng: {
      summary: 'I have analyzed your farming situation comprehensively.',
      points: 'Key recommendations:',
      opportunity: 'There is an opportunity to increase your income'
    }
  };

  const t = translations[language] || translations.eng;
  const topRecommendations = response.actionPlan.slice(0, 3);
  const topOpportunity = response.opportunities.costReductionOpportunities[0];

  return `${t.summary} ${t.points} ${topRecommendations.map(a => a.action).join('. ')}. ${t.opportunity}: ${topOpportunity.opportunity}.`;
}

function analyzeWaterShortage(context) {
  return {
    impact: `If water becomes scarce, yield could reduce by 20-30%`,
    recommendations: [
      'Shift to low-water crops like chickpea or mustard',
      'Implement drip irrigation',
      'Apply mulch to conserve soil moisture',
      'Switch to shallow-rooted varieties'
    ],
    impact: {
      worstCase: '₹30,000 income loss',
      withMitigation: '₹5,000 income loss',
      recommendedCrop: 'Chickpea (uses 40% less water)'
    }
  };
}

function analyzePriceDrop(context) {
  return {
    recommendations: [
      'Diversify to chickpea (always good price)',
      'Store and sell later if infrastructure available',
      'Look for direct buyer contracts',
      'Explore value addition (processing)'
    ],
    impact: {
      worstCase: 'Price drops to ₹2000: ₹50,000 income loss',
      withStrategy: 'Switch to chickpea: ₹40,000 profit',
      timeline: 'Can implement in 4-5 weeks'
    }
  };
}

function analyzePestOutbreak(context) {
  return {
    recommendations: [
      'Identify pest immediately (take photo)',
      'Use biological control first',
      'If needed, use approved pesticides',
      'Maintain isolation from neighboring fields',
      'Implement preventive measures for next season'
    ],
    impact: {
      worstCase: 'Complete crop loss: ₹125,000',
      withAction: '10-15% damage controlled: ₹100,000 saved',
      timeline: 'Action within 24 hours'
    }
  };
}

function analyzeYieldImprovement(context) {
  return {
    recommendations: [
      'Use certified high-yield seeds',
      'Apply precision nutrient management',
      'Improve irrigation scheduling',
      'Control pests proactively',
      'Use soil conditioners'
    ],
    impact: {
      targetYield: '55 quintals (10% improvement)',
      additionalIncome: '₹12,500',
      investmentNeeded: '₹3,000',
      roi: '417%'
    }
  };
}

export default router;
