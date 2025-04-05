import React from 'react';
import { useSelector } from 'react-redux';
import { Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Button,
  Chip,
  Divider,
  Link,
  List,
  ListItem,
  ListItemText,
  Typography,
  useTheme,
} from '@mui/material';
import ReceiptIcon from '@mui/icons-material/Receipt';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';

// Redux selectors
import { selectTransactions } from '../../store/reducers/transactionsSlice';
import { selectAccounts } from '../../store/reducers/accountsSlice';

// Utilities
import { formatCurrency, formatDate } from '../../utils/formatters';

const RecentTransactionsWidget = () => {
  const theme = useTheme();
  const transactions = useSelector(selectTransactions);
  const accounts = useSelector(selectAccounts);

  // Get the 5 most recent transactions
  const recentTransactions = [...transactions]
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 5);

  // Get account name by ID
  const getAccountName = (accountId) => {
    const account = accounts.find((acc) => acc.id === accountId);
    return account ? account.name : 'Unknown Account';
  };

  // Get transaction icon based on type
  const getTransactionIcon = (transaction) => {
    if (transaction.type === 'transfer') {
      return <SwapHorizIcon fontSize="small" sx={{ color: theme.palette.info.main }} />;
    } else if (transaction.amount > 0) {
      return <ArrowUpwardIcon fontSize="small" sx={{ color: theme.palette.success.main }} />;
    } else {
      return <ArrowDownwardIcon fontSize="small" sx={{ color: theme.palette.error.main }} />;
    }
  };

  // Get transaction color based on amount
  const getAmountColor = (amount) => {
    if (amount > 0) return theme.palette.success.main;
    if (amount < 0) return theme.palette.error.main;
    return theme.palette.text.primary;
  };

  return (
    <Box>
      <Box display="flex" alignItems="center" mb={2}>
        <ReceiptIcon sx={{ mr: 1, color: theme.palette.secondary.main }} />
        <Typography variant="h6">Recent Transactions</Typography>
      </Box>

      {recentTransactions.length === 0 ? (
        <Typography variant="body2" sx={{ textAlign: 'center', py: 4 }}>
          No transactions found. Add transactions to see them here.
        </Typography>
      ) : (
        <List disablePadding>
          {recentTransactions.map((transaction) => (
            <React.Fragment key={transaction.id}>
              <ListItem
                disablePadding
                sx={{
                  py: 1.5,
                  px: 0,
                  display: 'flex',
                  alignItems: 'flex-start',
                }}
              >
                <Box mr={1.5} mt={0.5}>
                  {getTransactionIcon(transaction)}
                </Box>
                <ListItemText
                  primary={
                    <Typography variant="body1" noWrap>
                      {transaction.description}
                    </Typography>
                  }
                  secondary={
                    <Box>
                      <Typography variant="body2" color="text.secondary" noWrap>
                        {formatDate(transaction.date)} · {getAccountName(transaction.accountId)}
                      </Typography>
                      {transaction.category && (
                        <Chip
                          label={transaction.category}
                          size="small"
                          sx={{ mt: 0.5, height: 20, fontSize: '0.7rem' }}
                        />
                      )}
                    </Box>
                  }
                  sx={{ margin: 0 }}
                />
                <Typography
                  variant="body2"
                  sx={{
                    fontWeight: 'medium',
                    color: getAmountColor(transaction.amount),
                    ml: 2,
                    mt: 0.5,
                  }}
                >
                  {formatCurrency(transaction.amount)}
                </Typography>
              </ListItem>
              <Divider />
            </React.Fragment>
          ))}
        </List>
      )}

      <Box mt={2} display="flex" justifyContent="center">
        <Button
          component={RouterLink}
          to="/transactions"
          color="primary"
          size="small"
          sx={{ textTransform: 'none' }}
        >
          View All Transactions
        </Button>
      </Box>
    </Box>
  );
};

export default RecentTransactionsWidget;