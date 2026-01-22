/**
 * Educational Videos Component
 * Links to YouTube videos and resources for farmer education
 */

import React, { useState } from 'react';
import './EducationalVideos.css';

function EducationalVideos() {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedVideo, setSelectedVideo] = useState(null);

  const videos = [
    {
      id: 1,
      title: 'Modern Farming Techniques & Yields',
      category: 'farming-techniques',
      duration: '15:32',
      views: '245K',
      channel: 'Indian Agricultural Ministry',
      thumbnail: '📺',
      link: 'https://www.youtube.com/watch?v=farming-techniques',
      description: 'Learn modern farming techniques to increase your crop yield by 30-40%.',
      keywords: ['yield', 'techniques', 'productivity']
    },
    {
      id: 2,
      title: 'Organic Farming for Higher Profits',
      category: 'organic-farming',
      duration: '22:45',
      views: '189K',
      channel: 'Agri Extension',
      thumbnail: '🌱',
      link: 'https://www.youtube.com/watch?v=organic-farming',
      description: 'Transition to organic farming and get 25% premium prices for your produce.',
      keywords: ['organic', 'premium', 'sustainability']
    },
    {
      id: 3,
      title: 'Soil Health & Fertility Management',
      category: 'soil-management',
      duration: '18:20',
      views: '156K',
      channel: 'Krishi Vigyan Kendra',
      thumbnail: '🌍',
      link: 'https://www.youtube.com/watch?v=soil-health',
      description: 'Complete guide to soil testing, nutrient management, and soil enrichment.',
      keywords: ['soil', 'nutrients', 'fertility']
    },
    {
      id: 4,
      title: 'Water Conservation & Drip Irrigation',
      category: 'irrigation',
      duration: '20:15',
      views: '312K',
      channel: 'Ministry of Jal Shakti',
      thumbnail: '💧',
      link: 'https://www.youtube.com/watch?v=drip-irrigation',
      description: 'Save 60% water using drip irrigation and increase yield by 25%.',
      keywords: ['water', 'irrigation', 'conservation']
    },
    {
      id: 5,
      title: 'Integrated Pest Management',
      category: 'pest-management',
      duration: '25:30',
      views: '198K',
      channel: 'Pesticide Free India',
      thumbnail: '🐛',
      link: 'https://www.youtube.com/watch?v=ipm-guide',
      description: 'Natural pest control methods to reduce chemical usage and production costs.',
      keywords: ['pest', 'organic', 'natural-control']
    },
    {
      id: 6,
      title: 'Crop Rotation Strategy for Profit',
      category: 'crop-rotation',
      duration: '19:45',
      views: '167K',
      channel: 'Agricultural Research',
      thumbnail: '🌾',
      link: 'https://www.youtube.com/watch?v=crop-rotation',
      description: 'Plan crop rotation to maximize income and maintain soil health.',
      keywords: ['rotation', 'planning', 'profitability']
    },
    {
      id: 7,
      title: 'Government Schemes for Farmers',
      category: 'schemes',
      duration: '28:00',
      views: '425K',
      channel: 'Ministry of Agriculture',
      thumbnail: '🏛️',
      link: 'https://www.youtube.com/watch?v=govt-schemes',
      description: 'Complete overview of government schemes and how to apply for benefits.',
      keywords: ['schemes', 'subsidies', 'benefits']
    },
    {
      id: 8,
      title: 'Market Linkage & E-NAM Platform',
      category: 'market-linkage',
      duration: '16:50',
      views: '134K',
      channel: 'eNAM Portal',
      thumbnail: '📊',
      link: 'https://www.youtube.com/watch?v=enam-tutorial',
      description: 'Sell your produce directly at better prices using eNAM digital platform.',
      keywords: ['market', 'enam', 'pricing']
    },
    {
      id: 9,
      title: 'Vegetable Farming for High Income',
      category: 'vegetable-farming',
      duration: '21:30',
      views: '289K',
      channel: 'Horticulture Department',
      thumbnail: '🥕',
      link: 'https://www.youtube.com/watch?v=vegetable-farming',
      description: 'High-value vegetable farming techniques to increase farm income 5x.',
      keywords: ['vegetables', 'income', 'horticulture']
    },
    {
      id: 10,
      title: 'Dairy Farming Alongside Agriculture',
      category: 'diversification',
      duration: '24:15',
      views: '276K',
      channel: 'Dairy Development Board',
      thumbnail: '🐄',
      link: 'https://www.youtube.com/watch?v=dairy-farming',
      description: 'Combine dairy farming with crop farming for stable year-round income.',
      keywords: ['dairy', 'diversification', 'income']
    },
    {
      id: 11,
      title: 'Precision Agriculture with Technology',
      category: 'technology',
      duration: '23:40',
      views: '145K',
      channel: 'AgriTech Innovation',
      thumbnail: '🤖',
      link: 'https://www.youtube.com/watch?v=precision-agriculture',
      description: 'Use AI and sensors to optimize crop management and reduce costs.',
      keywords: ['technology', 'AI', 'precision']
    },
    {
      id: 12,
      title: 'Climate Resilient Farming Practices',
      category: 'climate',
      duration: '26:20',
      views: '198K',
      channel: 'Climate Action for Agriculture',
      thumbnail: '🌤️',
      link: 'https://www.youtube.com/watch?v=climate-resilient',
      description: 'Adapt to climate change with resilient farming practices and crop selection.',
      keywords: ['climate', 'resilience', 'adaptation']
    }
  ];

  const categories = [
    { id: 'all', label: '🎯 All Videos', icon: '📹' },
    { id: 'farming-techniques', label: '🌾 Farming Techniques', icon: '📚' },
    { id: 'organic-farming', label: '🌱 Organic Farming', icon: '♻️' },
    { id: 'soil-management', label: '🌍 Soil Management', icon: '🔬' },
    { id: 'irrigation', label: '💧 Irrigation', icon: '💧' },
    { id: 'pest-management', label: '🐛 Pest Management', icon: '🐛' },
    { id: 'crop-rotation', label: '🔄 Crop Rotation', icon: '🔄' },
    { id: 'schemes', label: '🏛️ Schemes', icon: '📋' },
    { id: 'market-linkage', label: '📊 Market Linkage', icon: '💰' },
    { id: 'vegetable-farming', label: '🥕 Vegetables', icon: '🥕' },
    { id: 'diversification', label: '📈 Diversification', icon: '📈' },
    { id: 'technology', label: '🤖 Technology', icon: '🤖' },
    { id: 'climate', label: '🌤️ Climate', icon: '🌤️' }
  ];

  const filteredVideos = selectedCategory === 'all' 
    ? videos 
    : videos.filter(v => v.category === selectedCategory);

  return (
    <div className="videos-container">
      <div className="videos-header">
        <h1>📚 Educational Videos for Farmers</h1>
        <p className="videos-subtitle">Learn from experts to maximize your agricultural profit</p>
      </div>

      {/* Category Filter */}
      <div className="videos-categories">
        {categories.map(cat => (
          <button
            key={cat.id}
            className={`category-btn ${selectedCategory === cat.id ? 'active' : ''}`}
            onClick={() => setSelectedCategory(cat.id)}
          >
            <span className="cat-icon">{cat.icon}</span>
            {cat.label}
          </button>
        ))}
      </div>

      {/* Videos Grid */}
      <div className="videos-grid">
        {filteredVideos.map(video => (
          <div
            key={video.id}
            className="video-card"
            onClick={() => setSelectedVideo(selectedVideo?.id === video.id ? null : video)}
          >
            <div className="video-thumbnail">
              <span className="thumb-emoji">{video.thumbnail}</span>
              <div className="video-duration">{video.duration}</div>
            </div>

            <div className="video-info">
              <h3>{video.title}</h3>
              <div className="video-meta">
                <span className="channel">{video.channel}</span>
                <span className="views">👁️ {video.views}</span>
              </div>
            </div>

            {selectedVideo?.id === video.id && (
              <div className="video-expanded">
                <p className="video-description">{video.description}</p>
                
                <div className="keywords">
                  {video.keywords.map((kw, idx) => (
                    <span key={idx} className="keyword">#{kw}</span>
                  ))}
                </div>

                <a
                  href={video.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="play-button"
                >
                  ▶️ Watch on YouTube
                </a>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Educational Platforms */}
      <div className="educational-platforms">
        <h2>🌐 Other Educational Platforms</h2>
        <div className="platforms-grid">
          <a href="https://www.youtube.com/c/IndianAgriculture" target="_blank" rel="noopener noreferrer" className="platform-link">
            <span className="platform-icon">📺</span>
            <h4>Indian Agriculture Channel</h4>
            <p>Official ministry content</p>
          </a>
          <a href="https://www.icar.org.in/" target="_blank" rel="noopener noreferrer" className="platform-link">
            <span className="platform-icon">🔬</span>
            <h4>ICAR Portal</h4>
            <p>Research & recommendations</p>
          </a>
          <a href="https://krishivikas.gov.in/" target="_blank" rel="noopener noreferrer" className="platform-link">
            <span className="platform-icon">🌱</span>
            <h4>KrishiVikas</h4>
            <p>Agricultural knowledge</p>
          </a>
          <a href="https://www.agritech.tnau.ac.in/" target="_blank" rel="noopener noreferrer" className="platform-link">
            <span className="platform-icon">💡</span>
            <h4>AgriTech TNAU</h4>
            <p>Modern farming tech</p>
          </a>
        </div>
      </div>

      <div className="videos-footer">
        <p>💡 <strong>Tip:</strong> Watch these videos and apply learnings to increase your yield by 20-30%!</p>
      </div>
    </div>
  );
}

export default EducationalVideos;
