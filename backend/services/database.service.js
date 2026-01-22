/**
 * Database Service
 * Utilities for DynamoDB operations
 */

import AWS from 'aws-sdk';

const dynamodb = new AWS.DynamoDB.DocumentClient();

class DatabaseService {
  /**
   * Get farmer profile by ID
   */
  static async getFarmerById(farmerId) {
    try {
      const result = await dynamodb.get({
        TableName: process.env.DYNAMODB_TABLE,
        Key: { farmerId, createdAt: 0 }
      }).promise();
      return result.Item;
    } catch (error) {
      console.error('Error fetching farmer:', error);
      throw error;
    }
  }

  /**
   * Get farmer profile by phone number
   */
  static async getFarmerByPhone(phoneNumber) {
    try {
      const result = await dynamodb.query({
        TableName: process.env.DYNAMODB_TABLE,
        IndexName: 'phoneNumberIndex',
        KeyConditionExpression: 'phoneNumber = :pn',
        ExpressionAttributeValues: { ':pn': phoneNumber },
        Limit: 1
      }).promise();
      return result.Items?.[0];
    } catch (error) {
      console.error('Error fetching farmer by phone:', error);
      throw error;
    }
  }

  /**
   * Save farmer profile
   */
  static async saveFarmer(farmerData) {
    try {
      const params = {
        TableName: process.env.DYNAMODB_TABLE,
        Item: {
          ...farmerData,
          updatedAt: Date.now()
        }
      };
      await dynamodb.put(params).promise();
      return farmerData;
    } catch (error) {
      console.error('Error saving farmer:', error);
      throw error;
    }
  }

  /**
   * Get crop data
   */
  static async getCropData(cropId) {
    try {
      const result = await dynamodb.query({
        TableName: process.env.DYNAMODB_TABLE?.replace('farmer-profiles', 'crop-data'),
        KeyConditionExpression: 'cropId = :id',
        ExpressionAttributeValues: { ':id': cropId },
        ScanIndexForward: false, // Most recent first
        Limit: 1
      }).promise();
      return result.Items?.[0];
    } catch (error) {
      console.error('Error fetching crop data:', error);
      throw error;
    }
  }

  /**
   * Save crop data
   */
  static async saveCropData(cropData) {
    try {
      const params = {
        TableName: process.env.DYNAMODB_TABLE?.replace('farmer-profiles', 'crop-data'),
        Item: {
          ...cropData,
          timestamp: Date.now()
        }
      };
      await dynamodb.put(params).promise();
      return cropData;
    } catch (error) {
      console.error('Error saving crop data:', error);
      throw error;
    }
  }

  /**
   * Get conversation history
   */
  static async getConversationHistory(conversationId) {
    try {
      const result = await dynamodb.query({
        TableName: process.env.DYNAMODB_TABLE?.replace('farmer-profiles', 'conversation-history'),
        KeyConditionExpression: 'conversationId = :id',
        ExpressionAttributeValues: { ':id': conversationId },
        ScanIndexForward: false,
        Limit: 10
      }).promise();
      return result.Items;
    } catch (error) {
      console.error('Error fetching conversation history:', error);
      throw error;
    }
  }

  /**
   * Log event
   */
  static async logEvent(eventData) {
    try {
      const params = {
        TableName: process.env.DYNAMODB_TABLE?.replace('farmer-profiles', 'conversation-history'),
        Item: {
          conversationId: eventData.conversationId || `event_${Date.now()}`,
          timestamp: Date.now(),
          ...eventData,
          ttl: Math.floor(Date.now() / 1000) + (90 * 24 * 60 * 60)
        }
      };
      await dynamodb.put(params).promise();
    } catch (error) {
      console.error('Error logging event:', error);
    }
  }
}

export default DatabaseService;
