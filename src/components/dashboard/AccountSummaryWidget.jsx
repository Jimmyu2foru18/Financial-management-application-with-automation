import React from 'react';
import { useSelector } from 'react-redux';
import {
  Box,
  Card,
  CardContent,
  Divider,
  Grid,
  Typography,
  useTheme,
} from '@mui/material';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';

// Redux selectors
import { 
  selectAccounts, 
  selectTotalBalance, 
  selectNetWorth 
} from '../../store/reducers/accountsSlice';

// Utilities
import { formatCurrency } from '../../utils/formatters';

const AccountSummaryWidget = () => {
  const theme = useTheme();
  const accounts = useSelector(selectAccounts);
  const totalBalance = useSelector(selectTotalBalance);
  const netWorth = useSelector(selectNetWorth);

  // Group accounts by type
  const accountsByType = accounts.reduce((acc, account) => {
    const type = account.type || 'other';
    if (!acc[type]) {
      acc[type] = [];
    }
    acc[type].push(account);
    return acc;
  }, {});

  // Calculate totals by account type
  const calculateTotalByType = (type) => {
    return (accountsByType[type] || []).reduce(
      (total, account) => total + account.balance,
      0
    );
  };

  // Asset accounts
  const assetTypes = ['checking', 'savings', 'investment', 'cash', 'asset'];
  const assetAccounts = assetTypes.flatMap(type => accountsByType[type] || []);
  const totalAssets = assetAccounts.reduce(
    (total, account) => total + account.balance,
    0
  );

  // Liability accounts
  const liabilityTypes = ['credit', 'loan', 'debt'];
  const liabilityAccounts = liabilityTypes.flatMap(type => accountsByType[type] || []);
  const totalLiabilities = liabilityAccounts.reduce(
    (total, account) => total + account.balance,
    0
  );

  return (
    <Box>
      <Box display="flex" alignItems="center" mb={2}>
        <AccountBalanceWalletIcon 
          sx={{ mr: 1, color: theme.palette.primary.main }} 
        />
        <Typography variant="h6">Account Summary</Typography>
      </Box>
      
      <Grid container spacing={3}>
        {/* Net Worth Card */}
        <Grid item xs={12} md={4}>
          <Card 
            elevation={0} 
            sx={{ 
              bgcolor: theme.palette.primary.main,
              color: theme.palette.primary.contrastText,
              height: '100%'
            }}
          >
            <CardContent>
              <Typography variant="subtitle2" gutterBottom>
                NET WORTH
              </Typography>
              <Typography variant="h4">
                {formatCurrency(netWorth)}
              </Typography>
              <Box display="flex" alignItems="center" mt={1}>
                {netWorth >= 0 ? (
                  <TrendingUpIcon fontSize="small" sx={{ mr: 0.5 }} />
                ) : (
                  <TrendingDownIcon fontSize="small" sx={{ mr: 0.5 }} />
                )}
                <Typography variant="body2">
                  Assets: {formatCurrency(totalAssets)}
                </Typography>
              </Box>
              <Box display="flex" alignItems="center" mt={0.5}>
                <Typography variant="body2">
                  Liabilities: {formatCurrency(totalLiabilities)}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Total Balance Card */}
        <Grid item xs={12} md={4}>
          <Card 
            elevation={0} 
            sx={{ 
              bgcolor: theme.palette.secondary.main,
              color: theme.palette.secondary.contrastText,
              height: '100%'
            }}
          >
            <CardContent>
              <Typography variant="subtitle2" gutterBottom>
                TOTAL BALANCE
              </Typography>
              <Typography variant="h4">
                {formatCurrency(totalBalance)}
              </Typography>
              <Box display="flex" alignItems="center" mt={1}>
                <Typography variant="body2">
                  {accounts.length} Active Accounts
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Account Types Card */}
        <Grid item xs={12} md={4}>
          <Card 
            elevation={0} 
            sx={{ 
              bgcolor: theme.palette.background.paper,
              height: '100%'
            }}
          >
            <CardContent>
              <Typography variant="subtitle2" gutterBottom>
                ACCOUNT TYPES
              </Typography>
              
              {/* Checking */}
              {accountsByType.checking && (
                <Box display="flex" justifyContent="space-between" mt={1}>
                  <Typography variant="body2">Checking</Typography>
                  <Typography variant="body2">
                    {formatCurrency(calculateTotalByType('checking'))}
                  </Typography>
                </Box>
              )}
              
              {/* Savings */}
              {accountsByType.savings && (
                <Box display="flex" justifyContent="space-between" mt={1}>
                  <Typography variant="body2">Savings</Typography>
                  <Typography variant="body2">
                    {formatCurrency(calculateTotalByType('savings'))}
                  </Typography>
                </Box>
              )}
              
              {/* Investment */}
              {accountsByType.investment && (
                <Box display="flex" justifyContent="space-between" mt={1}>
                  <Typography variant="body2">Investment</Typography>
                  <Typography variant="body2">
                    {formatCurrency(calculateTotalByType('investment'))}
                  </Typography>
                </Box>
              )}
              
              {/* Credit */}
              {accountsByType.credit && (
                <Box display="flex" justifyContent="space-between" mt={1}>
                  <Typography variant="body2">Credit</Typography>
                  <Typography variant="body2">
                    {formatCurrency(calculateTotalByType('credit'))}
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Account List */}
      <Box mt={3}>
        <Typography variant="subtitle1" gutterBottom>
          Your Accounts
        </Typography>
        <Divider />
        
        {accounts.length === 0 ? (
          <Typography variant="body2" sx={{ mt: 2, textAlign: 'center' }}>
            No accounts found. Add an account to get started.
          </Typography>
        ) : (
          accounts.map((account) => (
            <Box 
              key={account.id} 
              py={1.5} 
              display="flex" 
              justifyContent="space-between"
              alignItems="center"
              sx={{
                borderBottom: `1px solid ${theme.palette.divider}`,
                '&:last-child': {
                  borderBottom: 'none',
                },
              }}
            >
              <Box>
                <Typography variant="body1">{account.name}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {account.institution} · {account.type.charAt(0).toUpperCase() + account.type.slice(1)}
                </Typography>
              </Box>
              <Typography 
                variant="body1" 
                fontWeight="medium"
                color={account.type === 'credit' || account.type === 'loan' || account.type === 'debt' ? 'error.main' : 'success.main'}
              >
                {formatCurrency(account.balance)}
              </Typography>
            </Box>
          ))
        )}
      </Box>
    </Box>
  );
};

export default AccountSummaryWidget;