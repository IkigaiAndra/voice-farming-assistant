/**
 * Farmer Context Aggregator Service
 * Gathers comprehensive context about farmer's situation
 * (Location, soil, climate, crops, profitability, market data)
 */

import axios from 'axios';

class FarmerContextAggregator {
  /**
   * Build comprehensive farmer context
   */
  static async buildFarmerContext(farmerId, farmData, language = 'hin') {
    try {
      const context = {
        farmer: farmData,
        location: await this.getLocationContext(farmData.state, farmData.district),
        weather: await this.getWeatherContext(farmData.state, farmData.district),
        soil: await this.getSoilContext(farmData.district, farmData.soilType),
        crops: await this.getCropRecommendations(
          farmData.state,
          farmData.soilType,
          farmData.currentCrop
        ),
        market: await this.getMarketContext(farmData.currentCrop, farmData.state),
        profitability: await this.getProfitabilityAnalysis(
          farmData.currentCrop,
          farmData.landSize,
          farmData.state
        ),
        seasonal: await this.getSeasonalAdvice(farmData.state, language),
        risks: await this.identifyFarmingRisks(
          farmData.state,
          farmData.currentCrop,
          farmData.soilType
        ),
        opportunities: await this.identifyProfitOpportunities(
          farmData.state,
          farmData.currentCrop,
          farmData.landSize
        )
      };

      return context;
    } catch (error) {
      console.error('Context aggregation error:', error);
      return this.getDefaultContext(farmData);
    }
  }

  /**
   * Get location-specific information
   */
  static async getLocationContext(state, district) {
    // Mock location data - in production, use real API
    const locationData = {
      hin: {
        state: 'Haryana',
        district: 'Hisar',
        region: 'North India - Indo-Gangetic Plain',
        latitude: 29.1493,
        longitude: 75.7307,
        altitude: 215,
        area: 'Semi-arid region',
        irrigation: 'Major canal network (Western Yamuna Canal)',
        population: 'Agricultural belt'
      },
      tam: {
        state: 'Tamil Nadu',
        district: 'Coimbatore',
        region: 'South India - Western Ghats foothills',
        latitude: 11.0081,
        longitude: 76.9142,
        altitude: 410,
        area: 'Semi-humid tropical region',
        irrigation: 'Noyyal River, wells, borewells',
        population: 'Mixed farming area'
      }
    };

    return locationData[state] || locationData.hin;
  }

  /**
   * Get real-time weather context
   */
  static async getWeatherContext(state, district) {
    // In production, use real weather API (OpenWeatherMap, Indian Meteorological Dept)
    const weatherData = {
      current: {
        temperature: 28,
        humidity: 65,
        rainfall: 0,
        windSpeed: 12,
        condition: 'Partly Cloudy',
        pressure: 1013,
        uvIndex: 6
      },
      forecast7Days: [
        {
          date: '2026-01-22',
          high: 32,
          low: 18,
          condition: 'Sunny',
          rainfall: 0,
          recommendation: 'Good day for irrigation'
        },
        {
          date: '2026-01-23',
          high: 30,
          low: 16,
          condition: 'Partly Cloudy',
          rainfall: 2,
          recommendation: 'Light irrigation, reduce water'
        }
        // More days...
      ],
      season: 'Winter (Rabi season)',
      monsoonStatus: 'Post-monsoon',
      extremeWeatherAlerts: []
    };

    return weatherData;
  }

  /**
   * Get soil information and recommendations
   */
  static async getSoilContext(district, soilType = 'Loamy') {
    const soilData = {
      type: soilType, // Loamy, Clay, Sandy, Black, Red, Laterite
      composition: {
        sand: 40,
        silt: 40,
        clay: 20
      },
      pH: 7.2,
      fertility: 'Medium',
      organicMatter: 1.5, // percentage
      nitrogen: 'Deficient',
      phosphorus: 'Adequate',
      potassium: 'Adequate',
      micronutrients: {
        iron: 'Low',
        manganese: 'Low',
        zinc: 'Deficient',
        boron: 'Adequate'
      },
      waterHoldingCapacity: 'Good',
      drainageStatus: 'Well-drained',
      salinity: 'Non-saline',
      sodicity: 'Normal',
      recommendations: [
        `Your ${soilType} soil is good for rabi crops`,
        'Add organic matter (FYM) before planting',
        'Apply zinc-enriched fertilizer',
        'Maintain pH around 7.0-7.5',
        'Regular soil testing recommended'
      ],
      improvementPlan: [
        'Add 5 tons/hectare farmyard manure',
        'Apply micronutrient mix (Zn, B, Mo)',
        'Practice crop rotation',
        'Grow green manure crops in off-season'
      ]
    };

    return soilData;
  }

  /**
   * Get crop recommendations for the region
   */
  static async getCropRecommendations(state, soilType, currentCrop) {
    const recommendations = {
      rabiBestCrops: [
        {
          name: 'Wheat',
          profitability: 'High',
          marketDemand: 'Very High',
          minimumTemp: 10,
          maximumTemp: 25,
          waterRequired: 'Medium',
          estimatedYield: '50 quintals/hectare',
          estimatedIncome: '₹100,000-150,000'
        },
        {
          name: 'Mustard',
          profitability: 'High',
          marketDemand: 'High',
          minimumTemp: 12,
          maximumTemp: 28,
          waterRequired: 'Low',
          estimatedYield: '20 quintals/hectare',
          estimatedIncome: '₹80,000-120,000'
        },
        {
          name: 'Chickpea (Chana)',
          profitability: 'Very High',
          marketDemand: 'Very High',
          minimumTemp: 15,
          maximumTemp: 25,
          waterRequired: 'Low',
          estimatedYield: '25 quintals/hectare',
          estimatedIncome: '₹120,000-160,000'
        }
      ],
      khrifiBestCrops: [
        {
          name: 'Cotton',
          profitability: 'Medium-High',
          marketDemand: 'High',
          waterRequired: 'High',
          duration: '180 days'
        },
        {
          name: 'Maize',
          profitability: 'High',
          marketDemand: 'High',
          waterRequired: 'Medium',
          duration: '110 days'
        }
      ],
      alternativeCrops: [
        'Pulses (for better income)',
        'Oil seeds (for soil improvement)',
        'Vegetables (for local market)'
      ]
    };

    return recommendations;
  }

  /**
   * Get current market analysis
   */
  static async getMarketContext(crop, state) {
    const marketData = {
      crop,
      state,
      currentPrice: 2500,
      priceHistory: {
        last7Days: { high: 2550, low: 2450, average: 2500 },
        last30Days: { high: 2600, low: 2400, average: 2500 },
        last1Year: { high: 3000, low: 2200, average: 2600 }
      },
      trend: 'Stable with upward pressure',
      demand: 'High - Steady demand from mills',
      supply: 'Moderate supply in market',
      bestTimeToSell: 'Now (January-February is peak)',
      forecast: {
        nextMonth: 'Expected to remain stable',
        nextSeason: 'Price may decrease after harvest'
      },
      nearbyMarkets: [
        { name: 'Hisar Mandi', price: 2480 },
        { name: 'Sirsa Mandi', price: 2520 },
        { name: 'Rohtak Mandi', price: 2530 }
      ],
      governmentSupport: 'MSP (Minimum Support Price) available',
      exportOpportunities: 'Domestic demand high'
    };

    return marketData;
  }

  /**
   * Analyze profitability of current farming
   */
  static async getProfitabilityAnalysis(crop, landSize, state) {
    const profitAnalysis = {
      currentCrop: crop,
      landSizeHectares: landSize,
      costBreakdown: {
        seeds: { amount: 1000, percentage: 5 },
        fertilizers: { amount: 5000, percentage: 25 },
        pesticides: { amount: 2000, percentage: 10 },
        labor: { amount: 8000, percentage: 40 },
        irrigation: { amount: 2000, percentage: 10 },
        machinery: { amount: 2000, percentage: 10 },
        total: 20000
      },
      costPerHectare: 20000,
      expectedYield: 50,
      expectedPrice: 2500,
      expectedIncome: 125000,
      expectedProfit: 105000, // Income - Cost
      profitMargin: 84,
      profitabilityStatus: 'Good',
      roi: 525, // Return on Investment %
      alternativeProfitability: [
        {
          crop: 'Chickpea',
          expectedProfit: 140000,
          reasoning: 'Better MSP and lower input costs'
        },
        {
          crop: 'Mustard',
          expectedProfit: 100000,
          reasoning: 'Lower production cost'
        }
      ],
      profitMaximizationStrategies: [
        'Reduce fertilizer cost by 20% using organic methods',
        'Save labor cost by using machinery',
        'Increase yield by 10% using improved seeds',
        'Sell directly to buyer (bypass middleman)',
        'Diversify crops to spread risk'
      ]
    };

    return profitAnalysis;
  }

  /**
   * Get seasonal advice
   */
  static async getSeasonalAdvice(state, language) {
    const seasonalAdvice = {
      currentSeason: 'Rabi (Winter crop) - January',
      activitiesThisMonth: [
        'Monitor wheat crop for diseases',
        'Apply top dressing of nitrogen',
        'Irrigation schedule: Every 20-25 days',
        'Pest management: Check for armyworms',
        'Weed management: Manual or chemical'
      ],
      nextMonthPrep: [
        'Plan for summer crop selection',
        'Prepare field for summer operations',
        'Check irrigation system'
      ],
      upcomingSeason: {
        name: 'Kharif (Monsoon crop) - June-July',
        preparationRequired: 'Field leveling, organic matter addition',
        cropOptions: 'Cotton, Maize, Bajra, Groundnut'
      }
    };

    return seasonalAdvice;
  }

  /**
   * Identify risks and mitigation
   */
  static async identifyFarmingRisks(state, crop, soilType) {
    const risks = {
      weatherRisks: [
        {
          risk: 'Late frost (March)',
          probability: 'Medium',
          impact: 'Crop damage, yield loss 20-30%',
          mitigation: [
            'Select frost-resistant varieties',
            'Avoid low-lying areas for planting',
            'Monitor weather forecasts'
          ]
        },
        {
          risk: 'Hailstorm',
          probability: 'Low',
          impact: 'Complete crop loss in affected area',
          mitigation: [
            'Insurance coverage',
            'Plant windbreaks',
            'Diversify field'
          ]
        }
      ],
      pestAndDiseaseRisks: [
        {
          pest: 'Armyworm',
          severity: 'High',
          season: 'January-February',
          mitigation: 'Bt cotton, neem spray, manual removal'
        },
        {
          disease: 'Leaf rust (wheat)',
          severity: 'Medium',
          season: 'February-March',
          mitigation: 'Resistant varieties, fungicide spray'
        }
      ],
      marketRisks: [
        {
          risk: 'Price crash',
          probability: 'Medium',
          mitigation: [
            'Sell when prices are good',
            'Consider MSP procurement',
            'Diversify crops'
          ]
        }
      ],
      insuranceOptions: [
        'Pradhan Mantri Fasal Bima Yojana (PMFBY)',
        'Weather Insurance',
        'Livestock Insurance'
      ]
    };

    return risks;
  }

  /**
   * Identify profit maximization opportunities
   */
  static async identifyProfitOpportunities(state, crop, landSize) {
    const opportunities = {
      costReductionOpportunities: [
        {
          opportunity: 'Use certified seeds',
          savings: '10-15% on pest control',
          effort: 'Low'
        },
        {
          opportunity: 'Adopt drip irrigation',
          savings: '30-40% on water bill',
          effort: 'High (initial investment)'
        },
        {
          opportunity: 'Use farm machinery instead of labor',
          savings: '20-25% on labor cost',
          effort: 'Medium'
        },
        {
          opportunity: 'Organic farming',
          savings: 'Reduce chemical cost by 50%',
          effort: 'High'
        }
      ],
      yieldIncreaseOpportunities: [
        {
          opportunity: 'Improved variety selection',
          increase: '10-15% yield increase',
          effort: 'Low'
        },
        {
          opportunity: 'Precision nutrient management',
          increase: '8-12% yield increase',
          effort: 'Medium'
        },
        {
          opportunity: 'Better crop timing',
          increase: '5-10% yield increase',
          effort: 'Low'
        }
      ],
      diversificationOpportunities: [
        {
          activity: 'Intercropping',
          crops: 'Wheat + Chickpea rotation',
          benefit: 'Double cropping, soil improvement',
          income: '₹50,000-70,000 additional'
        },
        {
          activity: 'Horticulture integration',
          crops: 'Orchards (mango, citrus)',
          benefit: 'Perennial income source',
          income: '₹100,000+ annually (long-term)'
        },
        {
          activity: 'Dairy farming',
          activity_type: 'Livestock',
          benefit: 'Regular monthly income',
          income: '₹20,000-30,000 monthly'
        }
      ],
      valueAddition: [
        {
          activity: 'Processing (dal mill, oil extraction)',
          profit_margin: '20-30%',
          investment: 'High'
        },
        {
          activity: 'Direct selling to consumer',
          profit_margin: '30-40%',
          investment: 'Low'
        }
      ]
    };

    return opportunities;
  }

  /**
   * Get default context for new farmers
   */
  static getDefaultContext(farmData) {
    return {
      farmer: farmData,
      message: 'Using default context. Please update profile for personalized recommendations.',
      suggestions: [
        'Add your state and district',
        'Specify soil type',
        'Update current crop',
        'Add land size',
        'Mention market location'
      ]
    };
  }
}

export default FarmerContextAggregator;
