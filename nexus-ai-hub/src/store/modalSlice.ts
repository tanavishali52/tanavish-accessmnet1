import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Model } from '@/lib/api';

export type ModalTab = 'overview' | 'guide' | 'pricing' | 'prompt' | 'agent' | 'reviews' | 'create-agent';

interface ModalState {
  isOpen: boolean;
  activeModel: Model | null;
  activeTab: ModalTab;
}

const initialState: ModalState = {
  isOpen: false,
  activeModel: null,
  activeTab: 'overview',
};

const modalSlice = createSlice({
  name: 'modal',
  initialState,
  reducers: {
    openModal(state, action: PayloadAction<{ model: Model; tab?: ModalTab }>) {
      state.isOpen = true;
      state.activeModel = action.payload.model;
      state.activeTab = action.payload.tab ?? 'overview';
    },
    closeModal(state) {
      state.isOpen = false;
    },
    setModalTab(state, action: PayloadAction<ModalTab>) {
      state.activeTab = action.payload;
    },
  },
});

export const { openModal, closeModal, setModalTab } = modalSlice.actions;
export default modalSlice.reducer;
