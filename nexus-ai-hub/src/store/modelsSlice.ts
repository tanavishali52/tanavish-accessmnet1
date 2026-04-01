import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { Model, Lab, ResearchItem } from '@/lib/api';

interface ModelsState {
  items: Model[];
  labs: Lab[];
  research: ResearchItem[];
  status: 'idle' | 'loading' | 'loaded' | 'error';
  searchQuery: string;
  activeFilter: string;
  activeLab: string;
  priceRange: number;
  minRating: string;
}

const initialState: ModelsState = {
  items: [],
  labs: [],
  research: [],
  status: 'idle',
  searchQuery: '',
  activeFilter: 'all',
  activeLab: 'all',
  priceRange: 100,
  minRating: 'any',
};

const modelsSlice = createSlice({
  name: 'models',
  initialState,
  reducers: {
    setModelsLoading(state) {
      state.status = 'loading';
    },
    setModels(state, action: PayloadAction<Model[]>) {
      state.items = action.payload;
      state.status = 'loaded';
    },
    setModelsError(state) {
      state.status = 'error';
    },
    setLabs(state, action: PayloadAction<Lab[]>) {
      state.labs = action.payload;
      state.status = 'loaded';
    },
    setResearch(state, action: PayloadAction<ResearchItem[]>) {
      state.research = action.payload;
      state.status = 'loaded';
    },
    setSearchQuery(state, action: PayloadAction<string>) {
      state.searchQuery = action.payload;
    },
    setActiveFilter(state, action: PayloadAction<string>) {
      state.activeFilter = action.payload;
    },
    setActiveLab(state, action: PayloadAction<string>) {
      state.activeLab = action.payload;
    },
    setPriceRange(state, action: PayloadAction<number>) {
      state.priceRange = action.payload;
    },
    setMinRating(state, action: PayloadAction<string>) {
      state.minRating = action.payload;
    },
    clearLabFilter(state) {
      state.activeLab = 'all';
    },
  },
});

export const {
  setModelsLoading, setModels, setModelsError,
  setLabs, setResearch,
  setSearchQuery, setActiveFilter, setActiveLab,
  setPriceRange, setMinRating, clearLabFilter,
} = modelsSlice.actions;
export default modelsSlice.reducer;
