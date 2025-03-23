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
} from '@mui/material';

// Mock data (replace with API call later)
const mockTools = [
  {
    id: '1',
    name: 'Text Summarizer',
    description: 'Summarize long texts into concise summaries.',
    category: 'Text',
    is_core: true,
  },
  {
    id: '2',
    name: 'Sentiment Analyzer',
    description: 'Analyze the sentiment of text as positive, negative, or neutral.',
    category: 'Text',
    is_core: true,
  },
  {
    id: '3',
    name: 'Text Translator',
    description: 'Translate text between multiple languages.',
    category: 'Text',
    is_core: false,
  },
];

function Dashboard() {
  const [tools, setTools] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // In a real app, fetch data from the API
    // For now, use mock data with a delay to simulate API call
    const fetchTools = async () => {
      try {
        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 1000));
        setTools(mockTools);
      } catch (error) {
        console.error('Error fetching tools:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTools();
  }, []);

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        AI Tools Dashboard
      </Typography>
      <Typography variant="body1" paragraph>
        Explore the available AI tools and plugins to enhance your workflow.
      </Typography>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Grid container spacing={3} sx={{ mt: 2 }}>
          {tools.map((tool) => (
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
                  <Typography variant="caption" color="text.secondary">
                    Category: {tool.category}
                  </Typography>
                </CardContent>
                <Divider />
                <CardActions>
                  <Button size="small" component={Link} to={`/tools/${tool.id}`}>
                    View Details
                  </Button>
                  <Button size="small" component={Link} to={`/tools/${tool.id}/use`}>
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

export default Dashboard; 