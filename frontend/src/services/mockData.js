// Mock data for tools
export const mockTools = [
  {
    id: '1',
    name: 'Text Summarizer',
    description: 'Summarize long texts into concise summaries. This tool uses extractive summarization to identify and extract key sentences that represent the main points of the text.',
    category: 'Text',
    is_core: true,
    status: 'active',
    version: '1.0.1'
  },
  {
    id: '2',
    name: 'Sentiment Analyzer',
    description: 'Analyze the sentiment of text as positive, negative, or neutral. This tool examines the emotional tone behind words to understand the attitudes, opinions, and emotions expressed within the text.',
    category: 'Text',
    is_core: true,
    status: 'active',
    version: '1.2.0'
  },
  {
    id: '3',
    name: 'Text Translator',
    description: 'Translate text between multiple languages. This plugin allows you to easily convert text from one language to another with support for Spanish, French, and German.',
    category: 'Text',
    is_core: false,
    status: 'active',
    version: '0.9.5'
  },
  {
    id: '4',
    name: 'Code Formatter',
    description: 'Format code to follow standard style guidelines. Supports JavaScript, Python, and HTML.',
    category: 'Development',
    is_core: true,
    status: 'active',
    version: '1.0.0'
  }
];

// Mock data for plugins
export const mockPlugins = [
  {
    id: '1',
    name: 'Text Translator',
    description: 'Translate text between multiple languages',
    version: '1.0.0',
    is_approved: true,
    is_active: true,
    repository_url: 'https://github.com/example/text-translator',
    status: 'active'
  },
  {
    id: '2',
    name: 'Image Captioner',
    description: 'Generate descriptive captions for images',
    version: '0.9.0',
    is_approved: true,
    is_active: false,
    repository_url: 'https://github.com/example/image-captioner',
    status: 'inactive'
  },
  {
    id: '3',
    name: 'Speech Recognition',
    description: 'Convert speech to text',
    version: '1.2.3',
    is_approved: false,
    is_active: false,
    repository_url: null,
    status: 'pending'
  }
];

// Helper function to simulate occasional failures for realistic behavior
const simulateRandomFailure = (failureRate = 0.05) => {
  return Math.random() < failureRate;
};

// Mock tool execution results
export const mockToolExecutions = {
  'text_summarizer': (params) => {
    // Validate input
    const text = params.text || '';
    if (!text) {
      return { 
        error: 'No text provided', 
        status: 'error',
        details: 'The text parameter is required for summarization'
      };
    }
    
    // Simulate random failure for testing error handling
    if (simulateRandomFailure()) {
      return {
        error: 'Service temporarily unavailable',
        status: 'error',
        code: 'SERVICE_UNAVAILABLE'
      };
    }
    
    // Process the text
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    let summary = '';
    
    if (sentences.length <= 2) {
      summary = text;
    } else {
      const keywordCounts = {};
      
      // Count word frequencies to find important sentences
      sentences.forEach(sentence => {
        const words = sentence.toLowerCase().split(/\W+/).filter(w => w.length > 2);
        words.forEach(word => {
          keywordCounts[word] = (keywordCounts[word] || 0) + 1;
        });
      });
      
      // Score sentences based on keyword frequency
      const sentenceScores = sentences.map(sentence => {
        const words = sentence.toLowerCase().split(/\W+/).filter(w => w.length > 2);
        let score = 0;
        words.forEach(word => {
          score += keywordCounts[word] || 0;
        });
        return score / Math.max(words.length, 1);
      });
      
      // Get top sentences (around 30% of the original)
      const topCount = Math.max(1, Math.ceil(sentences.length * 0.3));
      const topIndices = sentenceScores
        .map((score, index) => ({ score, index }))
        .sort((a, b) => b.score - a.score)
        .slice(0, topCount)
        .sort((a, b) => a.index - b.index) // Sort by original order
        .map(item => item.index);
      
      summary = topIndices.map(i => sentences[i]).join('. ') + '.';
    }
    
    return {
      result: summary,
      execution_time_ms: 120 + Math.floor(Math.random() * 50),
      status: 'success',
      input_length: text.length,
      output_length: summary.length,
      compression_ratio: text.length > 0 ? (summary.length / text.length) : 1
    };
  },
  
  'sentiment_analyzer': (params) => {
    // Validate input
    const text = params.text || '';
    if (!text) {
      return { 
        error: 'No text provided', 
        status: 'error',
        details: 'The text parameter is required for sentiment analysis'
      };
    }
    
    // Simulate random failure for testing error handling
    if (simulateRandomFailure()) {
      return {
        error: 'Service temporarily unavailable',
        status: 'error',
        code: 'SERVICE_UNAVAILABLE'
      };
    }
    
    // Analyze sentiment
    const positiveWords = ["good", "great", "excellent", "happy", "positive", "wonderful", "best", "love", 
                           "beautiful", "perfect", "amazing", "awesome", "fantastic", "enjoyable", "joy"];
    const negativeWords = ["bad", "terrible", "awful", "sad", "negative", "worst", "hate", "poor", 
                          "horrible", "disappointing", "unfortunately", "fail", "failed", "boring", "annoying"];
    
    const words = text.toLowerCase().split(/\W+/).filter(w => w.length > 0);
    const positiveCount = words.filter(w => positiveWords.includes(w)).length;
    const negativeCount = words.filter(w => negativeWords.includes(w)).length;
    
    // Calculate sentiment score (-1 to 1)
    const score = (positiveCount - negativeCount) / Math.max(words.length, 1);
    
    let sentiment = 'neutral';
    if (score > 0.05) sentiment = 'positive';
    if (score < -0.05) sentiment = 'negative';
    
    // Calculate confidence level
    const confidence = Math.min(0.99, Math.abs(score) * 2 + 0.5);
    
    return {
      result: {
        sentiment,
        score: parseFloat(score.toFixed(2)),
        positive_words: positiveCount,
        negative_words: negativeCount,
        confidence: parseFloat(confidence.toFixed(2)),
        analysis: {
          word_count: words.length,
          most_impactful_words: 
            score > 0 
              ? words.filter(w => positiveWords.includes(w)).slice(0, 3) 
              : words.filter(w => negativeWords.includes(w)).slice(0, 3)
        }
      },
      execution_time_ms: 85 + Math.floor(Math.random() * 30),
      status: 'success'
    };
  },
  
  'text_translator': (params) => {
    // Validate input
    const { text, source_lang, target_lang } = params;
    if (!text) {
      return { 
        error: 'No text provided', 
        status: 'error',
        details: 'The text parameter is required for translation'
      };
    }
    
    // Simulate random failure for testing error handling
    if (simulateRandomFailure()) {
      return {
        error: 'Translation service temporarily unavailable',
        status: 'error',
        code: 'SERVICE_UNAVAILABLE'
      };
    }
    
    // Common translations (expanded word list)
    const translations = {
      'hello': { 'es': 'hola', 'fr': 'bonjour', 'de': 'hallo' },
      'world': { 'es': 'mundo', 'fr': 'monde', 'de': 'welt' },
      'good': { 'es': 'bueno', 'fr': 'bon', 'de': 'gut' },
      'morning': { 'es': 'mañana', 'fr': 'matin', 'de': 'morgen' },
      'thank': { 'es': 'gracias', 'fr': 'merci', 'de': 'danke' },
      'you': { 'es': 'tu', 'fr': 'vous', 'de': 'du' },
      'welcome': { 'es': 'bienvenido', 'fr': 'bienvenue', 'de': 'willkommen' },
      'friend': { 'es': 'amigo', 'fr': 'ami', 'de': 'freund' },
      'today': { 'es': 'hoy', 'fr': 'aujourd\'hui', 'de': 'heute' },
      'tomorrow': { 'es': 'mañana', 'fr': 'demain', 'de': 'morgen' },
      'yes': { 'es': 'sí', 'fr': 'oui', 'de': 'ja' },
      'no': { 'es': 'no', 'fr': 'non', 'de': 'nein' },
      'please': { 'es': 'por favor', 'fr': 's\'il vous plaît', 'de': 'bitte' },
      'sorry': { 'es': 'lo siento', 'fr': 'désolé', 'de': 'entschuldigung' },
      'love': { 'es': 'amor', 'fr': 'amour', 'de': 'liebe' },
      'time': { 'es': 'tiempo', 'fr': 'temps', 'de': 'zeit' },
      'day': { 'es': 'día', 'fr': 'jour', 'de': 'tag' },
      'night': { 'es': 'noche', 'fr': 'nuit', 'de': 'nacht' },
      'food': { 'es': 'comida', 'fr': 'nourriture', 'de': 'essen' },
      'water': { 'es': 'agua', 'fr': 'eau', 'de': 'wasser' }
    };
    
    const sourceLang = source_lang || 'en';
    const targetLang = target_lang || 'es';
    
    // Validate language parameters
    if (sourceLang !== 'en') {
      return { 
        result: { error: 'Only English source language is supported in demo' },
        status: 'error',
        supported_source_languages: ['en']
      };
    }
    
    if (!['es', 'fr', 'de'].includes(targetLang)) {
      return { 
        result: { error: 'Only Spanish, French, and German target languages are supported in demo' },
        status: 'error',
        supported_target_languages: ['es', 'fr', 'de']
      };
    }
    
    // Translate the text
    const words = text.toLowerCase().split(/\W+/).filter(w => w.length > 0);
    const translatedWords = words.map(word => {
      if (translations[word] && translations[word][targetLang]) {
        return translations[word][targetLang];
      }
      return `[${word}]`;
    });
    
    // Get language names for display
    const languageNames = {
      'en': 'English',
      'es': 'Spanish',
      'fr': 'French',
      'de': 'German'
    };
    
    return {
      result: {
        source_text: text,
        source_lang: languageNames[sourceLang],
        target_lang: languageNames[targetLang],
        translated_text: translatedWords.join(' '),
        word_count: words.length,
        translated_word_count: translatedWords.length,
        unknown_words: words.filter(word => !translations[word] || !translations[word][targetLang]).length
      },
      execution_time_ms: 150 + Math.floor(Math.random() * 50),
      status: 'success'
    };
  },
  
  'code_formatter': (params) => {
    // Validate input
    const { text, language } = params;
    if (!text) {
      return { 
        error: 'No code provided', 
        status: 'error',
        details: 'The text parameter is required for code formatting'
      };
    }
    
    // Simulate random failure for testing error handling
    if (simulateRandomFailure()) {
      return {
        error: 'Formatting service temporarily unavailable',
        status: 'error',
        code: 'SERVICE_UNAVAILABLE'
      };
    }
    
    let formattedCode = text;
    const lang = language || 'javascript';
    
    // Basic formatting for JavaScript
    if (lang === 'javascript' || lang === 'js') {
      // Replace multiple spaces with single space
      formattedCode = formattedCode.replace(/\s+/g, ' ');
      
      // Add space after commas
      formattedCode = formattedCode.replace(/,([^\s])/g, ', $1');
      
      // Add space around operators
      formattedCode = formattedCode.replace(/([+\-*/%=])/g, ' $1 ');
      
      // Add newline after semicolons
      formattedCode = formattedCode.replace(/;/g, ';\n');
      
      // Format curly braces
      formattedCode = formattedCode.replace(/{/g, ' {\n  ');
      formattedCode = formattedCode.replace(/}/g, '\n}');
      
      // Clean up double spaces and newlines
      formattedCode = formattedCode.replace(/\n\s*\n/g, '\n');
      formattedCode = formattedCode.replace(/\s{2,}/g, ' ');
    }
    
    // Simulate formatting for other languages
    else if (lang === 'python') {
      formattedCode = formattedCode.replace(/\s+/g, ' ');
      formattedCode = formattedCode.replace(/:/g, ':\n  ');
      formattedCode = formattedCode.replace(/\n\s*\n/g, '\n');
    }
    
    return {
      result: formattedCode,
      execution_time_ms: 65 + Math.floor(Math.random() * 20),
      status: 'success',
      language: lang,
      formatting_rules_applied: ['spacing', 'indentation', 'line_breaks']
    };
  }
};

// Mock authentication state
let authToken = localStorage.getItem('token');

export const mockAuth = {
  login: (username, password) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (username === 'demo' && password === 'demo') {
          authToken = 'demo-token-' + Date.now();
          localStorage.setItem('token', authToken);
          resolve({ token: authToken, user: { username, id: '1' } });
        } else {
          reject(new Error('Invalid credentials. Try using "demo" for both username and password.'));
        }
      }, 800);
    });
  },
  
  logout: () => {
    return new Promise((resolve) => {
      setTimeout(() => {
        authToken = null;
        localStorage.removeItem('token');
        resolve(true);
      }, 300);
    });
  },
  
  isAuthenticated: () => {
    return authToken !== null || localStorage.getItem('token') !== null;
  },
  
  getUser: () => {
    if (!authToken && !localStorage.getItem('token')) {
      throw new Error('Not authenticated');
    }
    
    return {
      id: '1',
      username: 'demo',
      email: 'demo@example.com',
      is_active: true,
      is_admin: true,
      last_login: new Date().toISOString()
    };
  }
}; 