import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createSelector } from '../selectors';
import { perfEventBus } from '../utils/eventBus';
import { perfConfig } from '../config';

describe('createSelector Performance Tracking', () => {
    beforeEach(() => {
        perfConfig.selectorTrackingEnabled = true;
        vi.clearAllMocks();
    });

    it('should compute result correctly', () => {
        const selectA = (state: any) => state.a;
        const selectB = (state: any) => state.b;
        const selector = createSelector([selectA, selectB], (a, b) => a + b);

        const state = { a: 1, b: 2 };
        expect(selector(state)).toBe(3);
    });

    it('should emit redux-perf-selector event on recomputation', () => {
        const emitSpy = vi.spyOn(perfEventBus, 'emit');
        const selectA = (state: any) => state.a;
        const selector = createSelector([selectA], (a) => a * 2);

        // First run (recomputation)
        selector({ a: 1 });
        expect(emitSpy).toHaveBeenCalledWith('redux-perf-selector', expect.objectContaining({
            recomputation: true,
            duration: expect.any(Number),
        }));

        emitSpy.mockClear();

        // Second run with same data (hit)
        selector({ a: 1 });
        expect(emitSpy).not.toHaveBeenCalledWith('redux-perf-selector', expect.anything());
    });

    it('should detect the changed dependency index', () => {
        const emitSpy = vi.spyOn(perfEventBus, 'emit');
        const selectA = (state: any) => state.a;
        const selectB = (state: any) => state.b;
        const selector = createSelector([selectA, selectB], (a, b) => a + b);

        // Initial run
        selector({ a: 1, b: 10 });
        emitSpy.mockClear();

        // Change second dependency
        selector({ a: 1, b: 20 });
        expect(emitSpy).toHaveBeenCalledWith('redux-perf-selector', expect.objectContaining({
            changedIndex: 1,
            recomputation: true
        }));
    });

    it('should support named selectors via options', () => {
        const emitSpy = vi.spyOn(perfEventBus, 'emit');
        const selectA = (state: any) => state.a;
        const selector = createSelector([selectA], (a) => a, { name: 'MyCoolSelector' });

        selector({ a: 1 });
        expect(emitSpy).toHaveBeenCalledWith('redux-perf-selector', expect.objectContaining({
            name: 'MyCoolSelector'
        }));
    });

    it('should automatically infer names from combiner function name', () => {
        const emitSpy = vi.spyOn(perfEventBus, 'emit');
        const selectA = (state: any) => state.a;
        function mySpecialCombiner(a: any) { return a; }

        const selector = createSelector([selectA], mySpecialCombiner);

        selector({ a: 1 });
        expect(emitSpy).toHaveBeenCalledWith('redux-perf-selector', expect.objectContaining({
            name: 'mySpecialCombiner'
        }));
    });
});
