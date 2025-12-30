import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

interface LabState {
    dummyData: any[];
    slowSelectorActive: boolean;
    dispatchStormCount: number;
}

const initialState: LabState = {
    dummyData: [],
    slowSelectorActive: false,
    dispatchStormCount: 0,
};

const labSlice = createSlice({
    name: 'lab',
    initialState,
    reducers: {
        generateLargeState: (state, action: PayloadAction<number>) => {
            // Generate approximately action.payload MB of data
            // Each small object is roughly ~135 bytes in JSON
            const count = (action.payload * 1024 * 1024) / 135;
            state.dummyData = Array.from({ length: count }, (_, i) => ({
                id: i,
                text: 'This is some dummy text to fill up the state and simulate high memory usage.',
                meta: { index: i, active: true },
            }));
        },
        clearLargeState: (state) => {
            state.dummyData = [];
        },
        toggleSlowSelector: (state) => {
            state.slowSelectorActive = !state.slowSelectorActive;
        },
        incrementDispatchStorm: (state) => {
            state.dispatchStormCount++;
        },
    },
});

export const { generateLargeState, clearLargeState, toggleSlowSelector, incrementDispatchStorm } = labSlice.actions;
export default labSlice.reducer;
