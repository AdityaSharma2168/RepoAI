import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  CardHeader,
  Avatar,
  Divider,
  Tooltip,
  Paper,
  Button,
  CircularProgress,
  Alert,
  useTheme,
  Chip,
} from '@mui/material';
import { 
  TrendingUp, 
  Code, 
  Extension, 
  Analytics, 
  BarChart,
  History,
  Science as ScienceIcon,
  Code as CodeIcon,
  ArrowForward as ArrowForwardIcon,
} from '@mui/icons-material';
import apiService from '../services/apiService';

// Helper functions for contribution chart
const getDaysInYear = () => {
  const now = new Date();
  const year = now.getFullYear();
  const isLeapYear = (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
  return isLeapYear ? 366 : 365;
};

const generateContributionData = () => {
  // Get the last 365 days
  const days = getDaysInYear();
  const data = [];
  const today = new Date();
  
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);
    
    // Generate random contribution count (in a real app, this would come from API)
    // More recent days have higher chance of contributions
    const recencyFactor = Math.min(1, (days - i) / 60);
    const randomFactor = Math.random() * 0.8 + 0.2;
    const count = Math.floor(Math.max(0, 5 * recencyFactor * randomFactor * Math.random()));
    
    data.push({
      date: date,
      count: count,
      formattedDate: date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric', 
        year: 'numeric' 
      })
    });
  }
  
  return data;
};

const getContributionColor = (count, theme) => {
  if (count === 0) return theme.palette.mode === 'dark' ? '#1e2937' : '#ebedf0';
  if (count < 2) return theme.palette.success.light;
  if (count < 4) return theme.palette.success.main;
  if (count < 6) return theme.palette.success.dark;
  return '#196127'; // Very dark green for highest contributions
};

const getMonthLabels = () => {
  const months = [];
  const today = new Date();
  const startDate = new Date(today);
  startDate.setDate(today.getDate() - 364); // Start roughly a year ago
  
  // Create an array of months that covers our contribution period
  for (let i = 0; i < 12; i++) {
    const date = new Date(startDate);
    date.setMonth(startDate.getMonth() + i);
    if (date > today) break;
    months.push(date.toLocaleDateString('en-US', { month: 'short' }));
  }
  
  return months;
};

function ContributionChart() {
  const theme = useTheme();
  const [contributions, setContributions] = useState([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    // In a real app, we would fetch this data from the backend
    // For now, we generate mock data
    const data = generateContributionData();
    setContributions(data);
    setLoading(false);
  }, []);
  
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }
  
  // Calculate some stats
  const totalContributions = contributions.reduce((sum, day) => sum + day.count, 0);
  const streakDays = contributions
    .slice()
    .reverse()
    .findIndex(day => day.count === 0);
  const currentStreak = streakDays === -1 ? contributions.length : streakDays;
  
  // Group by week for display (7 days per row)
  const weeks = [];
  for (let i = 0; i < contributions.length; i += 7) {
    weeks.push(contributions.slice(i, i + 7));
  }
  
  // Get month labels
  const monthLabels = getMonthLabels();
  
  return (
    <Card sx={{ mb: 4 }}>
      <CardHeader 
        title="Your Contribution Activity" 
        subheader={`${totalContributions} contributions in the last year`}
      />
      <CardContent>
        <Box sx={{ mb: 2 }}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            <strong>Current streak:</strong> {currentStreak} days
          </Typography>
        </Box>
      
        <Box sx={{ overflowX: 'auto', pb: 2 }}>
          {/* Month labels */}
          <Box sx={{ display: 'flex', ml: '20px', mb: '4px' }}>
            {monthLabels.map((month, i) => (
              <Typography
                key={i}
                variant="caption"
                sx={{
                  width: '33px', // Approximately 4 weeks per month
                  textAlign: 'center',
                  whiteSpace: 'nowrap',
                  flex: 1
                }}
              >
                {month}
              </Typography>
            ))}
          </Box>
          
          {/* Day labels (shown on y-axis) */}
          <Box sx={{ display: 'flex' }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', mr: '4px', mt: '10px' }}>
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, i) => (
                <Typography
                  key={i}
                  variant="caption"
                  sx={{
                    height: '10px',
                    lineHeight: '10px',
                    textAlign: 'right',
                    mb: '1px',
                    mr: '4px',
                    fontSize: '9px',
                    visibility: i % 2 === 0 ? 'visible' : 'hidden' // Show every other day label
                  }}
                >
                  {day}
                </Typography>
              ))}
            </Box>
            
            {/* Contribution grid */}
            <Box sx={{ display: 'flex' }}>
              {weeks.map((week, weekIndex) => (
                <Box key={weekIndex} sx={{ display: 'flex', flexDirection: 'column', mr: '1px' }}>
                  {week.map((day, dayIndex) => (
                    <Tooltip
                      key={dayIndex}
                      title={`${day.count} contributions on ${day.formattedDate}`}
                      arrow
                    >
                      <Box
                        sx={{
                          width: '10px',
                          height: '10px',
                          m: '1px',
                          borderRadius: '2px',
                          bgcolor: getContributionColor(day.count, theme),
                          '&:hover': {
                            border: '1px solid rgba(0,0,0,0.3)',
                            margin: '0px', // Compensate for border
                          }
                        }}
                      />
                    </Tooltip>
                  ))}
                </Box>
              ))}
            </Box>
          </Box>
          
          {/* Legend */}
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', mt: 2 }}>
            <Typography variant="caption" sx={{ mr: 1 }}>Less</Typography>
            {[0, 1, 3, 5, 7].map((count) => (
              <Box
                key={count}
                sx={{
                  width: '10px',
                  height: '10px',
                  m: '1px',
                  borderRadius: '2px',
                  bgcolor: getContributionColor(count, theme),
                }}
              />
            ))}
            <Typography variant="caption" sx={{ ml: 1 }}>More</Typography>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}

function ActivityCard({ title, icon, value, description, color }) {
  const Icon = icon;
  return (
    <Card>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <Avatar sx={{ bgcolor: color, mr: 2 }}>
            <Icon />
          </Avatar>
          <Typography variant="h6">{title}</Typography>
        </Box>
        <Typography variant="h4" sx={{ my: 2 }}>{value}</Typography>
        <Typography variant="body2" color="text.secondary">{description}</Typography>
      </CardContent>
    </Card>
  );
}

function Dashboard() {
  const [user, setUser] = useState(null);
  const [recentTools, setRecentTools] = useState([]);
  const [recommendedTools, setRecommendedTools] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        const userData = await apiService.getCurrentUser();
        setUser(userData);
        
        // In a real app, we would fetch recent tools from API
        // For now, we'll use mock data
        const toolsData = await apiService.getTools();
        setRecentTools(toolsData.slice(0, 3));
        setRecommendedTools(toolsData.slice(0, 3));
        
        setError('');
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        setError('Failed to load your dashboard. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 3 }}>
        {error}
      </Alert>
    );
  }

  return (
    <Box>
      {/* Welcome Section */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          Welcome back, {user?.name || 'User'}
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Here's an overview of your activity and recommended tools.
        </Typography>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <ActivityCard
            title="Total Tools Used"
            icon={Analytics}
            value="42"
            description="Across 7 different categories"
            color="#1976d2"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <ActivityCard
            title="Text Analyzed"
            icon={BarChart}
            value="128K"
            description="Words processed this month"
            color="#2e7d32"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <ActivityCard
            title="AI Models Used"
            icon={Code}
            value="8"
            description="Including 2 custom models"
            color="#ed6c02"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <ActivityCard
            title="Plugins Installed"
            icon={Extension}
            value="5"
            description="3 active, 2 pending approval"
            color="#9c27b0"
          />
        </Grid>
      </Grid>

      {/* Contribution Chart */}
      <ContributionChart />

      {/* Recent Activity & Quick Access */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardHeader title="Recent Tools" />
            <Divider />
            <CardContent>
              {recentTools.length === 0 ? (
                <Typography variant="body2" color="text.secondary">
                  You haven't used any tools recently.
                </Typography>
              ) : (
                recentTools.map((tool, index) => (
                  <Box key={tool.id} sx={{ mb: index < recentTools.length - 1 ? 2 : 0 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <Avatar sx={{ mr: 2, bgcolor: tool.is_core ? 'primary.main' : 'secondary.main' }}>
                        <History />
                      </Avatar>
                      <Box>
                        <Typography variant="subtitle1">{tool.name}</Typography>
                        <Typography variant="body2" color="text.secondary">
                          Used 3 days ago
                        </Typography>
                      </Box>
                    </Box>
                    {index < recentTools.length - 1 && <Divider sx={{ my: 1 }} />}
                  </Box>
                ))
              )}
              <Box sx={{ mt: 2, textAlign: 'right' }}>
                <Button component={Link} to="/tools">
                  View All Tools
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        {recommendedTools.length > 0 && (
          <Grid item xs={12} md={4}>
            <Paper 
              elevation={3} 
              sx={{ 
                p: 3, 
                height: '100%',
                background: 'linear-gradient(135deg, rgba(23, 28, 44, 0.8), rgba(17, 20, 35, 0.9))',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(76, 201, 240, 0.1)',
                borderRadius: '12px',
                position: 'relative',
                overflow: 'hidden',
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  background: 'radial-gradient(circle at top right, rgba(76, 201, 240, 0.08), transparent 70%)',
                  pointerEvents: 'none',
                }
              }}
            >
              <Typography variant="h5" gutterBottom sx={{ 
                fontWeight: 600,
                background: 'linear-gradient(90deg, #4cc9f0, #f72585)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}>
                Recommended for You
              </Typography>
              <Box sx={{ mt: 2 }}>
                {recommendedTools.map(tool => (
                  <Box key={tool.id} sx={{ mb: 3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <Box
                        sx={{
                          mr: 2,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          width: 40,
                          height: 40,
                          backgroundColor: 'rgba(76, 201, 240, 0.15)',
                          borderRadius: '50%',
                        }}
                      >
                        {tool.category === 'AI' ? (
                          <ScienceIcon />
                        ) : (
                          <CodeIcon />
                        )}
                      </Box>
                      <Typography variant="h6" sx={{ fontWeight: 500 }}>
                        {tool.name}
                      </Typography>
                    </Box>
                    <Typography variant="body2" sx={{ ml: 7, mb: 2 }}>
                      {tool.description}
                    </Typography>
                    <Box sx={{ ml: 7, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                      <Chip 
                        label={tool.category} 
                        size="small" 
                        color="primary" 
                        sx={{ borderRadius: '6px' }} 
                      />
                      <Chip 
                        label="New tool available" 
                        size="small" 
                        color="secondary" 
                        sx={{ borderRadius: '6px' }} 
                      />
                    </Box>
                    <Box sx={{ ml: 7, mt: 2 }}>
                      <Button
                        variant="contained"
                        component={Link}
                        to={`/tools/upload`}
                        size="small"
                        endIcon={<ArrowForwardIcon />}
                        sx={{ 
                          borderRadius: '8px',
                          background: 'linear-gradient(45deg, #4cc9f0, #4361ee)',
                          boxShadow: '0 4px 10px rgba(76, 201, 240, 0.3)',
                          '&:hover': {
                            boxShadow: '0 6px 14px rgba(76, 201, 240, 0.4)',
                          }
                        }}
                      >
                        Upload new tool
                      </Button>
                    </Box>
                  </Box>
                ))}
              </Box>
            </Paper>
          </Grid>
        )}
      </Grid>
    </Box>
  );
}

export default Dashboard; 