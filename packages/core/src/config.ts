export const perfConfig = {
    selectorTrackingEnabled: true,
    slowSelectorThreshold: 5, // ms
    storeSizeTrackingEnabled: true,
    maxStoreSizeThreshold: 5, // MB
};

export const setPerfOptions = (options: Partial<typeof perfConfig>) => {
    Object.assign(perfConfig, options);
};
