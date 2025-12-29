import { HeavyList } from './components/HeavyList'
import { StockTicker } from './components/StockTicker'
import { PerfDashboard } from '@dienp/redux-perf-core'
import { Container, Typography, Box, CssBaseline, ThemeProvider, createTheme } from '@mui/material'

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
  },
});

function App() {
  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <Box sx={{ minHeight: '100vh', py: 4, bgcolor: 'background.default' }}>
        <PerfDashboard />

        <Container maxWidth="md">
          <Typography variant="h3" component="h1" gutterBottom align="center" fontWeight="bold">
            Redux Performance Toolkit
          </Typography>
          <Typography variant="subtitle1" align="center" color="text.secondary" paragraph>
            Stress Test Demo App
          </Typography>

          <Box sx={{ mb: 4, p: 2, border: '1px solid', borderColor: 'warning.main', borderRadius: 1, bgcolor: 'warning.dark', color: 'warning.contrastText' }}>
            <Typography variant="body1">
              <strong>Warning:</strong> The "Start Ticker" button fires actions every 50ms.
              Combined with the "Heavy List" (5000+ items), this will intentionally cause UI lag to demonstrate tracking.
            </Typography>
          </Box>

          <StockTicker />
          <HeavyList />
        </Container>
      </Box>
    </ThemeProvider>
  )
}

export default App
