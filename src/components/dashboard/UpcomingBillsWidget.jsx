import React, { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Button,
  Chip,
  Divider,
  Typography,
  useTheme,
} from '@mui/material';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import EventRepeatIcon from '@mui/icons-material/EventRepeat';
import PaymentIcon from '@mui/icons-material/Payment';

// Redux selectors
import { selectTransactions } from '../../store/reducers/transactionsSlice';
import { selectAccounts } from '../../store/reducers/accountsSlice';

// Utilities
import { formatCurrency, formatDate } from '../../utils/formatters';

const UpcomingBillsWidget = () => {
  const theme = useTheme();
  const transactions = useSelector(selectTransactions);
  const accounts = useSelector(selectAccounts);

  // Find recurring transactions (bills) based on transaction metadata
  const recurringTransactions = useMemo(() => {
    return transactions.filter(transaction => 
      transaction.isRecurring || 
      transaction.recurringId || 
      (transaction.metadata && transaction.metadata.isRecurring)
    );
  }, [transactions]);

  // Calculate upcoming bills for the next 30 days
  const upcomingBills = useMemo(() => {
    const today = new Date();
    const thirtyDaysLater = new Date(today);
    thirtyDaysLater.setDate(today.getDate() + 30);
    
    // Get the most recent occurrence of each recurring transaction
    const latestRecurringByGroup = {};
    
    recurringTransactions.forEach(transaction => {
      const recurringId = transaction.recurringId || transaction.id;
      
      if (!latestRecurringByGroup[recurringId] || 
          new Date(transaction.date) > new Date(latestRecurringByGroup[recurringId].date)) {
        latestRecurringByGroup[recurringId] = transaction;
      }
    });
    
    // Predict upcoming occurrences
    const upcoming = [];
    
    Object.values(latestRecurringByGroup).forEach(transaction => {
      const frequency = transaction.metadata?.frequency || 'monthly';
      const lastDate = new Date(transaction.date);
      
      // Calculate next occurrence date based on frequency
      let nextDate = new Date(lastDate);
      
      switch (frequency) {
        case 'weekly':
          nextDate.setDate(lastDate.getDate() + 7);
          break;
        case 'biweekly':
          nextDate.setDate(lastDate.getDate() + 14);
          break;
        case 'monthly':
          nextDate.setMonth(lastDate.getMonth() + 1);
          break;
        case 'quarterly':
          nextDate.setMonth(lastDate.getMonth() + 3);
          break;
        case 'annually':
          nextDate.setFullYear(lastDate.getFullYear() + 1);
          break;
        default:
          nextDate.setMonth(lastDate.getMonth() + 1); // Default to monthly
      }
      
      // If the next occurrence is within the next 30 days, add it to upcoming bills
      if (nextDate >= today && nextDate <= thirtyDaysLater) {
        upcoming.push({
          ...transaction,
          dueDate: nextDate.toISOString().split('T')[0],
          daysUntilDue: Math.ceil((nextDate - today) / (1000 * 60 * 60 * 24)),
          frequency
        });
      }
    });
    
    // Sort by due date (ascending)
    return upcoming.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
  }, [recurringTransactions]);

  // Get account name by ID
  const getAccountName = (accountId) => {
    const account = accounts.find((acc) => acc.id === accountId);
    return account ? account.name : 'Unknown Account';
  };

  // Get status chip based on days until due
  const getStatusChip = (daysUntilDue) => {
    if (daysUntilDue <= 3) {
      return (
        <Chip
          label="Due Soon"
          size="small"
          color="error"
          sx={{ height: 20, fontSize: '0.7rem' }}
        />
      );
    } else if (daysUntilDue <= 7) {
      return (
        <Chip
          label="Upcoming"
          size="small"
          color="warning"
          sx={{ height: 20, fontSize: '0.7rem' }}
        />
      );
    } else {
      return (
        <Chip
          label="Scheduled"
          size="small"
          color="info"
          sx={{ height: 20, fontSize: '0.7rem' }}
        />
      );
    }
  };

  // Format frequency for display
  const formatFrequency = (frequency) => {
    switch (frequency) {
      case 'weekly':
        return 'Weekly';
      case 'biweekly':
        return 'Bi-weekly';
      case 'monthly':
        return 'Monthly';
      case 'quarterly':
        return 'Quarterly';
      case 'annually':
        return 'Annually';
      default:
        return 'Recurring';
    }
  };

  return (
    <Box>
      <Box display="flex" alignItems="center" mb={2}>
        <CalendarTodayIcon sx={{ mr: 1, color: theme.palette.error.main }} />
        <Typography variant="h6">Upcoming Bills</Typography>
      </Box>

      {upcomingBills.length === 0 ? (
        <Typography variant="body2" sx={{ textAlign: 'center', py: 4 }}>
          No upcoming bills found. Set up recurring transactions to track your bills.
        </Typography>
      ) : (
        <Box>
          {upcomingBills.slice(0, 5).map((bill) => (
            <Box key={`${bill.id}-${bill.dueDate}`} mb={2}>
              <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                <Box>
                  <Typography variant="body1" fontWeight="medium">
                    {bill.description}
                  </Typography>
                  <Box display="flex" alignItems="center" mt={0.5}>
                    <EventRepeatIcon 
                      fontSize="small" 
                      sx={{ mr: 0.5, color: theme.palette.text.secondary, fontSize: '0.875rem' }} 
                    />
                    <Typography variant="body2" color="text.secondary">
                      {formatFrequency(bill.frequency)}
                    </Typography>
                  </Box>
                  <Box display="flex" alignItems="center" mt={0.5}>
                    <PaymentIcon 
                      fontSize="small" 
                      sx={{ mr: 0.5, color: theme.palette.text.secondary, fontSize: '0.875rem' }} 
                    />
                    <Typography variant="body2" color="text.secondary">
                      {getAccountName(bill.accountId)}
                    </Typography>
                  </Box>
                </Box>
                <Box textAlign="right">
                  <Typography 
                    variant="body1" 
                    fontWeight="medium"
                    color="error.main"
                  >
                    {formatCurrency(Math.abs(bill.amount))}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" mt={0.5}>
                    Due {formatDate(bill.dueDate)}
                  </Typography>
                  <Box mt={0.5}>
                    {getStatusChip(bill.daysUntilDue)}
                  </Box>
                </Box>
              </Box>
              <Divider sx={{ mt: 2 }} />
            </Box>
          ))}
        </Box>
      )}

      <Box mt={2} display="flex" justifyContent="center">
        <Button
          component={RouterLink}
          to="/transactions"
          color="primary"
          size="small"
          sx={{ textTransform: 'none' }}
        >
          Manage Recurring Transactions
        </Button>
      </Box>
    </Box>
  );
};

export default UpcomingBillsWidget;