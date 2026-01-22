/**
 * Advanced Farmer Advisory Interface
 * ChatGPT-style deep analysis for Indian farmers
 * Considers: location, soil, weather, market, profitability
 */

import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import './AdvancedFarmerInterface.css';

const API_BASE_URL = 'http://localhost:3000/api';

function AdvancedFarmerInterface({ farmerId, initialLanguage = 'hin' }) {
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [language, setLanguage] = useState(initialLanguage);
  const [isLoading, setIsLoading] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showInsights, setShowInsights] = useState(false);
  const [insights, setInsights] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const messagesEndRef = useRef(null);

  // Auto-scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Load farmer insights on mount
  useEffect(() => {
    loadFarmerInsights();
  }, [farmerId]);

  const loadFarmerInsights = async () => {
    try {
      // Demo insights - no API needed
      setInsights({
        location: 'Punjab',
        cropType: 'Wheat',
        farmSize: '5 hectares',
        monthlyIncome: '₹45,000',
        opportunities: [
          'PM-KISAN: ₹6,000/year direct support',
          'Drip irrigation subsidy: ₹50,000',
          'Organic farming: ₹1,50,000/3 years',
          'Kisan Credit Card: ₹1,00,000 credit'
        ]
      });
    } catch (error) {
      console.error('Error loading insights:', error);
    }
  };

  const startVoiceInput = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        chunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(chunksRef.current, { type: 'audio/webm' });
        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);
        reader.onloadend = async () => {
          const audioBase64 = reader.result.split(',')[1];
          await sendVoiceMessage(audioBase64);
        };
      };

      setIsRecording(true);
      mediaRecorder.start();

      // Stop after 5 seconds
      setTimeout(() => {
        if (mediaRecorder.state === 'recording') {
          mediaRecorder.stop();
          setIsRecording(false);
          stream.getTracks().forEach(track => track.stop());
        }
      }, 5000);
    } catch (error) {
      console.error('Microphone error:', error);
      alert('Microphone access denied');
    }
  };

  const sendVoiceMessage = async (audioBase64) => {
    try {
      const transcribeResponse = await axios.post(`${API_BASE_URL}/transcribe`, {
        audioBase64,
        language,
        farmerId
      });

      const transcribedText = transcribeResponse.data.text;
      addMessage(transcribedText, 'user');
      await sendDeepChat(transcribedText);
    } catch (error) {
      console.error('Voice processing error:', error);
      addMessage('Could not process voice. Please try again.', 'error');
    }
  };

  const sendTextMessage = async () => {
    if (!inputText.trim()) return;

    addMessage(inputText, 'user');
    setInputText('');
    await sendDeepChat(inputText);
  };

  const sendDeepChat = async (query) => {
    setIsLoading(true);

    try {
      // Demo response - no backend needed
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const demoResponses = [
        {
          text: `Great question about "${query}"! Here's my advice:\n\n🌾 For maximum profit:\n1. Check PM-KISAN scheme for direct income\n2. Consider organic farming for premium prices\n3. Use drip irrigation to save 40% water\n4. Explore eNAM marketplace for better prices\n\n📊 Next Steps:\n• Visit government schemes tab to apply for subsidies\n• Watch educational videos for techniques\n• Call Kisan Helpline: 1800-180-1551`,
          context: { crop: 'Wheat', region: 'North India' },
          actionPlan: ['Check eligibility for schemes', 'Learn about irrigation systems', 'Market your produce on eNAM'],
          opportunities: ['PM-KISAN benefits', 'Organic farming subsidy', 'Crop insurance']
        },
        {
          text: `Based on current market conditions:\n\n💰 Income Boosting Options:\n1. Apply for Kisan Credit Card (₹1,00,000 credit)\n2. Get soil health tested (Free via Soil Health Card)\n3. Use organic methods (₹50,000/hectare subsidy available)\n\n📱 Resources:\n• Government Schemes Tab: 12 schemes available\n• Videos Tab: Learn farming techniques\n• Helpline Tab: Talk to experts\n\nYour success matters to us! 🌾`,
          actionPlan: ['Review schemes', 'Schedule soil testing', 'Contact PMFBY for crop insurance'],
          opportunities: ['Direct income support', 'Irrigation subsidies', 'Market linkage']
        },
        {
          text: `Excellent farming question! Here's practical advice:\n\n✅ Profit Maximization Strategy:\n1. Diversify with high-value crops\n2. Use precision agriculture techniques\n3. Join farmer producer groups for better prices\n\n💡 Government Support Available:\n• PM-KISAN: ₹6,000/year (automatic)\n• PMFBY: Crop insurance coverage\n• eNAM: Direct market access\n\n📞 Need Help?\nKisan Call Centre: 1800-180-1551 (24/7)\nAll helpline details in Helpline tab.`,
          actionPlan: ['Explore diversification', 'Learn precision farming', 'Join FPO'],
          opportunities: ['Better market prices', 'Insurance protection', 'Subsidy access']
        }
      ];
      
      const response = demoResponses[Math.floor(Math.random() * demoResponses.length)];

      addMessage(response.text, 'assistant', {
        context: response.context,
        actionPlan: response.actionPlan,
        opportunities: response.opportunities
      });

    } catch (error) {
      console.error('Chat error:', error);
      addMessage('Please try your question again. You can also check the Government Schemes or Educational Videos tabs for more information.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const addMessage = (content, type, extra = {}) => {
    const newMessage = {
      id: Date.now(),
      content,
      type, // user, assistant, system, error
      timestamp: new Date().toLocaleTimeString(),
      ...extra
    };
    setMessages(prev => [...prev, newMessage]);
  };

  const playVoiceResponse = (audioUrl) => {
    const audio = new Audio(audioUrl);
    audio.play();
  };

  const languages = [
    { code: 'hin', name: 'हिंदी', flag: '🇮🇳' },
    { code: 'tam', name: 'தமிழ்', flag: '🇮🇳' },
    { code: 'tel', name: 'తెలుగు', flag: '🇮🇳' },
    { code: 'kan', name: 'ಕನ್ನಡ', flag: '🇮🇳' },
    { code: 'mal', name: 'മലയാളം', flag: '🇮🇳' },
    { code: 'mar', name: 'मराठी', flag: '🇮🇳' },
    { code: 'eng', name: 'English', flag: '🇬🇧' }
  ];

  const suggestedQuestions = [
    '💰 कैसे अपनी आय बढ़ा सकता हूँ?',
    '🌾 इस मौसम में कौन सी फसल उगाऊँ?',
    '🐛 मेरी फसल में कीड़े लग गए क्या करूँ?',
    '💧 सिंचाई का सही तरीका क्या है?',
    '🎯 सरकारी योजनाएं कौन सी हैं?'
  ];

  return (
    <div className="advanced-interface">
      {/* Header */}
      <div className="adv-header">
        <div className="adv-header-left">
          <h1>🌾 कृषि सलाहकार</h1>
          <p>Deep AI Analysis for Maximum Profit</p>
        </div>
        <div className="adv-header-right">
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="language-selector"
          >
            {languages.map(lang => (
              <option key={lang.code} value={lang.code}>
                {lang.flag} {lang.name}
              </option>
            ))}
          </select>
          <button
            className="insights-btn"
            onClick={() => setShowInsights(!showInsights)}
            title="View Comprehensive Insights"
          >
            📊 Insights
          </button>
          <button
            className="profile-btn"
            onClick={() => setShowProfile(!showProfile)}
            title="Edit Profile"
          >
            👤 Profile
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="adv-main">
        {/* Insights Panel */}
        {showInsights && insights && (
          <div className="insights-panel">
            <div className="insights-header">
              <h2>📊 Comprehensive Insights</h2>
              <button onClick={() => setShowInsights(false)}>✕</button>
            </div>

            <div className="insights-grid">
              {/* Location */}
              <div className="insight-card location-card">
                <h3>📍 Location</h3>
                <p className="insight-value">{insights.location.state}</p>
                <p className="insight-label">{insights.location.district}</p>
              </div>

              {/* Weather */}
              <div className="insight-card weather-card">
                <h3>⛅ Weather</h3>
                <p className="insight-value">{insights.weather.current.temperature}°C</p>
                <p className="insight-label">{insights.weather.current.condition}</p>
              </div>

              {/* Soil */}
              <div className="insight-card soil-card">
                <h3>🌱 Soil</h3>
                <p className="insight-value">{insights.soil.type}</p>
                <p className="insight-label">pH: {insights.soil.status}</p>
              </div>

              {/* Market */}
              <div className="insight-card market-card">
                <h3>💰 Market</h3>
                <p className="insight-value">₹{insights.market.currentPrice}</p>
                <p className="insight-label">{insights.market.trend}</p>
              </div>

              {/* Profitability */}
              <div className="insight-card profit-card">
                <h3>📈 Profitability</h3>
                <p className="insight-value">₹{insights.profitability.currentProfit}</p>
                <p className="insight-label">ROI: {insights.profitability.roi}%</p>
              </div>

              {/* Opportunities */}
              <div className="insight-card opportunity-card">
                <h3>🎯 Opportunities</h3>
                <ul className="opportunity-list">
                  {insights.opportunities.costReduction.map((opp, idx) => (
                    <li key={idx} title={opp.savings}>
                      {opp.opportunity}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Chat Area */}
        <div className="adv-chat-container">
          {messages.length === 0 ? (
            <div className="empty-state">
              <h2>🌾 नमस्ते किसान भाई!</h2>
              <p>मैं आपका AI कृषि सलाहकार हूँ</p>
              <p className="subtitle">Your personal agricultural advisor analyzing soil, weather, market, and profitability</p>
              
              <div className="suggested-questions">
                <p className="suggested-label">सुझाए गए प्रश्न:</p>
                {suggestedQuestions.map((q, idx) => (
                  <button
                    key={idx}
                    className="suggestion-btn"
                    onClick={() => {
                      addMessage(q, 'user');
                      sendDeepChat(q);
                    }}
                  >
                    {q}
                  </button>
                ))}
              </div>

              <div className="features-list">
                <h3>What I Can Help With:</h3>
                <ul>
                  <li>✅ Analyze your soil, weather & location</li>
                  <li>✅ Recommend profitable crop strategies</li>
                  <li>✅ Identify pest & disease management</li>
                  <li>✅ Maximize irrigation efficiency</li>
                  <li>✅ Find government schemes & subsidies</li>
                  <li>✅ Market price analysis & trends</li>
                </ul>
              </div>
            </div>
          ) : (
            <div className="messages-list">
              {messages.map(msg => (
                <div key={msg.id} className={`message-item message-${msg.type}`}>
                  <div className="message-header">
                    <span className="message-type-icon">
                      {msg.type === 'user' && '👨‍🌾'}
                      {msg.type === 'assistant' && '🤖'}
                      {msg.type === 'system' && '⏳'}
                      {msg.type === 'error' && '❌'}
                    </span>
                    <span className="message-time">{msg.timestamp}</span>
                  </div>

                  <div className="message-content">
                    <p>{msg.content}</p>

                    {msg.audioUrl && (
                      <button
                        className="play-audio-btn"
                        onClick={() => playVoiceResponse(msg.audioUrl)}
                      >
                        ▶️ Play Audio Response
                      </button>
                    )}

                    {msg.context && (
                      <div className="message-context">
                        <details>
                          <summary>📊 Analysis Context Used</summary>
                          <div className="context-grid">
                            <div className="context-item">
                              <strong>Location:</strong> {msg.context.location.state} - {msg.context.location.district}
                            </div>
                            <div className="context-item">
                              <strong>Weather:</strong> {msg.context.weather.current.temperature}°C, {msg.context.weather.current.condition}
                            </div>
                            <div className="context-item">
                              <strong>Soil:</strong> {msg.context.soil.type}, pH {msg.context.soil.pH}
                            </div>
                            <div className="context-item">
                              <strong>Market Price:</strong> ₹{msg.context.market.price}/quintal
                            </div>
                          </div>
                        </details>
                      </div>
                    )}

                    {msg.actionPlan && msg.actionPlan.length > 0 && (
                      <div className="action-plan">
                        <details>
                          <summary>📋 Action Plan</summary>
                          <ol className="action-list">
                            {msg.actionPlan.map(action => (
                              <li key={action.step} className={`priority-${action.priority.toLowerCase()}`}>
                                <strong>{action.action}</strong>
                                <span className="priority-badge">{action.priority}</span>
                              </li>
                            ))}
                          </ol>
                        </details>
                      </div>
                    )}

                    {msg.opportunities && (
                      <div className="opportunities-summary">
                        <details>
                          <summary>💡 Income Opportunities</summary>
                          <div className="opp-list">
                            {msg.opportunities.costReduction && (
                              <div className="opp-section">
                                <h4>Cost Reduction</h4>
                                {msg.opportunities.costReduction.map((opp, idx) => (
                                  <p key={idx}>• {opp.opportunity} - Saves {opp.savings}</p>
                                ))}
                              </div>
                            )}
                          </div>
                        </details>
                      </div>
                    )}
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="adv-input-area">
          <div className="input-buttons">
            <button
              className={`voice-btn ${isRecording ? 'recording' : ''}`}
              onClick={startVoiceInput}
              disabled={isLoading}
              title="Click to record (5 seconds)"
            >
              {isRecording ? '🔴 Recording...' : '🎤 Voice'}
            </button>
          </div>

          <div className="text-input-group">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && sendTextMessage()}
              placeholder="अपना सवाल पूछें... Ask your question..."
              disabled={isLoading}
              className="text-input"
            />
            <button
              onClick={sendTextMessage}
              disabled={!inputText.trim() || isLoading}
              className="send-btn"
            >
              {isLoading ? '⏳' : '➤'} Send
            </button>
          </div>

          <p className="input-hint">💡 Ask about crops, profits, pests, water, schemes, or anything farming-related!</p>
        </div>
      </div>

      {/* Profile Modal */}
      {showProfile && (
        <div className="profile-modal">
          <div className="modal-content">
            <h2>👤 Update Your Profile</h2>
            <p className="modal-subtitle">Provide details for personalized recommendations</p>
            
            <form className="profile-form">
              <div className="form-group">
                <label>State</label>
                <input type="text" placeholder="e.g., Haryana" />
              </div>
              <div className="form-group">
                <label>District</label>
                <input type="text" placeholder="e.g., Hisar" />
              </div>
              <div className="form-group">
                <label>Land Size (hectares)</label>
                <input type="number" placeholder="e.g., 5" />
              </div>
              <div className="form-group">
                <label>Soil Type</label>
                <select>
                  <option>Loamy</option>
                  <option>Clay</option>
                  <option>Sandy</option>
                  <option>Black</option>
                  <option>Red</option>
                </select>
              </div>
              <div className="form-group">
                <label>Current Crop</label>
                <input type="text" placeholder="e.g., Wheat" />
              </div>
              <button type="button" className="save-btn" onClick={() => setShowProfile(false)}>
                Save Changes
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdvancedFarmerInterface;
