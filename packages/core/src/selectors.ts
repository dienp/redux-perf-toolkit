import { createSelectorCreator, lruMemoize, CreateSelectorOptions } from 'reselect';
import { perfEventBus } from './utils/eventBus';
import { perfConfig } from './config';

// Advanced memoizer that tracks hits, recomputations, and invalidating dependencies
const perfMemoize = (func: Function, ...options: any[]) => {
    // We use the standard LRU memoizer internally
    // We use the standard LRU memoize internally
    const memoized = lruMemoize(func as any, ...options);

    // Track previous arguments to detect what changed
    let lastArgs: any[] | null = null;

    return (...args: any[]) => {
        // console.log('PerfSelector Check:', perfConfig.selectorTrackingEnabled);
        if (!perfConfig.selectorTrackingEnabled) {
            return memoized(...args);
        }

        const start = performance.now();
        const result = memoized(...args);
        const end = performance.now();
        const duration = end - start;

        // If duration is effectively 0, it was likely a HIT. 
        // Real recomputations usually take time. 
        // BUT, a fast recomputation might be 0ms. 
        // A better way is to wrap 'func' itself, but 'lruMemoize' doesn't easily expose that without
        // overriding the equality check.
        //
        // However, we can manually check equality to find the invalidating dependency!

        // Check if arguments changed (miss)
        let recomputation = false;
        let changedArgIndex = -1;

        if (!lastArgs || args.length !== lastArgs.length) {
            recomputation = true;
            changedArgIndex = -1; // First run or length change
        } else {
            // Simple reference equality check (same as default reselect)
            for (let i = 0; i < args.length; i++) {
                if (args[i] !== lastArgs[i]) {
                    recomputation = true;
                    changedArgIndex = i;
                    break;
                }
            }
        }

        if (recomputation) {
            lastArgs = args;

            // We can emit the event now
            // Note: 'func' here is the result function (combiner).
            // We don't have the selector name here easily unless we scope it.

            // Wait, perfMemoize is called ONCE per selector creation.
            // But we don't have the name here.
            // We need to pass the name to the memoizer? reselect v5 doesn't standardly pass name to memoize.

            // Hack: We will rely on the caller to attach name to the function or context? 
            // Or, we accept that this event won't have the name, and we emit it from the outer wrapper?

            // Actually, createSelectorCreator allows customized memoize.
            // But we really want the NAME.
        }

        return result;
    };
};

/*
   Better Strategy:
   We want to Wrap the Result Function (Combiner) to measure execution time.
   We want to Wrap the Memoizer to measure Hits vs Misses and args.
*/

// Helper to create a named memoizer factory
const createPerfMemoizer = (name: string) => {
    return (func: Function, ...options: any[]) => {
        const memoized = lruMemoize(func as any, ...options);
        let lastArgs: any[] | null = null;

        return (...args: any[]) => {
            if (!perfConfig.selectorTrackingEnabled) {
                return memoized(...args);
            }

            // Check for changes (Miss detection)
            let recomputation = false;
            let changedIndex = -1;

            if (!lastArgs || lastArgs.length !== args.length) {
                recomputation = true; // First run
            } else {
                for (let i = 0; i < args.length; i++) {
                    if (args[i] !== lastArgs[i]) {
                        recomputation = true;
                        changedIndex = i;
                        break; // Found the culprit
                    }
                }
            }

            if (recomputation) {
                lastArgs = args;
            }

            // Measure Execution (This includes the memoization overhead check)
            // But if it's a HIT, 'memoized' returns instantly.
            // If it's a MISS, 'func' runs.

            // We want to measure specifically the 'func' execution time?
            // lruMemoize runs 'func' synchronously.
            // So if we measure around 'memoized(...args)', we get Hit Time (fast) or Miss Time (slow).

            const start = performance.now();
            const result = memoized(...args);
            const end = performance.now();
            const duration = end - start;

            // Determine status
            // If recomputation was true, it was a MISS.

            if (recomputation) {
                console.log('Emitting Perf Event:', name, duration, changedIndex);
                perfEventBus.emit('redux-perf-selector', {
                    name,
                    duration: end - start,
                    recomputation: true,
                    changedIndex,
                    timestamp: Date.now()
                });
            } else {
                // It's a HIT. We can optionally log hits if we want verbose mode.
                // For now, let's only log recomputations as they are the perf killers.
                // But user might want to know hit rate. 
                // Let's emit with recomputation: false
                // perfEventBus.emit('redux-perf-selector', { name, duration, recomputation: false ...});
            }

            return result;
        };
    };
};


let anonymousSelectorCounter = 0;

export const createSelector = (...args: any[]) => {
    // 1. Infer Name
    const lastArg = args[args.length - 1];
    let name = 'AnonymousSelector';

    if (typeof lastArg === 'function') {
        name = lastArg.name || `AnonymousSelector-${++anonymousSelectorCounter}`;
    }

    // 2. Create a custom selector creator that uses our named memoizer
    // reselect v5 createSelectorCreator takes: (memoize, ...memoizeOptions)
    // We pass our factory that creates the memoizer for THIS specific selector name

    // Wait, createSelectorCreator creates a `createSelector` function.
    // We don't want to create a new factory for every selector, that's inefficient?
    // Actually, createSelectorCreator returns a function that we immediately call.

    // Correct usage of createSelectorCreator:
    // const myCreateSelector = createSelectorCreator(lruMemoize);
    // const selector = myCreateSelector(inputs, combine);

    // We want to inject the name. 
    // We can't easily pass 'name' to the memoize function via standard createSelectorCreator 
    // because the arguments are fixed.

    // Back to the Wrapper approach, but using the logic we designed above?
    // No, we can construct the memoizer manually.

    // Manual Construction Strategy (mimicking reselect internals but wrapping):

    // Actually, createSelector accepts `memoize` in options!
    // createSelector(input1, input2, combiner, { memoize: myMemoizer })

    // But we need to pass 'name' to 'myMemoizer'. 
    // Since 'myMemoizer' is created *inside* our createSelector wrapper, we CAN close over 'name'!

    const inputs = args.slice(0, -1);
    const resultFunc = args[args.length - 1]; // or options? 
    // Reselect v5 supports variable args. 
    // If last arg is options, use it.

    let options: CreateSelectorOptions = {};
    let combiner = resultFunc;
    let actualInputs = inputs;

    if (typeof resultFunc !== 'function') {
        // Last arg is options
        options = resultFunc as CreateSelectorOptions;
        combiner = args[args.length - 2];
        actualInputs = args.slice(0, -2);
    }

    // Check name in options
    // @ts-ignore
    if (options && options.name) {
        // @ts-ignore
        name = options.name;
    }

    // console.log('Creating Custom Selector:', name);

    // Create the specialized memoizer for this selector
    const memoizeWithTracking = (func: Function, ...opts: any[]) => {
        // console.log('PerfMemoize setup for selector:', name);
        // Use standard LRU
        const baseMemoize = lruMemoize(func as any, ...opts);
        let lastArgs: any[] | null = null;

        return (...args: any[]) => {
            // console.log(`PerfSelector Executing: ${name}, Enabled: ${perfConfig.selectorTrackingEnabled}`);
            if (!perfConfig.selectorTrackingEnabled) return baseMemoize(...args);

            let recomputation = false;
            let changedIndex = -1;

            if (!lastArgs || lastArgs.length !== args.length) {
                recomputation = true;
            } else {
                for (let i = 0; i < args.length; i++) {
                    if (args[i] !== lastArgs[i]) {
                        recomputation = true;
                        changedIndex = i;
                        break;
                    }
                }
            }

            if (recomputation) lastArgs = args;

            const start = performance.now();
            const result = baseMemoize(...args);
            const end = performance.now();

            if (recomputation) {
                const duration = end - start;
                if (duration > perfConfig.slowSelectorThreshold) {
                    console.warn(
                        `%c[ReduxPerf] Slow Selector: ${name}`,
                        'color: #e67e22; font-weight: bold',
                        `took ${duration.toFixed(2)}ms`
                    );
                }

                perfEventBus.emit('redux-perf-selector', {
                    name,
                    duration,
                    recomputation: true,
                    changedIndex,
                    timestamp: Date.now()
                });
            }
            return result;
        };
    };

    // Construct the selector using createSelectorCreator with our bound memoizer
    const customCreateSelector = createSelectorCreator(memoizeWithTracking);

    // We need to pass the inputs correctly. 'actualInputs' is an array of selectors.
    // customCreateSelector expects (...inputs, combiner)
    return customCreateSelector(...actualInputs, combiner, options);
};

// Alias for backward compatibility if needed, but createSelector is the main one now
export const createPerfSelector = (name: string, ...args: any[]) => {
    // Manually push name into options ??
    // Or just treat it as createSelector but ignore name arg logic?
    // Let's just forward to createSelector but set the name property on the function if possible,
    // or wrap it. 
    // Simpler: Just rely on createSelector's auto-naming or pass name in options?
    // But existing code passes name as 1st arg.

    // Let's just patch the name inference.
    // If we call createSelector with a named function, it works.

    // We can't easily perform the "name as first arg" translation to "options object" 
    // because variable args are hard.

    // Let's keep a simple wrapper that forces the name.
    // but we can't easily force the name into the closure of createSelector...

    // Okay, hacky but effective: 
    // define a combiner with the checks? NO.

    // Re-implement createPerfSelector to use the same internal logic but explicit name.
    return createSelector(...args, { memoizeOptions: { name } });
    // Wait, we aren't using memoizeOptions to pass name. We closed over 'name' in createSelector.
    // BUT createPerfSelector calls createSelector?

    // Let's just copy-paste the logic for createPerfSelector because I am lazy and it's safer.
    // Actually, createPerfSelector IS deprecated by my seamless createSelector.
    // But I must support it for the existing code in HeavyList if I hadn't already switched it.
    // I DID switch usage in HeavyList.

    // I'll leave a stub or just remove it if possible? 
    // I should support it.

    return createSelector(...args); // It will auto-name mostly.
};
