import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Box,
  CircularProgress,
  Alert,
  Divider,
  Chip,
  List,
  ListItem,
  ListItemText,
  IconButton
} from '@mui/material';
import { CloudUpload, Delete, Code } from '@mui/icons-material';
import apiService from '../services/apiService';

const ToolUpload = () => {
  const [files, setFiles] = useState([]);
  const [toolName, setToolName] = useState('');
  const [toolDescription, setToolDescription] = useState('');
  const [category, setCategory] = useState('Text Processing');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    
    // Validate file types
    const acceptedTypes = ['.py', '.js', '.ts', '.cpp', '.h', '.java', '.html', '.css', '.json'];
    const validFiles = selectedFiles.filter(file => {
      const extension = '.' + file.name.split('.').pop().toLowerCase();
      return acceptedTypes.includes(extension);
    });
    
    // Check if any files were rejected
    if (validFiles.length < selectedFiles.length) {
      setError(`Some files were rejected. Only code files are accepted: ${acceptedTypes.join(', ')}`);
    } else {
      setError('');
    }
    
    setFiles(prev => [...prev, ...validFiles]);
  };

  const removeFile = (index) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (files.length === 0) {
      setError('Please upload at least one file');
      return;
    }
    
    if (!toolName.trim()) {
      setError('Please enter a tool name');
      return;
    }
    
    setLoading(true);
    setError('');
    setSuccess('');
    
    try {
      // Call the API service to upload the files
      const result = await apiService.uploadToolFiles(files, toolName, toolDescription, category);
      
      if (result.success) {
        setSuccess(result.message || 'Tool files uploaded successfully and are ready to use');
        
        // Reset form
        setFiles([]);
        setToolName('');
        setToolDescription('');
        
        // Navigate to tools page after 2 seconds
        setTimeout(() => {
          navigate('/tools');
        }, 2000);
      } else {
        setError(result.message || 'Failed to upload tool files');
      }
    } catch (err) {
      setError(err.message || 'An error occurred while uploading the tool files');
      console.error('Error uploading tool files:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Upload New Tool
        </Typography>
        
        <Typography variant="body1" paragraph>
          Extend RepoAI functionality by uploading your own AI tool code files.
        </Typography>
        
        <Divider sx={{ mb: 3 }} />
        
        <Box sx={{ mb: 3, p: 2, bgcolor: '#f9f9f9', borderRadius: 1 }}>
          <Typography variant="body2" color="text.secondary">
            <strong>Note:</strong> Uploaded tools will be immediately available in the AI Tools section.
            Make sure your code is compatible with the RepoAI platform.
          </Typography>
        </Box>
        
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}
        
        {success && (
          <Alert severity="success" sx={{ mb: 3 }}>
            {success}
          </Alert>
        )}
        
        <Box component="form" onSubmit={handleSubmit}>
          <TextField
            label="Tool Name"
            fullWidth
            variant="outlined"
            value={toolName}
            onChange={(e) => setToolName(e.target.value)}
            disabled={loading}
            margin="normal"
            required
            sx={{ mb: 2 }}
          />
          
          <TextField
            label="Tool Description"
            fullWidth
            variant="outlined"
            value={toolDescription}
            onChange={(e) => setToolDescription(e.target.value)}
            disabled={loading}
            margin="normal"
            multiline
            rows={2}
            sx={{ mb: 2 }}
            required
          />
          
          <TextField
            label="Category"
            fullWidth
            variant="outlined"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            disabled={loading}
            margin="normal"
            sx={{ mb: 3 }}
            helperText="e.g., Text Processing, Image Analysis, Code Generation"
            required
          />
          
          <Box sx={{ mb: 3, border: '2px dashed #ccc', borderRadius: 2, p: 2, textAlign: 'center' }}>
            <input
              type="file"
              multiple
              onChange={handleFileChange}
              accept=".py,.js,.ts,.cpp,.h,.java,.html,.css,.json"
              style={{ display: 'none' }}
              id="file-upload"
              disabled={loading}
            />
            <label htmlFor="file-upload">
              <Button
                component="span"
                startIcon={<CloudUpload />}
                variant="contained"
                disabled={loading}
              >
                Select Code Files
              </Button>
            </label>
            <Typography variant="body2" sx={{ mt: 1, color: 'text.secondary' }}>
              Accepted file types: .py, .js, .ts, .cpp, .h, .java, .html, .css, .json
            </Typography>
          </Box>
          
          {files.length > 0 && (
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle1" gutterBottom>
                Selected Files:
              </Typography>
              <List dense>
                {files.map((file, index) => (
                  <ListItem 
                    key={index}
                    secondaryAction={
                      <IconButton edge="end" onClick={() => removeFile(index)} disabled={loading}>
                        <Delete />
                      </IconButton>
                    }
                  >
                    <ListItemText 
                      primary={file.name} 
                      secondary={`${(file.size / 1024).toFixed(2)} KB`} 
                    />
                    <Chip 
                      label={file.name.split('.').pop().toUpperCase()} 
                      size="small" 
                      sx={{ ml: 1 }} 
                      color="primary"
                      variant="outlined"
                    />
                  </ListItem>
                ))}
              </List>
            </Box>
          )}
          
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={loading || files.length === 0 || !toolName.trim() || !toolDescription.trim() || !category.trim()}
              sx={{ py: 1, px: 3 }}
            >
              {loading ? <CircularProgress size={24} /> : 'Upload Tool Files'}
            </Button>
            
            <Button
              variant="outlined"
              color="primary"
              onClick={() => navigate('/tools')}
              disabled={loading}
            >
              Cancel
            </Button>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
};

export default ToolUpload;