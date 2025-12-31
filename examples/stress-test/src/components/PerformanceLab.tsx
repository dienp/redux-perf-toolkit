import React, { useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Box, Button, Typography, Stack, Card, CardContent, Divider, Chip, Alert, Snackbar } from '@mui/material';
import type { RootState, AppDispatch } from '../store';
import { generateLargeState, clearLargeState, toggleSlowSelector, incrementDispatchStorm } from '../features/lab/labSlice';
import { perfAnalytics } from '@dynlabs/redux-perf-core';

export const PerformanceLab: React.FC = () => {
    const dispatch = useDispatch<AppDispatch>();
    const { dummyData, slowSelectorActive } = useSelector((state: RootState) => state.lab);
    const [snackbar, setSnackbar] = React.useState<{ open: boolean; message: string; severity: 'success' | 'info' | 'warning' }>({
        open: false,
        message: '',
        severity: 'success'
    });

    // Simulated slow selector
    const processedData = useSelector((state: RootState) => {
        if (!state.lab.slowSelectorActive) return null;

        // Artificial delay
        const start = performance.now();
        while (performance.now() - start < 20) {
            // Block for 20ms
        }
        return `Processed ${state.lab.dummyData.length} items`;
    });

    const showNotification = (message: string, severity: 'success' | 'info' | 'warning' = 'success') => {
        setSnackbar({ open: true, message, severity });
    };

    const handleDispatchStorm = () => {
        for (let i = 0; i < 100; i++) {
            dispatch(incrementDispatchStorm());
        }
        showNotification('Dispatched 100 actions! Check console for performance metrics.', 'success');
    };

    const handleGenerateState = (mb: number) => {
        dispatch(generateLargeState(mb));
        showNotification(`Added ${mb}MB to store. Check console for memory warnings.`, 'info');
    };

    const handleClearState = () => {
        dispatch(clearLargeState());
        showNotification('Store cleared!', 'success');
    };

    const stateSizeMB = useMemo(() => {
        const str = JSON.stringify(dummyData);
        return (new TextEncoder().encode(str).length / (1024 * 1024)).toFixed(2);
    }, [dummyData]);

    const [trackingStatus, setTrackingStatus] = React.useState(perfAnalytics.getIsTracking());

    const toggleTracking = () => {
        if (perfAnalytics.getIsTracking()) {
            perfAnalytics.stopTracking();
            showNotification('Performance tracking paused', 'info');
        } else {
            perfAnalytics.startTracking();
            showNotification('Performance tracking resumed', 'success');
        }
        setTrackingStatus(perfAnalytics.getIsTracking());
    };

    const handleReset = () => {
        perfAnalytics.reset();
        showNotification('All metrics cleared!', 'success');
    };

    const handleLogSummary = () => {
        perfAnalytics.logSummary();
        showNotification('Performance summary logged to console!', 'success');
    };

    return (
        <>
            <Card sx={{ mb: 4, border: '1px solid #444' }}>
                <CardContent>
                    <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                        <Typography variant="h5" fontWeight="bold" component="h2">
                            🧪 Performance Lab
                        </Typography>
                        <Chip
                            label={trackingStatus ? 'Tracking Active' : 'Tracking Paused'}
                            color={trackingStatus ? 'success' : 'default'}
                            size="small"
                            variant="outlined"
                            aria-label={`Performance tracking is currently ${trackingStatus ? 'active' : 'paused'}`}
                        />
                    </Box>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        Use these tools to stress test Redux and view analytics in the console.
                    </Typography>

                    <Divider sx={{ my: 2 }} />

                    <Stack spacing={3}>
                        <Box role="region" aria-labelledby="ram-stress-heading">
                            <Typography id="ram-stress-heading" variant="subtitle1" fontWeight="bold" gutterBottom>
                                💾 RAM: Large State Stress
                            </Typography>
                            <Box sx={{ mb: 1 }}>
                                <Typography variant="body2" component="span">
                                    Add large amounts of dummy data to the store.
                                </Typography>
                                <Chip
                                    size="small"
                                    label={`Current: ${stateSizeMB} MB`}
                                    color={Number(stateSizeMB) > 5 ? 'error' : 'default'}
                                    sx={{ ml: 1 }}
                                    aria-label={`Current store size is ${stateSizeMB} megabytes`}
                                />
                            </Box>
                            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                                <Button
                                    variant="outlined"
                                    color="primary"
                                    onClick={() => handleGenerateState(1)}
                                    aria-label="Add 1 megabyte of data to store"
                                >
                                    +1 MB
                                </Button>
                                <Button
                                    variant="outlined"
                                    color="primary"
                                    onClick={() => handleGenerateState(5)}
                                    aria-label="Add 5 megabytes of data to store"
                                >
                                    +5 MB
                                </Button>
                                <Button
                                    variant="outlined"
                                    color="primary"
                                    onClick={() => handleGenerateState(10)}
                                    aria-label="Add 10 megabytes of data to store"
                                >
                                    +10 MB
                                </Button>
                                <Button
                                    variant="outlined"
                                    color="error"
                                    onClick={handleClearState}
                                    aria-label="Clear all data from store"
                                >
                                    Clear State
                                </Button>
                            </Stack>
                        </Box>

                        <Box role="region" aria-labelledby="cpu-stress-heading">
                            <Typography id="cpu-stress-heading" variant="subtitle1" fontWeight="bold" gutterBottom>
                                ⚡ CPU: Slow Selectors
                            </Typography>
                            <Typography variant="body2" paragraph>
                                Toggle a selector that artificially blocks the main thread for 20ms.
                            </Typography>
                            <Button
                                variant="contained"
                                color={slowSelectorActive ? 'error' : 'success'}
                                onClick={() => dispatch(toggleSlowSelector())}
                                aria-label={slowSelectorActive ? 'Disable slow selector' : 'Enable slow selector'}
                                aria-pressed={slowSelectorActive}
                            >
                                {slowSelectorActive ? 'Disable Slow Selector' : 'Enable Slow Selector'}
                            </Button>
                            {slowSelectorActive && (
                                <Alert severity="warning" sx={{ mt: 1 }} role="status" aria-live="polite">
                                    Heavy workload active: {processedData}
                                </Alert>
                            )}
                        </Box>

                        <Box role="region" aria-labelledby="middleware-stress-heading">
                            <Typography id="middleware-stress-heading" variant="subtitle1" fontWeight="bold" gutterBottom>
                                🔄 Middleware: Dispatch Storm
                            </Typography>
                            <Typography variant="body2" paragraph>
                                Dispatch 100 actions in a single loop to test middleware overhead.
                            </Typography>
                            <Button
                                variant="outlined"
                                color="warning"
                                onClick={handleDispatchStorm}
                                aria-label="Dispatch 100 actions to test middleware performance"
                            >
                                Run Dispatch Storm
                            </Button>
                        </Box>

                        <Divider />

                        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                            <Button
                                variant="contained"
                                size="large"
                                color="info"
                                fullWidth
                                onClick={handleLogSummary}
                                sx={{ py: 1.5, fontWeight: 'bold' }}
                                aria-label="Log performance summary to browser console"
                            >
                                📊 Log Summary
                            </Button>
                            <Button
                                variant="outlined"
                                size="large"
                                color={trackingStatus ? "error" : "success"}
                                fullWidth
                                onClick={toggleTracking}
                                sx={{ py: 1.5, fontWeight: 'bold' }}
                                aria-label={trackingStatus ? "Stop performance tracking" : "Start performance tracking"}
                                aria-pressed={trackingStatus}
                            >
                                {trackingStatus ? "⏹ Stop Tracking" : "▶ Start Tracking"}
                            </Button>
                            <Button
                                variant="outlined"
                                size="large"
                                color="secondary"
                                fullWidth
                                onClick={handleReset}
                                sx={{ py: 1.5, fontWeight: 'bold' }}
                                aria-label="Reset all performance metrics"
                            >
                                🔄 Reset Metrics
                            </Button>
                        </Stack>
                    </Stack>
                </CardContent>
            </Card>

            <Snackbar
                open={snackbar.open}
                autoHideDuration={4000}
                onClose={() => setSnackbar({ ...snackbar, open: false })}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            >
                <Alert
                    onClose={() => setSnackbar({ ...snackbar, open: false })}
                    severity={snackbar.severity}
                    variant="filled"
                    sx={{ width: '100%' }}
                >
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </>
    );
};
