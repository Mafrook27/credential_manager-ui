import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import AppRoutes from './app/routes';
import './styles/global.css';

// Create MUI theme that works with Bootstrap and Tailwind
// Explicitly set to light mode and prevent dark mode from system preferences
const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#2962FF',
    },
    secondary: {
      main: '#00BFA5',
    },
    background: {
      default: '#ffffff',
      paper: '#ffffff',
    },
    text: {
      primary: '#213547',
      secondary: '#666666',
    },
  },
  typography: {
    fontFamily: 'Poppins, system-ui, -apple-system, sans-serif',
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          colorScheme: 'light',
          backgroundColor: '#ffffff',
          color: '#213547',
        },
        html: {
          colorScheme: 'light',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          colorScheme: 'light',
          forcedColorAdjust: 'none',
        },
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          colorScheme: 'light',
          forcedColorAdjust: 'none',
        },
      },
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter  future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true
      }}>
        <AppRoutes />
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
