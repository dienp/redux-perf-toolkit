import { Middleware, UnknownAction } from 'redux';
import { perfEventBus } from './utils/eventBus';

export const createPerfMiddleware = (): Middleware => {
    return store => next => action => {
        const typedAction = action as UnknownAction;
        const start = performance.now();
        const result = next(action);
        const end = performance.now();
        const duration = end - start;

        // TODO: better threshold configuration
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

        return result;
    };
};
