# Selector Performance Tracking

The Redux Performance Toolkit provides a drop-in replacement for `reselect`'s `createSelector` that adds deep instrumentation for performance monitoring.

## How it Works

The `createSelector` utility from `@ptdien/redux-perf-core` wraps the standard `reselect` logic with a custom memoizer that tracks execution metrics.

### 1. Instrumentation via Custom Memoizer
Instead of just wrapping the result function, we inject a custom memoizer using `createSelectorCreator`. This allows us to intercept every execution of the selector and compare current arguments with the previous ones.

```typescript
const memoizeWithTracking = (func: Function, ...opts: any[]) => {
    const baseMemoize = lruMemoize(func as any, ...opts);
    let lastArgs: any[] | null = null;

    return (...args: any[]) => {
        // ... tracking logic ...
        const result = baseMemoize(...args);
        // ... emission logic ...
        return result;
    };
};
```

### 2. Detection of Recomputations
We track "Hits" and "Misses" by performing a reference equality check on the input arguments (the same way `reselect` does).

- **Hit**: Arguments are the same as last time. The selector returns the cached value instantly.
- **Miss (Recomputation)**: One or more arguments have changed. The combiner function is executed.

### 3. Identifying the Culprit (Changed Index)
By comparing the new arguments array with the `lastArgs` array, we can identify exactly which dependency caused the selector to recompute.

```typescript
for (let i = 0; i < args.length; i++) {
    if (args[i] !== lastArgs[i]) {
        recomputation = true;
        changedIndex = i; // This is the dependency that changed!
        break;
    }
}
```

### 4. Measuring Execution Time
We use `performance.now()` to measure the precise time taken for a recomputation. This duration is then emitted to the `perfEventBus`.

## Metrics Collected
- **Name**: The variable name of the selector (inferred via Vite plugin or `.name` property).
- **Duration**: Execution time in milliseconds.
- **Changed Index**: The index of the input selector that triggered the recomputation.
- **Hits/Misses**: Tracked by the `PerfAnalytics` class to calculate hit rates.

## Analytics Integration
Every recomputation triggers a `redux-perf-selector` event. The `PerfAnalytics` class aggregates these events into:
- **Top 10 Most Triggered**: Selectors that recompute most often.
- **Top 10 Slowest**: Selectors with the highest single-execution duration.
- **Top 10 Heaviest**: Selectors with the highest cumulative execution time.
