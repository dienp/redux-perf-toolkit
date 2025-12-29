import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState } from '../store';
import { updateItemValue, shuffleItems, type HeavyItem } from '../features/heavy/heavySlice';
import { useRenderTracker } from '@dienp/redux-perf-core';
import {
    Box,
    Button,
    Card,
    CardContent,
    List,
    ListItem,
    ListItemText,
    TextField,
    Typography,
    Chip,
    Stack,
    Divider
} from '@mui/material';
import ShuffleIcon from '@mui/icons-material/Shuffle';
import RefreshIcon from '@mui/icons-material/Refresh';

// A heavy selector that isn't memoized properly
// Standard reselect import - but it will be hijacked by Vite!
import { createSelector } from 'reselect';

// Create the selector outside the component to benefit from memoization
// (Original code was creating a hook that re-ran logic, which was bad,
//  but now we demonstrate proper selection with perf tracking)
const selectHeavyItems = createSelector(
    (state: RootState) => state.heavy.items,
    (items: any[]) => { // Anonymous function, let's see if our proxy handles it!
        // Intensively process the items every time memoization breaks
        const sorted = [...items].sort((a, b) => {
            // Artificial delay
            for (let i = 0; i < 1000; i++) { }
            return a.value - b.value;
        });
        return sorted;
    }
);

// Input selector for the filter string
const selectFilter = (_: RootState, filter: string) => filter;

// A composite selector that tracks multiple dependencies
const selectFilteredHeavyItems = createSelector(
    [selectHeavyItems, selectFilter],
    function SelectFilteredItems(items, filter) { // Naming this function names the selector!
        // Make this slow enough to show up in the dashboard
        const start = performance.now();
        while (performance.now() - start < 5) { } // 5ms busy wait

        if (!filter) return items;
        return items.filter(i => i.label.toLowerCase().includes(filter.toLowerCase()));
    }
);

export const HeavyList: React.FC = () => {
    const dispatch = useDispatch();
    const [filter, setFilter] = useState('');

    // Pass the filter to the selector
    // Note: We use an arrow function to pass the 'filter' arg to the selector
    const items = useSelector((state: RootState) => selectFilteredHeavyItems(state, filter)) as HeavyItem[];

    useRenderTracker('HeavyList');

    // Intentionally inefficient rendering
    return (
        <Card>
            <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                    <Typography variant="h5">
                        Heavy List ({items.length} items)
                    </Typography>
                    <Button
                        variant="outlined"
                        startIcon={<ShuffleIcon />}
                        onClick={() => dispatch(shuffleItems())}
                    >
                        Shuffle (Global Update)
                    </Button>
                </Box>

                <TextField
                    fullWidth
                    variant="outlined"
                    label="Filter by name (local state)"
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                    sx={{ mb: 2 }}
                />

                <List sx={{ height: 500, overflowY: 'scroll', border: '1px solid #e0e0e0', borderRadius: 1 }}>
                    {items.map((item, index) => ( // Filtering is now done in the selector!
                        <React.Fragment key={item.id}>
                            <ListItem
                                secondaryAction={
                                    <Button
                                        size="small"
                                        startIcon={<RefreshIcon />}
                                        onClick={() => dispatch(updateItemValue({ id: item.id, value: Math.random() * 1000 }))}
                                    >
                                        Update
                                    </Button>
                                }
                            >
                                <ListItemText
                                    primary={item.label}
                                    secondary={
                                        <Box component="span">
                                            <Typography variant="body2" component="span" color="text.secondary">
                                                Value: {item.value.toFixed(2)}
                                            </Typography>
                                            <Stack direction="row" spacing={1} mt={0.5}>
                                                {item.tags.map((tag, i) => (
                                                    <Chip key={i} label={tag} size="small" variant="outlined" />
                                                ))}
                                            </Stack>
                                        </Box>
                                    }
                                    secondaryTypographyProps={{ component: 'div' }}
                                />
                            </ListItem>
                            {index < items.length - 1 && <Divider component="li" />}
                        </React.Fragment>
                    ))}
                </List>
            </CardContent>
        </Card>
    );
};
