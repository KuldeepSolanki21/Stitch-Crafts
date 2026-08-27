import { configureStore } from '@reduxjs/toolkit';

export const adminStore = configureStore({
  reducer: {},
});

export type RootState = ReturnType<typeof adminStore.getState>;
export type AppDispatch = typeof adminStore.dispatch;
