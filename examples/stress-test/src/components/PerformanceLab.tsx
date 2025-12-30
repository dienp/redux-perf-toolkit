import React, { useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Box, Button, Typography, Stack, Card, CardContent, Divider, Chip, Alert } from '@mui/material';
import type { RootState, AppDispatch } from '../store';
import { generateLargeState, clearLargeState, toggleSlowSelector, incrementDispatchStorm } from '../features/lab/labSlice';
import { perfAnalytics } from '@dienp/redux-perf-core';

export const PerformanceLab: React.FC = () => {
    const dispatch = useDispatch<AppDispatch>();
    const { dummyData, slowSelectorActive } = useSelector((state: RootState) => state.lab);

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

    const handleDispatchStorm = () => {
        for (let i = 0; i < 100; i++) {
            dispatch(incrementDispatchStorm());
        }
    };

    const stateSizeMB = useMemo(() => {
        const str = JSON.stringify(dummyData);
        return (new TextEncoder().encode(str).length / (1024 * 1024)).toFixed(2);
    }, [dummyData]);

    const [trackingStatus, setTrackingStatus] = React.useState(perfAnalytics.getIsTracking());

    const toggleTracking = () => {
        if (perfAnalytics.getIsTracking()) {
            perfAnalytics.stopTracking();
        } else {
            perfAnalytics.startTracking();
        }
        setTrackingStatus(perfAnalytics.getIsTracking());
    };

    const handleReset = () => {
        perfAnalytics.reset();
        // Force re-render to reflect potentially cleared data in the view if needed,
        // though currently the summary is console-only.
    };

    return (
        <Card sx={{ mb: 4, border: '1px solid #444' }}>
            <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                    <Typography variant="h5" fontWeight="bold">
                        🧪 Performance Lab
                    </Typography>
                    <Chip
                        label={trackingStatus ? 'Tracking Active' : 'Tracking Paused'}
                        color={trackingStatus ? 'success' : 'default'}
                        size="small"
                        variant="outlined"
                    />
                </Box>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Use these tools to stress test Redux and view analytics in the console.
                </Typography>

                <Divider sx={{ my: 2 }} />

                <Stack spacing={3}>
                    <Box>
                        <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                            RAM: Large State Stress
                        </Typography>
                        <Box sx={{ mb: 1 }}>
                            <Typography variant="body2" component="span">
                                Add large amounts of dummy data to the store.
                            </Typography>
                            <Chip size="small" label={`Current: ${stateSizeMB} MB`} color={Number(stateSizeMB) > 5 ? 'error' : 'default'} sx={{ ml: 1 }} />
                        </Box>
                        <Stack direction="row" spacing={1}>
                            <Button variant="outlined" color="primary" onClick={() => dispatch(generateLargeState(1))}>+1 MB</Button>
                            <Button variant="outlined" color="primary" onClick={() => dispatch(generateLargeState(5))}>+5 MB</Button>
                            <Button variant="outlined" color="primary" onClick={() => dispatch(generateLargeState(10))}>+10 MB</Button>
                            <Button variant="outlined" color="error" onClick={() => dispatch(clearLargeState())}>Clear State</Button>
                        </Stack>
                    </Box>

                    <Box>
                        <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                            CPU: Slow Selectors
                        </Typography>
                        <Typography variant="body2" paragraph>
                            Toggle a selector that artificially blocks the main thread for 20ms.
                        </Typography>
                        <Button
                            variant="contained"
                            color={slowSelectorActive ? 'error' : 'success'}
                            onClick={() => dispatch(toggleSlowSelector())}
                        >
                            {slowSelectorActive ? 'Disable Slow Selector' : 'Enable Slow Selector'}
                        </Button>
                        {slowSelectorActive && (
                            <Alert severity="warning" sx={{ mt: 1 }}>
                                Heavy workload active: {processedData}
                            </Alert>
                        )}
                    </Box>

                    <Box>
                        <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                            Middleware: Dispatch Storm
                        </Typography>
                        <Typography variant="body2" paragraph>
                            Dispatch 100 actions in a single loop to test middleware overhead.
                        </Typography>
                        <Button variant="outlined" color="warning" onClick={handleDispatchStorm}>
                            Run Dispatch Storm
                        </Button>
                    </Box>

                    <Divider />

                    <Stack direction="row" spacing={2}>
                        <Button
                            variant="contained"
                            size="large"
                            color="info"
                            fullWidth
                            onClick={() => perfAnalytics.logSummary()}
                            sx={{ py: 1.5, fontWeight: 'bold' }}
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
                        >
                            🔄 Reset Metrics
                        </Button>
                    </Stack>
                </Stack>
            </CardContent>
        </Card>
    );
};
