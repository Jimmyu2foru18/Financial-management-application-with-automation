// Accounts slice for Redux store
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  accounts: [],
  loading: false,
  error: null,
  selectedAccount: null,
  totalBalance: 0,
  netWorth: 0,
};

const accountsSlice = createSlice({
  name: 'accounts',
  initialState,
  reducers: {
    // Set loading state
    setLoading: (state, action) => {
      state.loading = action.payload;
      if (action.payload) {
        state.error = null;
      }
    },
    // Set accounts data
    setAccounts: (state, action) => {
      state.accounts = action.payload;
      state.loading = false;
      state.error = null;
      
      // Calculate total balance and net worth
      state.totalBalance = calculateTotalBalance(action.payload);
      state.netWorth = calculateNetWorth(action.payload);
    },
    // Add a new account
    addAccount: (state, action) => {
      state.accounts.push(action.payload);
      state.totalBalance = calculateTotalBalance(state.accounts);
      state.netWorth = calculateNetWorth(state.accounts);
    },
    // Update an existing account
    updateAccount: (state, action) => {
      const index = state.accounts.findIndex(account => account.id === action.payload.id);
      if (index !== -1) {
        state.accounts[index] = {
          ...state.accounts[index],
          ...action.payload,
        };
        
        // Update selected account if it's the one being updated
        if (state.selectedAccount && state.selectedAccount.id === action.payload.id) {
          state.selectedAccount = {
            ...state.selectedAccount,
            ...action.payload,
          };
        }
        
        state.totalBalance = calculateTotalBalance(state.accounts);
        state.netWorth = calculateNetWorth(state.accounts);
      }
    },
    // Delete an account
    deleteAccount: (state, action) => {
      state.accounts = state.accounts.filter(account => account.id !== action.payload);
      
      // Clear selected account if it's the one being deleted
      if (state.selectedAccount && state.selectedAccount.id === action.payload) {
        state.selectedAccount = null;
      }
      
      state.totalBalance = calculateTotalBalance(state.accounts);
      state.netWorth = calculateNetWorth(state.accounts);
    },
    // Set selected account
    setSelectedAccount: (state, action) => {
      state.selectedAccount = action.payload;
    },
    // Set error state
    setError: (state, action) => {
      state.error = action.payload;
      state.loading = false;
    },
    // Update account balance
    updateAccountBalance: (state, action) => {
      const { accountId, newBalance } = action.payload;
      const index = state.accounts.findIndex(account => account.id === accountId);
      
      if (index !== -1) {
        state.accounts[index].balance = newBalance;
        
        // Update selected account if it's the one being updated
        if (state.selectedAccount && state.selectedAccount.id === accountId) {
          state.selectedAccount.balance = newBalance;
        }
        
        state.totalBalance = calculateTotalBalance(state.accounts);
        state.netWorth = calculateNetWorth(state.accounts);
      }
    },
    // Clear accounts data
    clearAccounts: (state) => {
      state.accounts = [];
      state.selectedAccount = null;
      state.totalBalance = 0;
      state.netWorth = 0;
      state.loading = false;
      state.error = null;
    },
  },
});

// Helper functions for calculations
const calculateTotalBalance = (accounts) => {
  return accounts.reduce((total, account) => {
    // Only include asset accounts (checking, savings, investment)
    if (['checking', 'savings', 'investment', 'cash', 'asset'].includes(account.type)) {
      return total + account.balance;
    }
    return total;
  }, 0);
};

const calculateNetWorth = (accounts) => {
  return accounts.reduce((total, account) => {
    // Add assets
    if (['checking', 'savings', 'investment', 'cash', 'asset'].includes(account.type)) {
      return total + account.balance;
    }
    // Subtract liabilities
    if (['credit', 'loan', 'debt'].includes(account.type)) {
      return total - account.balance;
    }
    return total;
  }, 0);
};

// Export actions
export const {
  setLoading,
  setAccounts,
  addAccount,
  updateAccount,
  deleteAccount,
  setSelectedAccount,
  setError,
  updateAccountBalance,
  clearAccounts,
} = accountsSlice.actions;

// Export selectors
export const selectAccounts = (state) => state.accounts.accounts;
export const selectAccountsLoading = (state) => state.accounts.loading;
export const selectAccountsError = (state) => state.accounts.error;
export const selectSelectedAccount = (state) => state.accounts.selectedAccount;
export const selectTotalBalance = (state) => state.accounts.totalBalance;
export const selectNetWorth = (state) => state.accounts.netWorth;

// Export reducer
export default accountsSlice.reducer;