# @dynlabs/redux-perf-vite-plugin

Vite plugin for automatic selector naming and seamless integration with `@dynlabs/redux-perf-core`.

## Features

- 🏷️ **Automatic Naming**: Automatically captures variable names for all `createSelector` calls
- 🔄 **Reselect Aliasing**: Optionally rewrites `reselect` imports to `@dynlabs/redux-perf-core`
- ⚡ **Zero Config**: Works out of the box with sensible defaults
- 🎯 **Build-Time**: No runtime overhead

## Installation

```bash
npm install @dynlabs/redux-perf-vite-plugin
```

## Usage

Add the plugin to your `vite.config.ts`:

```typescript
import { defineConfig } from 'vite';
import { reduxPerfPlugin } from '@dynlabs/redux-perf-vite-plugin';

export default defineConfig({
  plugins: [
    reduxPerfPlugin()
  ]
});
```

## Configuration

```typescript
reduxPerfPlugin({
  // Automatically rewrite 'reselect' imports to '@dynlabs/redux-perf-core'
  // Default: true
  rewriteReselect: true,
  
  // Custom path to resolve '@dynlabs/redux-perf-core'
  // Default: '@dynlabs/redux-perf-core'
  corePath: '@dynlabs/redux-perf-core'
})
```

## How It Works

The plugin performs two transformations at build time:

### 1. Import Rewriting (Optional)
Automatically converts:
```typescript
import { createSelector } from 'reselect';
```
to:
```typescript
import { createSelector } from '@dynlabs/redux-perf-core';
```

### 2. Automatic Naming
Instruments `createSelector` calls with their variable names:
```typescript
// Before
const selectUser = createSelector([selectUsers], users => users[0]);

// After (automatic)
const selectUser = createSelector([selectUsers], users => users[0], { name: 'selectUser' });
```

This enables the performance toolkit to display meaningful names in analytics reports.

## Requirements

- Vite 3.0 or higher
- `@dynlabs/redux-perf-core` installed in your project

## License

ISC © 2025
