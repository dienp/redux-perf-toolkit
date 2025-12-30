import { perfEventBus } from './utils/eventBus';
import { perfConfig } from './config';

interface Metric {
    count: number;
    totalDuration: number;
    maxDuration: number;
    minDuration: number;
}

export class PerfAnalytics {
    private actions: Record<string, Metric> = {};
    private selectors: Record<string, Metric> = {};
    private storeSizes: { timestamp: number; size: number }[] = [];
    private unsubscribes: (() => void)[] = [];

    private isTracking: boolean = false;

    constructor() {
        this.startTracking();
    }

    public startTracking() {
        if (this.isTracking) return;
        this.isTracking = true;

        const handleAction = (data: { type: string; duration: number }) => {
            if (!this.actions[data.type]) {
                this.actions[data.type] = { count: 0, totalDuration: 0, maxDuration: 0, minDuration: Infinity };
            }
            const m = this.actions[data.type];
            m.count++;
            m.totalDuration += data.duration;
            m.maxDuration = Math.max(m.maxDuration, data.duration);
            m.minDuration = Math.min(m.minDuration, data.duration);
        };

        const handleSelector = (data: { name: string; duration: number }) => {
            if (!this.selectors[data.name]) {
                this.selectors[data.name] = { count: 0, totalDuration: 0, maxDuration: 0, minDuration: Infinity };
            }
            const m = this.selectors[data.name];
            m.count++;
            m.totalDuration += data.duration;
            m.maxDuration = Math.max(m.maxDuration, data.duration);
            m.minDuration = Math.min(m.minDuration, data.duration);
        };

        const handleStoreSize = (data: { size: number; timestamp: number }) => {
            this.storeSizes.push(data);
            if (data.size > perfConfig.maxStoreSizeThreshold * 1024 * 1024) {
                console.warn(
                    `%c[ReduxPerf] High Memory Warning: Store size is ${(data.size / (1024 * 1024)).toFixed(2)}MB (Threshold: ${perfConfig.maxStoreSizeThreshold}MB)`,
                    'color: orange; font-weight: bold'
                );
            }
        };

        perfEventBus.on('redux-perf-action', handleAction);
        perfEventBus.on('redux-perf-selector', handleSelector);
        perfEventBus.on('redux-perf-store-size', handleStoreSize);

        this.unsubscribes.push(
            () => perfEventBus.off('redux-perf-action', handleAction),
            () => perfEventBus.off('redux-perf-selector', handleSelector),
            () => perfEventBus.off('redux-perf-store-size', handleStoreSize)
        );
    }

    public stopTracking() {
        if (!this.isTracking) return;
        this.isTracking = false;
        this.unsubscribes.forEach(unsub => unsub());
        this.unsubscribes = [];
    }

    public reset() {
        this.actions = {};
        this.selectors = {};
        this.storeSizes = [];
        console.log('%c[ReduxPerf] Performance metrics reset', 'color: #2196F3; font-weight: bold');
    }

    public getIsTracking() {
        return this.isTracking;
    }

    private getTop10(metrics: Record<string, Metric>, sortBy: 'count' | 'maxDuration' | 'totalDuration') {
        return Object.entries(metrics)
            .map(([name, m]) => ({
                name,
                count: m.count,
                avg: (m.totalDuration / m.count).toFixed(2) + 'ms',
                max: m.maxDuration.toFixed(2) + 'ms',
                total: m.totalDuration.toFixed(2) + 'ms',
                _totalRaw: m.totalDuration,
                _maxRaw: m.maxDuration
            }))
            .sort((a, b) => {
                if (sortBy === 'count') return b.count - a.count;
                if (sortBy === 'maxDuration') return b._maxRaw - a._maxRaw;
                return b._totalRaw - a._totalRaw;
            })
            .slice(0, 10)
            .map(({ _totalRaw, _maxRaw, ...rest }) => rest);
    }

    public logSummary() {
        console.log('%c[ReduxPerf] Performance Summary', 'font-size: 16px; font-weight: bold; color: #4CAF50');

        console.log('\n%c--- Top 10 Most Triggered Actions ---', 'font-weight: bold');
        console.table(this.getTop10(this.actions, 'count'));

        console.log('\n%c--- Top 10 Slowest Actions (Max Duration) ---', 'font-weight: bold');
        console.table(this.getTop10(this.actions, 'maxDuration'));

        console.log('\n%c--- Top 10 Heaviest Actions (Total Time) ---', 'font-weight: bold');
        console.table(this.getTop10(this.actions, 'totalDuration'));

        console.log('\n%c--- Top 10 Most Triggered Selectors ---', 'font-weight: bold');
        console.table(this.getTop10(this.selectors, 'count'));

        console.log('\n%c--- Top 10 Slowest Selectors (Max Duration) ---', 'font-weight: bold');
        console.table(this.getTop10(this.selectors, 'maxDuration'));

        console.log('\n%c--- Top 10 Heaviest Selectors (Total Time) ---', 'font-weight: bold');
        console.table(this.getTop10(this.selectors, 'totalDuration'));

        if (this.storeSizes.length > 0) {
            const lastSize = this.storeSizes[this.storeSizes.length - 1].size;
            console.log(`\n%cCurrent Store Size: ${(lastSize / (1024 * 1024)).toFixed(2)}MB`, 'font-weight: bold; color: #2196F3');
        }
    }
}

export const perfAnalytics = new PerfAnalytics();
