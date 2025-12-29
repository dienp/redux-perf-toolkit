import React, { useEffect, useState } from 'react';
import { perfEventBus } from '../utils/eventBus';

export const PerfDashboard: React.FC = () => {
    const [metrics, setMetrics] = useState({
        lastActionType: 'None',
        lastActionDuration: 0,
        actionCount: 0
    });

    // Track most expensive selector
    const [slowestSelector, setSlowestSelector] = useState({ name: '', duration: 0, changedIndex: -1 });

    useEffect(() => {
        const handleAction = (data: any) => {
            setMetrics(prev => ({
                lastActionType: data.type,
                lastActionDuration: data.duration,
                actionCount: prev.actionCount + 1
            }));
        };

        const handleSelector = (data: any) => {
            // Defer the state update to the next tick to avoid "Cannot update a component while rendering another"
            // This happens because selectors run during the render phase.
            setTimeout(() => {
                if (data.duration > 1 || (data.duration > 0 && data.recomputation)) {
                    setSlowestSelector(prev => {
                        if (data.duration >= prev.duration) {
                            return {
                                name: data.name,
                                duration: data.duration,
                                changedIndex: data.changedIndex
                            };
                        }
                        return prev;
                    });
                }
            }, 0);
        };

        const unsubscribeAction = perfEventBus.on('redux-perf-action', handleAction);
        const unsubscribeSelector = perfEventBus.on('redux-perf-selector', handleSelector);

        return () => {
            unsubscribeAction();
            unsubscribeSelector();
        };
    }, []);

    return (
        <div style={{
            position: 'fixed',
            top: '50px',
            right: '10px',
            background: 'rgba(0, 0, 0, 0.8)',
            color: 'white',
            padding: '10px',
            borderRadius: '5px',
            fontFamily: 'monospace',
            zIndex: 9999,
            pointerEvents: 'none',
            fontSize: '12px',
            minWidth: '200px'
        }}>
            <div style={{ borderBottom: '1px solid #555', marginBottom: '5px', fontWeight: 'bold' }}>
                Redux Perf
            </div>
            <div>Actions: {metrics.actionCount}</div>
            <div>Last: {metrics.lastActionType}</div>
            <div style={{
                color: metrics.lastActionDuration > 16 ? '#ff4d4d' : '#4dff4d',
                fontWeight: 'bold'
            }}>
                Time: {metrics.lastActionDuration.toFixed(2)}ms
            </div>

            {slowestSelector.duration > 0 && (
                <>
                    <div style={{ borderTop: '1px solid #555', marginTop: '5px', paddingTop: '5px', fontWeight: 'bold' }}>
                        Slowest Selector
                    </div>
                    <div>{slowestSelector.name}</div>
                    <div style={{ color: '#ff4d4d' }}>
                        {slowestSelector.duration.toFixed(2)}ms
                    </div>
                    {slowestSelector.changedIndex !== undefined && slowestSelector.changedIndex !== -1 && (
                        <div style={{ fontSize: '10px', color: '#aaa', marginTop: '2px' }}>
                            Caused by dep #{slowestSelector.changedIndex}
                        </div>
                    )}
                </>
            )}
        </div>
    );
};
