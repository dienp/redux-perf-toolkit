import { configureStore } from '@reduxjs/toolkit';
import heavyReducer from './features/heavy/heavySlice';
import stockReducer from './features/stock/stockSlice';
import { createPerfMiddleware } from '@dienp/redux-perf-core';

export const store = configureStore({
    reducer: {
        heavy: heavyReducer,
        stock: stockReducer,
    },
    middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(createPerfMiddleware()),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
