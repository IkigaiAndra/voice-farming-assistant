/**
 * Deep Thinking Prompt Generator for Indian Farmers
 * Creates comprehensive, multi-aspect farming advice using Claude's extended thinking
 */

class DeepThinkingPrompts {
  /**
   * Generate comprehensive farmer advisory prompt
   */
  static generateFarmerAdvisoryPrompt(farmerContext, query, language = 'hin') {
    const { farmer, location, weather, soil, crops, market, profitability, seasonal, risks, opportunities } = farmerContext;

    const systemPrompt = `You are an expert agricultural advisor for Indian farmers with deep knowledge of:
- Regional farming practices and crop selection
- Soil science and nutrient management
- Weather patterns and climate adaptation
- Market dynamics and profitability maximization
- Pest and disease management
- Irrigation and water conservation
- Government schemes and subsidies
- Sustainable and organic farming practices

Your role is to provide:
1. CONTEXTUAL ANALYSIS: Consider the farmer's specific location, soil, weather, and market conditions
2. COMPREHENSIVE ADVICE: Address all aspects of their concern (economic, environmental, health)
3. PROFIT MAXIMIZATION: Always suggest ways to increase income and reduce costs
4. RISK MITIGATION: Identify potential problems and preventive measures
5. ACTIONABLE STEPS: Provide step-by-step implementation guidance
6. ALTERNATIVE OPTIONS: Suggest crop diversification and income sources

Important: Provide advice in the farmer's preferred language when responding.`;

    const contextPrompt = `
## Farmer's Context Information:

### Location & Demographics
- State: ${location.state}
- District: ${location.district}
- Region: ${location.region}
- Land Size: ${farmer.landSize || 'Not specified'} hectares

### Current Weather Conditions
- Temperature: ${weather.current.temperature}°C
- Humidity: ${weather.current.humidity}%
- Rainfall: ${weather.current.rainfall}mm
- Condition: ${weather.current.condition}
- Season: ${weather.season}

### Soil Information
- Type: ${soil.type}
- pH: ${soil.pH}
- Fertility Level: ${soil.fertility}
- Organic Matter: ${soil.organicMatter}%
- Key Deficiencies: ${soil.micronutrients.zinc} Zinc, ${soil.micronutrients.iron} Iron
- Recommendations: ${soil.recommendations.join('; ')}

### Current Crop & Economics
- Crop: ${farmer.currentCrop || 'Not specified'}
- Estimated Yield: ${profitability.expectedYield} quintals/hectare
- Current Market Price: ₹${market.currentPrice}/quintal
- Expected Income: ₹${profitability.expectedIncome}
- Expected Profit: ₹${profitability.expectedProfit}
- Profit Margin: ${profitability.profitMargin}%

### Best Alternative Crops for Region
${crops.rabiBestCrops.map(crop => `- ${crop.name}: ₹${crop.estimatedIncome}, Demand: ${crop.marketDemand}`).join('\n')}

### Market Analysis
- Price Trend: ${market.trend}
- Market Demand: ${market.demand}
- Supply Status: ${market.supply}
- Best Time to Sell: ${market.bestTimeToSell}

### Identified Risks
${risks.weatherRisks.map(r => `- ${r.risk} (${r.probability} probability): ${r.mitigation.join(', ')}`).join('\n')}

### Profit Opportunities
${opportunities.costReductionOpportunities.map(o => `- ${o.opportunity}: ${o.savings}`).join('\n')}
${opportunities.yieldIncreaseOpportunities.map(o => `- ${o.opportunity}: ${o.increase}`).join('\n')}

### Seasonal Tasks
- Current Month: ${seasonal.activitiesThisMonth.join(', ')}
- Next Season: ${seasonal.upcomingSeason.name}

## Farmer's Question/Concern:
"${query}"
`;

    return {
      systemPrompt,
      contextPrompt,
      fullPrompt: systemPrompt + contextPrompt
    };
  }

  /**
   * Generate profit maximization analysis prompt
   */
  static generateProfitMaximizationPrompt(farmerContext) {
    return `
Based on the farmer's current situation:

Current Profit: ₹${farmerContext.profitability.expectedProfit}/hectare
Current ROI: ${farmerContext.profitability.roi}%

Generate a detailed profit maximization strategy that includes:

1. IMMEDIATE ACTIONS (This season):
   - Reduce costs by: [specific ways]
   - Increase yield by: [specific methods]
   - Potential additional income: ₹[amount]

2. SHORT-TERM IMPROVEMENTS (Next 6 months):
   - Alternative crops to consider
   - Cost reduction opportunities
   - Market timing strategies
   - Expected impact on profit

3. MEDIUM-TERM STRATEGY (1-2 years):
   - Diversification options
   - Infrastructure investment recommendations
   - Soil improvement plans
   - Technology adoption

4. LONG-TERM WEALTH BUILDING (3+ years):
   - Sustainable income sources
   - Asset creation strategy
   - Market linkage development
   - Skill development needs

5. RISK MITIGATION:
   - Insurance options
   - Market hedging strategies
   - Crop insurance enrollment

For each recommendation, provide:
- Expected additional income
- Implementation cost
- Time to implementation
- Success probability
- Prerequisites needed

Calculate total potential profit increase: ₹[X] = [Y]% improvement
`;
  }

  /**
   * Generate crop selection and rotation prompt
   */
  static generateCropSelectionPrompt(farmerContext) {
    const { soil, weather, crops, market, location } = farmerContext;

    return `
The farmer is in ${location.district}, ${location.state} with ${soil.type} soil.

Analyze the following options and recommend the best crop rotation strategy:

Available Crops:
${crops.rabiBestCrops.map((crop, i) => `
${i + 1}. ${crop.name}
   - Yield: ${crop.estimatedYield}
   - Income: ${crop.estimatedIncome}
   - Water Needed: ${crop.waterRequired}
   - Temperature Range: ${crop.minimumTemp}°C - ${crop.maximumTemp}°C
   - Market Demand: ${crop.marketDemand}
`).join('\n')}

Soil Constraints:
- Type: ${soil.type}
- pH: ${soil.pH}
- Key deficiency: Zinc (${soil.micronutrients.zinc})
- Organic matter: Low (${soil.organicMatter}%)

Weather Constraints:
- Season: ${weather.season}
- Rainfall: ${weather.forecast7Days.reduce((sum, d) => sum + d.rainfall, 0)}mm expected
- Temperature: ${weather.current.temperature}°C

Based on this analysis:

1. IMMEDIATE RECOMMENDATION:
   Best crop to plant now: [Crop Name]
   Reason: [Detailed reasoning]
   Expected profit: ₹[Amount]
   Implementation timeline: [Days to harvest]

2. CROP ROTATION PLAN (3-year cycle):
   Year 1 Kharif: [Crop]
   Year 1 Rabi: [Crop]
   Year 2 Kharif: [Crop]
   Year 2 Rabi: [Crop]
   Year 3 Kharif: [Crop]
   Year 3 Rabi: [Crop]

   Benefits:
   - Soil health improvement: [Specific]
   - Pest/disease break: [Specific]
   - Income stability: [Specific]
   - Average annual income: ₹[Amount]

3. SOIL IMPROVEMENT STRATEGY:
   To fix zinc deficiency:
   - Action 1: [Specific]
   - Action 2: [Specific]
   - Cost: ₹[Amount]
   - Timeline: [Months]
   - Expected yield improvement: [%]

4. RISK MITIGATION:
   - Weather risk for recommended crop: [Assessment]
   - Market risk: [Assessment]
   - Pest/disease risk: [Assessment]
   - Mitigation strategies: [Specific actions]

5. ALTERNATIVE SCENARIOS:
   If water becomes scarce:
   - Recommended crop: [Crop]
   - Yield adjustment: [%]
   - Profit impact: ₹[Amount]

   If market price crashes:
   - Recommended crop: [Crop]
   - Safety mechanism: [Strategy]
`;
  }

  /**
   * Generate pest and disease management prompt
   */
  static generatePestManagementPrompt(farmerContext, cropIssue) {
    return `
Farmer's Concern: ${cropIssue}
Crop: ${farmerContext.farmer.currentCrop}
Location: ${farmerContext.location.district}, ${farmerContext.location.state}
Current Weather: ${farmerContext.weather.current.condition}, ${farmerContext.weather.current.temperature}°C

Based on this issue, provide:

1. DIAGNOSIS:
   - Most likely pest/disease: [Name]
   - Confidence level: [%]
   - Why this diagnosis: [Reasoning]
   - Alternative possibilities: [List]

2. IMMEDIATE ACTION (Next 24-48 hours):
   - Priority action 1: [Specific task]
   - Priority action 2: [Specific task]
   - Cost: ₹[Amount]
   - Equipment needed: [List]

3. TREATMENT OPTIONS (Ranked by effectiveness):
   
   Option 1: ORGANIC/BIOLOGICAL
   - Method: [Specific method]
   - Materials: [Required materials]
   - Cost: ₹[Amount]
   - Effectiveness: [%]
   - Timeline to recovery: [Days]
   - Environmental impact: [Assessment]
   
   Option 2: CHEMICAL
   - Pesticide: [Specific brand]
   - Dosage: [Concentration and quantity]
   - Application method: [Specific]
   - Cost: ₹[Amount]
   - Effectiveness: [%]
   - Precautions: [Important safety info]
   - Waiting period before harvest: [Days]
   
   Option 3: INTEGRATED PEST MANAGEMENT
   - Combination approach: [Specific mix]
   - Cost: ₹[Amount]
   - Effectiveness: [%]

4. PREVENTION STRATEGY (For future crops):
   - Cultural practices: [Specific actions]
   - Resistant varieties: [Recommended varieties]
   - Crop rotation: [Specific rotation]
   - Cost: ₹[Amount]

5. EXPECTED CROP LOSS:
   - If no action taken: [%] yield loss = ₹[Income loss]
   - After treatment: [%] yield loss = ₹[Income loss]
   - Net benefit of treatment: ₹[Amount]

6. MONITORING SCHEDULE:
   - Days 1-3: [Check what]
   - Days 4-7: [Check what]
   - After 10 days: [Assess recovery]
`;
  }

  /**
   * Generate water management and irrigation prompt
   */
  static generateIrrigationPrompt(farmerContext, season) {
    return `
Farmer Location: ${farmerContext.location.district}, ${farmerContext.location.state}
Current Crop: ${farmerContext.farmer.currentCrop}
Land Size: ${farmerContext.farmer.landSize} hectares
Soil Type: ${farmerContext.soil.type}
Water Holding Capacity: ${farmerContext.soil.waterHoldingCapacity}

Current Weather & Forecast:
- Current rainfall: ${farmerContext.weather.current.rainfall}mm
- 7-day forecast rainfall: ${farmerContext.weather.forecast7Days.reduce((sum, d) => sum + d.rainfall, 0)}mm
- Temperature: ${farmerContext.weather.current.temperature}°C
- Humidity: ${farmerContext.weather.current.humidity}%

Provide a detailed IRRIGATION MANAGEMENT PLAN:

1. WATER REQUIREMENT ANALYSIS:
   - Total water needed for crop: [mm/season]
   - Expected rainfall: [mm]
   - Irrigation needed: [mm] = [Number] irrigation cycles
   - Water cost at current rates: ₹[Amount]

2. IRRIGATION SCHEDULE (Current Season):
   Week 1: [When to irrigate] = [How much water]
   Week 2: [When to irrigate] = [How much water]
   [Continue for season]
   
   Based on: Soil moisture, weather, crop stage

3. WATER CONSERVATION STRATEGIES:
   - Mulching: Save [%] water, Cost: ₹[Amount]
   - Drip irrigation: Save [%] water, Cost: ₹[Amount]
   - Soil amendment: Save [%] water, Cost: ₹[Amount]
   - Total potential saving: ₹[Amount/season]

4. SOURCE ASSESSMENT:
   - Groundwater availability: [Assessment]
   - Borewell depth recommended: [Meters]
   - Pump capacity needed: [HP]
   - Maintenance cost: ₹[Amount/year]

5. EMERGENCY DROUGHT PLAN:
   If water becomes scarce:
   - Priority crops to irrigate: [List]
   - Deficit irrigation strategy: [Specific]
   - Crop yield impact: [%]

6. INVESTMENT OPPORTUNITIES:
   - Micro-irrigation ROI: [Years to payback]
   - Solar pump: [Cost and benefit analysis]
   - Water harvesting: [Feasibility]
`;
  }

  /**
   * Generate government scheme and subsidy prompt
   */
  static generateSchemePrompt(farmerContext) {
    return `
Farmer Profile:
- State: ${farmerContext.location.state}
- District: ${farmerContext.location.district}
- Land Size: ${farmerContext.farmer.landSize} hectares
- Main Crop: ${farmerContext.farmer.currentCrop}
- Current Income: ₹${farmerContext.profitability.expectedIncome}

Identify ALL applicable government schemes and subsidies:

1. CROP-SPECIFIC SCHEMES:
   For ${farmerContext.farmer.currentCrop}:
   - Scheme name: [Name]
   - Subsidy amount: ₹[Amount]
   - Eligibility: [Criteria]
   - Application process: [Steps]
   - Expected timeline: [Days]
   - Link: [Application portal]

2. AGRICULTURAL INFRASTRUCTURE SCHEMES:
   - Irrigation subsidy: [Details]
   - Seed subsidy: [Details]
   - Fertilizer subsidy: [Details]
   - Machinery subsidy: [Details]

3. INCOME SUPPORT SCHEMES:
   - PM-KISAN (Direct income support): ₹[Amount] eligibility
   - State income schemes: [Specific to ${farmerContext.location.state}]
   - Crop insurance eligibility: [Details]

4. CREDIT & FINANCE SCHEMES:
   - Farm loan schemes: [Details]
   - Interest subsidy: [Details]
   - Debt relief programs: [Details]

5. ORGANIC & SUSTAINABLE FARMING:
   - Organic certification subsidy: [Details]
   - Cost of cultivation subsidy: [Details]
   - Organic inputs subsidy: [Details]

6. MARKET-LINKED SCHEMES:
   - Agricultural produce market committees: [Details]
   - Contract farming guidelines: [Details]
   - Minimum support price (MSP): ₹${farmerContext.market.governmentSupport}

7. ACTION PLAN TO MAXIMIZE BENEFITS:
   Priority 1: [Scheme] - Expected benefit: ₹[Amount]
   Priority 2: [Scheme] - Expected benefit: ₹[Amount]
   Priority 3: [Scheme] - Expected benefit: ₹[Amount]
   
   Total potential additional income: ₹[Amount/year]
   
   Implementation timeline:
   - Month 1: [Apply for schemes]
   - Month 2: [Track applications]
   - Month 3: [Receive benefits]
`;
  }
}

export default DeepThinkingPrompts;
