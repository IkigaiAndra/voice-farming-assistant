/**
 * Response Formatter Service
 * Formats and documents agricultural advice in native languages
 */

class ResponseFormatter {
  static languageData = {
    hin: {
      title: 'कृषि सलाह',
      sections: {
        problem: 'समस्या',
        solution: 'समाधान',
        steps: 'कदम',
        prevention: 'रोकथाम',
        timeline: 'समय सीमा',
        cost: 'अनुमानित खर्च',
        expert: 'विशेषज्ञ सलाह चाहिए?',
        moreInfo: 'और जानकारी के लिए'
      },
      templates: {
        cropAdvice: `
🌾 {cropType} की सलाह

समस्या: {issue}

समाधान:
{solution}

अपनाने के कदम:
{steps}

रोकथाम:
{prevention}

ℹ️ विश्वसनीयता: {confidence}%
⏱️ परिणाम: {timeline}
💰 अनुमानित खर्च: {cost}`,
        
        pestDetection: `
🐛 कीट की पहचान: {pestName}

आपकी {cropType} में {pestName} पाया गया है।

जैविक समाधान:
{organicSolutions}

रसायनिक विकल्प (आवश्यकता पड़ने पर):
{chemicalSolutions}

रोकथाम के तरीके:
{prevention}

⚠️ चेतावनी: अगर समस्या बढ़े तो विशेषज्ञ से मिलें।`,
        
        weatherAdvice: `
⛅ आपके क्षेत्र के लिए मौसम सलाह

वर्तमान स्थिति: {weather}

सिफारिश:
{recommendation}

सिंचाई कार्यक्रम:
{irrigationSchedule}

सावधानियां:
{precautions}

🌾 आने वाले {days} दिनों के लिए सलाह उपलब्ध है।`
      }
    },
    
    tam: {
      title: 'விவசாய ஆலோசனை',
      sections: {
        problem: 'சிக்கல்',
        solution: 'தீர்வு',
        steps: 'படிகள்',
        prevention: 'தடுப்பு',
        timeline: 'கால எல்லை',
        cost: 'மதிப்பிடப்பட்ட செலவு',
        expert: 'நிபுணர் ஆலோசனை வேண்டுமா?',
        moreInfo: 'மேலும் தகவல் பெற'
      },
      templates: {
        cropAdvice: `
🌾 {cropType} ஆலோசனை

சிக்கல்: {issue}

தீர்வு:
{solution}

பின்பற்ற வேண்டிய படிகள்:
{steps}

தடுப்பு:
{prevention}

ℹ️ நம்பகத்தன்மை: {confidence}%
⏱️ முடிவு: {timeline}
💰 மதிப்பிடப்பட்ட செலவு: {cost}`
      }
    },
    
    eng: {
      title: 'Agricultural Advice',
      sections: {
        problem: 'Problem',
        solution: 'Solution',
        steps: 'Steps',
        prevention: 'Prevention',
        timeline: 'Timeline',
        cost: 'Estimated Cost',
        expert: 'Need Expert Advice?',
        moreInfo: 'More Information'
      },
      templates: {
        cropAdvice: `
🌾 {cropType} Advice

Problem: {issue}

Solution:
{solution}

Steps to Follow:
{steps}

Prevention:
{prevention}

ℹ️ Confidence: {confidence}%
⏱️ Timeline: {timeline}
💰 Estimated Cost: {cost}`
      }
    }
  };

  /**
   * Format crop advice response
   */
  static formatCropAdvice(advice, language = 'hin') {
    const lang = this.languageData[language] || this.languageData.eng;
    
    const formatted = {
      title: lang.title,
      text: this.buildCropAdviceText(advice, lang),
      voice_text: this.buildVoiceText(advice, lang),
      sections: {
        main: advice.message,
        steps: advice.recommendations || [],
        prevention: advice.prevention || 'Follow regular maintenance',
        timeline: advice.timeline || '7-14 days',
        cost: advice.estimatedCost || 'Variable',
        confidence: advice.confidence || 0.85
      },
      suggestions: [
        { text: lang.sections.moreInfo, action: 'MORE_INFO' },
        { text: lang.sections.expert, action: 'EXPERT_CONTACT' },
        { text: 'Next Issue', action: 'NEXT' }
      ],
      metadata: {
        cropType: advice.cropType,
        issue: advice.issue,
        generatedAt: new Date().toISOString(),
        language
      }
    };

    return formatted;
  }

  /**
   * Build text representation
   */
  static buildCropAdviceText(advice, lang) {
    let text = `*${lang.sections.problem}:* ${advice.issue}\n\n`;
    
    text += `*${lang.sections.solution}:*\n${advice.message}\n\n`;
    
    if (advice.recommendations && advice.recommendations.length > 0) {
      text += `*${lang.sections.steps}:*\n`;
      advice.recommendations.forEach((step, i) => {
        text += `${i + 1}. ${step}\n`;
      });
      text += '\n';
    }
    
    if (advice.prevention) {
      text += `*${lang.sections.prevention}:*\n${advice.prevention}\n\n`;
    }
    
    text += `ℹ️ *${lang.sections.timeline}:* ${advice.timeline || '7-14 days'}\n`;
    text += `💰 *${lang.sections.cost}:* ${advice.estimatedCost || 'Varies'}\n`;
    text += `✅ *Confidence:* ${Math.round((advice.confidence || 0.85) * 100)}%\n`;
    
    return text;
  }

  /**
   * Build voice-optimized text
   */
  static buildVoiceText(advice, lang) {
    const issue = advice.issue;
    const solution = advice.message;
    const steps = advice.recommendations?.slice(0, 3) || [];
    
    let voice = `आपकी ${advice.cropType} में ${issue} है। ${solution}। `;
    
    if (steps.length > 0) {
      voice += `करने के लिए कदम: `;
      steps.forEach(step => {
        voice += step + '. ';
      });
    }
    
    voice += `यह सलाह आपके स्थानीय विशेषज्ञ से सहमति से दी गई है।`;
    
    return voice;
  }

  /**
   * Format pest detection response
   */
  static formatPestDetection(pestData, language = 'hin') {
    const lang = this.languageData[language] || this.languageData.eng;
    
    return {
      title: `🐛 ${pestData.pestName}`,
      text: `
*पहचान:* ${pestData.pestName}
*फसल:* ${pestData.cropType}
*गंभीरता:* ${this.getSeverityLabel(pestData.severity, language)}

*जैविक नियंत्रण:*
${pestData.organicMethods?.map(m => `✓ ${m}`).join('\n')}

*रासायनिक विकल्प:*
${pestData.chemicalMethods?.map(m => `⚠️ ${m}`).join('\n')}

*रोकथाम:*
${pestData.prevention?.map(p => `• ${p}`).join('\n')}

_⚠️ अगर समस्या बढ़े तो विशेषज्ञ से मिलें_
      `,
      voice_text: `आपकी ${pestData.cropType} में ${pestData.pestName} का कीट पाया गया। यह ${this.getSeverityLabel(pestData.severity, language)} है। जैविक तरीकों से शुरू करें। बेहतर परिणाम के लिए स्थानीय कृषि विभाग से संपर्क करें।`,
      severity: pestData.severity,
      organicMethods: pestData.organicMethods || [],
      chemicalMethods: pestData.chemicalMethods || [],
      preventionTips: pestData.prevention || []
    };
  }

  /**
   * Get severity label
   */
  static getSeverityLabel(severity, language = 'hin') {
    const labels = {
      hin: { low: 'कम', medium: 'मध्यम', high: 'गंभीर' },
      tam: { low: 'குறைவு', medium: 'நடுத்தர', high: 'கடுமையான' },
      eng: { low: 'Low', medium: 'Medium', high: 'High' }
    };
    
    return labels[language]?.[severity] || 'Unknown';
  }

  /**
   * Format weather advice
   */
  static formatWeatherAdvice(weatherData, language = 'hin') {
    const lang = this.languageData[language] || this.languageData.eng;
    
    return {
      title: '⛅ मौसम आधारित सलाह',
      text: `
*वर्तमान मौसम:* ${weatherData.condition}
*तापमान:* ${weatherData.temperature}°C
*वर्षा की संभावना:* ${weatherData.rainProbability}%
*आर्द्रता:* ${weatherData.humidity}%

*सिंचाई सिफारिश:*
${weatherData.irrigationAdvice}

*कृषि कार्य:*
${weatherData.farmingActivities?.map(a => `✓ ${a}`).join('\n')}

*सावधानियां:*
${weatherData.precautions?.map(p => `⚠️ ${p}`).join('\n')}

🔔 अगले ${weatherData.forecastDays} दिनों के लिए पूर्वानुमान उपलब्ध है।
      `,
      voice_text: `आपके क्षेत्र में ${weatherData.condition} की संभावना है। तापमान ${weatherData.temperature} डिग्री होगा। ${weatherData.irrigationAdvice}। स्थानीय मौसम की जानकारी के लिए नियमित अपडेट के लिए हमें फॉलो करें।`,
      forecast: weatherData.forecast || []
    };
  }

  /**
   * Format market price response
   */
  static formatMarketPrice(priceData, language = 'hin') {
    const lang = this.languageData[language] || this.languageData.eng;
    
    return {
      title: '💰 बाजार मूल्य',
      text: `
*फसल:* ${priceData.crop}
*स्थान:* ${priceData.state}

*मूल्य जानकारी:*
💵 *वर्तमान दर:* ₹${priceData.currentPrice} प्रति क्विंटल
📊 *प्रवृत्ति:* ${this.getTrendEmoji(priceData.trend)} ${priceData.trendPercentage}%
📈 *पिछले सप्ताह की तुलना:* ${priceData.weekComparison}

*सर्वश्रेष्ठ समय:*
${priceData.bestTimeToSell}

*भंडारण सलाह:*
${priceData.storageAdvice}

*निकटतम मंडी:*
${priceData.nearbyMarkets?.map(m => `• ${m.name} - ₹${m.price}`).join('\n')}

🔔 रोजाना अपडेट के लिए हमें फॉलो करते रहें।
      `,
      voice_text: `${priceData.crop} का वर्तमान बाजार मूल्य ${priceData.currentPrice} रुपये प्रति क्विंटल है। यह ${this.getTrendLabel(priceData.trend, language)} है। ${priceData.bestTimeToSell}। अपनी फसल को सही समय पर बेचने के लिए हमसे जुड़े रहें।`,
      price: priceData.currentPrice,
      trend: priceData.trend,
      markets: priceData.nearbyMarkets || []
    };
  }

  /**
   * Get trend emoji
   */
  static getTrendEmoji(trend) {
    const emojis = { up: '📈', down: '📉', stable: '➡️' };
    return emojis[trend] || '➡️';
  }

  /**
   * Get trend label
   */
  static getTrendLabel(trend, language = 'hin') {
    const labels = {
      hin: { up: 'बढ़ रहा है', down: 'घट रहा है', stable: 'स्थिर है' },
      tam: { up: 'உயர்ந்து கொண்டிருக்கிறது', down: 'குறைந்து கொண்டிருக்கிறது', stable: 'நிலையற்றது' },
      eng: { up: 'increasing', down: 'decreasing', stable: 'stable' }
    };
    
    return labels[language]?.[trend] || 'stable';
  }

  /**
   * Format soil health response
   */
  static formatSoilHealth(soilData, language = 'hin') {
    return {
      title: '🌱 मिट्टी का स्वास्थ्य',
      text: `
*मिट्टी का विश्लेषण:*
• रंग: ${soilData.color}
• बनावट: ${soilData.texture}
• पीएच स्तर: ${soilData.pH}

*सुझाव:*
${soilData.recommendations?.map(r => `✓ ${r}`).join('\n')}

*आवश्यक सुधार:*
${soilData.improvements?.map(i => `⚠️ ${i}`).join('\n')}

*जैविक खाद सिफारिशें:*
${soilData.organicFertilizers?.map(f => `• ${f}`).join('\n')}

⏱️ सुधार के लिए समय: ${soilData.improvementTimeline}

💡 *विशेषज्ञ सलाह:* आपकी मिट्टी की विस्तृत जांच के लिए स्थानीय कृषि विज्ञान केंद्र से संपर्क करें।
      `,
      voice_text: `आपकी मिट्टी ${soilData.color} है और ${soilData.texture} बनावट की है। पीएच स्तर ${soilData.pH} है। ${soilData.recommendations?.join('. ')}। स्वस्थ मिट्टी के लिए नियमित जांच करवाएं।`
    };
  }

  /**
   * Add documentation to any response
   */
  static addDocumentation(response, cropType, language = 'hin') {
    const docs = {
      hin: {
        header: '📖 सहायक जानकारी',
        sources: 'स्रोत: भारतीय कृषि अनुसंधान संस्थान',
        disclaimer: 'यह सलाह सामान्य मार्गदर्शन के लिए है। स्थानीय जलवायु के अनुसार परिवर्तन संभव है।',
        expert: 'अधिक सहायता के लिए अपने स्थानीय कृषि विशेषज्ञ से मिलें।'
      },
      eng: {
        header: '📖 Supporting Information',
        sources: 'Source: Indian Council of Agricultural Research',
        disclaimer: 'This advice is general guidance. Local variations may apply.',
        expert: 'For more help, contact your local agricultural expert.'
      }
    };

    const doc = docs[language] || docs.eng;
    
    response.documentation = {
      header: doc.header,
      sources: doc.sources,
      disclaimer: doc.disclaimer,
      expertContact: doc.expert,
      generatedAt: new Date().toLocaleString('hi-IN'),
      cropType,
      language
    };

    return response;
  }
}

export default ResponseFormatter;
