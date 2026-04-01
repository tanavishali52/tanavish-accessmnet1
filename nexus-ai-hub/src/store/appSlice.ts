import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export type ActivePage = 'landing' | 'app';
export type ActiveTab = 'chat' | 'marketplace' | 'agents' | 'research';

interface AppState {
  activePage: ActivePage;
  activeTab: ActiveTab;
  toastMessage: string;
  toastVisible: boolean;
}

const initialState: AppState = {
  activePage: 'landing',
  activeTab: 'chat',
  toastMessage: '',
  toastVisible: false,
};

const appSlice = createSlice({
  name: 'app',
  initialState,
  reducers: {
    setActivePage(state, action: PayloadAction<ActivePage>) {
      state.activePage = action.payload;
    },
    setActiveTab(state, action: PayloadAction<ActiveTab>) {
      state.activeTab = action.payload;
    },
    openApp(state, action: PayloadAction<ActiveTab>) {
      state.activePage = 'app';
      state.activeTab = action.payload;
    },
    goHome(state) {
      state.activePage = 'landing';
    },
    showToast(state, action: PayloadAction<string>) {
      state.toastMessage = action.payload;
      state.toastVisible = true;
    },
    hideToast(state) {
      state.toastVisible = false;
    },
  },
});

export const { setActivePage, setActiveTab, openApp, goHome, showToast, hideToast } = appSlice.actions;
export default appSlice.reducer;
