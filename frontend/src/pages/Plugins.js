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
  Paper,
  Snackbar,
} from '@mui/material';
import apiService from '../services/apiService';

function Plugins() {
  const [plugins, setPlugins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusMessage, setStatusMessage] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  const fetchPlugins = async () => {
    try {
      setLoading(true);
      const pluginsData = await apiService.getPlugins();
      setPlugins(pluginsData);
      setError('');
    } catch (error) {
      console.error('Error fetching plugins:', error);
      setError('Failed to load plugins. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlugins();
  }, []);

  const handleToggleStatus = async (plugin) => {
    setIsUpdating(true);
    try {
      const newStatus = plugin.is_active || plugin.status === 'active' ? 'inactive' : 'active';
      // In a real app, we would call an API to update the plugin status
      // For mock data, we'll update it locally
      await apiService.updatePluginStatus(plugin.id, newStatus);
      
      // Update the local state to reflect the change immediately
      setPlugins(plugins.map(p => 
        p.id === plugin.id 
          ? { ...p, status: newStatus, is_active: newStatus === 'active' } 
          : p
      ));
      
      setStatusMessage(`Plugin ${plugin.name} is now ${newStatus}`);
    } catch (error) {
      console.error('Error updating plugin status:', error);
      setStatusMessage(`Failed to update plugin status: ${error.message || 'Unknown error'}`);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCloseSnackbar = () => {
    setStatusMessage('');
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'success';
      case 'inactive':
        return 'warning';
      case 'pending':
        return 'info';
      default:
        return 'default';
    }
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Plugins
      </Typography>
      <Typography variant="body1" paragraph>
        Browse and manage available plugins to extend RepoAI's functionality.
      </Typography>

      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'flex-end' }}>
        <Button 
          variant="contained" 
          color="primary" 
          component={Link} 
          to="/plugins/upload"
        >
          Upload New Plugin
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Snackbar
        open={!!statusMessage}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        message={statusMessage}
      />

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress />
        </Box>
      ) : plugins.length === 0 ? (
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="body1">
            No plugins found. Upload a new plugin to get started.
          </Typography>
          <Button 
            variant="contained" 
            color="primary" 
            component={Link} 
            to="/plugins/upload"
            sx={{ mt: 2 }}
          >
            Upload Plugin
          </Button>
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {plugins.map((plugin) => (
            <Grid item xs={12} sm={6} md={4} key={plugin.id}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <CardContent sx={{ flexGrow: 1 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                    <Typography variant="h6" component="div">
                      {plugin.name}
                    </Typography>
                    <Chip 
                      label={plugin.status || (plugin.is_active ? 'Active' : 'Inactive')}
                      size="small"
                      color={getStatusColor(plugin.status || (plugin.is_active ? 'active' : 'inactive'))}
                    />
                  </Box>
                  <Typography variant="body2" color="text.secondary" paragraph>
                    {plugin.description}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" display="block">
                    Version: {plugin.version}
                  </Typography>
                  {plugin.repository_url && (
                    <Typography variant="caption" color="text.secondary" display="block" sx={{ wordBreak: 'break-all' }}>
                      Repository: {plugin.repository_url}
                    </Typography>
                  )}
                </CardContent>
                <Divider />
                <CardActions>
                  <Button 
                    size="small" 
                    color="primary"
                    component={Link}
                    to={`/tools/${plugin.tool_id || plugin.id}`}
                    disabled={!plugin.is_active && plugin.status !== 'active'}
                  >
                    Use Plugin
                  </Button>
                  <Button
                    size="small"
                    color={plugin.is_active || plugin.status === 'active' ? 'warning' : 'success'}
                    disabled={plugin.status === 'pending' || isUpdating}
                    onClick={() => handleToggleStatus(plugin)}
                  >
                    {plugin.is_active || plugin.status === 'active' ? 'Disable' : 'Enable'}
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

export default Plugins; 