/**
 * Farmer Helpline & Support Component
 * Phone numbers, email, and support resources
 */

import React, { useState } from 'react';
import './FarmerHelpline.css';

function FarmerHelpline() {
  const [selectedCategory, setSelectedCategory] = useState('national');
  const [expandedHelpline, setExpandedHelpline] = useState(null);

  const helplines = {
    national: [
      {
        id: 1,
        name: 'PM Kisan Helpline',
        phone: '1800-11-5526',
        email: 'pmkisan@nic.in',
        website: 'https://pmkisan.gov.in/',
        hours: '24/7',
        description: 'Direct income support scheme queries',
        services: ['PM-KISAN status', 'Registration assistance', 'Payment tracking'],
        icon: '💰'
      },
      {
        id: 2,
        name: 'Agricultural Ministry - Kisan Call Centre',
        phone: '1800-180-1551',
        email: 'kisancallcentre@nic.in',
        hours: '6 AM - 10 PM (All days)',
        description: 'Expert advice on farming practices',
        services: ['Crop advice', 'Pest management', 'Irrigation guidance'],
        icon: '🌾'
      },
      {
        id: 3,
        name: 'PMFBY - Crop Insurance Helpline',
        phone: '1800-110-001',
        email: 'pmfby@nic.in',
        website: 'https://pmfby.gov.in/',
        hours: '24/7',
        description: 'Crop insurance claims and assistance',
        services: ['Claim filing', 'Claim status', 'Insurance queries'],
        icon: '🛡️'
      },
      {
        id: 4,
        name: 'eNAM (e-National Agriculture Market)',
        phone: '1800-890-3969',
        email: 'support@enam.gov.in',
        website: 'https://enam.gov.in/',
        hours: '9 AM - 6 PM',
        description: 'Online agricultural marketplace support',
        services: ['Registration', 'Bidding help', 'Transaction support'],
        icon: '📊'
      },
      {
        id: 5,
        name: 'Soil Health Card - Support',
        phone: '1800-190-8080',
        email: 'soilhealth@nic.in',
        website: 'https://soilhealth.dac.gov.in/',
        hours: '10 AM - 5 PM (Weekdays)',
        description: 'Soil testing and recommendations',
        services: ['Test location finder', 'Report interpretation', 'Fertilizer guidance'],
        icon: '🌱'
      },
      {
        id: 6,
        name: 'National Disaster Management Authority',
        phone: '1078',
        email: 'disaster@ndma.gov.in',
        hours: '24/7',
        description: 'Natural disaster relief and assistance',
        services: ['Crop loss compensation', 'Relief funds', 'Emergency support'],
        icon: '🆘'
      }
    ],
    state: [
      {
        id: 7,
        name: 'Haryana Agriculture Department',
        phone: '0172-2571151',
        website: 'https://agriculture.haryana.gov.in/',
        state: 'Haryana',
        description: 'State-level agricultural support',
        services: ['Subsidy schemes', 'Crop advice', 'License support'],
        icon: '📍'
      },
      {
        id: 8,
        name: 'Tamil Nadu Agricultural Department',
        phone: '044-24381133',
        website: 'https://agriculture.tn.gov.in/',
        state: 'Tamil Nadu',
        description: 'Tamil Nadu agricultural services',
        services: ['Market info', 'Farming advisory', 'Scheme details'],
        icon: '📍'
      },
      {
        id: 9,
        name: 'Punjab Agriculture Department',
        phone: '0172-2701076',
        website: 'https://agriharyana.gov.in/',
        state: 'Punjab',
        description: 'Punjab agricultural assistance',
        services: ['Crop guidance', 'Subsidy info', 'Market rates'],
        icon: '📍'
      },
      {
        id: 10,
        name: 'Uttar Pradesh Agriculture Department',
        phone: '0522-2236555',
        website: 'https://upagriculture.gov.in/',
        state: 'Uttar Pradesh',
        description: 'UP agricultural support services',
        services: ['Farming techniques', 'Scheme enrollment', 'Dispute resolution'],
        icon: '📍'
      },
      {
        id: 11,
        name: 'Rajasthan Agriculture Department',
        phone: '0141-2744015',
        website: 'https://agriculture.rajasthan.gov.in/',
        state: 'Rajasthan',
        description: 'Rajasthan agricultural assistance',
        services: ['Irrigation support', 'Crop advisory', 'Subsidy schemes'],
        icon: '📍'
      },
      {
        id: 12,
        name: 'Karnataka Agriculture Department',
        phone: '080-22252222',
        website: 'https://agriculture.karnataka.gov.in/',
        state: 'Karnataka',
        description: 'Karnataka agricultural services',
        services: ['Coffee advisory', 'Horticulture help', 'Market linkage'],
        icon: '📍'
      }
    ],
    emergency: [
      {
        id: 13,
        name: 'Farmer Emergency Hotline',
        phone: '181 (Toll-free)',
        description: 'Emergency response for crop crisis',
        services: ['Immediate assistance', 'Rapid response', 'Crisis management'],
        icon: '🚨',
        highlight: true
      },
      {
        id: 14,
        name: 'Livestock Disease Helpline',
        phone: '1962',
        description: 'Animal husbandry emergency support',
        services: ['Veterinary help', 'Disease reporting', 'Vaccination info'],
        icon: '🐄'
      },
      {
        id: 15,
        name: 'Disaster Relief Hotline',
        phone: '1070',
        description: 'Natural disaster reporting',
        services: ['Crop loss report', 'Relief application', 'Compensation tracking'],
        icon: '⚠️'
      },
      {
        id: 16,
        name: 'Water Management Emergency',
        phone: '1800-234-1234',
        description: 'Irrigation and water crisis support',
        services: ['Water shortage assistance', 'Irrigation repair', 'Drought support'],
        icon: '💧'
      }
    ]
  };

  const categories = [
    { id: 'national', label: '🇮🇳 National', icon: '📱' },
    { id: 'state', label: '📍 State Level', icon: '🏛️' },
    { id: 'emergency', label: '🆘 Emergency', icon: '🚨' }
  ];

  const currentHelplines = helplines[selectedCategory];

  return (
    <div className="helpline-container">
      <div className="helpline-header">
        <h1>📞 Farmer Support & Helpline</h1>
        <p className="helpline-subtitle">Get expert help and support whenever you need it</p>
      </div>

      {/* Category Tabs */}
      <div className="helpline-tabs">
        {categories.map(cat => (
          <button
            key={cat.id}
            className={`tab-btn ${selectedCategory === cat.id ? 'active' : ''}`}
            onClick={() => setSelectedCategory(cat.id)}
          >
            <span className="tab-icon">{cat.icon}</span>
            {cat.label}
          </button>
        ))}
      </div>

      {/* Helplines Grid */}
      <div className="helplines-grid">
        {currentHelplines.map(helpline => (
          <div
            key={helpline.id}
            className={`helpline-card ${helpline.highlight ? 'highlight' : ''}`}
            onClick={() => setExpandedHelpline(expandedHelpline?.id === helpline.id ? null : helpline)}
          >
            <div className="helpline-header-card">
              <span className="helpline-icon">{helpline.icon}</span>
              <h3>{helpline.name}</h3>
              {helpline.state && <span className="state-badge">{helpline.state}</span>}
            </div>

            <div className="helpline-main-info">
              <div className="info-item">
                <span className="info-label">☎️ Phone:</span>
                <a href={`tel:${helpline.phone}`} className="phone-link">
                  {helpline.phone}
                </a>
              </div>

              {helpline.email && (
                <div className="info-item">
                  <span className="info-label">📧 Email:</span>
                  <a href={`mailto:${helpline.email}`} className="email-link">
                    {helpline.email}
                  </a>
                </div>
              )}

              {helpline.hours && (
                <div className="info-item">
                  <span className="info-label">⏰ Hours:</span>
                  <span className="hours">{helpline.hours}</span>
                </div>
              )}
            </div>

            {expandedHelpline?.id === helpline.id && (
              <div className="helpline-expanded">
                <p className="description">{helpline.description}</p>

                <div className="services">
                  <span className="services-label">Services Offered:</span>
                  <ul>
                    {helpline.services.map((service, idx) => (
                      <li key={idx}>✓ {service}</li>
                    ))}
                  </ul>
                </div>

                {helpline.website && (
                  <a
                    href={helpline.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="website-link"
                  >
                    🌐 Visit Website
                  </a>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="quick-actions">
        <h2>⚡ Quick Actions</h2>
        <div className="actions-grid">
          <button className="action-btn" onClick={() => alert('Calling PM Kisan helpline...')}>
            <span className="action-icon">💰</span>
            <h4>Check PM-KISAN Status</h4>
            <p>Verify payment status instantly</p>
          </button>
          <button className="action-btn" onClick={() => alert('Opening crop advisory...')}>
            <span className="action-icon">🌾</span>
            <h4>Get Crop Advice</h4>
            <p>Expert farming guidance</p>
          </button>
          <button className="action-btn" onClick={() => alert('Launching market rates...')}>
            <span className="action-icon">📊</span>
            <h4>Check Market Rates</h4>
            <p>Real-time price info</p>
          </button>
          <button className="action-btn" onClick={() => alert('Opening scheme finder...')}>
            <span className="action-icon">🏛️</span>
            <h4>Find Schemes</h4>
            <p>Eligible government schemes</p>
          </button>
        </div>
      </div>

      {/* Important Notice */}
      <div className="important-notice">
        <h3>⚠️ Important Notice</h3>
        <ul>
          <li>All helpline numbers are <strong>toll-free</strong></li>
          <li>Call during working hours or use 24/7 emergency lines</li>
          <li>Keep your <strong>Aadhar number</strong> ready for queries</li>
          <li>Report fraud or scams to <strong>Police Cyber Unit</strong></li>
          <li>Always verify official helpline numbers before calling</li>
        </ul>
      </div>

      <div className="helpline-footer">
        <p>We are here to help you succeed! Don't hesitate to reach out for support.</p>
      </div>
    </div>
  );
}

export default FarmerHelpline;
