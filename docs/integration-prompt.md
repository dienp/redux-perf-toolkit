# AI Integration Prompt

If you want an AI assistant (like Antigravity) to automatically integrate this toolkit into your existing Redux project, you can use the following prompt.

## The Prompt

> **Subject: Integrate Redux Performance Toolkit**
>
> Please integrate the `@dynlabs/redux-perf-toolkit` into my project to help me identify performance bottlenecks. Follow these steps:
>
> 1. **Install Dependencies**: Install `@dynlabs/redux-perf-core` and `@dynlabs/redux-perf-vite-plugin` (if using Vite).
> 2. **Vite Configuration**: Update my `vite.config.ts` to include the `reduxPerfPlugin()` for automated selector naming.
> 3. **Store Middleware**: Locating my Redux store configuration (e.g., `src/store.ts`) and add the `createPerfMiddleware()` to the middleware array.
> 4. **Seamless Integration**: Instead of manual code changes, let the Vite plugin automatically alias `reselect` imports to `@dynlabs/redux-perf-core`. This enables zero-touch performance tracking for all existing selectors in the codebase.
> 5. **Analytics Control**: In my main `App.tsx` or a debug menu component, add buttons to call `perfAnalytics.logSummary()` and `perfAnalytics.reset()`.
> 6. **Verification**: Verify that when I interact with the app, performance metrics for actions and selectors appear in the browser console.

---

## Why this prompt works
- **Explicit Steps**: It breaks down the installation, configuration, and migration tasks.
- **Vite-aware**: It specifically asks for the naming plugin, which is critical for readable analytics.
- **Instrumentation**: It ensures all selectors are migrated, not just new ones.
- **On-Demand Access**: It ensures the user has a way to trigger the reporting from the UI.
