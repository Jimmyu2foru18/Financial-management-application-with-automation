import React from 'react';
import { useSelector } from 'react-redux';
import { Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Button,
  Divider,
  LinearProgress,
  Typography,
  useTheme,
} from '@mui/material';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';

// Redux selectors
import { 
  selectBudgets, 
  selectBudgetPerformance,
  selectBudgetMethod
} from '../../store/reducers/budgetsSlice';

// Utilities
import { formatCurrency, formatPercentage } from '../../utils/formatters';

const BudgetOverviewWidget = () => {
  const theme = useTheme();
  const budgets = useSelector(selectBudgets);
  const budgetPerformance = useSelector(selectBudgetPerformance);
  const budgetMethod = useSelector(selectBudgetMethod);

  // Get active budget (most recent one)
  const activeBudget = budgets.length > 0
    ? [...budgets].sort((a, b) => new Date(b.startDate) - new Date(a.startDate))[0]
    : null;

  // Get progress color based on percentage
  const getProgressColor = (percent) => {
    if (percent < 70) return theme.palette.success.main;
    if (percent < 90) return theme.palette.warning.main;
    return theme.palette.error.main;
  };

  // Format budget method for display
  const formatBudgetMethod = (method) => {
    switch (method) {
      case 'category':
        return 'Category-based';
      case 'zero-based':
        return 'Zero-based';
      case '50-30-20':
        return '50/30/20 Rule';
      default:
        return 'Custom';
    }
  };

  return (
    <Box>
      <Box display="flex" alignItems="center" mb={2}>
        <AccountBalanceIcon sx={{ mr: 1, color: theme.palette.info.main }} />
        <Typography variant="h6">Budget Overview</Typography>
      </Box>

      {!activeBudget ? (
        <Typography variant="body2" sx={{ textAlign: 'center', py: 4 }}>
          No active budget found. Create a budget to get started.
        </Typography>
      ) : (
        <>
          {/* Budget Performance Summary */}
          <Box mb={3}>
            <Typography variant="subtitle2" gutterBottom>
              CURRENT BUDGET PERFORMANCE
            </Typography>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
              <Typography variant="body2">Total Budgeted</Typography>
              <Typography variant="body1" fontWeight="medium">
                {formatCurrency(budgetPerformance.totalBudgeted)}
              </Typography>
            </Box>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
              <Typography variant="body2">Total Spent</Typography>
              <Typography 
                variant="body1" 
                fontWeight="medium"
                color={budgetPerformance.percentUsed > 100 ? 'error.main' : 'text.primary'}
              >
                {formatCurrency(budgetPerformance.totalSpent)}
              </Typography>
            </Box>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
              <Typography variant="body2">Remaining</Typography>
              <Typography 
                variant="body1" 
                fontWeight="medium"
                color={budgetPerformance.remainingAmount < 0 ? 'error.main' : 'success.main'}
              >
                {formatCurrency(budgetPerformance.remainingAmount)}
              </Typography>
            </Box>
            <Box mt={2}>
              <Box display="flex" justifyContent="space-between" mb={0.5}>
                <Typography variant="body2">Overall Progress</Typography>
                <Typography variant="body2">
                  {formatPercentage(budgetPerformance.percentUsed)}
                </Typography>
              </Box>
              <LinearProgress
                variant="determinate"
                value={Math.min(budgetPerformance.percentUsed, 100)}
                sx={{
                  height: 8,
                  borderRadius: 4,
                  bgcolor: theme.palette.grey[200],
                  '& .MuiLinearProgress-bar': {
                    bgcolor: getProgressColor(budgetPerformance.percentUsed),
                  },
                }}
              />
            </Box>
          </Box>

          <Divider sx={{ my: 2 }} />

          {/* Budget Details */}
          <Box>
            <Typography variant="subtitle2" gutterBottom>
              BUDGET DETAILS
            </Typography>
            <Box display="flex" justifyContent="space-between" mb={1}>
              <Typography variant="body2">Budget Name</Typography>
              <Typography variant="body2" fontWeight="medium">
                {activeBudget.name}
              </Typography>
            </Box>
            <Box display="flex" justifyContent="space-between" mb={1}>
              <Typography variant="body2">Period</Typography>
              <Typography variant="body2" fontWeight="medium">
                {new Date(activeBudget.startDate).toLocaleDateString()} - {new Date(activeBudget.endDate).toLocaleDateString()}
              </Typography>
            </Box>
            <Box display="flex" justifyContent="space-between" mb={1}>
              <Typography variant="body2">Method</Typography>
              <Typography variant="body2" fontWeight="medium">
                {formatBudgetMethod(budgetMethod)}
              </Typography>
            </Box>
            <Box display="flex" justifyContent="space-between" mb={1}>
              <Typography variant="body2">Categories</Typography>
              <Typography variant="body2" fontWeight="medium">
                {activeBudget.categories ? activeBudget.categories.length : 0}
              </Typography>
            </Box>
          </Box>

          {/* Top Categories */}
          {activeBudget.categories && activeBudget.categories.length > 0 && (
            <Box mt={3}>
              <Typography variant="subtitle2" gutterBottom>
                TOP CATEGORIES
              </Typography>
              {activeBudget.categories
                .sort((a, b) => b.amount - a.amount)
                .slice(0, 3)
                .map((category) => {
                  const spent = category.spent || 0;
                  const percentUsed = category.amount > 0 ? (spent / category.amount) * 100 : 0;
                  
                  return (
                    <Box key={category.id} mb={2}>
                      <Box display="flex" justifyContent="space-between" mb={0.5}>
                        <Typography variant="body2">{category.name}</Typography>
                        <Typography variant="body2">
                          {formatCurrency(spent)} / {formatCurrency(category.amount)}
                        </Typography>
                      </Box>
                      <LinearProgress
                        variant="determinate"
                        value={Math.min(percentUsed, 100)}
                        sx={{
                          height: 6,
                          borderRadius: 3,
                          bgcolor: theme.palette.grey[200],
                          '& .MuiLinearProgress-bar': {
                            bgcolor: getProgressColor(percentUsed),
                          },
                        }}
                      />
                    </Box>
                  );
                })}
            </Box>
          )}
        </>
      )}

      <Box mt={2} display="flex" justifyContent="center">
        <Button
          component={RouterLink}
          to="/budget"
          color="primary"
          size="small"
          sx={{ textTransform: 'none' }}
        >
          View Budget Details
        </Button>
      </Box>
    </Box>
  );
};

export default BudgetOverviewWidget;