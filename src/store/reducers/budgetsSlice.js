// Budgets slice for Redux store
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  budgets: [],
  loading: false,
  error: null,
  selectedBudget: null,
  activeBudgetPeriod: {
    startDate: null,
    endDate: null,
  },
  budgetMethod: 'category', // 'category', 'zero-based', '50-30-20'
  budgetPerformance: {
    totalBudgeted: 0,
    totalSpent: 0,
    remainingAmount: 0,
    percentUsed: 0,
  },
};

const budgetsSlice = createSlice({
  name: 'budgets',
  initialState,
  reducers: {
    // Set loading state
    setLoading: (state, action) => {
      state.loading = action.payload;
      if (action.payload) {
        state.error = null;
      }
    },
    // Set budgets data
    setBudgets: (state, action) => {
      state.budgets = action.payload;
      state.loading = false;
      state.error = null;
      
      // Calculate budget performance
      calculateBudgetPerformance(state);
    },
    // Add a new budget
    addBudget: (state, action) => {
      state.budgets.push(action.payload);
      calculateBudgetPerformance(state);
    },
    // Update an existing budget
    updateBudget: (state, action) => {
      const index = state.budgets.findIndex(budget => budget.id === action.payload.id);
      if (index !== -1) {
        state.budgets[index] = {
          ...state.budgets[index],
          ...action.payload,
        };
        
        // Update selected budget if it's the one being updated
        if (state.selectedBudget && state.selectedBudget.id === action.payload.id) {
          state.selectedBudget = {
            ...state.selectedBudget,
            ...action.payload,
          };
        }
        
        calculateBudgetPerformance(state);
      }
    },
    // Delete a budget
    deleteBudget: (state, action) => {
      state.budgets = state.budgets.filter(budget => budget.id !== action.payload);
      
      // Clear selected budget if it's the one being deleted
      if (state.selectedBudget && state.selectedBudget.id === action.payload) {
        state.selectedBudget = null;
      }
      
      calculateBudgetPerformance(state);
    },
    // Set selected budget
    setSelectedBudget: (state, action) => {
      state.selectedBudget = action.payload;
    },
    // Set error state
    setError: (state, action) => {
      state.error = action.payload;
      state.loading = false;
    },
    // Set active budget period
    setActiveBudgetPeriod: (state, action) => {
      state.activeBudgetPeriod = action.payload;
      calculateBudgetPerformance(state);
    },
    // Set budget method
    setBudgetMethod: (state, action) => {
      state.budgetMethod = action.payload;
    },
    // Update budget category amount
    updateBudgetCategoryAmount: (state, action) => {
      const { budgetId, categoryId, amount } = action.payload;
      const budgetIndex = state.budgets.findIndex(budget => budget.id === budgetId);
      
      if (budgetIndex !== -1) {
        const budget = state.budgets[budgetIndex];
        const categoryIndex = budget.categories.findIndex(category => category.id === categoryId);
        
        if (categoryIndex !== -1) {
          budget.categories[categoryIndex].amount = amount;
          
          // Update total budgeted amount
          budget.totalAmount = budget.categories.reduce((total, category) => total + category.amount, 0);
          
          // Update selected budget if it's the one being updated
          if (state.selectedBudget && state.selectedBudget.id === budgetId) {
            state.selectedBudget = { ...budget };
          }
          
          calculateBudgetPerformance(state);
        }
      }
    },
    // Update budget performance with actual spending
    updateBudgetPerformance: (state, action) => {
      const { categorySpending } = action.payload;
      
      // Update spending for each budget category
      state.budgets.forEach(budget => {
        budget.categories.forEach(category => {
          const spent = categorySpending[category.id] || 0;
          category.spent = spent;
          category.remaining = category.amount - spent;
          category.percentUsed = category.amount > 0 ? (spent / category.amount) * 100 : 0;
        });
      });
      
      calculateBudgetPerformance(state);
    },
    // Clear budgets data
    clearBudgets: (state) => {
      state.budgets = [];
      state.selectedBudget = null;
      state.budgetPerformance = initialState.budgetPerformance;
      state.loading = false;
      state.error = null;
    },
  },
});

// Helper function to calculate overall budget performance
const calculateBudgetPerformance = (state) => {
  // Filter budgets for the active period
  const activeBudgets = state.activeBudgetPeriod.startDate
    ? state.budgets.filter(budget => {
        const budgetStart = new Date(budget.startDate);
        const budgetEnd = new Date(budget.endDate);
        const activeStart = new Date(state.activeBudgetPeriod.startDate);
        const activeEnd = new Date(state.activeBudgetPeriod.endDate);
        
        return (
          (budgetStart >= activeStart && budgetStart <= activeEnd) ||
          (budgetEnd >= activeStart && budgetEnd <= activeEnd) ||
          (budgetStart <= activeStart && budgetEnd >= activeEnd)
        );
      })
    : state.budgets;
  
  // Calculate total budgeted amount
  const totalBudgeted = activeBudgets.reduce((total, budget) => {
    return total + budget.totalAmount;
  }, 0);
  
  // Calculate total spent amount
  const totalSpent = activeBudgets.reduce((total, budget) => {
    return total + budget.categories.reduce((categoryTotal, category) => {
      return categoryTotal + (category.spent || 0);
    }, 0);
  }, 0);
  
  // Calculate remaining amount and percentage used
  const remainingAmount = totalBudgeted - totalSpent;
  const percentUsed = totalBudgeted > 0 ? (totalSpent / totalBudgeted) * 100 : 0;
  
  state.budgetPerformance = {
    totalBudgeted,
    totalSpent,
    remainingAmount,
    percentUsed,
  };
};

// Export actions
export const {
  setLoading,
  setBudgets,
  addBudget,
  updateBudget,
  deleteBudget,
  setSelectedBudget,
  setError,
  setActiveBudgetPeriod,
  setBudgetMethod,
  updateBudgetCategoryAmount,
  updateBudgetPerformance,
  clearBudgets,
} = budgetsSlice.actions;

// Export selectors
export const selectBudgets = (state) => state.budgets.budgets;
export const selectActiveBudgets = (state) => {
  const { budgets, activeBudgetPeriod } = state.budgets;
  
  if (!activeBudgetPeriod.startDate) {
    return budgets;
  }
  
  return budgets.filter(budget => {
    const budgetStart = new Date(budget.startDate);
    const budgetEnd = new Date(budget.endDate);
    const activeStart = new Date(activeBudgetPeriod.startDate);
    const activeEnd = new Date(activeBudgetPeriod.endDate);
    
    return (
      (budgetStart >= activeStart && budgetStart <= activeEnd) ||
      (budgetEnd >= activeStart && budgetEnd <= activeEnd) ||
      (budgetStart <= activeStart && budgetEnd >= activeEnd)
    );
  });
};

export const selectBudgetsLoading = (state) => state.budgets.loading;
export const selectBudgetsError = (state) => state.budgets.error;
export const selectSelectedBudget = (state) => state.budgets.selectedBudget;
export const selectActiveBudgetPeriod = (state) => state.budgets.activeBudgetPeriod;
export const selectBudgetMethod = (state) => state.budgets.budgetMethod;
export const selectBudgetPerformance = (state) => state.budgets.budgetPerformance;

// Export reducer
export default budgetsSlice.reducer;