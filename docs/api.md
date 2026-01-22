# Voice Farming Assistant - API Documentation

## Overview

The Voice Farming Assistant provides REST APIs and event-driven interfaces for integrating with Amazon Connect, Lex, and third-party services.

## Authentication

All API requests should include AWS Signature Version 4 authentication or use IAM roles for Lambda functions.

```bash
# Example authenticated request
aws lambda invoke \
  --function-name vfa-connect-handler-dev \
  --payload file://payload.json \
  response.json
```

## Connect Handler API

**Endpoint**: `POST /call`

Handles incoming phone calls from Amazon Connect.

### Request

```json
{
  "details": {
    "contactData": {
      "contactId": "string",
      "customerEndpoint": {
        "Address": "+91XXXXXXXXXX"
      },
      "attributes": {
        "callType": "inbound|missed"
      }
    }
  }
}
```

### Response

```json
{
  "statusCode": 200,
  "body": {
    "message": "string",
    "contactId": "string",
    "action": "GREET_NEW_USER|RESUME_CONVERSATION",
    "farmerId": "string (optional)"
  }
}
```

### Example Flow

```bash
# 1. Farmer calls the number
# 2. Amazon Connect routes to Lambda
# 3. Handler identifies farmer or creates new profile
# 4. Returns action for IVR to take

curl -X POST https://api.example.com/call \
  -H "Content-Type: application/json" \
  -H "Authorization: AWS4-HMAC-SHA256 ..." \
  -d '{
    "details": {
      "contactData": {
        "contactId": "abc123",
        "customerEndpoint": {"Address": "+919876543210"},
        "attributes": {"callType": "inbound"}
      }
    }
  }'
```

## Lex Fulfillment API

**Endpoint**: `POST /fulfillment`

Handles Lex intent fulfillment.

### Request

```json
{
  "currentIntent": {
    "name": "CropAdvice",
    "slots": {
      "cropType": "tomato",
      "issue": "yellow leaves"
    }
  },
  "invocationSource": "FulfillmentCodeHook",
  "userId": "farmer_xyz",
  "sessionAttributes": {}
}
```

### Response

```json
{
  "dialogAction": {
    "type": "Close",
    "fulfillmentState": "Fulfilled",
    "message": {
      "contentType": "PlainText",
      "content": "Your crop advice text"
    }
  }
}
```

### Supported Intents

#### CropAdvice
Get farming recommendations for specific crops.

**Slots**:
- `cropType` (required): tomato, rice, wheat, cotton, etc.
- `issue` (required): description of problem

**Example**:
```json
{
  "currentIntent": {
    "name": "CropAdvice",
    "slots": {
      "cropType": "tomato",
      "issue": "leaves turning yellow"
    }
  }
}
```

#### PestDetection
Identify pests and get treatment advice.

**Slots**:
- `cropType` (required): affected crop
- `pestType` (optional): if known

#### WeatherAdvice
Get weather-based farming recommendations.

**Slots**:
- `cropType` (required): crop type
- `weatherQuery` (required): farming question

#### MarketPrice
Get current crop market prices.

**Slots**:
- `crop` (required): crop name
- `state` (optional): Indian state

#### SoilHealth
Get soil analysis recommendations.

**Slots**:
- `soilColor` (required): observed color
- `soilTexture` (required): clay/sandy/loamy

## Bedrock Agent API

**Endpoint**: Internal Lambda function

Provides LLM-powered reasoning.

### Request

```json
{
  "userId": "farmer_123",
  "intent": "CropAdvice",
  "cropType": "tomato",
  "issue": "wilting despite irrigation"
}
```

### Response

```json
{
  "statusCode": 200,
  "body": {
    "message": "Detailed agricultural advice",
    "cropType": "tomato",
    "recommendations": ["Step 1", "Step 2", "Step 3"],
    "timestamp": "2024-01-22T10:30:00Z",
    "confidence": 0.95
  }
}
```

## Data Processor API

**Endpoint**: S3 Event (Automatic)

Triggered when farmers upload crop images.

### Event

```json
{
  "Records": [
    {
      "s3": {
        "bucket": {
          "name": "vfa-media-123456"
        },
        "object": {
          "key": "farmer_abc/crop_photo.jpg"
        }
      }
    }
  ]
}
```

### Processing

1. Downloads image from S3
2. Uses AWS Rekognition to analyze
3. Detects crop type and issues
4. Stores results in DynamoDB
5. Triggers Bedrock analysis

## DynamoDB Schema

### FarmerProfile Table

```json
{
  "farmerId": "farmer_uuid",
  "phoneNumber": "+919876543210",
  "contactId": "connect_id",
  "createdAt": 1674380400000,
  "updatedAt": 1674380400000,
  "language": "hin",
  "state": "Maharashtra",
  "crops": ["tomato", "wheat"],
  "preferences": {
    "notifications": true,
    "language": "hin"
  }
}
```

### CropData Table

```json
{
  "cropId": "farmer_uuid_tomato",
  "timestamp": 1674380400000,
  "farmerId": "farmer_uuid",
  "cropType": "tomato",
  "imageKey": "farmer_abc/crop_photo.jpg",
  "analysis": {
    "labels": [
      {"name": "Plant", "confidence": 98.5},
      {"name": "Leaf", "confidence": 95.2}
    ],
    "detectedIssues": ["yellowing", "pest_damage"],
    "detectionTimestamp": "2024-01-22T10:30:00Z"
  },
  "processed": true
}
```

### ConversationHistory Table

```json
{
  "conversationId": "farmer_uuid_1674380400000",
  "timestamp": 1674380400000,
  "phoneNumber": "+919876543210",
  "event": "INITIATED|ADVICE_REQUESTED|IMAGE_UPLOADED",
  "callType": "inbound|missed",
  "ttl": 1705916400
}
```

## WhatsApp Integration API

**Endpoint**: `POST /webhooks/whatsapp`

Handles incoming WhatsApp voice messages.

### Request

```json
{
  "From": "whatsapp:+919876543210",
  "To": "whatsapp:+911234567890",
  "Body": "How to prevent tomato blight?",
  "MediaUrl0": "https://example.com/audio.m4a"
}
```

### Response

```json
{
  "statusCode": 200,
  "body": "Message processed"
}
```

## Error Responses

### 400 Bad Request
```json
{
  "statusCode": 400,
  "error": "INVALID_INPUT",
  "message": "Missing required parameter: cropType"
}
```

### 500 Internal Server Error
```json
{
  "statusCode": 500,
  "error": "INTERNAL_ERROR",
  "message": "Error processing request"
}
```

### 503 Service Unavailable
```json
{
  "statusCode": 503,
  "error": "SERVICE_UNAVAILABLE",
  "message": "Bedrock service temporarily unavailable"
}
```

## Rate Limiting

- Connect Handler: 1000 requests/minute
- Lex Fulfillment: 5000 requests/minute
- Bedrock Agent: 500 requests/minute

## Monitoring

Track API usage with CloudWatch metrics:

```bash
# Get Lambda invocation count
aws cloudwatch get-metric-statistics \
  --metric-name Invocations \
  --namespace AWS/Lambda \
  --start-time 2024-01-01T00:00:00Z \
  --end-time 2024-01-02T00:00:00Z \
  --period 3600 \
  --statistics Sum
```

## WebSocket API (Optional)

For real-time conversation streaming:

```javascript
// JavaScript client example
const ws = new WebSocket('wss://api.example.com/stream');

ws.onopen = () => {
  ws.send(JSON.stringify({
    action: 'startConversation',
    farmerId: 'farmer_123',
    language: 'hin'
  }));
};

ws.onmessage = (event) => {
  const response = JSON.parse(event.data);
  console.log('Assistant:', response.message);
};
```

## References

- [AWS Lambda API Reference](https://docs.aws.amazon.com/lambda/latest/dg/API_Reference.html)
- [Amazon Lex Runtime API](https://docs.aws.amazon.com/lex/latest/dg/API_Reference.html)
- [Amazon Polly API](https://docs.aws.amazon.com/polly/latest/dg/API_Reference.html)
