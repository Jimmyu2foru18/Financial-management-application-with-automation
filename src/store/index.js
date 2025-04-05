// Redux store configuration
import { configureStore } from '@reduxjs/toolkit';

// Import reducers
import authReducer from './reducers/authSlice';
import accountsReducer from './reducers/accountsSlice';
import transactionsReducer from './reducers/transactionsSlice';
import budgetsReducer from './reducers/budgetsSlice';
import goalsReducer from './reducers/goalsSlice';
import uiReducer from './reducers/uiSlice';

// Configure the Redux store
export const store = configureStore({
  reducer: {
    auth: authReducer,
    accounts: accountsReducer,
    transactions: transactionsReducer,
    budgets: budgetsReducer,
    goals: goalsReducer,
    ui: uiReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these action types
        ignoredActions: ['auth/setUser'],
        // Ignore these field paths in all actions
        ignoredActionPaths: ['payload.user', 'meta.arg.user'],
        // Ignore these paths in the state
        ignoredPaths: ['auth.user'],
      },
    }),
  devTools: process.env.NODE_ENV !== 'production',
});

// Export the store
export default store;