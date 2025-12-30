# Store Size Measurement

The toolkit provides automated tracking of the Redux store's memory footprint to prevent "State Bloat" and memory leaks.

## How it Works

Store size tracking is integrated into the `createPerfMiddleware` but is decoupled from the main action processing loop to avoid performance overhead.

### 1. Throttled Measurement
Measuring the store size (by stringifying the state) is an expensive operation. To minimize CPU impact, the toolkit:
- Only measures if `storeSizeTrackingEnabled` is set to `true`.
- Throttles checks to a maximum of **once per second** (`STORE_SIZE_CHECK_INTERVAL`).

```typescript
if (perfConfig.storeSizeTrackingEnabled) {
    const now = Date.now();
    if (now - lastStoreSizeCheck > 1000) {
        const size = getStoreSize(store.getState());
        perfEventBus.emit('redux-perf-store-size', { size, timestamp: now });
        lastStoreSizeCheck = now;
    }
}
```

### 2. Size Estimation Technique
The store size is estimated by stringifying the entire state and measuring the byte length of the resulting string. While not 100% accurate for raw RAM (due to JS engine overhead), it provides a very reliable **relative metric** for tracking growth.

```typescript
const getStoreSize = (state: any): number => {
    const str = JSON.stringify(state);
    return new TextEncoder().encode(str).length; // Bytes
};
```

## Threshold Warnings
Developers can set a `maxStoreSizeThreshold` (in MB). If the store exceeds this limit, a high-visibility warning is logged to the console:

`[ReduxPerf] High Memory Warning: Store size is 14.04MB (Threshold: 10MB)`

## Analytics Integration
The `PerfAnalytics` class maintains a history of store size measurements, which can be used to:
- Detect leaks (persistent upward trends).
- Identify which actions caused massive state jumps.
- Correlate RAM usage with UI performance (CPU/Dispatch latency).
