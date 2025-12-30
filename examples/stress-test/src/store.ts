import { configureStore } from '@reduxjs/toolkit';
import heavyReducer from './features/heavy/heavySlice';
import stockReducer from './features/stock/stockSlice';
import labReducer from './features/lab/labSlice';
import { createPerfMiddleware } from '@dienp/redux-perf-core';

export const store = configureStore({
    reducer: {
        heavy: heavyReducer,
        stock: stockReducer,
        lab: labReducer,
    },
    middleware: (getDefaultMiddleware) => getDefaultMiddleware({
        serializableCheck: false, // For large state stress test
    }).concat(createPerfMiddleware()),
});

export type RootState = {
    heavy: ReturnType<typeof heavyReducer>;
    stock: ReturnType<typeof stockReducer>;
    lab: ReturnType<typeof labReducer>;
};
export type AppDispatch = typeof store.dispatch;
