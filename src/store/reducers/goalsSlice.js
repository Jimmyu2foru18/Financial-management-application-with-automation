// Goals slice for Redux store
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  goals: [],
  loading: false,
  error: null,
  selectedGoal: null,
  goalProgress: {},
  goalCategories: [
    'Emergency Fund',
    'Retirement',
    'Home Purchase',
    'Education',
    'Vacation',
    'Car Purchase',
    'Debt Payoff',
    'Wedding',
    'Business',
    'Other'
  ],
};

const goalsSlice = createSlice({
  name: 'goals',
  initialState,
  reducers: {
    // Set loading state
    setLoading: (state, action) => {
      state.loading = action.payload;
      if (action.payload) {
        state.error = null;
      }
    },
    // Set goals data
    setGoals: (state, action) => {
      state.goals = action.payload;
      state.loading = false;
      state.error = null;
      
      // Calculate progress for each goal
      action.payload.forEach(goal => {
        calculateGoalProgress(state, goal.id);
      });
    },
    // Add a new goal
    addGoal: (state, action) => {
      state.goals.push(action.payload);
      calculateGoalProgress(state, action.payload.id);
    },
    // Update an existing goal
    updateGoal: (state, action) => {
      const index = state.goals.findIndex(goal => goal.id === action.payload.id);
      if (index !== -1) {
        state.goals[index] = {
          ...state.goals[index],
          ...action.payload,
        };
        
        // Update selected goal if it's the one being updated
        if (state.selectedGoal && state.selectedGoal.id === action.payload.id) {
          state.selectedGoal = {
            ...state.selectedGoal,
            ...action.payload,
          };
        }
        
        calculateGoalProgress(state, action.payload.id);
      }
    },
    // Delete a goal
    deleteGoal: (state, action) => {
      state.goals = state.goals.filter(goal => goal.id !== action.payload);
      
      // Clear selected goal if it's the one being deleted
      if (state.selectedGoal && state.selectedGoal.id === action.payload) {
        state.selectedGoal = null;
      }
      
      // Remove progress data for the deleted goal
      delete state.goalProgress[action.payload];
    },
    // Set selected goal
    setSelectedGoal: (state, action) => {
      state.selectedGoal = action.payload;
    },
    // Set error state
    setError: (state, action) => {
      state.error = action.payload;
      state.loading = false;
    },
    // Update goal contribution
    addGoalContribution: (state, action) => {
      const { goalId, amount, date, note } = action.payload;
      const goalIndex = state.goals.findIndex(goal => goal.id === goalId);
      
      if (goalIndex !== -1) {
        const goal = state.goals[goalIndex];
        
        // Add contribution to the goal's contributions array
        if (!goal.contributions) {
          goal.contributions = [];
        }
        
        goal.contributions.push({
          id: Date.now().toString(),
          amount,
          date,
          note
        });
        
        // Update current amount
        goal.currentAmount = (goal.currentAmount || 0) + amount;
        
        // Update selected goal if it's the one being updated
        if (state.selectedGoal && state.selectedGoal.id === goalId) {
          state.selectedGoal = { ...goal };
        }
        
        calculateGoalProgress(state, goalId);
      }
    },
    // Remove goal contribution
    removeGoalContribution: (state, action) => {
      const { goalId, contributionId } = action.payload;
      const goalIndex = state.goals.findIndex(goal => goal.id === goalId);
      
      if (goalIndex !== -1 && state.goals[goalIndex].contributions) {
        const goal = state.goals[goalIndex];
        const contributionIndex = goal.contributions.findIndex(c => c.id === contributionId);
        
        if (contributionIndex !== -1) {
          // Subtract the contribution amount from the current amount
          goal.currentAmount -= goal.contributions[contributionIndex].amount;
          
          // Remove the contribution
          goal.contributions.splice(contributionIndex, 1);
          
          // Update selected goal if it's the one being updated
          if (state.selectedGoal && state.selectedGoal.id === goalId) {
            state.selectedGoal = { ...goal };
          }
          
          calculateGoalProgress(state, goalId);
        }
      }
    },
    // Clear goals data
    clearGoals: (state) => {
      state.goals = [];
      state.selectedGoal = null;
      state.goalProgress = {};
      state.loading = false;
      state.error = null;
    },
  },
});

// Helper function to calculate goal progress
const calculateGoalProgress = (state, goalId) => {
  const goal = state.goals.find(g => g.id === goalId);
  
  if (goal) {
    const currentAmount = goal.currentAmount || 0;
    const targetAmount = goal.targetAmount || 0;
    
    // Calculate percentage complete
    const percentComplete = targetAmount > 0 ? (currentAmount / targetAmount) * 100 : 0;
    
    // Calculate estimated completion date based on contribution rate
    let estimatedCompletionDate = null;
    
    if (goal.contributions && goal.contributions.length > 1 && currentAmount < targetAmount) {
      // Sort contributions by date
      const sortedContributions = [...goal.contributions].sort(
        (a, b) => new Date(a.date) - new Date(b.date)
      );
      
      // Calculate average contribution rate (per day)
      const firstDate = new Date(sortedContributions[0].date);
      const lastDate = new Date(sortedContributions[sortedContributions.length - 1].date);
      const daysDiff = Math.max(1, (lastDate - firstDate) / (1000 * 60 * 60 * 24));
      const totalContributed = sortedContributions.reduce((sum, contrib) => sum + contrib.amount, 0);
      const dailyRate = totalContributed / daysDiff;
      
      if (dailyRate > 0) {
        // Calculate days needed to reach target
        const amountRemaining = targetAmount - currentAmount;
        const daysNeeded = amountRemaining / dailyRate;
        
        // Calculate estimated completion date
        estimatedCompletionDate = new Date();
        estimatedCompletionDate.setDate(estimatedCompletionDate.getDate() + daysNeeded);
      }
    }
    
    // Store progress data
    state.goalProgress[goalId] = {
      percentComplete,
      estimatedCompletionDate,
      currentAmount,
      targetAmount,
      remaining: targetAmount - currentAmount,
    };
  }
};

// Export actions
export const {
  setLoading,
  setGoals,
  addGoal,
  updateGoal,
  deleteGoal,
  setSelectedGoal,
  setError,
  addGoalContribution,
  removeGoalContribution,
  clearGoals,
} = goalsSlice.actions;

// Export selectors
export const selectGoals = (state) => state.goals.goals;
export const selectGoalsLoading = (state) => state.goals.loading;
export const selectGoalsError = (state) => state.goals.error;
export const selectSelectedGoal = (state) => state.goals.selectedGoal;
export const selectGoalProgress = (state, goalId) => state.goals.goalProgress[goalId];
export const selectAllGoalProgress = (state) => state.goals.goalProgress;
export const selectGoalCategories = (state) => state.goals.goalCategories;

// Export reducer
export default goalsSlice.reducer;