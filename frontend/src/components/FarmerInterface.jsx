import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import './FarmerInterface.css';

/**
 * Farmer Voice Interface - Beautiful UI for WhatsApp & Voice Chat
 * Supports native Indian languages with voice input/output
 */

const LANGUAGES = {
  hin: { name: 'हिंदी', code: 'hin', flag: '🇮🇳' },
  tam: { name: 'தமிழ்', code: 'tam', flag: '🇮🇳' },
  tel: { name: 'తెలుగు', code: 'tel', flag: '🇮🇳' },
  kan: { name: 'ಕನ್ನಡ', code: 'kan', flag: '🇮🇳' },
  mal: { name: 'മലയാളം', code: 'mal', flag: '🇮🇳' },
  mar: { name: 'मराठी', code: 'mar', flag: '🇮🇳' },
  eng: { name: 'English', code: 'eng', flag: '🇬🇧' }
};

const INTENTS = [
  {
    id: 'crop_advice',
    icon: '🌾',
    label: { hin: 'फसल सलाह', tam: 'பயிர் ஆலோசனை', eng: 'Crop Advice' },
    description: 'Get farming recommendations'
  },
  {
    id: 'pest_detection',
    icon: '🐛',
    label: { hin: 'कीट पहचान', tam: 'பூச்சி கண்டறிதல்', eng: 'Pest Detection' },
    description: 'Identify and treat pests'
  },
  {
    id: 'weather_advice',
    icon: '⛅',
    label: { hin: 'मौसम सलाह', tam: 'வானிலை ஆலோசனை', eng: 'Weather Advice' },
    description: 'Weather-based farming guidance'
  },
  {
    id: 'market_price',
    icon: '💰',
    label: { hin: 'बाजार मूल्य', tam: 'சந்தை விலை', eng: 'Market Price' },
    description: 'Current crop prices'
  },
  {
    id: 'soil_health',
    icon: '🌱',
    label: { hin: 'मिट्टी स्वास्थ्य', tam: 'மண் ஆரோக்கியம்', eng: 'Soil Health' },
    description: 'Soil analysis'
  }
];

export default function FarmerInterface() {
  const [language, setLanguage] = useState('hin');
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedIntent, setSelectedIntent] = useState(null);
  const [currentCrop, setCurrentCrop] = useState('');
  const messagesEndRef = useRef(null);
  const mediaRecorder = useRef(null);
  const audioChunks = useRef([]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Voice recording
  const startVoiceInput = async () => {
    try {
      setIsListening(true);
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorder.current = new MediaRecorder(stream);
      audioChunks.current = [];

      mediaRecorder.current.ondataavailable = (event) => {
        audioChunks.current.push(event.data);
      };

      mediaRecorder.current.onstop = async () => {
        const audioBlob = new Blob(audioChunks.current, { type: 'audio/wav' });
        await sendVoiceMessage(audioBlob);
        setIsListening(false);
      };

      mediaRecorder.current.start();
      setTimeout(() => {
        if (mediaRecorder.current) {
          mediaRecorder.current.stop();
        }
      }, 5000); // Record for 5 seconds
    } catch (error) {
      console.error('Error accessing microphone:', error);
      setIsListening(false);
    }
  };

  const sendVoiceMessage = async (audioBlob) => {
    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append('audio', audioBlob);
      formData.append('language', language);

      const response = await axios.post('/api/transcribe', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      const transcribedText = response.data.text;
      setInputText(transcribedText);
      sendTextMessage(transcribedText);
    } catch (error) {
      console.error('Error sending voice message:', error);
      addMessage('assistant', 'वॉयस संदेश प्रोसेस करने में त्रुटि', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const sendTextMessage = async (text = inputText) => {
    if (!text.trim()) return;

    // Add user message
    addMessage('user', text, 'text');
    setInputText('');
    setIsLoading(true);

    try {
      const response = await axios.post('/api/chat', {
        message: text,
        language,
        crop: currentCrop,
        intent: selectedIntent
      });

      // Add assistant message with voice
      addMessage('assistant', response.data.text, 'response', {
        voiceUrl: response.data.voiceUrl,
        confidence: response.data.confidence
      });

      // Auto-play voice if available
      if (response.data.voiceUrl) {
        playVoiceResponse(response.data.voiceUrl);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      addMessage('assistant', 'खेद है, एक त्रुटि हुई। कृपया बाद में पुनः प्रयास करें।', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const playVoiceResponse = (voiceUrl) => {
    const audio = new Audio(voiceUrl);
    audio.play().catch(error => console.error('Error playing audio:', error));
  };

  const addMessage = (sender, text, type, metadata = {}) => {
    setMessages(prev => [...prev, {
      id: Date.now(),
      sender,
      text,
      type,
      timestamp: new Date(),
      ...metadata
    }]);
  };

  const handleIntentClick = (intentId) => {
    setSelectedIntent(intentId);
    const intent = INTENTS.find(i => i.id === intentId);
    addMessage('system', `${intent.icon} ${getLabel(intent.label)}`, 'system');
  };

  const getLabel = (labelObj) => {
    return labelObj[language] || labelObj.eng;
  };

  return (
    <div className="farmer-interface">
      {/* Header */}
      <header className="header">
        <div className="header-content">
          <h1 className="logo">
            <span className="logo-emoji">🌾</span>
            <span className="logo-text">कृषि सहायक</span>
          </h1>
          <p className="tagline">आपका खेत का बुद्धिमान साथी</p>
        </div>

        {/* Language Selector */}
        <div className="language-selector">
          {Object.entries(LANGUAGES).map(([code, lang]) => (
            <button
              key={code}
              className={`lang-btn ${language === code ? 'active' : ''}`}
              onClick={() => setLanguage(code)}
              title={lang.name}
            >
              {lang.flag}
            </button>
          ))}
        </div>
      </header>

      <div className="main-container">
        {/* Sidebar - Quick Actions */}
        <aside className="sidebar">
          <h3 className="sidebar-title">🎯 जल्दी सहायता</h3>
          <div className="intent-buttons">
            {INTENTS.map(intent => (
              <button
                key={intent.id}
                className={`intent-btn ${selectedIntent === intent.id ? 'active' : ''}`}
                onClick={() => handleIntentClick(intent.id)}
              >
                <span className="intent-icon">{intent.icon}</span>
                <span className="intent-label">{getLabel(intent.label)}</span>
              </button>
            ))}
          </div>

          {/* Crop Selection */}
          <div className="crop-section">
            <h4>📍 मेरी फसल</h4>
            <input
              type="text"
              placeholder="अपनी फसल दर्ज करें"
              value={currentCrop}
              onChange={(e) => setCurrentCrop(e.target.value)}
              className="crop-input"
            />
          </div>
        </aside>

        {/* Chat Area */}
        <main className="chat-container">
          {/* Messages */}
          <div className="messages-list">
            {messages.length === 0 ? (
              <div className="empty-state">
                <div className="empty-emoji">🌾</div>
                <h2>आपका कृषि सहायक आपका स्वागत करता है!</h2>
                <p>अपनी फसल के बारे में कोई सवाल पूछें या नीचे एक विकल्प चुनें।</p>
              </div>
            ) : (
              messages.map(msg => (
                <div key={msg.id} className={`message message-${msg.sender}`}>
                  <div className="message-content">
                    {msg.type === 'response' ? (
                      <>
                        <div className="response-text">{msg.text}</div>
                        {msg.voiceUrl && (
                          <div className="voice-player">
                            <button
                              className="play-btn"
                              onClick={() => playVoiceResponse(msg.voiceUrl)}
                            >
                              🔊 खेद है
                            </button>
                          </div>
                        )}
                        {msg.confidence && (
                          <div className="confidence">
                            ✅ विश्वसनीयता: {Math.round(msg.confidence * 100)}%
                          </div>
                        )}
                      </>
                    ) : (
                      msg.text
                    )}
                  </div>
                  <span className="message-time">
                    {msg.timestamp.toLocaleTimeString('hi-IN')}
                  </span>
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="input-area">
            <div className="input-actions">
              <button
                className={`action-btn voice-btn ${isListening ? 'listening' : ''}`}
                onClick={startVoiceInput}
                disabled={isLoading}
                title="वॉयस संदेश रिकॉर्ड करें"
              >
                {isListening ? '🔴 रिकॉर्डिंग...' : '🎤'}
              </button>

              <input
                type="text"
                className="message-input"
                placeholder="अपना सवाल लिखें या 🎤 दबाएं..."
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && sendTextMessage()}
                disabled={isLoading}
              />

              <button
                className="action-btn send-btn"
                onClick={() => sendTextMessage()}
                disabled={isLoading || !inputText.trim()}
                title="संदेश भेजें"
              >
                {isLoading ? '⏳' : '📤'}
              </button>
            </div>

            {isLoading && <div className="loading-indicator">प्रोसेस कर रहे हैं...</div>}
          </div>
        </main>
      </div>

      {/* Footer - Info */}
      <footer className="footer">
        <p>
          🌾 <strong>कृषि सहायक:</strong> आपके खेत के लिए स्मार्ट सलाह, आपकी भाषा में
        </p>
        <p className="support-text">24/7 सहायता उपलब्ध | किसी भी समय WhatsApp करें</p>
      </footer>
    </div>
  );
}
