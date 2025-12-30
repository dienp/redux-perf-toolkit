# 🚀 Redux Performance Toolkit

**Identify and eliminate Redux performance bottlenecks with zero-config monitoring.**

A pure TypeScript toolkit that tracks selector recomputations, action dispatch times, and store memory usage—helping you optimize Redux applications across web, Node.js, and React Native.

---

## 🎯 The Problem

Redux applications can suffer from performance issues that are difficult to diagnose:

- **🐌 Slow Selectors**: Expensive computations running on every render, even when data hasn't changed
- **🔄 Unnecessary Recomputations**: Selectors recalculating when their inputs are identical
- **⏱️ Action Bottlenecks**: Reducers taking too long to process actions, blocking the UI
- **💾 Memory Bloat**: Store growing unbounded, consuming excessive RAM
- **🔍 Lack of Visibility**: No easy way to identify which selectors or actions are causing problems

Traditional profiling tools show *symptoms* but don't pinpoint the *Redux-specific* root causes.

---

## ✨ The Solution

Redux Performance Toolkit provides **automatic, zero-config monitoring** with:

✅ **Drop-in Replacement**: Works with existing `reselect` selectors—no code changes required  
✅ **Real-Time Alerts**: Console warnings when selectors/actions exceed configurable thresholds  
✅ **Detailed Analytics**: Top 10 reports for slowest operations, most frequent calls, and cumulative time  
✅ **Memory Tracking**: Monitor Redux store size with automatic high-RAM warnings  
✅ **Platform Agnostic**: Pure TypeScript—works in React, Vue, Angular, Node.js, and React Native  
✅ **Build-Time Naming**: Vite plugin automatically captures selector names for readable reports

---

## 📦 Packages

### `@dynlabs/redux-perf-core`

The core monitoring engine. Provides middleware for action profiling and a drop-in `createSelector` replacement for tracking selector performance.

**Key APIs:**

```typescript
// Middleware for action profiling and store size tracking
createPerfMiddleware()

// Drop-in replacement for reselect's createSelector
createSelector(selectors, combiner, options?)

// Analytics dashboard
perfAnalytics.logSummary()
perfAnalytics.startTracking()
perfAnalytics.stopTracking()
perfAnalytics.reset()

// Configuration
setPerfOptions({
  selectorTrackingEnabled: boolean,
  slowSelectorThreshold: number,        // ms
  storeSizeTrackingEnabled: boolean,
  maxStoreSizeThreshold: number         // MB
})
```

### `@dynlabs/redux-perf-vite-plugin`

Vite plugin for automatic selector naming and optional `reselect` import aliasing.

**Key APIs:**

```typescript
reduxPerfPlugin({
  rewriteReselect: boolean,    // Auto-alias 'reselect' to '@dynlabs/redux-perf-core'
  corePath: string             // Custom path to core package
})
```

---

## 🚀 Installation

### 1. Install Core Package

```bash
npm install @dynlabs/redux-perf-core
```

### 2. (Optional) Install Vite Plugin for Auto-Naming

```bash
npm install @dynlabs/redux-perf-vite-plugin
```

---

## 📖 Quick Start

### Step 1: Configure Vite Plugin (Optional but Recommended)

Add to `vite.config.ts`:

```typescript
import { defineConfig } from 'vite';
import { reduxPerfPlugin } from '@dynlabs/redux-perf-vite-plugin';

export default defineConfig({
  plugins: [
    reduxPerfPlugin({
      rewriteReselect: true  // Automatically alias 'reselect' imports
    })
  ]
});
```

### Step 2: Add Middleware to Store

```typescript
import { configureStore } from '@reduxjs/toolkit';
import { createPerfMiddleware } from '@dynlabs/redux-perf-core';

export const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefault) => getDefault().concat(createPerfMiddleware())
});
```

### Step 3: Use Performance-Aware Selectors

```typescript
import { createSelector } from '@dynlabs/redux-perf-core';

export const selectFilteredItems = createSelector(
  [selectItems, selectFilter],
  (items, filter) => items.filter(i => i.includes(filter))
);
```

### Step 4: View Analytics

```typescript
import { perfAnalytics } from '@dynlabs/redux-perf-core';

// Open console and call:
perfAnalytics.logSummary();
```

---

## 📊 Example Output

### Real-Time Warnings

When performance thresholds are exceeded, you'll see styled console warnings:

```text
[ReduxPerf] Slow Action: cart/addItem took 12.3ms
[ReduxPerf] Slow Selector: selectExpensiveComputation took 8.7ms
[ReduxPerf] High Memory Warning: Store size is 15.2MB (Threshold: 10MB)
```

### Analytics Dashboard

Call `perfAnalytics.logSummary()` to see detailed performance breakdowns:

```text
[ReduxPerf] Performance Summary

--- Top 10 Most Triggered Actions ---
┌─────────┬──────────────────────┬───────┬─────────┬─────────┬──────────┐
│ (index) │ name                 │ count │ avg     │ max     │ total    │
├─────────┼──────────────────────┼───────┼─────────┼─────────┼──────────┤
│ 0       │ 'cart/addItem'       │ 247   │ '0.3ms' │ '12.3ms'│ '74.1ms' │
│ 1       │ 'user/updateProfile' │ 18    │ '1.2ms' │ '3.4ms' │ '21.6ms' │
└─────────┴──────────────────────┴───────┴─────────┴─────────┴──────────┘

--- Top 10 Slowest Selectors (Max Duration) ---
┌─────────┬────────────────────────────┬───────┬─────────┬─────────┬──────────┐
│ (index) │ name                       │ count │ avg     │ max     │ total    │
├─────────┼────────────────────────────┼───────┼─────────┼─────────┼──────────┤
│ 0       │ 'selectExpensiveCompute'   │ 42    │ '6.2ms' │ '8.7ms' │ '260.4ms'│
│ 1       │ 'selectFilteredProducts'   │ 156   │ '0.8ms' │ '2.1ms' │ '124.8ms'│
└─────────┴────────────────────────────┴───────┴─────────┴─────────┴──────────┘

--- Top 10 Heaviest Selectors (Cumulative Time) ---
┌─────────┬────────────────────────────┬───────┬─────────┬─────────┬──────────┐
│ (index) │ name                       │ count │ avg     │ max     │ total    │
├─────────┼────────────────────────────┼───────┼─────────┼─────────┼──────────┤
│ 0       │ 'selectExpensiveCompute'   │ 42    │ '6.2ms' │ '8.7ms' │ '260.4ms'│
│ 1       │ 'selectFilteredProducts'   │ 156   │ '0.8ms' │ '2.1ms' │ '124.8ms'│
└─────────┴────────────────────────────┴───────┴─────────┴─────────┴──────────┘
```

---

## ⚙️ Configuration

Customize thresholds and behavior:

```typescript
import { setPerfOptions } from '@dynlabs/redux-perf-core';

setPerfOptions({
  selectorTrackingEnabled: true,
  slowSelectorThreshold: 5,           // Log warning if selector takes > 5ms
  storeSizeTrackingEnabled: true,
  maxStoreSizeThreshold: 10           // Log warning if store exceeds 10MB
});
```

---

## 🏗️ Architecture

### Monorepo Structure

```
redux-perf-toolkit/
├── packages/
│   ├── core/              # Pure TS monitoring engine
│   └── vite-plugin/       # Build-time instrumentation
├── examples/
│   └── stress-test/       # Performance Lab demo
└── docs/                  # Technical deep-dives
```

### How It Works

1. **Middleware Layer**: Intercepts every Redux action to measure reducer execution time
2. **Selector Wrapper**: Wraps `createSelector` to track recomputations and execution time
3. **Analytics Engine**: Aggregates metrics and provides console-based reporting
4. **Vite Plugin**: Automatically injects selector names at build time for readable reports

---

## 📚 Documentation

- 🏎️ [Action Profiling](docs/actions.md) - How we measure reducer execution time
- 🎯 [Selector Tracking](docs/selectors.md) - Deep dive into recomputation detection
- 📦 [Store Size Measurement](docs/store-size.md) - Memory footprint tracking
- 🤖 [AI Integration Prompt](docs/integration-prompt.md) - Let AI integrate this for you

---

## 🎬 Live Demo

Try the **Performance Lab** at [https://dienp.github.io/redux-perf-toolkit/](https://dienp.github.io/redux-perf-toolkit/)

Simulate slow selectors, action storms, and memory bloat to see the toolkit in action.

---

## 🤖 AI-Generated

This entire repository—including core logic, build plugins, unit tests, and documentation—was **fully generated and verified by Antigravity**, an agentic AI coding assistant.

---

## 📄 License

ISC © 2025 [dienp](https://github.com/dienp)
