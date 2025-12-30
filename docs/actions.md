# Action Performance Profiling

Action tracking is implemented as a standard Redux middleware that measures the time taken by the entire reducer chain to process a specific action.

## How it Works

The `createPerfMiddleware` intercepts every action dispatched to the store and wraps the `next(action)` call with high-resolution timestamps.

### 1. Profiling Logic
The middleware measures the delta between the start and end of the reduction process for each action.

```typescript
export const createPerfMiddleware = (): Middleware => {
    return store => next => action => {
        const start = performance.now();
        const result = next(action);
        const end = performance.now();
        const duration = end - start;

        // Emit for analytics
        perfEventBus.emit('redux-perf-action', {
            type: action.type,
            duration,
            timestamp: Date.now()
        });

        return result;
    };
};
```

### 2. Platform Agnosticism
Because it uses the standard `performance.now()` API and is written in pure TypeScript, this middleware works identically in Web browsers, Node.js, and React Native environments.

## Slow Action Warnings
If an action takes longer than **16ms** (the budget for 60fps), the middleware logs a styled warning to the console, alerting the developer to a potential frame drop.

## Metrics Collected
- **Action Type**: The unique string identifying the action.
- **Duration**: Total time spent in the reducers for this action.
- **Timestamp**: When the action was processed.

## Analytics Integration
Actions are aggregated by `PerfAnalytics` to identify:
- **Dispatch Storms**: Rapidly firing actions that clog the event loop.
- **Heavy Reducers**: Reducers that perform expensive computations or deep state clones.
- **Hit Counts**: Which actions are the most "chatty" in the application.
