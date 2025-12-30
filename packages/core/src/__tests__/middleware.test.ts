import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createPerfMiddleware } from '../middleware';
import { perfEventBus } from '../utils/eventBus';
import { perfConfig } from '../config';

describe('createPerfMiddleware', () => {
    let store: any;
    let next: any;
    let action: any;

    beforeEach(() => {
        store = {
            getState: vi.fn(() => ({})),
        };
        next = vi.fn((action) => action);
        action = { type: 'TEST_ACTION' };
        vi.clearAllMocks();
        // Enable store size tracking for relevant tests
        perfConfig.storeSizeTrackingEnabled = false;
    });

    it('should call next(action)', () => {
        const middleware = createPerfMiddleware()(store)(next);
        middleware(action);
        expect(next).toHaveBeenCalledWith(action);
    });

    it('should emit redux-perf-action event with valid duration', () => {
        const emitSpy = vi.spyOn(perfEventBus, 'emit');
        const middleware = createPerfMiddleware()(store)(next);

        middleware(action);

        expect(emitSpy).toHaveBeenCalledWith('redux-perf-action', expect.objectContaining({
            type: 'TEST_ACTION',
            duration: expect.any(Number),
            timestamp: expect.any(Number),
        }));
    });

    it('should warning for slow actions (>16ms)', () => {
        const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => { });
        const slowNext = vi.fn((action) => {
            // Simple artificial delay isn't enough for performance.now() 
            // if the engine is too fast, but common next calls are synchronous.
            const start = performance.now();
            while (performance.now() - start < 20) { }
            return action;
        });

        const middleware = createPerfMiddleware()(store)(slowNext);
        middleware(action);

        expect(warnSpy).toHaveBeenCalledWith(
            expect.stringContaining('[ReduxPerf] Slow Action: TEST_ACTION'),
            expect.any(String),
            expect.stringContaining('took')
        );
        warnSpy.mockRestore();
    });

    it('should emit store size event if enabled and throttled', () => {
        perfConfig.storeSizeTrackingEnabled = true;
        const emitSpy = vi.spyOn(perfEventBus, 'emit');
        const middleware = createPerfMiddleware()(store)(next);

        middleware(action);

        expect(emitSpy).toHaveBeenCalledWith('redux-perf-store-size', expect.objectContaining({
            size: expect.any(Number),
            timestamp: expect.any(Number),
        }));
    });

    it('should throttle store size checks', () => {
        perfConfig.storeSizeTrackingEnabled = true;
        const emitSpy = vi.spyOn(perfEventBus, 'emit');
        const middleware = createPerfMiddleware()(store)(next);

        // First call (emits)
        middleware(action);
        const firstEmitCount = emitSpy.mock.calls.filter(c => c[0] === 'redux-perf-store-size').length;
        expect(firstEmitCount).toBe(1);

        // Second immediate call (should be throttled)
        middleware(action);
        const secondEmitCount = emitSpy.mock.calls.filter(c => c[0] === 'redux-perf-store-size').length;
        expect(secondEmitCount).toBe(1);
    });
});
