/**
 * Amazon Bedrock Agent Function
 * LLM-powered reasoning for agricultural intelligence
 */

import AWS from 'aws-sdk';

const bedrockRuntime = new AWS.BedrockRuntime();
const dynamodb = new AWS.DynamoDB.DocumentClient();

const MODEL_ID = process.env.BEDROCK_MODEL_ID || 'anthropic.claude-v2';
const REGION = process.env.REGION || 'us-east-1';

export const handler = async (event) => {
  console.log('Bedrock agent event:', JSON.stringify(event, null, 2));

  try {
    const { userId, intent, cropType, issue } = event;

    // Build context from farmer profile and crop data
    const context = await buildContext(userId, cropType);

    // Create prompt for Bedrock
    const prompt = buildPrompt(intent, cropType, issue, context);

    // Call Bedrock Claude model
    const response = await invokeBedrockModel(prompt);

    // Parse and structure response
    const advice = parseBedrockResponse(response, cropType);

    // Store interaction
    await storeInteraction(userId, intent, cropType, advice);

    return {
      statusCode: 200,
      body: JSON.stringify(advice)
    };

  } catch (error) {
    console.error('Error in Bedrock agent:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: 'Error generating agricultural advice',
        error: error.message
      })
    };
  }
};

/**
 * Build context from database
 */
async function buildContext(userId, cropType) {
  try {
    const cropResult = await dynamodb.query({
      TableName: process.env.DYNAMODB_TABLE?.replace('farmer-profiles', 'crop-data'),
      KeyConditionExpression: 'cropId = :cid',
      ExpressionAttributeValues: {
        ':cid': `${userId}_${cropType}`
      }
    }).promise();

    return {
      cropType,
      recentData: cropResult.Items?.[0] || {},
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error('Error building context:', error);
    return { cropType, timestamp: new Date().toISOString() };
  }
}

/**
 * Build prompt for Bedrock
 */
function buildPrompt(intent, cropType, issue, context) {
  const systemPrompt = `You are an expert agricultural advisor for Indian farmers.
Provide practical, actionable advice in clear language.
Focus on sustainable farming practices.
Consider local climate conditions.
Always recommend organic/traditional methods first.`;

  let userPrompt = '';

  switch (intent) {
    case 'CropAdvice':
      userPrompt = `My ${cropType} crop has the following issue: ${issue}. 
What should I do? Please provide step-by-step advice.
Context: ${JSON.stringify(context)}`;
      break;
    case 'PestDetection':
      userPrompt = `I've identified a pest problem on my ${cropType} crop.
What are organic solutions? How do I prevent this in the future?`;
      break;
    case 'WeatherAdvice':
      userPrompt = `Given current weather conditions, how should I manage my ${cropType} crop?
What irrigation schedule would you recommend?`;
      break;
    default:
      userPrompt = `Help me with my ${cropType} farming: ${issue}`;
  }

  return { systemPrompt, userPrompt };
}

/**
 * Invoke Bedrock Claude model
 */
async function invokeBedrockModel(prompt) {
  const body = {
    prompt: `${prompt.systemPrompt}\n\nHuman: ${prompt.userPrompt}\n\nAssistant:`,
    max_tokens_to_sample: 500,
    temperature: 0.7,
    top_p: 0.9,
    stop_sequences: ['\n\nHuman:']
  };

  const params = {
    modelId: MODEL_ID,
    body: JSON.stringify(body),
    contentType: 'application/json',
    accept: 'application/json'
  };

  try {
    const response = await bedrockRuntime.invokeModel(params).promise();
    const responseBody = JSON.parse(Buffer.from(response.body).toString('utf8'));
    return responseBody.completion;
  } catch (error) {
    console.error('Error invoking Bedrock:', error);
    throw error;
  }
}

/**
 * Parse and structure Bedrock response
 */
function parseBedrockResponse(response, cropType) {
  // Clean up response
  const cleanedResponse = response.trim();

  // Extract key recommendations
  const lines = cleanedResponse.split('\n').filter(line => line.trim());

  return {
    message: cleanedResponse,
    cropType,
    recommendations: lines,
    timestamp: new Date().toISOString(),
    confidence: 0.95
  };
}

/**
 * Store interaction for learning
 */
async function storeInteraction(userId, intent, cropType, advice) {
  const params = {
    TableName: process.env.DYNAMODB_TABLE?.replace('farmer-profiles', 'conversation-history'),
    Item: {
      conversationId: `${userId}_${Date.now()}`,
      timestamp: Date.now(),
      userId,
      intent,
      cropType,
      advice: advice.message.substring(0, 500), // Store first 500 chars
      ttl: Math.floor(Date.now() / 1000) + (365 * 24 * 60 * 60) // 1 year TTL
    }
  };

  try {
    await dynamodb.put(params).promise();
  } catch (error) {
    console.error('Error storing interaction:', error);
  }
}
