import { describe, it, expect, vi, beforeEach } from 'vitest';
import { PerfAnalytics } from '../analytics';
import { perfEventBus } from '../utils/eventBus';

describe('PerfAnalytics', () => {
    let analytics: PerfAnalytics;

    beforeEach(() => {
        analytics = new PerfAnalytics();
        analytics.reset();
    });

    it('should track actions', () => {
        perfEventBus.emit('redux-perf-action', { type: 'ACTION_A', duration: 10, timestamp: Date.now() });
        perfEventBus.emit('redux-perf-action', { type: 'ACTION_A', duration: 20, timestamp: Date.now() });

        // Internal state check via logSummary (checking if it doesn't throw and captures data)
        const logSpy = vi.spyOn(console, 'table');
        analytics.logSummary();

        // Most triggered actions table
        expect(logSpy).toHaveBeenCalled();
        logSpy.mockRestore();
    });

    it('should respect stopTracking', () => {
        analytics.stopTracking();
        perfEventBus.emit('redux-perf-action', { type: 'ACTION_A', duration: 10, timestamp: Date.now() });

        const logSpy = vi.spyOn(console, 'table');
        analytics.logSummary();

        // Tables should be empty
        const calls = logSpy.mock.calls;
        // @ts-ignore
        const actionTable = calls.find(c => Array.isArray(c[0]) && c[0].length > 0 && c[0][0].name === 'ACTION_A');
        expect(actionTable).toBeUndefined();

        logSpy.mockRestore();
    });

    it('should reset metrics', () => {
        perfEventBus.emit('redux-perf-action', { type: 'ACTION_X', duration: 10, timestamp: Date.now() });
        analytics.reset();

        const logSpy = vi.spyOn(console, 'table');
        analytics.logSummary();

        const calls = logSpy.mock.calls;
        // @ts-ignore
        const actionTable = calls.find(c => Array.isArray(c[0]) && c[0].length > 0);
        expect(actionTable).toBeUndefined();

        logSpy.mockRestore();
    });
});
