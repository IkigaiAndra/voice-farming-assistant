/**
 * Voice Service
 * Utilities for Polly and voice operations
 */

import AWS from 'aws-sdk';

const polly = new AWS.Polly();
const s3 = new AWS.S3();

class VoiceService {
  static voiceConfig = {
    hin: { voiceId: 'Aditi', languageCode: 'hi-IN' },
    tam: { voiceId: 'Tamizh', languageCode: 'ta-IN' },
    tel: { voiceId: 'Telugu', languageCode: 'te-IN' },
    kan: { voiceId: 'Kannada', languageCode: 'kn-IN' },
    mal: { voiceId: 'Malayalam', languageCode: 'ml-IN' },
    mar: { voiceId: 'Marathi', languageCode: 'mr-IN' },
    eng: { voiceId: 'Joanna', languageCode: 'en-US' }
  };

  /**
   * Convert text to speech
   */
  static async textToSpeech(text, language = 'hin', outputFormat = 'mp3') {
    try {
      const config = this.voiceConfig[language];
      if (!config) {
        throw new Error(`Unsupported language: ${language}`);
      }

      const params = {
        Text: text,
        TextType: 'text',
        VoiceId: config.voiceId,
        OutputFormat: outputFormat,
        Engine: 'neural',
        SpeechMarkTypes: []
      };

      const response = await polly.synthesizeSpeech(params).promise();
      return response.AudioStream;
    } catch (error) {
      console.error('Error in textToSpeech:', error);
      throw error;
    }
  }

  /**
   * Convert SSML to speech (for more control)
   */
  static async ssmlToSpeech(ssml, language = 'hin', outputFormat = 'mp3') {
    try {
      const config = this.voiceConfig[language];
      const params = {
        Text: ssml,
        TextType: 'ssml',
        VoiceId: config.voiceId,
        OutputFormat: outputFormat,
        Engine: 'neural'
      };

      const response = await polly.synthesizeSpeech(params).promise();
      return response.AudioStream;
    } catch (error) {
      console.error('Error in ssmlToSpeech:', error);
      throw error;
    }
  }

  /**
   * Create SSML response with proper formatting
   */
  static createSSML(text, language = 'hin', properties = {}) {
    const config = this.voiceConfig[language];
    
    // Default properties
    const rate = properties.rate || '95%';
    const pitch = properties.pitch || 'default';
    const volume = properties.volume || 'default';

    return `
      <speak>
        <prosody rate="${rate}" pitch="${pitch}" volume="${volume}">
          ${text}
        </prosody>
      </speak>
    `.trim();
  }

  /**
   * Save audio to S3
   */
  static async saveAudioToS3(audioStream, farmerId, conversationId, language) {
    try {
      const fileName = `audio/${farmerId}/${conversationId}_${language}.mp3`;
      
      const params = {
        Bucket: process.env.MEDIA_BUCKET || 'vfa-media',
        Key: fileName,
        Body: audioStream,
        ContentType: 'audio/mpeg'
      };

      const result = await s3.upload(params).promise();
      return result.Location;
    } catch (error) {
      console.error('Error saving audio to S3:', error);
      throw error;
    }
  }

  /**
   * Get supported languages
   */
  static getSupportedLanguages() {
    return Object.keys(this.voiceConfig);
  }

  /**
   * Build response message with language formatting
   */
  static buildMessage(advice, language = 'hin') {
    // Add language-specific formatting
    const messages = {
      hin: { greeting: 'नमस्ते! ', closing: '\nआपकी मदद के लिए धन्यवाद।' },
      tam: { greeting: 'வணக்கம்! ', closing: '\nআপনার সাহায্যের জন্য ধন্যবাদ।' },
      eng: { greeting: 'Hello! ', closing: '\nThank you for using our service.' }
    };

    const msg = messages[language] || messages.eng;
    return `${msg.greeting}${advice}${msg.closing}`;
  }
}

export default VoiceService;
