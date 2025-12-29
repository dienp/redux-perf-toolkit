import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

export interface HeavyItem {
    id: string;
    value: number;
    label: string;
    tags: string[];
}

interface HeavyState {
    items: HeavyItem[];
    deeplyNested: {
        level1: {
            level2: {
                level3: {
                    data: string;
                };
            };
        };
    };
}

const generateItems = (count: number): HeavyItem[] => {
    return Array.from({ length: count }, (_, i) => ({
        id: `item-${i}`,
        value: Math.random() * 1000,
        label: `Item ${i}`,
        tags: [`Group-${i % 10}`, `Status-${i % 5}`],
    }));
};

const initialState: HeavyState = {
    items: generateItems(5000), // Initial load of 5000 items
    deeplyNested: {
        level1: {
            level2: {
                level3: {
                    data: 'Initial Data',
                },
            },
        },
    },
};

const heavySlice = createSlice({
    name: 'heavy',
    initialState,
    reducers: {
        updateItemValue: (state, action: PayloadAction<{ id: string; value: number }>) => {
            const item = state.items.find((i) => i.id === action.payload.id);
            if (item) {
                item.value = action.payload.value;
            }
        },
        // A heavy reducer that shuffles the list or does something expensive
        shuffleItems: (state) => {
            // simple shuffle
            state.items.sort(() => Math.random() - 0.5);
        },
        updateDeepData: (state, action: PayloadAction<string>) => {
            state.deeplyNested.level1.level2.level3.data = action.payload;
        },
    },
});

export const { updateItemValue, shuffleItems, updateDeepData } = heavySlice.actions;
export default heavySlice.reducer;
