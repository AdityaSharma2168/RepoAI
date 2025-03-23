import React from 'react';
import { Box, Typography, Paper, Button, Container } from '@mui/material';
import { Link } from 'react-router-dom';
import { Home as HomeIcon } from '@mui/icons-material';

const FallbackPage = ({ title, message, actionText, actionLink, showHomeButton = true }) => {
  return (
    <Container maxWidth="md">
      <Paper 
        elevation={3} 
        sx={{ 
          p: 4, 
          mt: 8, 
          textAlign: 'center',
          borderRadius: 2,
          backgroundColor: '#f9f9f9'
        }}
      >
        <Typography variant="h4" component="h1" gutterBottom color="primary">
          {title || "Mock Mode Active"}
        </Typography>
        
        <Typography variant="body1" paragraph>
          {message || "This feature is not available in demo mode. The backend API is currently being mocked for demonstration purposes."}
        </Typography>
        
        <Typography variant="body2" paragraph sx={{ mt: 2, color: 'text.secondary' }}>
          In a production environment, this would connect to the real API server.
        </Typography>
        
        <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center', gap: 2 }}>
          {actionText && actionLink && (
            <Button 
              variant="contained" 
              color="primary" 
              component={Link} 
              to={actionLink}
            >
              {actionText}
            </Button>
          )}
          
          {showHomeButton && (
            <Button 
              variant="outlined" 
              color="primary" 
              component={Link} 
              to="/" 
              startIcon={<HomeIcon />}
            >
              Return Home
            </Button>
          )}
        </Box>
      </Paper>
    </Container>
  );
};

export default FallbackPage; 