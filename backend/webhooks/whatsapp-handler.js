/**
 * WhatsApp Integration Handler
 * Manages voice messages, text queries, and responses via WhatsApp
 */

import axios from 'axios';
import AWS from 'aws-sdk';
import { v4 as uuidv4 } from 'uuid';

const dynamodb = new AWS.DynamoDB.DocumentClient();
const polly = new AWS.Polly();
const s3 = new AWS.S3();
const lambda = new AWS.Lambda();

const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID;
const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN;
const WHATSAPP_PHONE = process.env.WHATSAPP_PHONE || 'whatsapp:+1234567890';
const FARMER_TABLE = process.env.DYNAMODB_TABLE;

export const handler = async (event) => {
  console.log('WhatsApp event:', JSON.stringify(event, null, 2));

  try {
    const { From, Body, MediaUrl0, NumMedia } = event;
    const farmerPhone = From;
    const messageId = uuidv4();

    // Log incoming message
    await logMessage({
      messageId,
      farmerPhone,
      type: 'incoming',
      body: Body,
      hasMedia: NumMedia > 0,
      timestamp: Date.now()
    });

    // Get or create farmer profile
    let farmer = await getFarmerByPhone(farmerPhone);
    if (!farmer) {
      farmer = await createFarmerProfile(farmerPhone);
    }

    // Detect language from message or farmer preference
    const language = farmer.preferences?.language || 'hin';

    let response = {};

    // If it's a voice message (audio)
    if (NumMedia > 0 && MediaUrl0) {
      response = await handleVoiceMessage(
        MediaUrl0,
        farmerPhone,
        farmer,
        language,
        messageId
      );
    } else if (Body) {
      // Text-based query
      response = await handleTextQuery(
        Body,
        farmerPhone,
        farmer,
        language,
        messageId
      );
    }

    // Send response via WhatsApp
    await sendWhatsAppMessage(farmerPhone, response, language);

    return {
      statusCode: 200,
      body: JSON.stringify({
        status: 'success',
        messageId,
        farmerId: farmer.farmerId
      })
    };

  } catch (error) {
    console.error('Error handling WhatsApp message:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        status: 'error',
        message: error.message
      })
    };
  }
};

/**
 * Handle voice message from farmer
 */
async function handleVoiceMessage(audioUrl, farmerPhone, farmer, language, messageId) {
  try {
    // Download audio from Twilio
    const audioBuffer = await downloadAudio(audioUrl);

    // Transcribe using AWS Transcribe (optional - can use Google Speech-to-Text too)
    const transcription = await transcribeAudio(audioBuffer, language);

    // Process as text query
    return await handleTextQuery(
      transcription,
      farmerPhone,
      farmer,
      language,
      messageId
    );

  } catch (error) {
    console.error('Error handling voice message:', error);
    return {
      type: 'text',
      text: getTranslation(language, 'voice_error'),
      format: 'plain'
    };
  }
}

/**
 * Handle text query from farmer
 */
async function handleTextQuery(query, farmerPhone, farmer, language, messageId) {
  try {
    // Call Bedrock via Lambda for intelligent response
    const bedrockResult = await lambda.invoke({
      FunctionName: `vfa-bedrock-agent-${process.env.ENVIRONMENT}`,
      Payload: JSON.stringify({
        userId: farmer.farmerId,
        query,
        language,
        context: {
          state: farmer.state,
          crops: farmer.crops,
          previousIssues: farmer.previousIssues
        }
      })
    }).promise();

    const advice = JSON.parse(bedrockResult.Payload);

    // Format response with documentation
    const formattedResponse = formatFarmerResponse(advice, language);

    // Generate voice response
    const voiceUrl = await generateVoiceResponse(
      formattedResponse.voice_text,
      language,
      farmer.farmerId,
      messageId
    );

    // Store interaction
    await storeInteraction({
      farmerId: farmer.farmerId,
      messageId,
      query,
      response: formattedResponse,
      voiceUrl,
      language,
      timestamp: Date.now()
    });

    return {
      type: 'voice_with_text',
      text: formattedResponse.text,
      voice: voiceUrl,
      buttons: formattedResponse.suggestions,
      format: 'rich'
    };

  } catch (error) {
    console.error('Error processing query:', error);
    return {
      type: 'text',
      text: getTranslation(language, 'error'),
      format: 'plain'
    };
  }
}

/**
 * Format response for farmer with documentation
 */
function formatFarmerResponse(advice, language) {
  const translations = {
    hin: {
      advice: 'सलाह',
      steps: 'कदम',
      prevention: 'रोकथाम',
      when_expert: 'विशेषज्ञ से मिलें'
    },
    tam: {
      advice: 'ஆலோசனை',
      steps: 'படிகள்',
      prevention: 'தடுப்பு',
      when_expert: 'நிபுணரைப் பாருங்கள்'
    },
    eng: {
      advice: 'Advice',
      steps: 'Steps',
      prevention: 'Prevention',
      when_expert: 'See Expert'
    }
  };

  const t = translations[language] || translations.eng;

  // Build well-documented response
  const text = `
*${t.advice}:*
${advice.message}

*${t.steps}:*
${advice.recommendations?.map((r, i) => `${i + 1}. ${r}`).join('\n')}

*${t.prevention}:*
${advice.prevention || 'Follow the above steps regularly'}

_${advice.confidence ? '✅ Confidence: ' + Math.round(advice.confidence * 100) + '%' : ''}_
  `.trim();

  const voice_text = advice.message;

  const suggestions = [
    { text: getTranslation(language, 'more_info'), payload: 'MORE' },
    { text: getTranslation(language, 'other_issue'), payload: 'OTHER' },
    { text: getTranslation(language, 'call_expert'), payload: 'EXPERT' }
  ];

  return { text, voice_text, suggestions };
}

/**
 * Generate voice response using Polly
 */
async function generateVoiceResponse(text, language, farmerId, messageId) {
  try {
    const voiceConfig = {
      hin: { voiceId: 'Aditi' },
      tam: { voiceId: 'Tamizh' },
      tel: { voiceId: 'Telugu' },
      kan: { voiceId: 'Kannada' },
      mal: { voiceId: 'Malayalam' },
      mar: { voiceId: 'Marathi' },
      eng: { voiceId: 'Joanna' }
    };

    const config = voiceConfig[language] || voiceConfig.eng;

    const params = {
      Text: text,
      TextType: 'text',
      VoiceId: config.voiceId,
      OutputFormat: 'mp3',
      Engine: 'neural',
      SpeechMarkTypes: []
    };

    const response = await polly.synthesizeSpeech(params).promise();

    // Upload to S3
    const s3Key = `voices/${farmerId}/${messageId}_${language}.mp3`;
    await s3.putObject({
      Bucket: process.env.MEDIA_BUCKET,
      Key: s3Key,
      Body: response.AudioStream,
      ContentType: 'audio/mpeg'
    }).promise();

    // Generate signed URL for WhatsApp
    const url = s3.getSignedUrl('getObject', {
      Bucket: process.env.MEDIA_BUCKET,
      Key: s3Key,
      Expires: 3600
    });

    return url;

  } catch (error) {
    console.error('Error generating voice:', error);
    return null;
  }
}

/**
 * Send WhatsApp message with voice
 */
async function sendWhatsAppMessage(farmerPhone, response, language) {
  try {
    const messages = [];

    // Send text message
    if (response.text) {
      messages.push({
        type: 'text',
        content: response.text
      });
    }

    // Send voice message
    if (response.voice) {
      messages.push({
        type: 'audio',
        url: response.voice
      });
    }

    // Send suggestion buttons
    if (response.buttons && response.format === 'rich') {
      messages.push({
        type: 'buttons',
        buttons: response.buttons
      });
    }

    // Send via Twilio
    for (const msg of messages) {
      await sendTwilioMessage(farmerPhone, msg);
    }

  } catch (error) {
    console.error('Error sending WhatsApp message:', error);
  }
}

/**
 * Send message via Twilio
 */
async function sendTwilioMessage(farmerPhone, message) {
  const url = `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Messages`;

  let body = {
    From: WHATSAPP_PHONE,
    To: farmerPhone
  };

  if (message.type === 'text') {
    body.Body = message.content;
  } else if (message.type === 'audio') {
    body.MediaUrl = message.url;
  }

  try {
    await axios.post(url, body, {
      auth: {
        username: TWILIO_ACCOUNT_SID,
        password: TWILIO_AUTH_TOKEN
      }
    });
  } catch (error) {
    console.error('Error sending Twilio message:', error);
  }
}

/**
 * Get farmer by phone number
 */
async function getFarmerByPhone(phoneNumber) {
  try {
    const result = await dynamodb.query({
      TableName: FARMER_TABLE,
      IndexName: 'phoneNumberIndex',
      KeyConditionExpression: 'phoneNumber = :pn',
      ExpressionAttributeValues: { ':pn': phoneNumber },
      Limit: 1
    }).promise();

    return result.Items?.[0];
  } catch (error) {
    console.error('Error fetching farmer:', error);
    return null;
  }
}

/**
 * Create farmer profile from WhatsApp message
 */
async function createFarmerProfile(phoneNumber) {
  const farmerId = `farmer_${uuidv4()}`;

  const params = {
    TableName: FARMER_TABLE,
    Item: {
      farmerId,
      phoneNumber,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      language: 'hin',
      crops: [],
      preferences: {
        notifications: true,
        language: 'hin'
      }
    }
  };

  try {
    await dynamodb.put(params).promise();
    return params.Item;
  } catch (error) {
    console.error('Error creating farmer:', error);
    throw error;
  }
}

/**
 * Helper functions
 */
function getTranslation(language, key) {
  const translations = {
    hin: {
      voice_error: 'वॉयस संदेश प्रोसेस करने में त्रुटि। कृपया पाठ में भेजें।',
      error: 'खेद है, एक त्रुटि हुई। कृपया बाद में पुनः प्रयास करें।',
      more_info: 'अधिक जानकारी',
      other_issue: 'अन्य समस्या',
      call_expert: 'विशेषज्ञ से बात करें'
    },
    tam: {
      voice_error: 'குரல் செய்திகளை செயல்படுத்த பிழை. உரையை அனுப்பவும்.',
      error: 'வருந்தகிறோம், ஒரு பிழை ஏற்பட்டது. பின்னர் முயற்சி செய்யவும்.',
      more_info: 'மேலும் தகவல்',
      other_issue: 'மற்ற பிரச்சனை',
      call_expert: 'நிபுணரைப் பாருங்கள்'
    },
    eng: {
      voice_error: 'Error processing voice message. Please send text.',
      error: 'Sorry, an error occurred. Please try again later.',
      more_info: 'More Info',
      other_issue: 'Other Issue',
      call_expert: 'Talk to Expert'
    }
  };

  return translations[language]?.[key] || translations.eng[key];
}

async function downloadAudio(url) {
  const response = await axios.get(url, { responseType: 'arraybuffer' });
  return Buffer.from(response.data);
}

async function transcribeAudio(audioBuffer, language) {
  // Placeholder - implement with AWS Transcribe or Google Speech-to-Text
  return 'मेरे टमाटर की पत्तियां पीली पड़ रही हैं';
}

async function logMessage(message) {
  try {
    await dynamodb.put({
      TableName: FARMER_TABLE.replace('farmer-profiles', 'messages'),
      Item: message
    }).promise();
  } catch (error) {
    console.error('Error logging message:', error);
  }
}

async function storeInteraction(interaction) {
  try {
    await dynamodb.put({
      TableName: FARMER_TABLE.replace('farmer-profiles', 'conversation-history'),
      Item: interaction
    }).promise();
  } catch (error) {
    console.error('Error storing interaction:', error);
  }
}
