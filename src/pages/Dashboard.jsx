import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  Card,
  CardContent,
  Container,
  Grid,
  Paper,
  Typography,
  useTheme,
} from '@mui/material';

// Components
import AccountSummaryWidget from '../components/dashboard/AccountSummaryWidget';
import RecentTransactionsWidget from '../components/dashboard/RecentTransactionsWidget';
import BudgetOverviewWidget from '../components/dashboard/BudgetOverviewWidget';
import GoalsProgressWidget from '../components/dashboard/GoalsProgressWidget';
import SpendingTrendsWidget from '../components/dashboard/SpendingTrendsWidget';
import UpcomingBillsWidget from '../components/dashboard/UpcomingBillsWidget';

// Redux selectors
import { selectVisibleWidgets } from '../store/reducers/uiSlice';
import { selectUser } from '../store/reducers/authSlice';
import { selectAccounts, setAccounts } from '../store/reducers/accountsSlice';
import { selectTransactions, setTransactions } from '../store/reducers/transactionsSlice';
import { selectBudgets, setBudgets } from '../store/reducers/budgetsSlice';
import { selectGoals, setGoals } from '../store/reducers/goalsSlice';

// Firebase
import { db } from '../services/firebase';
import { collection, getDocs, query, where } from 'firebase/firestore';

const Dashboard = () => {
  const theme = useTheme();
  const dispatch = useDispatch();
  const user = useSelector(selectUser);
  const visibleWidgets = useSelector(selectVisibleWidgets);
  const accounts = useSelector(selectAccounts);
  const transactions = useSelector(selectTransactions);
  const budgets = useSelector(selectBudgets);
  const goals = useSelector(selectGoals);

  // Fetch user data on component mount
  useEffect(() => {
    const fetchUserData = async () => {
      if (!user) return;

      try {
        // Fetch accounts
        const accountsQuery = query(
          collection(db, 'accounts'),
          where('userId', '==', user.uid)
        );
        const accountsSnapshot = await getDocs(accountsQuery);
        const accountsData = accountsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));
        dispatch(setAccounts(accountsData));

        // Fetch transactions
        const transactionsQuery = query(
          collection(db, 'transactions'),
          where('userId', '==', user.uid)
        );
        const transactionsSnapshot = await getDocs(transactionsQuery);
        const transactionsData = transactionsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));
        dispatch(setTransactions(transactionsData));

        // Fetch budgets
        const budgetsQuery = query(
          collection(db, 'budgets'),
          where('userId', '==', user.uid)
        );
        const budgetsSnapshot = await getDocs(budgetsQuery);
        const budgetsData = budgetsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));
        dispatch(setBudgets(budgetsData));

        // Fetch goals
        const goalsQuery = query(
          collection(db, 'goals'),
          where('userId', '==', user.uid)
        );
        const goalsSnapshot = await getDocs(goalsQuery);
        const goalsData = goalsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));
        dispatch(setGoals(goalsData));
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };

    fetchUserData();
  }, [dispatch, user]);

  // Get time of day for greeting
  const getTimeOfDay = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'morning';
    if (hour < 18) return 'afternoon';
    return 'evening';
  };

  // Render widget based on ID
  const renderWidget = (widgetId) => {
    switch (widgetId) {
      case 'account-summary':
        return <AccountSummaryWidget />;
      case 'recent-transactions':
        return <RecentTransactionsWidget />;
      case 'budget-overview':
        return <BudgetOverviewWidget />;
      case 'goals-progress':
        return <GoalsProgressWidget />;
      case 'spending-trends':
        return <SpendingTrendsWidget />;
      case 'upcoming-bills':
        return <UpcomingBillsWidget />;
      default:
        return null;
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {/* Welcome message */}
      <Box mb={4}>
        <Typography variant="h4" gutterBottom>
          Good {getTimeOfDay()}, {user?.displayName || 'User'}
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          Here's an overview of your finances
        </Typography>
      </Box>

      {/* Dashboard widgets */}
      <Grid container spacing={3}>
        {visibleWidgets.map((widget) => (
          <Grid item xs={12} md={widget.id === 'account-summary' ? 12 : 6} lg={widget.id === 'account-summary' ? 12 : 6} key={widget.id}>
            <Paper
              elevation={2}
              sx={{
                p: 2,
                display: 'flex',
                flexDirection: 'column',
                height: '100%',
                borderRadius: 2,
                overflow: 'hidden',
              }}
            >
              {renderWidget(widget.id)}
            </Paper>
          </Grid>
        ))}

        {/* Show message if no widgets are visible */}
        {visibleWidgets.length === 0 && (
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" align="center">
                  No widgets to display. Customize your dashboard in settings.
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        )}
      </Grid>
    </Container>
  );
};

export default Dashboard;