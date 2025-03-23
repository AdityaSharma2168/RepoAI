import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Divider,
  Chip,
  CircularProgress,
  Alert,
  TextField,
  InputAdornment,
  IconButton,
} from '@mui/material';
import { Search as SearchIcon, Clear as ClearIcon } from '@mui/icons-material';
import apiService from '../services/apiService';

function Tools() {
  const [tools, setTools] = useState([]);
  const [filteredTools, setFilteredTools] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchTools = async () => {
      try {
        setLoading(true);
        const toolsData = await apiService.getTools();
        setTools(toolsData);
        setFilteredTools(toolsData);
        setError('');
      } catch (error) {
        console.error('Error fetching tools:', error);
        setError('Failed to load tools. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchTools();
  }, []);

  // Filter tools based on search term
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredTools(tools);
      return;
    }

    const lowerSearchTerm = searchTerm.toLowerCase();
    const filtered = tools.filter(
      (tool) =>
        tool.name.toLowerCase().includes(lowerSearchTerm) ||
        tool.description.toLowerCase().includes(lowerSearchTerm) ||
        tool.category.toLowerCase().includes(lowerSearchTerm)
    );
    setFilteredTools(filtered);
  }, [searchTerm, tools]);

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const clearSearch = () => {
    setSearchTerm('');
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        AI Tools
      </Typography>
      <Typography variant="body1" paragraph>
        Browse all available AI tools and plugins to find what you need.
      </Typography>

      <Box sx={{ mb: 4 }}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Search tools by name, description, or category..."
          value={searchTerm}
          onChange={handleSearchChange}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
            endAdornment: searchTerm && (
              <InputAdornment position="end">
                <IconButton onClick={clearSearch} edge="end" size="small">
                  <ClearIcon />
                </IconButton>
              </InputAdornment>
            ),
          }}
        />
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress />
        </Box>
      ) : filteredTools.length === 0 ? (
        <Alert severity="info">
          No tools found matching your search criteria.
        </Alert>
      ) : (
        <Grid container spacing={3}>
          {filteredTools.map((tool) => (
            <Grid item xs={12} sm={6} md={4} key={tool.id}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography variant="h6" component="div" gutterBottom>
                    {tool.name}
                    {tool.is_core ? (
                      <Chip
                        label="Core"
                        size="small"
                        color="primary"
                        sx={{ ml: 1 }}
                      />
                    ) : (
                      <Chip
                        label="Plugin"
                        size="small"
                        color="secondary"
                        sx={{ ml: 1 }}
                      />
                    )}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" paragraph>
                    {tool.description}
                  </Typography>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="caption" color="text.secondary">
                      Category: {tool.category}
                    </Typography>
                    {tool.version && (
                      <Typography variant="caption" color="text.secondary">
                        v{tool.version}
                      </Typography>
                    )}
                  </Box>
                </CardContent>
                <Divider />
                <CardActions>
                  <Button 
                    size="small" 
                    variant="contained"
                    color="primary"
                    component={Link} 
                    to={`/tools/${tool.id}`}
                    fullWidth
                  >
                    Use Tool
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
}

export default Tools; 