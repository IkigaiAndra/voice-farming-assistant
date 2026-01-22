/**
 * Master Dashboard - Integrates all farmer features
 * Chatbot, Government Schemes, Educational Videos, Helpline
 */

import React, { useState, useEffect } from 'react';
import './MasterDashboard.css';

// Import components (will be available once created)
import AdvancedFarmerInterface from './AdvancedFarmerInterface';
import GovernmentSchemes from './GovernmentSchemes';
import EducationalVideos from './EducationalVideos';
import FarmerHelpline from './FarmerHelpline';

function MasterDashboard() {
  const [activeTab, setActiveTab] = useState('chatbot');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [userGreeting, setUserGreeting] = useState('');

  useEffect(() => {
    // Set greeting based on time of day
    const hour = new Date().getHours();
    if (hour < 12) {
      setUserGreeting('Good Morning, Farmer! 🌅');
    } else if (hour < 18) {
      setUserGreeting('Good Afternoon, Farmer! ☀️');
    } else {
      setUserGreeting('Good Evening, Farmer! 🌙');
    }
  }, []);

  const tabs = [
    {
      id: 'chatbot',
      label: 'AI Chatbot',
      icon: '🤖',
      title: 'Agricultural AI Assistant',
      description: 'Get expert farming advice powered by AI'
    },
    {
      id: 'schemes',
      label: 'Government Schemes',
      icon: '🏛️',
      title: 'Government Funding & Schemes',
      description: 'Explore government schemes for farmers'
    },
    {
      id: 'videos',
      label: 'Educational Videos',
      icon: '📚',
      title: 'Learning Resources',
      description: 'Watch educational videos to improve farming'
    },
    {
      id: 'helpline',
      label: 'Helpline',
      icon: '📞',
      title: 'Support & Helpline',
      description: 'Contact support and helpline services'
    }
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'chatbot':
        return <AdvancedFarmerInterface />;
      case 'schemes':
        return <GovernmentSchemes />;
      case 'videos':
        return <EducationalVideos />;
      case 'helpline':
        return <FarmerHelpline />;
      default:
        return <AdvancedFarmerInterface />;
    }
  };

  const getActiveTabInfo = () => {
    return tabs.find(t => t.id === activeTab);
  };

  const activeTabInfo = getActiveTabInfo();

  return (
    <div className="master-dashboard">
      {/* Header */}
      <header className="dashboard-header">
        <div className="header-content">
          <div className="header-logo">
            <span className="logo-icon">🌾</span>
            <div className="logo-text">
              <h1>Voice Farming Assistant</h1>
              <p>Your Complete Agricultural Platform</p>
            </div>
          </div>

          <button
            className="mobile-menu-btn"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            <span className="menu-icon">☰</span>
          </button>
        </div>

        {/* User Greeting */}
        <div className="user-greeting">
          <p>{userGreeting}</p>
        </div>
      </header>

      {/* Main Container */}
      <div className="dashboard-main">
        {/* Navigation Sidebar */}
        <nav className={`dashboard-nav ${isMobileMenuOpen ? 'mobile-open' : ''}`}>
          <div className="nav-header">
            <h2>Features</h2>
            <button
              className="nav-close-btn"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              ✕
            </button>
          </div>

          <ul className="nav-list">
            {tabs.map(tab => (
              <li key={tab.id}>
                <button
                  className={`nav-btn ${activeTab === tab.id ? 'active' : ''}`}
                  onClick={() => {
                    setActiveTab(tab.id);
                    setIsMobileMenuOpen(false);
                  }}
                >
                  <span className="nav-icon">{tab.icon}</span>
                  <span className="nav-label">{tab.label}</span>
                  {activeTab === tab.id && <span className="nav-indicator">→</span>}
                </button>
              </li>
            ))}
          </ul>

          {/* Quick Tips */}
          <div className="quick-tips">
            <h3>💡 Quick Tip</h3>
            <p>Use the AI Chatbot to get personalized farming advice based on your crop type and location.</p>
          </div>

          {/* Dashboard Stats */}
          <div className="dashboard-stats">
            <div className="stat-item">
              <span className="stat-icon">✓</span>
              <div className="stat-text">
                <span className="stat-label">Features</span>
                <span className="stat-value">4</span>
              </div>
            </div>
            <div className="stat-item">
              <span className="stat-icon">📊</span>
              <div className="stat-text">
                <span className="stat-label">Schemes</span>
                <span className="stat-value">12+</span>
              </div>
            </div>
            <div className="stat-item">
              <span className="stat-icon">📚</span>
              <div className="stat-text">
                <span className="stat-label">Videos</span>
                <span className="stat-value">12+</span>
              </div>
            </div>
          </div>
        </nav>

        {/* Content Area */}
        <main className="dashboard-content">
          {/* Breadcrumb & Info */}
          <div className="content-header">
            <div className="breadcrumb">
              <span>Home</span>
              <span className="separator">›</span>
              <span>{activeTabInfo?.title}</span>
            </div>
          </div>

          {/* Content */}
          <div className="content-wrapper">
            {renderContent()}
          </div>
        </main>
      </div>

      {/* Footer */}
      <footer className="dashboard-footer">
        <div className="footer-content">
          <div className="footer-section">
            <h3>About Us</h3>
            <p>Voice Farming Assistant is a comprehensive platform designed to help farmers maximize their profits through AI-powered advice, government scheme information, and educational resources.</p>
          </div>

          <div className="footer-section">
            <h3>Quick Links</h3>
            <ul>
              <li><a href="#chatbot">AI Chatbot</a></li>
              <li><a href="#schemes">Government Schemes</a></li>
              <li><a href="#videos">Learning Resources</a></li>
              <li><a href="#helpline">Support</a></li>
            </ul>
          </div>

          <div className="footer-section">
            <h3>Emergency Support</h3>
            <p><strong>Kisan Helpline:</strong> 1800-180-1551</p>
            <p><strong>PM-KISAN:</strong> 1800-11-5526</p>
            <p><strong>Disaster Relief:</strong> 1070</p>
          </div>

          <div className="footer-section">
            <h3>Connect With Us</h3>
            <div className="social-links">
              <a href="#" className="social-icon">📱</a>
              <a href="#" className="social-icon">💬</a>
              <a href="#" className="social-icon">📧</a>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <p>&copy; 2024 Voice Farming Assistant. All rights reserved.</p>
          <p>Empowering Indian farmers with technology and knowledge.</p>
        </div>
      </footer>

      {/* Overlay for Mobile Menu */}
      {isMobileMenuOpen && (
        <div
          className="mobile-overlay"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
    </div>
  );
}

export default MasterDashboard;
