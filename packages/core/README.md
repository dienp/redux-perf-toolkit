# @dynlabs/redux-perf-core

A pure TypeScript performance monitoring toolkit for Redux applications. Track selector recomputations, action dispatch times, and store size with zero configuration.

## Features

- 🎯 **Selector Performance Tracking**: Drop-in replacement for `reselect`'s `createSelector` with automatic performance monitoring
- 🏎️ **Action Profiling**: Measure reducer execution time for every dispatched action
- 📦 **Store Size Monitoring**: Track Redux state memory footprint with configurable warnings
- 📊 **Console Analytics**: Built-in analytics dashboard accessible via `perfAnalytics.logSummary()`
- ⏹️ **On-Demand Control**: Start, stop, and reset tracking at any time
- 🌐 **Platform Agnostic**: Works in web, Node.js, and React Native environments

## Installation

```bash
npm install @dynlabs/redux-perf-core
```

## Quick Start

### 1. Add Middleware

```typescript
import { configureStore } from '@reduxjs/toolkit';
import { createPerfMiddleware } from '@dynlabs/redux-perf-core';

export const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefault) => getDefault().concat(createPerfMiddleware()),
});
```

### 2. Use Performance-Aware Selectors

```typescript
import { createSelector } from '@dynlabs/redux-perf-core';

export const selectFilteredItems = createSelector(
  [selectItems, selectFilter],
  (items, filter) => items.filter(i => i.includes(filter))
);
```

### 3. View Analytics

```typescript
import { perfAnalytics } from '@dynlabs/redux-perf-core';

// Log performance summary to console
perfAnalytics.logSummary();

// Control tracking
perfAnalytics.stopTracking();
perfAnalytics.reset();
perfAnalytics.startTracking();
```

## Configuration

```typescript
import { setPerfOptions } from '@dynlabs/redux-perf-core';

setPerfOptions({
  selectorTrackingEnabled: true,
  slowSelectorThreshold: 5,           // ms
  storeSizeTrackingEnabled: true,
  maxStoreSizeThreshold: 10           // MB
});
```

## API Reference

### `createSelector(selectors, combiner, options?)`
Drop-in replacement for `reselect`'s `createSelector` with performance tracking.

### `createPerfMiddleware()`
Redux middleware that profiles action dispatch times and tracks store size.

### `perfAnalytics`
- `logSummary()` - Display performance metrics in console
- `startTracking()` - Resume performance tracking
- `stopTracking()` - Pause performance tracking
- `reset()` - Clear all collected metrics

### `setPerfOptions(options)`
Configure performance thresholds and tracking behavior.

## License

ISC © 2025
