import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { perfEventBus } from '@dienp/redux-perf-core';

export const PerfDashboard: React.FC = () => {
    const [metrics, setMetrics] = useState({
        lastActionType: 'None',
        lastActionDuration: 0,
        actionCount: 0
    });

    useEffect(() => {
        const handleAction = (data: any) => {
            setMetrics(prev => ({
                lastActionType: data.type,
                lastActionDuration: data.duration,
                actionCount: prev.actionCount + 1
            }));
        };

        const unsubscribe = perfEventBus.on('redux-perf-action', handleAction);
        return () => unsubscribe();
    }, []);

    return (
        <View style={styles.container} pointerEvents="none">
            <Text style={styles.title}>Redux Perf</Text>
            <Text style={styles.text}>Actions: {metrics.actionCount}</Text>
            <Text style={styles.text}>Last: {metrics.lastActionType}</Text>
            <Text style={[
                styles.text,
                styles.duration,
                { color: metrics.lastActionDuration > 16 ? '#ff4d4d' : '#4dff4d' }
            ]}>
                Time: {metrics.lastActionDuration.toFixed(2)}ms
            </Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        top: 50,
        right: 10,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        padding: 10,
        borderRadius: 5,
        zIndex: 9999,
    },
    title: {
        color: 'white',
        fontWeight: 'bold',
        marginBottom: 5,
        borderBottomWidth: 1,
        borderBottomColor: '#555',
    },
    text: {
        color: 'white',
        fontFamily: 'monospace',
        fontSize: 12,
    },
    duration: {
        fontWeight: 'bold',
    }
});
