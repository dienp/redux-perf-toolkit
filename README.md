# 🚀 Redux Performance Toolkit

A powerful, developer-centric toolkit designed to **track, measure, and optimize** Redux application performance with zero-config automated naming.

![Redux Performance Dashboard](https://raw.githubusercontent.com/dienp/redux-perf-toolkit/master/assets/dashboard-preview.png) *(Placeholder for dashboard screenshot)*

## ✨ Key Features

- 🏎️ **Action Profiling**: Track exactly how long each reducer takes to process actions.
- 🎯 **Seamless Selector Tracking**: Drop-in `createSelector` replacement that automatically detects:
    - **Execution Time**
    - **Cache Misses vs Hits**
    - **Invalidating Dependency Index** (Know exactly *which* input caused the recomputation!)
- 🏷️ **Automated Naming**: Variables names (e.g., `const selectUser = createSelector(...)`) are automatically captured using a build-time plugin. No manual naming required!
- 📊 **Real-time Dashboard**: A sleek MUI-based overlay to monitor your slowest actions and selectors in real-time.
- 📱 **Cross-Platform**: Support for both **Web** (React) and **React Native**.
- 🛠️ **Developer Experience**: Styled console warnings for "Slow Selectors" and "Slow Actions" that exceed your defined thresholds.

---

## 📦 Installation

To use the core performance tracking logic:

```bash
npm install @dienp/redux-perf-core
```

For React Native applications:

```bash
npm install @dienp/redux-perf-react-native
```

---

## 🚀 Quick Start

### 1. Configure the Middleware
Add the performance middleware to your Redux store:

```typescript
import { configureStore } from '@reduxjs/toolkit';
import { createPerfMiddleware } from '@dienp/redux-perf-core';

export const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefault) => getDefault().concat(createPerfMiddleware()),
});
```

### 2. Instrumented Selectors
Swap your imports to use the performance-aware `createSelector`.

```typescript
// Before
import { createSelector } from 'reselect';

// After (Drop-in replacement with auto-tracking!)
import { createSelector } from '@dienp/redux-perf-core';

export const selectFilteredItems = createSelector(
  [selectItems, selectFilter],
  (items, filter) => items.filter(i => i.includes(filter))
);
```

### 3. Mount the Dashboard
Add the debugging UI to your root component:

```tsx
import { PerfDashboard } from '@dienp/redux-perf-core';

function App() {
  return (
    <>
      <MyApplication />
      {process.env.NODE_ENV === 'development' && <PerfDashboard />}
    </>
  );
}
```

---

## ⚙️ Configuration

Control the toolkit behavior at runtime:

```typescript
import { setPerfOptions } from '@dienp/redux-perf-core';

setPerfOptions({
  selectorTrackingEnabled: true,
  slowSelectorThreshold: 5, // ms (Logs a styled warning if exceeded)
});
```

---

## 🏗️ Monorepo Structure

- `packages/core`: The core performance logic, EventBus, and Web dashboard.
- `packages/react-native`: Specialized UI components for mobile performance tracking.
- `examples/stress-test`: A heavy implementation demo with 10,000+ items and artificial delays to test the toolkit.

---

## 👷‍♂️ CI/CD

This project uses **GitHub Actions** for:
- 🏗️ **Automated Builds** on every push.
- 📦 **NPM Publishing** to GitHub Packages.
- 🚀 **GitHub Pages** deployment for the stress-test demo.
- 🏷️ **Automated Releases** with unique version tags.

---

## 📄 License
ISC © 2025 [dienp](https://github.com/dienp)
