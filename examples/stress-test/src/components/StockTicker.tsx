import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState } from '../store';
import { toggleTicker, updateAllPrices } from '../features/stock/stockSlice';
import {
    Box,
    Button,
    Card,
    CardContent,
    Typography
} from '@mui/material';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import StopIcon from '@mui/icons-material/Stop';

export const StockTicker: React.FC = () => {
    const dispatch = useDispatch();
    const { symbols, isRunning, updateCount } = useSelector((state: RootState) => state.stock);

    useEffect(() => {
        let interval: any;
        if (isRunning) {
            interval = setInterval(() => {
                dispatch(updateAllPrices());
            }, 50);
        }
        return () => clearInterval(interval);
    }, [isRunning, dispatch]);

    return (
        <Card>
            <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                    <Typography variant="h5" component="div" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <TrendingUpIcon color="primary" /> Rapid-Fire Stock Ticker
                    </Typography>
                    <Button
                        variant="contained"
                        color={isRunning ? "error" : "success"}
                        startIcon={isRunning ? <StopIcon /> : <PlayArrowIcon />}
                        onClick={() => dispatch(toggleTicker())}
                        aria-label={isRunning ? "Stop stock ticker updates" : "Start stock ticker updates"}
                        aria-pressed={isRunning}
                    >
                        {isRunning ? 'STOP' : 'START'}
                    </Button>
                </Box>

                <Typography variant="body2" color="text.secondary" gutterBottom role="status" aria-live="polite">
                    Updates processed: <strong>{updateCount}</strong>
                </Typography>

                <Box display="flex" flexWrap="wrap" gap={2} mt={1}>
                    {Object.entries(symbols).map(([symbol, price]) => (
                        <Box key={symbol} sx={{ width: { xs: '45%', sm: '30%', md: '15%' }, flexGrow: 1 }}>
                            <Card variant="outlined">
                                <CardContent sx={{ p: 1, '&:last-child': { pb: 1 } }}>
                                    <Typography variant="subtitle2" color="text.secondary">
                                        {symbol}
                                    </Typography>
                                    <Typography variant="h6" color={price > 1000 ? "primary" : "secondary"}>
                                        ${price.toFixed(2)}
                                    </Typography>
                                </CardContent>
                            </Card>
                        </Box>
                    ))}
                </Box>
            </CardContent>
        </Card>
    );
};
