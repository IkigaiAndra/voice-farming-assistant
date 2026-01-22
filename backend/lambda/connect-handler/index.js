/**
 * Amazon Connect Handler
 * Manages incoming calls and routes to Lex for NLU
 */

import AWS from 'aws-sdk';
import { v4 as uuidv4 } from 'uuid';

const dynamodb = new AWS.DynamoDB.DocumentClient();
const connect = new AWS.Connect();
const polly = new AWS.Polly();

const FARMER_TABLE = process.env.DYNAMODB_TABLE;

export const handler = async (event) => {
  console.log('Incoming Connect event:', JSON.stringify(event, null, 2));

  try {
    const contactId = event.details.contactData.contactId;
    const phoneNumber = event.details.contactData.customerEndpoint?.Address;
    const callType = event.details.contactData.attributes?.callType || 'inbound';

    // Log conversation initiation
    await logConversation(contactId, phoneNumber, 'INITIATED', callType);

    // Check if farmer exists
    const farmerProfile = await getFarmerProfile(phoneNumber);

    if (!farmerProfile) {
      // New farmer - create profile
      await createFarmerProfile(phoneNumber, contactId);
      return {
        statusCode: 200,
        body: JSON.stringify({
          message: 'New farmer registered',
          contactId,
          action: 'GREET_NEW_USER'
        })
      };
    }

    // Existing farmer - continue conversation
    return {
      statusCode: 200,
      body: JSON.stringify({
        message: 'Welcome back farmer',
        contactId,
        farmerId: farmerProfile.farmerId,
        action: 'RESUME_CONVERSATION'
      })
    };

  } catch (error) {
    console.error('Error handling Connect call:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: 'Error processing call',
        error: error.message
      })
    };
  }
};

/**
 * Get farmer profile by phone number
 */
async function getFarmerProfile(phoneNumber) {
  try {
    const result = await dynamodb.query({
      TableName: FARMER_TABLE,
      IndexName: 'phoneNumberIndex',
      KeyConditionExpression: 'phoneNumber = :pn',
      ExpressionAttributeValues: {
        ':pn': phoneNumber
      },
      Limit: 1
    }).promise();

    return result.Items?.[0] || null;
  } catch (error) {
    console.error('Error fetching farmer profile:', error);
    return null;
  }
}

/**
 * Create new farmer profile
 */
async function createFarmerProfile(phoneNumber, contactId) {
  const farmerId = `farmer_${uuidv4()}`;
  const timestamp = Date.now();

  const params = {
    TableName: FARMER_TABLE,
    Item: {
      farmerId,
      phoneNumber,
      contactId,
      createdAt: timestamp,
      updatedAt: timestamp,
      language: 'hin', // Default to Hindi
      state: 'unknown',
      crops: [],
      preferences: {
        notifications: true,
        language: 'hin'
      }
    }
  };

  try {
    await dynamodb.put(params).promise();
    console.log(`Created farmer profile: ${farmerId}`);
    return params.Item;
  } catch (error) {
    console.error('Error creating farmer profile:', error);
    throw error;
  }
}

/**
 * Log conversation event
 */
async function logConversation(conversationId, phoneNumber, event, callType) {
  const params = {
    TableName: process.env.DYNAMODB_TABLE?.replace('farmer-profiles', 'conversation-history'),
    Item: {
      conversationId,
      timestamp: Date.now(),
      phoneNumber,
      event,
      callType,
      ttl: Math.floor(Date.now() / 1000) + (90 * 24 * 60 * 60) // 90 days TTL
    }
  };

  try {
    await dynamodb.put(params).promise();
  } catch (error) {
    console.error('Error logging conversation:', error);
  }
}
