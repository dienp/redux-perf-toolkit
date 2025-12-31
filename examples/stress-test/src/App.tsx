import { HeavyList } from './components/HeavyList'
import { StockTicker } from './components/StockTicker'
import { PerformanceLab } from './components/PerformanceLab'
import { Container, Typography, Box, CssBaseline, ThemeProvider, createTheme, Button, Alert, AlertTitle } from '@mui/material'
import CodeIcon from '@mui/icons-material/Code'

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#4CAF50',
    },
    secondary: {
      main: '#2196F3',
    },
  },
});

function App() {
  const openDevTools = () => {
    alert('Press F12 (Windows/Linux) or Cmd+Option+I (Mac) to open DevTools, then click the Console tab.');
  };

  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <Box sx={{ minHeight: '100vh', py: 4, bgcolor: 'background.default' }}>
        <Container maxWidth="lg">
          <Typography
            variant="h3"
            component="h1"
            gutterBottom
            align="center"
            fontWeight="bold"
            sx={{ mb: 1 }}
          >
            Redux Perf Toolkit
          </Typography>
          <Typography variant="subtitle1" align="center" color="text.secondary" paragraph>
            Performance Lab & Stress Test
          </Typography>

          <Alert
            severity="info"
            sx={{ mb: 3 }}
            action={
              <Button
                color="inherit"
                size="small"
                startIcon={<CodeIcon />}
                onClick={openDevTools}
                aria-label="Open browser developer tools"
              >
                Open DevTools
              </Button>
            }
          >
            <AlertTitle>📊 View Results in Console</AlertTitle>
            All performance metrics are logged to the browser console. Click "Open DevTools" or press <kbd>F12</kbd> to view analytics.
          </Alert>

          <PerformanceLab />

          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', md: '1fr 1.5fr' },
              gap: 3
            }}
          >
            <StockTicker />
            <HeavyList />
          </Box>
        </Container>
      </Box>
    </ThemeProvider>
  )
}

export default App
