import { createSelectorCreator, lruMemoize, CreateSelectorOptions } from 'reselect';
import { perfEventBus } from './utils/eventBus';
import { perfConfig } from './config';

let anonymousSelectorCounter = 0;

export const createSelector = (...args: any[]) => {
    // 1. Infer Name and Options
    const inputs = args.slice(0, -1);
    const resultFunc = args[args.length - 1];

    let options: CreateSelectorOptions = {};
    let combiner = resultFunc;
    let actualInputs = inputs;
    let name = 'AnonymousSelector';

    if (typeof resultFunc !== 'function') {
        // Last arg is options
        options = resultFunc as CreateSelectorOptions;
        combiner = args[args.length - 2];
        actualInputs = args.slice(0, -2);
    }

    // Attempt to get name from combiner or options
    if (typeof combiner === 'function' && combiner.name) {
        name = combiner.name;
    }

    // @ts-ignore
    if (options && options.name) {
        // @ts-ignore
        name = options.name;
    }

    if (name === 'AnonymousSelector' || !name) {
        name = `AnonymousSelector-${++anonymousSelectorCounter}`;
    }

    // 2. Create the specialized memoizer for this selector
    const memoizeWithTracking = (func: Function, ...opts: any[]) => {
        const baseMemoize = lruMemoize(func as any, ...opts);
        let lastArgs: any[] | null = null;

        return (...args: any[]) => {
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

    const customCreateSelector = createSelectorCreator(memoizeWithTracking);
    return customCreateSelector(...actualInputs, combiner, options);
};

// Alias for backward compatibility
export const createPerfSelector = (nameOrCombiner: any, ...args: any[]) => {
    if (typeof nameOrCombiner === 'string') {
        const name = nameOrCombiner;
        const lastArg = args[args.length - 1];
        if (lastArg && typeof lastArg === 'object' && !Array.isArray(lastArg) && typeof lastArg !== 'function') {
            // @ts-ignore
            lastArg.name = name;
            return createSelector(...args);
        }
        return createSelector(...args, { name });
    }
    return createSelector(nameOrCombiner, ...args);
};
