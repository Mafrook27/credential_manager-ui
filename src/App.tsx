import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import AppRoutes from './app/routes';
import './styles/global.css';

// Create MUI theme that works with Bootstrap and Tailwind
const theme = createTheme({
  palette: {
    primary: {
      main: '#2962FF',
    },
    secondary: {
      main: '#00BFA5',
    },
  },
  typography: {
    fontFamily: 'Poppins, system-ui, -apple-system, sans-serif',
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
