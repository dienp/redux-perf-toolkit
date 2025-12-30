import { Middleware, UnknownAction } from 'redux';
import { perfEventBus } from './utils/eventBus';
import { perfConfig } from './config';

// Lightweight size estimation
const getStoreSize = (state: any): number => {
    try {
        const str = JSON.stringify(state);
        return new TextEncoder().encode(str).length;
    } catch (e) {
        return 0;
    }
};

export const createPerfMiddleware = (): Middleware => {
    let lastStoreSizeCheck = 0;
    const STORE_SIZE_CHECK_INTERVAL = 1000; // ms

    return store => next => action => {
        const typedAction = action as UnknownAction;
        const start = performance.now();
        const result = next(action);
        const end = performance.now();
        const duration = end - start;

        // Slow action warning
        if (duration > 16) {
            console.warn(
                `%c[ReduxPerf] Slow Action: ${typedAction.type}`,
                'color: red; font-weight: bold',
                `took ${duration.toFixed(2)}ms`
            );
        }

        // Dispatch to the event bus
        perfEventBus.emit('redux-perf-action', {
            type: typedAction.type,
            duration,
            timestamp: Date.now()
        });

        // Store size tracking
        if (perfConfig.storeSizeTrackingEnabled) {
            const now = Date.now();
            if (now - lastStoreSizeCheck > STORE_SIZE_CHECK_INTERVAL) {
                const size = getStoreSize(store.getState());
                perfEventBus.emit('redux-perf-store-size', {
                    size,
                    timestamp: now
                });
                lastStoreSizeCheck = now;
            }
        }

        return result;
    };
};
