import { configureStore } from '@reduxjs/toolkit';
import themeReducer from './theme/themeSlice';
import authReducer from './auth/authSlice';
import tasksReducer from './tasks/tasksSlice';

export const store = configureStore({
  reducer: {
    theme: themeReducer,
    auth: authReducer,
    tasks: tasksReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
