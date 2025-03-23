import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  CircularProgress,
  Divider,
  Alert,
  Card,
  CardContent,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  FormHelperText,
  Tabs,
  Tab,
  IconButton,
  useTheme,
  alpha
} from '@mui/material';
import {
  Code as CodeIcon,
  Download as DownloadIcon,
  FileCopy as CopyIcon,
  TerminalRounded as TerminalIcon
} from '@mui/icons-material';
import apiService from '../services/apiService';

// Sample code snippets for different tool types (in a real app, these would come from the backend)
const sampleCodeSnippets = {
  text_summarizer: `# Text Summarizer Tool
import nltk
from nltk.corpus import stopwords
from nltk.tokenize import sent_tokenize, word_tokenize
from heapq import nlargest

class TextSummarizer:
    def __init__(self):
        nltk.download('punkt', quiet=True)
        nltk.download('stopwords', quiet=True)
        self.stop_words = set(stopwords.words('english'))
        
    def summarize(self, text, num_sentences=3):
        """
        Summarize the given text by extracting the most important sentences.
        
        Args:
            text (str): The text to summarize
            num_sentences (int): Number of sentences to include in summary
            
        Returns:
            str: A summary of the original text
        """
        # Tokenize the text into sentences and words
        sentences = sent_tokenize(text)
        
        # If text is too short, return it as is
        if len(sentences) <= num_sentences:
            return text
            
        # Create frequency table for words
        word_frequencies = {}
        for word in word_tokenize(text.lower()):
            if word not in self.stop_words and word.isalnum():
                if word not in word_frequencies:
                    word_frequencies[word] = 1
                else:
                    word_frequencies[word] += 1
                    
        # Normalize frequencies
        max_frequency = max(word_frequencies.values()) if word_frequencies else 1
        for word in word_frequencies:
            word_frequencies[word] = word_frequencies[word] / max_frequency
            
        # Calculate sentence scores based on word frequencies
        sentence_scores = {}
        for i, sentence in enumerate(sentences):
            for word in word_tokenize(sentence.lower()):
                if word in word_frequencies:
                    if i not in sentence_scores:
                        sentence_scores[i] = word_frequencies[word]
                    else:
                        sentence_scores[i] += word_frequencies[word]
                        
        # Get the top N sentences with highest scores
        summary_indices = nlargest(num_sentences, sentence_scores, key=sentence_scores.get)
        summary_indices.sort()  # Sort to maintain original order
        
        # Create the summary
        summary = ' '.join([sentences[i] for i in summary_indices])
        return summary

    def __call__(self, text, **kwargs):
        """Make the class callable for easy integration"""
        return self.summarize(text, **kwargs)
        
# Create an instance of the summarizer
summarizer = TextSummarizer()

# Example usage
def process_text(text, num_sentences=3):
    return summarizer(text, num_sentences=num_sentences)`,

  sentiment_analyzer: `# Sentiment Analyzer Tool
import re
from collections import Counter

class SentimentAnalyzer:
    def __init__(self):
        # Simple positive and negative word lists
        # In a real implementation, use a more comprehensive lexicon
        self.positive_words = set([
            "good", "great", "excellent", "amazing", "wonderful", "fantastic",
            "happy", "love", "best", "beautiful", "enjoy", "nice", "liked",
            "positive", "perfect", "awesome", "recommend", "recommended"
        ])
        
        self.negative_words = set([
            "bad", "awful", "terrible", "horrible", "worst", "hate",
            "dislike", "disappointed", "poor", "negative", "difficult",
            "wrong", "annoying", "waste", "boring", "failed", "frustrating"
        ])
    
    def analyze(self, text):
        """
        Analyze the sentiment of the given text.
        
        Args:
            text (str): The text to analyze
            
        Returns:
            dict: Sentiment analysis results with sentiment label and score
        """
        if not text or not text.strip():
            return {"sentiment": "neutral", "score": 0.0}
            
        # Clean and normalize text
        text = text.lower()
        words = re.findall(r'\\w+', text)
        
        # Count positive and negative words
        word_counts = Counter(words)
        
        # Calculate positive and negative scores
        positive_score = sum(word_counts[word] for word in self.positive_words if word in word_counts)
        negative_score = sum(word_counts[word] for word in self.negative_words if word in word_counts)
        
        # Calculate net sentiment score (-1 to 1)
        total = positive_score + negative_score
        if total == 0:
            net_score = 0.0
        else:
            net_score = (positive_score - negative_score) / total
            
        # Determine sentiment label
        if net_score > 0.1:
            sentiment = "positive"
        elif net_score < -0.1:
            sentiment = "negative"
        else:
            sentiment = "neutral"
            
        return {
            "sentiment": sentiment,
            "score": net_score,
            "details": {
                "positive_words": positive_score,
                "negative_words": negative_score
            }
        }
    
    def __call__(self, text):
        """Make the class callable for easy integration"""
        return self.analyze(text)

# Create an instance of the analyzer
analyzer = SentimentAnalyzer()

# Example usage
def process_text(text):
    return analyzer(text)`,

  text_translator: `# Text Translator Tool
from googletrans import Translator

class TextTranslator:
    def __init__(self):
        # Initialize the translator
        self.translator = Translator()
        self.language_codes = {
            'en': 'English',
            'es': 'Spanish',
            'fr': 'French',
            'de': 'German',
            'it': 'Italian',
            'pt': 'Portuguese',
            'ru': 'Russian',
            'ja': 'Japanese',
            'zh-cn': 'Chinese (Simplified)',
            'ar': 'Arabic'
        }
        
    def translate(self, text, source_lang='auto', target_lang='en'):
        """
        Translate text from source language to target language.
        
        Args:
            text (str): The text to translate
            source_lang (str): Source language code (default: auto-detect)
            target_lang (str): Target language code (default: English)
            
        Returns:
            dict: Translation results including translated text
        """
        if not text or not text.strip():
            return {"translated_text": "", "source_lang": source_lang, "target_lang": target_lang}
            
        try:
            # If source language is 'auto', the library will auto-detect
            result = self.translator.translate(
                text, 
                src=None if source_lang == 'auto' else source_lang,
                dest=target_lang
            )
            
            detected_source = result.src
            
            return {
                "translated_text": result.text,
                "source_lang": detected_source,
                "source_lang_name": self.language_codes.get(detected_source, detected_source),
                "target_lang": target_lang,
                "target_lang_name": self.language_codes.get(target_lang, target_lang),
                "confidence": getattr(result, 'confidence', None)
            }
            
        except Exception as e:
            return {
                "error": f"Translation failed: {str(e)}",
                "source_lang": source_lang,
                "target_lang": target_lang
            }
    
    def __call__(self, text, source_lang='auto', target_lang='en'):
        """Make the class callable for easy integration"""
        return self.translate(text, source_lang, target_lang)

# Create an instance of the translator
translator = TextTranslator()

# Example usage
def process_text(text, source_lang='auto', target_lang='es'):
    return translator(text, source_lang, target_lang)`,

  code_formatter: `# Code Formatter Tool
import re
import black
import autopep8

class CodeFormatter:
    def __init__(self):
        # Default formatter options
        self.black_options = {
            'line_length': 88,
            'string_normalization': True,
        }
        
        self.autopep8_options = {
            'max_line_length': 88,
            'aggressive': 2,
        }
        
    def format_python(self, code, formatter='black'):
        """
        Format Python code using the specified formatter.
        
        Args:
            code (str): The Python code to format
            formatter (str): The formatter to use ('black' or 'autopep8')
            
        Returns:
            dict: Formatted code and metadata
        """
        if not code or not code.strip():
            return {"formatted_code": "", "formatter": formatter}
        
        try:
            if formatter.lower() == 'black':
                # Format with Black
                formatted = black.format_str(
                    code,
                    **self.black_options
                )
            else:
                # Format with autopep8
                formatted = autopep8.fix_code(
                    code,
                    options=autopep8.parse_args(['--aggressive', '--aggressive', f'--max-line-length={self.autopep8_options["max_line_length"]}', ''])
                )
                
            # Calculate stats
            original_lines = len(code.splitlines())
            formatted_lines = len(formatted.splitlines())
            
            return {
                "formatted_code": formatted,
                "formatter": formatter,
                "stats": {
                    "original_lines": original_lines,
                    "formatted_lines": formatted_lines,
                    "difference": formatted_lines - original_lines
                }
            }
            
        except Exception as e:
            return {
                "error": f"Formatting failed: {str(e)}",
                "formatter": formatter
            }
    
    def __call__(self, code, formatter='black'):
        """Make the class callable for easy integration"""
        return self.format_python(code, formatter)

# Create an instance of the formatter
formatter = CodeFormatter()

# Example usage
def process_code(code, formatter='black'):
    return formatter(code, formatter)`
};

// Helper function to get code preview based on file extension
const getCodePreview = (fileName) => {
  const extension = fileName.split('.').pop().toLowerCase();
  
  // Return different code based on file extension
  switch(extension) {
    case 'py':
      return `# Python implementation for this tool
import numpy as np
import pandas as pd

class ${fileName.split('.')[0]}:
    def __init__(self):
        self.name = "${fileName.split('.')[0]}"
        print(f"Initializing {self.name}")
        
    def process(self, data):
        # Process the input data
        result = self._analyze(data)
        return result
        
    def _analyze(self, input_data):
        # Core analysis logic
        return {"result": "Processed data", "status": "success"}`;
        
    case 'js':
      return `// JavaScript implementation for this tool
class ${fileName.split('.')[0]} {
  constructor() {
    this.name = "${fileName.split('.')[0]}";
    console.log(\`Initializing \${this.name}\`);
  }
  
  process(data) {
    // Process the input data
    const result = this._analyze(data);
    return result;
  }
  
  _analyze(inputData) {
    // Core analysis logic
    return { result: "Processed data", status: "success" };
  }
}

module.exports = new ${fileName.split('.')[0]}();`;
      
    case 'java':
      return `// Java implementation for this tool
public class ${fileName.split('.')[0]} {
    private String name;
    
    public ${fileName.split('.')[0]}() {
        this.name = "${fileName.split('.')[0]}";
        System.out.println("Initializing " + this.name);
    }
    
    public Object process(Object data) {
        // Process the input data
        Object result = analyze(data);
        return result;
    }
    
    private Object analyze(Object inputData) {
        // Core analysis logic
        return Map.of("result", "Processed data", "status", "success");
    }
}`;
      
    default:
      return `// Implementation for ${fileName}
// This file contains the core logic for this tool.`;
  }
};

const ToolDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const theme = useTheme();
  const [tool, setTool] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [inputText, setInputText] = useState('');
  const [result, setResult] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [targetLang, setTargetLang] = useState('es');
  const [retryCount, setRetryCount] = useState(0);
  const [activeTab, setActiveTab] = useState(0);
  const [copySuccess, setCopySuccess] = useState('');

  useEffect(() => {
    const fetchTool = async () => {
      try {
        const toolData = await apiService.getTool(id);
        setTool(toolData);
      } catch (error) {
        setError('Error loading tool details: ' + (error.message || 'Unknown error'));
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchTool();
  }, [id]);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleInputChange = (e) => {
    setInputText(e.target.value);
  };

  const handleLanguageChange = (e) => {
    setTargetLang(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setProcessing(true);
    setResult(null);
    setError('');
    
    if (!inputText.trim()) {
      setError('Please enter text to process');
      setProcessing(false);
      return;
    }
    
    try {
      // Prepare different parameters based on tool type
      let params = { text: inputText };
      
      // Add tool-specific parameters
      if (tool.name.toLowerCase().includes('translator')) {
        params = { 
          ...params, 
          source_lang: 'en',
          target_lang: targetLang 
        };
      }
      
      const toolId = tool.name.toLowerCase().replace(/ /g, '_');
      console.log(`Executing tool: ${toolId} with params:`, params);
      
      const response = await apiService.executeTool(toolId, params);
      
      if (response.status === 'error' || response.error) {
        const errorMsg = response.error || 'Error executing tool';
        setError(errorMsg);
        console.error('Tool execution error:', errorMsg);
      } else {
        setResult(response);
        setError('');
      }
    } catch (error) {
      const errorMsg = 'Failed to execute tool: ' + (error.message || 'Unknown error');
      setError(errorMsg);
      console.error('Tool execution exception:', error);
      
      // Retry logic for potential temporary issues
      if (retryCount < 2) {
        setRetryCount(prev => prev + 1);
        setError(`${errorMsg} - Retrying... (${retryCount + 1}/3)`);
        setTimeout(() => handleSubmit(e), 1000);
        return;
      }
    } finally {
      setProcessing(false);
    }
  };

  const handleReset = () => {
    setInputText('');
    setResult(null);
    setError('');
    setRetryCount(0);
  };

  const getToolCode = () => {
    if (!tool) return '';
    
    // If the tool has files, display them
    if (tool.files && tool.files.length > 0) {
      // For demo purposes, we're showing a preview based on the first file
      const firstFile = tool.files[0];
      return getCodePreview(firstFile);
    }
    
    // Fallback to the default mock code
    const toolId = tool.name.toLowerCase().replace(/ /g, '_');
    return sampleCodeSnippets[toolId] || 
      `# ${tool.name}

# This tool's source code is not available in the demo.
# In a production environment, the actual implementation would be shown here.`;
  };

  const handleCopyCode = () => {
    const code = getToolCode();
    navigator.clipboard.writeText(code).then(
      () => {
        setCopySuccess('Copied!');
        setTimeout(() => setCopySuccess(''), 2000);
      },
      () => {
        setCopySuccess('Failed to copy!');
      }
    );
  };

  const handleDownloadCode = () => {
    if (!tool) return;
    
    const toolId = tool.name.toLowerCase().replace(/ /g, '_');
    const code = getToolCode();
    
    // Determine file extension based on code content
    let fileExtension = 'py';
    if (code.includes('class') && code.includes('constructor')) {
      fileExtension = 'js';
    } else if (code.includes('public class') && code.includes('System.out.println')) {
      fileExtension = 'java';
    }
    
    // Create a blob from the code
    const blob = new Blob([code], { type: 'text/plain' });
    
    // Create a temporary URL for the blob
    const url = URL.createObjectURL(blob);
    
    // Create a temporary anchor element and trigger the download
    const a = document.createElement('a');
    a.href = url;
    a.download = `${toolId}.${fileExtension}`;
    document.body.appendChild(a);
    a.click();
    
    // Clean up
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <Container sx={{ mt: 4, textAlign: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }

  if (!tool) {
    return (
      <Container sx={{ mt: 4 }}>
        <Alert severity="error">Tool not found</Alert>
        <Button sx={{ mt: 2 }} variant="contained" onClick={() => navigate('/')}>
          Back to Dashboard
        </Button>
      </Container>
    );
  }

  const isTranslator = tool.name.toLowerCase().includes('translator');

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Paper 
        elevation={3} 
        sx={{ 
          p: 3, 
          mb: 4, 
          background: `linear-gradient(145deg, ${alpha(theme.palette.background.paper, 0.8)}, ${alpha(theme.palette.background.paper, 0.95)})`,
          backdropFilter: 'blur(10px)',
          border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
          borderRadius: '12px',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <Box 
            sx={{ 
              mr: 2, 
              bgcolor: alpha(theme.palette.primary.main, 0.1), 
              borderRadius: '50%', 
              p: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center' 
            }}
          >
            <TerminalIcon sx={{ color: theme.palette.primary.main, fontSize: '2.5rem' }} />
          </Box>
          <Box>
            <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 600, m: 0 }}>
              {tool.name}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.9rem' }}>
              {tool.is_core ? "Built-in Core Tool" : "Custom Tool"} • Category: {tool.category}
            </Typography>
          </Box>
        </Box>
        <Typography 
          variant="body1" 
          paragraph 
          sx={{ 
            mt: 2, 
            fontSize: '1.05rem', 
            lineHeight: 1.6,
            color: alpha(theme.palette.text.primary, 0.85)
          }}
        >
          {tool.description}
        </Typography>
      </Paper>

      <Tabs 
        value={activeTab} 
        onChange={handleTabChange} 
        aria-label="tool tabs"
        sx={{ 
          mb: 2, 
          '& .MuiTab-root': {
            borderRadius: '8px',
            transition: 'all 0.2s ease',
            '&.Mui-selected': {
              backgroundColor: alpha(theme.palette.primary.main, 0.1),
            }
          },
          '& .MuiTabs-indicator': {
            height: '3px',
            borderRadius: '3px',
          }
        }}
      >
        <Tab 
          label="Try it out" 
          icon={<CodeIcon />} 
          iconPosition="start"
        />
        <Tab 
          label="Source Code" 
          icon={<DownloadIcon />} 
          iconPosition="start"
        />
      </Tabs>

      {activeTab === 0 ? (
        <Paper 
          elevation={3} 
          sx={{ 
            p: 3, 
            mb: 4, 
            background: `linear-gradient(145deg, ${alpha(theme.palette.background.paper, 0.8)}, ${alpha(theme.palette.background.paper, 0.95)})`,
            backdropFilter: 'blur(10px)',
            border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
            borderRadius: '12px',
          }}
        >
          <Typography variant="h5" gutterBottom>
            Try it out
          </Typography>
          <Divider sx={{ mb: 3 }} />

          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit}>
            <TextField
              label="Enter text to process"
              multiline
              rows={4}
              fullWidth
              value={inputText}
              onChange={handleInputChange}
              sx={{ 
                mb: 2,
                '& .MuiOutlinedInput-root': {
                  borderRadius: '10px',
                  '&:hover .MuiOutlinedInput-notchedOutline': {
                    borderColor: theme.palette.primary.light,
                  },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                    borderWidth: '2px',
                  }
                }
              }}
              placeholder="Type or paste your text here..."
              required
              error={inputText.trim() === '' && error.includes('Please enter text')}
              helperText={inputText.trim() === '' && error.includes('Please enter text') ? 'This field is required' : ''}
            />
            
            {isTranslator && (
              <FormControl sx={{ mb: 2, minWidth: 200 }}>
                <InputLabel id="target-language-label">Target Language</InputLabel>
                <Select
                  labelId="target-language-label"
                  id="target-language"
                  value={targetLang}
                  label="Target Language"
                  onChange={handleLanguageChange}
                  sx={{ borderRadius: '10px' }}
                >
                  <MenuItem value="es">Spanish</MenuItem>
                  <MenuItem value="fr">French</MenuItem>
                  <MenuItem value="de">German</MenuItem>
                </Select>
                <FormHelperText>Select the language to translate to</FormHelperText>
              </FormControl>
            )}
            
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button 
                variant="contained" 
                type="submit" 
                disabled={processing || !inputText.trim()}
                sx={{ 
                  minWidth: 120, 
                  borderRadius: '10px',
                  py: 1.2,
                  background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
                  boxShadow: `0 4px 14px ${alpha(theme.palette.primary.main, 0.4)}`,
                  '&:hover': {
                    boxShadow: `0 6px 18px ${alpha(theme.palette.primary.main, 0.6)}`,
                  }
                }}
              >
                {processing ? <CircularProgress size={24} /> : 'Process'}
              </Button>
              
              <Button
                variant="outlined"
                onClick={handleReset}
                disabled={processing || (!inputText && !result && !error)}
                sx={{ 
                  borderRadius: '10px',
                  borderWidth: '2px',
                  '&:hover': {
                    borderWidth: '2px',
                  }
                }}
              >
                Reset
              </Button>
            </Box>
          </Box>
        </Paper>
      ) : (
        <Paper 
          elevation={3} 
          sx={{ 
            p: 3, 
            mb: 4, 
            background: `linear-gradient(145deg, ${alpha(theme.palette.background.paper, 0.8)}, ${alpha(theme.palette.background.paper, 0.95)})`,
            backdropFilter: 'blur(10px)',
            border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
            borderRadius: '12px',
          }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h5" gutterBottom sx={{ mb: 0 }}>
              Source Code
            </Typography>
            <Box>
              <IconButton 
                color="primary" 
                onClick={handleCopyCode} 
                title="Copy code"
                sx={{ mr: 1 }}
              >
                <CopyIcon />
              </IconButton>
              <Button
                variant="contained"
                startIcon={<DownloadIcon />}
                onClick={handleDownloadCode}
                sx={{ 
                  borderRadius: '10px',
                  background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
                  boxShadow: `0 4px 14px ${alpha(theme.palette.primary.main, 0.4)}`,
                  '&:hover': {
                    boxShadow: `0 6px 18px ${alpha(theme.palette.primary.main, 0.6)}`,
                  }
                }}
              >
                Download Code
              </Button>
            </Box>
          </Box>
          <Typography variant="body2" sx={{ mb: 2 }}>
            This is the implementation code for the {tool.name}. You can use this in your own projects.
          </Typography>
          {copySuccess && (
            <Alert severity="success" sx={{ mb: 2 }}>
              {copySuccess}
            </Alert>
          )}
          <Box 
            sx={{ 
              bgcolor: 'rgba(30, 30, 40, 0.95)',
              color: '#e0e0ff', 
              p: 2, 
              borderRadius: '12px',
              overflowX: 'auto',
              fontFamily: 'Consolas, Monaco, "Andale Mono", monospace',
              fontSize: '0.9rem',
              lineHeight: 1.5,
              boxShadow: 'inset 0 0 10px rgba(0,0,0,0.3)',
              position: 'relative',
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                right: 0,
                bottom: 0,
                left: 0,
                background: 'linear-gradient(to bottom, rgba(131,58,180,0.05) 0%, rgba(253,29,29,0.05) 50%, rgba(252,176,69,0.05) 100%)',
                pointerEvents: 'none',
                borderRadius: '12px',
              }
            }}
          >
            <pre style={{ whiteSpace: 'pre-wrap', margin: 0 }}>
              {getToolCode()}
            </pre>
          </Box>
        </Paper>
      )}

      {result && activeTab === 0 && (
        <Card 
          sx={{ 
            mb: 4, 
            borderRadius: '12px',
            overflow: 'hidden',
            boxShadow: `0 8px 20px ${alpha('#000', 0.12)}`,
            border: `1px solid ${alpha(theme.palette.success.main, 0.3)}`,
          }}
        >
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Results
            </Typography>
            <Divider sx={{ mb: 2 }} />
            
            <Box 
              sx={{ 
                backgroundColor: alpha(theme.palette.success.light, 0.1), 
                p: 2, 
                borderRadius: '10px',
                border: `1px solid ${alpha(theme.palette.success.main, 0.1)}`
              }}
            >
              {typeof result.result === 'object' ? (
                <pre style={{ 
                  whiteSpace: 'pre-wrap', 
                  wordBreak: 'break-word',
                  fontFamily: 'Consolas, Monaco, monospace',
                  fontSize: '0.9rem',
                }}>
                  {JSON.stringify(result.result, null, 2)}
                </pre>
              ) : (
                <Typography variant="body1">{result.result}</Typography>
              )}
            </Box>
            
            {result.execution_time_ms && (
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Execution time: {result.execution_time_ms}ms
              </Typography>
            )}
          </CardContent>
        </Card>
      )}
    </Container>
  );
};

export default ToolDetails; 