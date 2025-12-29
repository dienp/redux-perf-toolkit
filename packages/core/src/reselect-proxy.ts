// This file acts as a surgical replacement for reselect
// We import the ORIGINAL implementation from the file path directly to avoid
// circular dependency loops when we alias 'reselect' to this file in the bundler.

// Relative path from packages/core/src to node_modules/reselect/dist/reselect.mjs
// packages/core/src -> ../../../node_modules/...
// @ts-ignore
import * as ReselectOriginal from 'reselect';

console.log('Using Reselect Proxy!');

// Import our instrumented creator
import { createSelector as createPerfSelector } from './selectors';

// Re-export everything from the original
// @ts-ignore
export * from 'reselect';

// Override createSelector with our perf version
export const createSelector = createPerfSelector;
