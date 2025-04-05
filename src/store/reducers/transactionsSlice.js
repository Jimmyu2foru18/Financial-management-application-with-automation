// Transactions slice for Redux store
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  transactions: [],
  loading: false,
  error: null,
  filters: {
    dateRange: {
      startDate: null,
      endDate: null,
    },
    categories: [],
    accounts: [],
    searchTerm: '',
    minAmount: null,
    maxAmount: null,
    type: 'all', // 'all', 'income', 'expense', 'transfer'
  },
  selectedTransaction: null,
  pagination: {
    page: 1,
    limit: 50,
    total: 0,
  },
  sortBy: {
    field: 'date',
    direction: 'desc',
  },
};

const transactionsSlice = createSlice({
  name: 'transactions',
  initialState,
  reducers: {
    // Set loading state
    setLoading: (state, action) => {
      state.loading = action.payload;
      if (action.payload) {
        state.error = null;
      }
    },
    // Set transactions data
    setTransactions: (state, action) => {
      state.transactions = action.payload;
      state.loading = false;
      state.error = null;
      state.pagination.total = action.payload.length;
    },
    // Add a new transaction
    addTransaction: (state, action) => {
      state.transactions.unshift(action.payload);
      state.pagination.total = state.transactions.length;
      
      // Sort transactions based on current sort settings
      sortTransactions(state);
    },
    // Update an existing transaction
    updateTransaction: (state, action) => {
      const index = state.transactions.findIndex(transaction => transaction.id === action.payload.id);
      if (index !== -1) {
        state.transactions[index] = {
          ...state.transactions[index],
          ...action.payload,
        };
        
        // Update selected transaction if it's the one being updated
        if (state.selectedTransaction && state.selectedTransaction.id === action.payload.id) {
          state.selectedTransaction = {
            ...state.selectedTransaction,
            ...action.payload,
          };
        }
        
        // Sort transactions based on current sort settings
        sortTransactions(state);
      }
    },
    // Delete a transaction
    deleteTransaction: (state, action) => {
      state.transactions = state.transactions.filter(transaction => transaction.id !== action.payload);
      
      // Clear selected transaction if it's the one being deleted
      if (state.selectedTransaction && state.selectedTransaction.id === action.payload) {
        state.selectedTransaction = null;
      }
      
      state.pagination.total = state.transactions.length;
    },
    // Set selected transaction
    setSelectedTransaction: (state, action) => {
      state.selectedTransaction = action.payload;
    },
    // Set error state
    setError: (state, action) => {
      state.error = action.payload;
      state.loading = false;
    },
    // Update filters
    setFilters: (state, action) => {
      state.filters = {
        ...state.filters,
        ...action.payload,
      };
      // Reset to first page when filters change
      state.pagination.page = 1;
    },
    // Reset filters
    resetFilters: (state) => {
      state.filters = initialState.filters;
      state.pagination.page = 1;
    },
    // Update pagination
    setPagination: (state, action) => {
      state.pagination = {
        ...state.pagination,
        ...action.payload,
      };
    },
    // Update sort settings
    setSortBy: (state, action) => {
      state.sortBy = action.payload;
      sortTransactions(state);
    },
    // Batch add transactions (for imports)
    batchAddTransactions: (state, action) => {
      state.transactions = [...state.transactions, ...action.payload];
      state.pagination.total = state.transactions.length;
      
      // Sort transactions based on current sort settings
      sortTransactions(state);
    },
    // Clear transactions data
    clearTransactions: (state) => {
      state.transactions = [];
      state.selectedTransaction = null;
      state.pagination.total = 0;
      state.loading = false;
      state.error = null;
    },
  },
});

// Helper function to sort transactions
const sortTransactions = (state) => {
  const { field, direction } = state.sortBy;
  
  state.transactions.sort((a, b) => {
    let comparison = 0;
    
    // Handle different field types
    if (field === 'date') {
      comparison = new Date(a.date) - new Date(b.date);
    } else if (field === 'amount') {
      comparison = a.amount - b.amount;
    } else if (field === 'description' || field === 'category' || field === 'account') {
      comparison = a[field].localeCompare(b[field]);
    }
    
    // Apply sort direction
    return direction === 'asc' ? comparison : -comparison;
  });
};

// Export actions
export const {
  setLoading,
  setTransactions,
  addTransaction,
  updateTransaction,
  deleteTransaction,
  setSelectedTransaction,
  setError,
  setFilters,
  resetFilters,
  setPagination,
  setSortBy,
  batchAddTransactions,
  clearTransactions,
} = transactionsSlice.actions;

// Export selectors
export const selectTransactions = (state) => state.transactions.transactions;
export const selectFilteredTransactions = (state) => {
  const { transactions, filters } = state.transactions;
  
  return transactions.filter(transaction => {
    // Date range filter
    if (filters.dateRange.startDate && new Date(transaction.date) < new Date(filters.dateRange.startDate)) {
      return false;
    }
    if (filters.dateRange.endDate && new Date(transaction.date) > new Date(filters.dateRange.endDate)) {
      return false;
    }
    
    // Categories filter
    if (filters.categories.length > 0 && !filters.categories.includes(transaction.category)) {
      return false;
    }
    
    // Accounts filter
    if (filters.accounts.length > 0 && !filters.accounts.includes(transaction.accountId)) {
      return false;
    }
    
    // Search term filter
    if (filters.searchTerm) {
      const searchLower = filters.searchTerm.toLowerCase();
      const descriptionMatch = transaction.description.toLowerCase().includes(searchLower);
      const categoryMatch = transaction.category.toLowerCase().includes(searchLower);
      const noteMatch = transaction.note && transaction.note.toLowerCase().includes(searchLower);
      
      if (!descriptionMatch && !categoryMatch && !noteMatch) {
        return false;
      }
    }
    
    // Amount range filter
    if (filters.minAmount !== null && transaction.amount < filters.minAmount) {
      return false;
    }
    if (filters.maxAmount !== null && transaction.amount > filters.maxAmount) {
      return false;
    }
    
    // Transaction type filter
    if (filters.type !== 'all') {
      if (filters.type === 'income' && transaction.amount <= 0) {
        return false;
      }
      if (filters.type === 'expense' && transaction.amount >= 0) {
        return false;
      }
      if (filters.type === 'transfer' && transaction.type !== 'transfer') {
        return false;
      }
    }
    
    return true;
  });
};

export const selectPaginatedTransactions = (state) => {
  const filteredTransactions = selectFilteredTransactions(state);
  const { page, limit } = state.transactions.pagination;
  
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  
  return filteredTransactions.slice(startIndex, endIndex);
};

export const selectTransactionsLoading = (state) => state.transactions.loading;
export const selectTransactionsError = (state) => state.transactions.error;
export const selectSelectedTransaction = (state) => state.transactions.selectedTransaction;
export const selectTransactionFilters = (state) => state.transactions.filters;
export const selectTransactionPagination = (state) => state.transactions.pagination;
export const selectTransactionSortBy = (state) => state.transactions.sortBy;

// Export reducer
export default transactionsSlice.reducer;