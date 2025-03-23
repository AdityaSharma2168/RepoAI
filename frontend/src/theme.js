import { createTheme, alpha } from '@mui/material/styles';

const glowEffect = (color, amount = 0.5) => `0 0 15px ${alpha(color, amount)}, 0 0 30px ${alpha(color, 0.3)}`;

const futuristicTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#4cc9f0',
      light: '#80dfff',
      dark: '#0077c2',
      contrastText: '#000',
    },
    secondary: {
      main: '#f72585',
      light: '#ff5db8',
      dark: '#c20056',
      contrastText: '#fff',
    },
    background: {
      default: '#0f111a',
      paper: '#171c2c',
    },
    success: {
      main: '#41ead4',
      light: '#67ffff',
      dark: '#00b7a3',
    },
    error: {
      main: '#ff4d6d',
      light: '#ff7f9d',
      dark: '#c30041',
    },
    warning: {
      main: '#ffca3a',
      light: '#fffc6b',
      dark: '#c79a00',
    },
    info: {
      main: '#8338ec',
      light: '#b568ff',
      dark: '#4c00b9',
    },
    text: {
      primary: '#e0e0ff',
      secondary: '#b0b0d0',
      disabled: 'rgba(255, 255, 255, 0.5)',
    },
    divider: 'rgba(130, 130, 200, 0.12)',
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 700,
      letterSpacing: '-0.02em',
    },
    h2: {
      fontWeight: 700,
      letterSpacing: '-0.01em',
    },
    h3: {
      fontWeight: 600,
    },
    h4: {
      fontWeight: 600,
    },
    h5: {
      fontWeight: 500,
    },
    h6: {
      fontWeight: 500,
    },
    button: {
      fontWeight: 600,
      textTransform: 'none',
      letterSpacing: '0.02em',
    },
  },
  shape: {
    borderRadius: 10,
  },
  shadows: [
    'none',
    `0 2px 5px 0 ${alpha('#000000', 0.16)}`,
    `0 3px 8px 0 ${alpha('#000000', 0.2)}`,
    `0 4px 12px 0 ${alpha('#000000', 0.24)}`,
    `0 6px 16px 0 ${alpha('#000000', 0.28)}`,
    `0 8px 20px 0 ${alpha('#000000', 0.32)}`,
    `0 10px 24px 0 ${alpha('#000000', 0.36)}`,
    `0 12px 28px 0 ${alpha('#000000', 0.4)}`,
    `0 14px 32px 0 ${alpha('#000000', 0.44)}`,
    `0 16px 36px 0 ${alpha('#000000', 0.48)}`,
    `0 18px 40px 0 ${alpha('#000000', 0.52)}`,
    `0 20px 44px 0 ${alpha('#000000', 0.56)}`,
    `0 22px 48px 0 ${alpha('#000000', 0.6)}`,
    `0 24px 52px 0 ${alpha('#000000', 0.64)}`,
    `0 26px 56px 0 ${alpha('#000000', 0.68)}`,
    `0 28px 60px 0 ${alpha('#000000', 0.72)}`,
    `0 30px 64px 0 ${alpha('#000000', 0.76)}`,
    `0 32px 68px 0 ${alpha('#000000', 0.8)}`,
    `0 34px 72px 0 ${alpha('#000000', 0.84)}`,
    `0 36px 76px 0 ${alpha('#000000', 0.88)}`,
    `0 38px 80px 0 ${alpha('#000000', 0.92)}`,
    `0 40px 84px 0 ${alpha('#000000', 0.96)}`,
    `0 42px 88px 0 ${alpha('#000000', 1)}`,
    `0 44px 92px 0 ${alpha('#000000', 1)}`,
    `0 46px 96px 0 ${alpha('#000000', 1)}`,
  ],
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundImage: 'radial-gradient(circle at 30% 10%, rgba(76, 201, 240, 0.05), transparent 30%), radial-gradient(circle at 80% 40%, rgba(114, 9, 183, 0.05), transparent 60%), radial-gradient(circle at 10% 80%, rgba(247, 37, 133, 0.05), transparent 50%)',
          backgroundAttachment: 'fixed',
          scrollbarWidth: 'thin',
          scrollbarColor: '#373a47 #171c2c',
          '&::-webkit-scrollbar': {
            width: '8px',
            height: '8px',
          },
          '&::-webkit-scrollbar-track': {
            background: '#171c2c',
          },
          '&::-webkit-scrollbar-thumb': {
            background: '#373a47',
            borderRadius: '4px',
            '&:hover': {
              background: '#4f5163',
            },
          },
        },
      },
    },
    MuiButton: {
      defaultProps: {
        disableElevation: true,
      },
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: 'none',
          padding: '10px 16px',
          transition: 'all 0.2s ease-in-out',
        },
        contained: {
          '&.MuiButton-containedPrimary': {
            background: `linear-gradient(135deg, #4cc9f0, #0077c2)`,
            '&:hover': {
              boxShadow: glowEffect('#4cc9f0'),
            },
          },
          '&.MuiButton-containedSecondary': {
            background: `linear-gradient(135deg, #f72585, #c20056)`,
            '&:hover': {
              boxShadow: glowEffect('#f72585'),
            },
          },
        },
        outlined: {
          borderWidth: '2px',
          '&:hover': {
            borderWidth: '2px',
          },
          '&.MuiButton-outlinedPrimary': {
            borderColor: '#4cc9f0',
            '&:hover': {
              boxShadow: glowEffect('#4cc9f0', 0.3),
            },
          },
          '&.MuiButton-outlinedSecondary': {
            borderColor: '#f72585',
            '&:hover': {
              boxShadow: glowEffect('#f72585', 0.3),
            },
          },
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundImage: 'linear-gradient(to right, rgba(23, 28, 44, 0.95), rgba(17, 20, 35, 0.95))',
          backdropFilter: 'blur(10px)',
          boxShadow: `0 4px 20px ${alpha('#000000', 0.5)}`,
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          backgroundImage: 'linear-gradient(to bottom, rgba(23, 28, 44, 0.98), rgba(17, 20, 35, 0.98))',
          backdropFilter: 'blur(10px)',
          borderRight: `1px solid ${alpha('#4cc9f0', 0.1)}`,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundImage: 'linear-gradient(135deg, rgba(23, 28, 44, 0.9), rgba(17, 20, 35, 0.9))',
          backdropFilter: 'blur(10px)',
          transition: 'all 0.3s ease-in-out',
          '&:hover': {
            transform: 'translateY(-5px)',
            boxShadow: `0 10px 30px ${alpha('#000000', 0.4)}`,
            '&::before': {
              opacity: 1,
            },
          },
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '3px',
            background: 'linear-gradient(to right, #4cc9f0, #f72585)',
            opacity: 0,
            transition: 'opacity 0.3s ease-in-out',
            borderTopLeftRadius: 'inherit',
            borderTopRightRadius: 'inherit',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'linear-gradient(135deg, rgba(23, 28, 44, 0.8), rgba(17, 20, 35, 0.8))',
          backdropFilter: 'blur(10px)',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            transition: 'all 0.2s ease-in-out',
            '&.Mui-focused': {
              '& .MuiOutlinedInput-notchedOutline': {
                borderColor: '#4cc9f0',
                borderWidth: '2px',
                boxShadow: `0 0 10px ${alpha('#4cc9f0', 0.2)}`,
              },
            },
            '&:hover .MuiOutlinedInput-notchedOutline': {
              borderColor: alpha('#4cc9f0', 0.7),
            },
          },
        },
      },
    },
    MuiListItem: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          '&.Mui-selected': {
            backgroundColor: alpha('#4cc9f0', 0.15),
            '&:hover': {
              backgroundColor: alpha('#4cc9f0', 0.2),
            },
            '&::before': {
              content: '""',
              position: 'absolute',
              left: 0,
              top: '50%',
              transform: 'translateY(-50%)',
              height: '60%',
              width: '3px',
              background: 'linear-gradient(to bottom, #4cc9f0, #0077c2)',
              borderRadius: '0 4px 4px 0',
            },
          },
        },
      },
    },
    MuiTabs: {
      styleOverrides: {
        indicator: {
          height: '3px',
          borderRadius: '3px 3px 0 0',
          background: 'linear-gradient(to right, #4cc9f0, #0077c2)',
        },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          transition: 'all 0.2s ease-in-out',
          '&.Mui-selected': {
            color: '#4cc9f0',
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: '6px',
        },
        colorPrimary: {
          background: `linear-gradient(135deg, #4cc9f0, #0077c2)`,
        },
        colorSecondary: {
          background: `linear-gradient(135deg, #f72585, #c20056)`,
        },
      },
    },
  },
});

export default futuristicTheme; 