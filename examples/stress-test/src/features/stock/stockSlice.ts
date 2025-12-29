import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

interface StockState {
    symbols: Record<string, number>;
    isRunning: boolean;
    updateCount: number;
}

const initialState: StockState = {
    symbols: {
        AAPL: 150.0,
        GOOGL: 2800.0,
        MSFT: 300.0,
        AMZN: 3400.0,
        TSLA: 700.0,
    },
    isRunning: false,
    updateCount: 0,
};

const stockSlice = createSlice({
    name: 'stock',
    initialState,
    reducers: {
        toggleTicker: (state) => {
            state.isRunning = !state.isRunning;
        },
        updatePrice: (state, action: PayloadAction<{ symbol: string; change: number }>) => {
            if (state.symbols[action.payload.symbol]) {
                state.symbols[action.payload.symbol] += action.payload.change;
                state.updateCount++;
            }
        },
        // Intentionally bad reducer: iterates everything to find one thing (simulating unoptimized logic)
        updateAllPrices: (state) => {
            Object.keys(state.symbols).forEach(key => {
                state.symbols[key] += (Math.random() - 0.5) * 5;
            });
            state.updateCount++;
        }
    },
});

export const { toggleTicker, updatePrice, updateAllPrices } = stockSlice.actions;
export default stockSlice.reducer;
