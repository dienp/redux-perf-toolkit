import { useRef, useEffect } from 'react';

export const useRenderTracker = (componentName: string) => {
    const renderCount = useRef(0);

    useEffect(() => {
        renderCount.current++;
        if (renderCount.current > 0) {
            // Highlight logic could go here
        }
    });

    return renderCount.current;
};
