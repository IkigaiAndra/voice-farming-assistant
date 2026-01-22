/**
 * Lex Fulfillment Function
 * Handles Lex intents and routes to appropriate business logic
 */

import AWS from 'aws-sdk';

const dynamodb = new AWS.DynamoDB.DocumentClient();
const lambda = new AWS.Lambda();

const CROP_TABLE = process.env.DYNAMODB_TABLE?.replace('farmer-profiles', 'crop-data') || 'crop-data';

export const handler = async (event) => {
  console.log('Lex fulfillment event:', JSON.stringify(event, null, 2));

  try {
    const intentName = event.currentIntent.name;
    const slots = event.currentIntent.slots;
    const source = event.invocationSource;
    const userId = event.userId;

    // Route to appropriate handler
    let response;

    if (source === 'DialogCodeHook') {
      // Validate slots during conversation
      response = await validateSlots(intentName, slots);
    } else if (source === 'FulfillmentCodeHook') {
      // Fulfill the intent
      switch (intentName) {
        case 'CropAdvice':
          response = await handleCropAdvice(slots, userId);
          break;
        case 'PestDetection':
          response = await handlePestDetection(slots, userId);
          break;
        case 'WeatherAdvice':
          response = await handleWeatherAdvice(slots, userId);
          break;
        case 'MarketPrice':
          response = await handleMarketPrice(slots, userId);
          break;
        case 'SoilHealth':
          response = await handleSoilHealth(slots, userId);
          break;
        default:
          response = await handleGenericIntent(intentName, slots, userId);
      }
    }

    return response;

  } catch (error) {
    console.error('Error in Lex fulfillment:', error);
    return buildResponse('Failed', 'Sorry, I encountered an error. Please try again.');
  }
};

/**
 * Handle crop advice intent
 */
async function handleCropAdvice(slots, userId) {
  const cropType = slots.cropType;
  const issue = slots.issue;

  // Call Bedrock agent for intelligent recommendations
  const bedrockParams = {
    FunctionName: 'vfa-bedrock-agent-' + process.env.ENVIRONMENT,
    Payload: JSON.stringify({
      userId,
      intent: 'CropAdvice',
      cropType,
      issue
    })
  };

  try {
    const result = await lambda.invoke(bedrockParams).promise();
    const advice = JSON.parse(result.Payload);
    return buildResponse('Fulfilled', advice.message);
  } catch (error) {
    console.error('Error getting crop advice:', error);
    return buildResponse('Failed', 'Unable to fetch crop advice at this moment.');
  }
}

/**
 * Handle pest detection intent
 */
async function handlePestDetection(slots, userId) {
  const cropType = slots.cropType;
  // Image would be stored and processed asynchronously
  return buildResponse('ConfirmIntent',
    `I will help detect pests on your ${cropType}. Please send a photo of the affected area.`
  );
}

/**
 * Handle weather advice intent
 */
async function handleWeatherAdvice(slots, userId) {
  const cropType = slots.cropType;
  const weatherQuery = slots.weatherQuery;

  const response = await buildWeatherResponse(cropType, weatherQuery);
  return buildResponse('Fulfilled', response);
}

/**
 * Handle market price inquiry
 */
async function handleMarketPrice(slots, userId) {
  const crop = slots.crop;
  const state = slots.state;

  try {
    const price = await getMarketPrice(crop, state);
    return buildResponse('Fulfilled', `Current market price for ${crop} in ${state} is ₹${price} per quintal.`);
  } catch (error) {
    return buildResponse('Failed', 'Could not fetch market price. Please try again later.');
  }
}

/**
 * Handle soil health inquiry
 */
async function handleSoilHealth(slots, userId) {
  const color = slots.soilColor;
  const texture = slots.soilTexture;

  const response = `Based on the ${color} color and ${texture} texture, ` +
    `your soil appears to need nitrogen enrichment. Consider using organic compost.`;

  return buildResponse('Fulfilled', response);
}

/**
 * Validate slots during conversation
 */
async function validateSlots(intentName, slots) {
  // Validation logic
  return buildResponse('ElicitSlot', 'Please provide more details.');
}

/**
 * Handle generic intents
 */
async function handleGenericIntent(intentName, slots, userId) {
  console.log(`Handling generic intent: ${intentName}`);
  return buildResponse('Fulfilled', 'Thank you for your question.');
}

/**
 * Build weather response
 */
async function buildWeatherResponse(cropType, weatherQuery) {
  // In production, integrate with weather API
  return `For ${cropType}, I recommend checking weather conditions before irrigation. ` +
    `Current trends suggest watering every 3-4 days.`;
}

/**
 * Get market price for crop
 */
async function getMarketPrice(crop, state) {
  // In production, integrate with market data API
  const prices = {
    'wheat': 2200,
    'rice': 2100,
    'cotton': 5500,
    'tomato': 1200,
    'potato': 800
  };

  return prices[crop?.toLowerCase()] || 'N/A';
}

/**
 * Build Lex response
 */
function buildResponse(fulfillmentState, message) {
  return {
    dialogAction: {
      type: 'Close',
      fulfillmentState,
      message: {
        contentType: 'PlainText',
        content: message
      }
    }
  };
}
