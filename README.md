# 🚀 Redux Performance Toolkit

A powerful, developer-centric toolkit designed to **track, measure, and optimize** Redux application performance with zero-config automated naming. Now 100% pure TypeScript and platform-agnostic.

---

## 🏗️ Pure TypeScript & Platform Agnostic

The `@dienp/redux-perf-core` package has been completely revamped to be dependency-free (no React/React Native required). It works seamlessly in:
- 🌐 **Web** (React, Vue, Angular, Vanilla)
- 🖥️ **Node.js** (Server-side Redux)
- 📱 **Mobile** (React Native, Expo)

---

## ✨ Key Features

- 🏎️ **Action Profiling**: Track exactly how long each reducer takes to process actions.
- 🎯 **Seamless Selector Tracking**: Drop-in `createSelector` replacement that automatically detects execution time and cache hits/misses.
- 📦 **Store Size Measurement**: Real-time tracking of your Redux state size with configurable high-RAM warnings.
- 📊 **Console Analytics**: A powerful analytics engine reachable via `perfAnalytics.logSummary()`, providing Top 10 reporting for:
    - Most triggered actions/selectors
    - Slowest operations (Max duration)
    - Heaviest operations (Cumulative time)
- 🏷️ **Automated Naming**: Variable names are automatically captured using a build-time Vite plugin.
- ⏹️ **On-Demand Control**: Start, stop, or reset tracking at any time to focus on specific user flows.

---

## 📦 Installation

To use the core performance tracking logic:

```bash
npm install @dienp/redux-perf-core
```

To enable **Automated Naming** in Vite projects:

```bash
npm install @dienp/redux-perf-vite-plugin
```

---

## 🚀 Quick Start

### 1. Configure the Vite Plugin (Optional but Recommended)
Enable automated selector naming in your `vite.config.ts`:

```typescript
import { reduxPerfPlugin } from '@dienp/redux-perf-vite-plugin';

export default defineConfig({
  plugins: [
    reduxPerfPlugin()
  ]
});
```

### 2. Configure the Middleware
Add the performance middleware to your Redux store:

```typescript
import { configureStore } from '@reduxjs/toolkit';
import { createPerfMiddleware } from '@dienp/redux-perf-core';

export const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefault) => getDefault().concat(createPerfMiddleware()),
});
```

### 3. Instrumented Selectors
Swap your imports to use the performance-aware `createSelector`.

```typescript
// After (Drop-in replacement with auto-tracking!)
import { createSelector } from '@dienp/redux-perf-core';

export const selectFilteredItems = createSelector(
  [selectItems, selectFilter],
  (items, filter) => items.filter(i => i.includes(filter))
);
```

### 4. View Analytics
```typescript
import { perfAnalytics } from '@dienp/redux-perf-core';

// Log the Top 10 tables to console
perfAnalytics.logSummary();

// Manage tracking on-demand
perfAnalytics.stopTracking();
perfAnalytics.reset();
perfAnalytics.startTracking();
```

---

## 🖥️ Console Output Examples

The toolkit provides high-visibility console outputs to help you identify bottlenecks instantly.

### ⚠️ Performance Warnings
When thresholds are exceeded, styled warnings are logged:

```text
[ReduxPerf] Slow Action: lab/generateLargeState took 65.30ms
[ReduxPerf] Slow Selector: selectHeavyItems took 22.45ms
[ReduxPerf] High Memory Warning: Store size is 14.04MB (Threshold: 10MB)
```

### 📊 Performance Summary
Call `perfAnalytics.logSummary()` to get a detailed breakdown of your Redux performance:

```text
[ReduxPerf] Performance Summary

--- Top 10 Most Triggered Actions ---
┌───────────┬────────────────────────────┬───────┬─────────┬─────────┬─────────┐
│ (index)   │ name                       │ count │ avg     │ max     │ total   │
├───────────┼────────────────────────────┼───────┼─────────┼─────────┼─────────┤
│ 0         │ 'lab/incrementDispatch...' │ 100   │ '0.05ms'│ '0.21ms'│ '5.42ms'│
│ 1         │ 'lab/toggleSlowSelector'   │ 2     │ '0.12ms'│ '0.18ms'│ '0.24ms'│
└───────────┴────────────────────────────┴───────┴─────────┴─────────┴─────────┘

--- Top 10 Slowest Selectors (Max Duration) ---
┌───────────┬────────────────────┬───────┬──────────┬──────────┬──────────┐
│ (index)   │ name               │ count │ avg      │ max      │ total    │
├───────────┼────────────────────┼───────┼──────────┼──────────┼──────────┤
│ 0         │ 'selectHeavyItems' │ 5     │ '21.15ms'│ '23.40ms'│ '105.7ms'│
└───────────┴────────────────────┴───────┴──────────┴──────────┴──────────┘
```

---

## ⚙️ Configuration

Control the toolkit behavior at runtime:

```typescript
import { setPerfOptions } from '@dienp/redux-perf-core';

setPerfOptions({
  selectorTrackingEnabled: true,
  slowSelectorThreshold: 5,           // ms
  storeSizeTrackingEnabled: true,     // New!
  maxStoreSizeThreshold: 10           // MB (Warns if exceeded)
});
```

---

## 📚 Detailed Documentation

For a deep dive into how each technical component works, check out our specialized guides:

- 🏎️ [Action Profiling](docs/actions.md): How we measure reducer execution time.
- 🎯 [Selector Tracking](docs/selectors.md): Deep dive into recomputation detection and dependency tracking.
- 📦 [Store Size Measurement](docs/store-size.md): How we track memory footprint and state bloat.

---

## 🏗️ Monorepo Structure

- `packages/core`: Pure TypeScript performance logic and analytics engine.
- `packages/vite-plugin`: Build-time instrumentation for automated naming.
- `examples/stress-test`: A "Performance Lab" demo for simulating RAM, CPU, and Middleware stress.

---

## 👷‍♂️ CI/CD

This project uses **GitHub Actions** for automated builds, NPM publishing to GitHub Packages, and deployment of the Stress Test Lab to GitHub Pages.

---

## 📄 License
ISC © 2025 [dienp](https://github.com/dienp)
