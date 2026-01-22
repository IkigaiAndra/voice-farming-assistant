/**
 * Government of India Schemes for Farmer Funding
 * Comprehensive list of schemes with eligibility and application info
 */

import React, { useState } from 'react';
import './GovernmentSchemes.css';

function GovernmentSchemes() {
  const [selectedScheme, setSelectedScheme] = useState(null);
  const [filterState, setFilterState] = useState('all');

  const schemes = [
    {
      id: 1,
      name: 'Pradhan Mantri Kisan Samman Nidhi (PM-KISAN)',
      type: 'Direct Income Support',
      eligibility: 'All landholding farmer families',
      benefit: '₹6,000 per year in 3 installments',
      state: 'all',
      link: 'https://pmkisan.gov.in/',
      description: 'Direct benefit transfer of ₹6,000 annually to farmer families holding cultivable land.',
      steps: [
        'Visit pmkisan.gov.in',
        'Enter Aadhar/Account Number',
        'Fill farmer details',
        'Submit and get confirmation'
      ]
    },
    {
      id: 2,
      name: 'Soil Health Card Scheme',
      type: 'Soil Testing',
      eligibility: 'Farmers across India',
      benefit: 'Free soil testing, improved yield',
      state: 'all',
      link: 'https://soilhealth.dac.gov.in/',
      description: 'Free soil health testing to provide customized nutrient recommendations.',
      steps: [
        'Contact nearest soil testing lab',
        'Collect soil sample',
        'Submit for analysis',
        'Get personalized recommendations'
      ]
    },
    {
      id: 3,
      name: 'Pradhan Mantri Fasal Bima Yojana (PMFBY)',
      type: 'Crop Insurance',
      eligibility: 'All farmers growing notified crops',
      benefit: 'Crop loss coverage, ₹100,000-₹200,000',
      state: 'all',
      link: 'https://pmfby.gov.in/',
      description: 'Comprehensive crop insurance covering yield losses due to natural calamities.',
      steps: [
        'Apply through bank during sowing season',
        'Pay premium (0.75-2% of sum insured)',
        'Get insurance certificate',
        'Claim in case of crop damage'
      ]
    },
    {
      id: 4,
      name: 'Kisan Credit Card (KCC)',
      type: 'Agricultural Credit',
      eligibility: 'Individual farmers with land',
      benefit: 'Easy agricultural credit up to ₹1,00,000',
      state: 'all',
      link: 'https://www.rbi.org.in/',
      description: 'Flexible credit facility for agricultural operations and consumption needs.',
      steps: [
        'Apply at nearest bank',
        'Submit land documents',
        'Get credit limit evaluation',
        'Receive KCC card with credit'
      ]
    },
    {
      id: 5,
      name: 'Sukanya Samriddhi Yojana',
      type: 'Child Welfare',
      eligibility: 'Farmers with girl child',
      benefit: 'Savings scheme with tax benefits',
      state: 'all',
      link: 'https://www.indiapost.gov.in/',
      description: 'Savings scheme for farmer families to invest for girl child\'s future.',
      steps: [
        'Open account at post office',
        'Deposit minimum ₹250 annually',
        'Get 7.6% interest + tax benefits',
        'Mature at age 21'
      ]
    },
    {
      id: 6,
      name: 'Pradhan Mantri Krishi Sinchayee Yojana (PMKSY)',
      type: 'Irrigation',
      eligibility: 'Farmers in command area of irrigation projects',
      benefit: '40-50% subsidy on irrigation infrastructure',
      state: 'all',
      link: 'https://pmksy.gov.in/',
      description: 'Subsidy on drip irrigation, sprinklers, and other water-saving irrigation systems.',
      steps: [
        'Apply through agriculture department',
        'Submit project proposal',
        'Site inspection and approval',
        'Installation and subsidy disbursement'
      ]
    },
    {
      id: 7,
      name: 'Paramparagat Krishi Vikas Yojana (PKVY)',
      type: 'Organic Farming',
      eligibility: 'Farmers interested in organic farming',
      benefit: 'Subsidy ₹50,000 per hectare for 3 years',
      state: 'all',
      link: 'https://pkvy.rkvy.nic.in/',
      description: 'Support for organic farming including certification and input costs.',
      steps: [
        'Form farmer group or individual',
        'Apply with organic farming plan',
        'Certification agency registration',
        'Receive subsidy in three years'
      ]
    },
    {
      id: 8,
      name: 'Pradhan Mantri Agricultural Business Development Scheme',
      type: 'Business Development',
      eligibility: 'Farmers, FPOs, businesses in agricultural value chain',
      benefit: 'Subsidy up to ₹27.50 lakh',
      state: 'all',
      link: 'https://www.pmabds.com/',
      description: 'Support for setting up agricultural businesses, processing units.',
      steps: [
        'Identify business opportunity',
        'Prepare detailed project report',
        'Apply with cost benefit analysis',
        'Get approval and subsidy'
      ]
    },
    {
      id: 9,
      name: 'eNAM (e-National Agriculture Market)',
      type: 'Market Linkage',
      eligibility: 'Farmers, traders, merchants',
      benefit: 'Digital marketplace, better prices',
      state: 'all',
      link: 'https://enam.gov.in/',
      description: 'Online platform to sell agricultural produce directly at best prices.',
      steps: [
        'Register on eNAM portal',
        'List your agricultural produce',
        'Connect with buyers directly',
        'Negotiate and transact online'
      ]
    },
    {
      id: 10,
      name: 'Haryana Mukhya Mantri Annadata Assistance Scheme',
      type: 'State Subsidy',
      eligibility: 'Haryana farmers with registered land',
      benefit: 'Direct cash assistance ₹4,000 per hectare',
      state: 'Haryana',
      link: 'https://haryana.gov.in/',
      description: 'Haryana state scheme providing direct cash assistance to farmers.',
      steps: [
        'Register on Haryana agriculture portal',
        'Submit land documents',
        'Verification by agriculture department',
        'Assistance credited to bank account'
      ]
    },
    {
      id: 11,
      name: 'Tamil Nadu Crop Insurance Scheme',
      type: 'State Insurance',
      eligibility: 'Tamil Nadu farmers',
      benefit: 'Comprehensive crop insurance coverage',
      state: 'Tamil Nadu',
      link: 'https://agri.tn.gov.in/',
      description: 'State-backed crop insurance with premium subsidy.',
      steps: [
        'Apply through block agriculture office',
        'Register as beneficiary',
        'Pay reduced premium',
        'Get coverage certificate'
      ]
    },
    {
      id: 12,
      name: 'Punjab Agricultural Loan Forgiveness Scheme',
      type: 'Loan Relief',
      eligibility: 'Punjab small and marginal farmers with agricultural loans',
      benefit: 'Agricultural loan waiver up to ₹2 lakh',
      state: 'Punjab',
      link: 'https://punjab.gov.in/',
      description: 'Loan forgiveness for small and marginal farmers.',
      steps: [
        'Check eligibility on portal',
        'Submit required documents',
        'Loan verification',
        'Waiver processing and crediting'
      ]
    }
  ];

  const filteredSchemes = filterState === 'all' 
    ? schemes 
    : schemes.filter(s => s.state === 'all' || s.state === filterState);

  const states = ['all', 'Haryana', 'Tamil Nadu', 'Punjab', ...new Set(schemes.map(s => s.state).filter(s => s !== 'all'))];

  return (
    <div className="schemes-container">
      <div className="schemes-header">
        <h1>🏛️ Government of India Schemes for Farmers</h1>
        <p className="schemes-subtitle">Comprehensive funding and support programs to maximize your agricultural income</p>
      </div>

      {/* Filter Section */}
      <div className="schemes-filters">
        <label>Filter by State:</label>
        <div className="filter-buttons">
          {states.map(state => (
            <button
              key={state}
              className={`filter-btn ${filterState === state ? 'active' : ''}`}
              onClick={() => setFilterState(state)}
            >
              {state === 'all' ? '🌾 All States' : `📍 ${state}`}
            </button>
          ))}
        </div>
      </div>

      {/* Schemes Grid */}
      <div className="schemes-grid">
        {filteredSchemes.map(scheme => (
          <div
            key={scheme.id}
            className="scheme-card"
            onClick={() => setSelectedScheme(selectedScheme?.id === scheme.id ? null : scheme)}
          >
            <div className="scheme-header">
              <h3>{scheme.name}</h3>
              <span className="scheme-type">{scheme.type}</span>
            </div>
            
            <div className="scheme-info">
              <p><strong>💰 Benefit:</strong> {scheme.benefit}</p>
              <p><strong>✅ Eligibility:</strong> {scheme.eligibility}</p>
            </div>

            {selectedScheme?.id === scheme.id && (
              <div className="scheme-details">
                <p><strong>📝 Details:</strong></p>
                <p>{scheme.description}</p>
                
                <p><strong>📋 Application Steps:</strong></p>
                <ol>
                  {scheme.steps.map((step, idx) => (
                    <li key={idx}>{step}</li>
                  ))}
                </ol>

                <a href={scheme.link} target="_blank" rel="noopener noreferrer" className="scheme-link">
                  🔗 Visit Official Website
                </a>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="schemes-footer">
        <p>💡 <strong>Tip:</strong> Click on any scheme to see details and application steps.</p>
        <p>📞 Contact your nearest agriculture department office for assistance with applications.</p>
      </div>
    </div>
  );
}

export default GovernmentSchemes;
