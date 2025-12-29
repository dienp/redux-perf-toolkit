export const perfConfig = {
    selectorTrackingEnabled: true,
    slowSelectorThreshold: 5, // ms
};

export const setPerfOptions = (options: Partial<typeof perfConfig>) => {
    Object.assign(perfConfig, options);
};
