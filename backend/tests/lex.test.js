/**
 * Test suite for Lex fulfillment
 */

import { handler } from '../lambda/lex-fulfillment/index.js';

describe('Lex Fulfillment', () => {
  describe('CropAdvice Intent', () => {
    it('should handle crop advice request', async () => {
      const event = {
        currentIntent: {
          name: 'CropAdvice',
          slots: {
            cropType: 'tomato',
            issue: 'yellow leaves'
          }
        },
        invocationSource: 'FulfillmentCodeHook',
        userId: 'farmer_test_123',
        sessionAttributes: {}
      };

      const response = await handler(event);
      
      expect(response).toBeDefined();
      expect(response.dialogAction).toBeDefined();
      expect(response.dialogAction.type).toBe('Close');
    });

    it('should handle missing slots', async () => {
      const event = {
        currentIntent: {
          name: 'CropAdvice',
          slots: {
            cropType: null,
            issue: 'yellowing'
          }
        },
        invocationSource: 'DialogCodeHook',
        userId: 'farmer_test_123'
      };

      const response = await handler(event);
      expect(response).toBeDefined();
    });
  });

  describe('WeatherAdvice Intent', () => {
    it('should provide weather recommendations', async () => {
      const event = {
        currentIntent: {
          name: 'WeatherAdvice',
          slots: {
            cropType: 'wheat',
            weatherQuery: 'Should I irrigate'
          }
        },
        invocationSource: 'FulfillmentCodeHook',
        userId: 'farmer_test_456'
      };

      const response = await handler(event);
      expect(response.dialogAction.fulfillmentState).toBe('Fulfilled');
    });
  });

  describe('MarketPrice Intent', () => {
    it('should return market price', async () => {
      const event = {
        currentIntent: {
          name: 'MarketPrice',
          slots: {
            crop: 'wheat',
            state: 'Punjab'
          }
        },
        invocationSource: 'FulfillmentCodeHook',
        userId: 'farmer_test_789'
      };

      const response = await handler(event);
      expect(response.dialogAction.message).toBeDefined();
      expect(response.dialogAction.message.content).toContain('₹');
    });
  });

  describe('SoilHealth Intent', () => {
    it('should analyze soil health', async () => {
      const event = {
        currentIntent: {
          name: 'SoilHealth',
          slots: {
            soilColor: 'brown',
            soilTexture: 'sandy'
          }
        },
        invocationSource: 'FulfillmentCodeHook',
        userId: 'farmer_test_soil'
      };

      const response = await handler(event);
      expect(response.dialogAction.fulfillmentState).toBe('Fulfilled');
    });
  });
});
