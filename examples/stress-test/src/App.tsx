import { HeavyList } from './components/HeavyList'
import { StockTicker } from './components/StockTicker'
import { PerformanceLab } from './components/PerformanceLab'
import { Container, Typography, Box, CssBaseline, ThemeProvider, createTheme } from '@mui/material'

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
  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <Box sx={{ minHeight: '100vh', py: 4, bgcolor: 'background.default' }}>
        <Container maxWidth="md">
          <Typography variant="h3" component="h1" gutterBottom align="center" fontWeight="bold">
            Redux Perf Toolkit
          </Typography>
          <Typography variant="subtitle1" align="center" color="text.secondary" paragraph>
            Performance Lab & Stress Test
          </Typography>

          <Box sx={{ mb: 4, p: 2, border: '1px solid', borderColor: '#444', borderRadius: 1, bgcolor: '#1a1a1a' }}>
            <Typography variant="body2" color="text.secondary">
              Welcome to the Redux Performance Lab. Use the controls below to simulate real-world performance bottlenecks.
              <strong> All metrics are logged to the browser console.</strong> Open DevTools (F12) to view the analytics.
            </Typography>
          </Box>

          <PerformanceLab />

          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: 3 }}>
            <StockTicker />
            <HeavyList />
          </Box>
        </Container>
      </Box>
    </ThemeProvider>
  )
}

export default App
