import React, { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Button,
  FormControl,
  MenuItem,
  Select,
  Typography,
  useTheme,
} from '@mui/material';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

// Redux selectors
import { selectTransactions } from '../../store/reducers/transactionsSlice';

// Utilities
import { formatCurrency } from '../../utils/formatters';

// Register Chart.js components
ChartJS.register(ArcElement, Tooltip, Legend);

const SpendingTrendsWidget = () => {
  const theme = useTheme();
  const transactions = useSelector(selectTransactions);
  const [timeRange, setTimeRange] = React.useState('month'); // 'week', 'month', 'year'

  // Filter transactions by time range and only include expenses
  const filteredTransactions = useMemo(() => {
    const now = new Date();
    let startDate;

    switch (timeRange) {
      case 'week':
        startDate = new Date(now);
        startDate.setDate(now.getDate() - 7);
        break;
      case 'month':
        startDate = new Date(now);
        startDate.setMonth(now.getMonth() - 1);
        break;
      case 'year':
        startDate = new Date(now);
        startDate.setFullYear(now.getFullYear() - 1);
        break;
      default:
        startDate = new Date(now);
        startDate.setMonth(now.getMonth() - 1);
    }

    return transactions.filter(
      (transaction) =>
        new Date(transaction.date) >= startDate &&
        new Date(transaction.date) <= now &&
        transaction.amount < 0 && // Only expenses (negative amounts)
        transaction.type !== 'transfer' // Exclude transfers
    );
  }, [transactions, timeRange]);

  // Calculate spending by category
  const spendingByCategory = useMemo(() => {
    const categoryTotals = {};

    filteredTransactions.forEach((transaction) => {
      const category = transaction.category || 'Uncategorized';
      const amount = Math.abs(transaction.amount); // Convert to positive for display

      if (!categoryTotals[category]) {
        categoryTotals[category] = 0;
      }

      categoryTotals[category] += amount;
    });

    // Sort categories by amount (descending)
    return Object.entries(categoryTotals)
      .sort((a, b) => b[1] - a[1])
      .reduce((acc, [category, amount]) => {
        acc[category] = amount;
        return acc;
      }, {});
  }, [filteredTransactions]);

  // Prepare chart data
  const chartData = useMemo(() => {
    const categories = Object.keys(spendingByCategory);
    const amounts = Object.values(spendingByCategory);

    // Generate colors for each category
    const generateColors = (count) => {
      const baseColors = [
        theme.palette.primary.main,
        theme.palette.secondary.main,
        theme.palette.error.main,
        theme.palette.warning.main,
        theme.palette.info.main,
        theme.palette.success.main,
      ];

      // If we need more colors than in the base array, generate them
      const colors = [];
      for (let i = 0; i < count; i++) {
        if (i < baseColors.length) {
          colors.push(baseColors[i]);
        } else {
          // Generate a color with reduced opacity for additional categories
          const index = i % baseColors.length;
          const color = baseColors[index];
          const opacity = 0.7 - (Math.floor(i / baseColors.length) * 0.2);
          colors.push(color + Math.floor(opacity * 255).toString(16).padStart(2, '0'));
        }
      }

      return colors;
    };

    return {
      labels: categories,
      datasets: [
        {
          data: amounts,
          backgroundColor: generateColors(categories.length),
          borderWidth: 1,
          borderColor: theme.palette.background.paper,
        },
      ],
    };
  }, [spendingByCategory, theme]);

  // Chart options
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            const label = context.label || '';
            const value = context.raw || 0;
            const total = context.dataset.data.reduce((a, b) => a + b, 0);
            const percentage = ((value / total) * 100).toFixed(1);
            return `${label}: ${formatCurrency(value)} (${percentage}%)`;
          },
        },
      },
    },
  };

  // Calculate total spending
  const totalSpending = Object.values(spendingByCategory).reduce(
    (sum, amount) => sum + amount,
    0
  );

  // Get time range label
  const getTimeRangeLabel = () => {
    switch (timeRange) {
      case 'week':
        return 'Past Week';
      case 'month':
        return 'Past Month';
      case 'year':
        return 'Past Year';
      default:
        return 'Past Month';
    }
  };

  return (
    <Box>
      <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
        <Box display="flex" alignItems="center">
          <TrendingUpIcon sx={{ mr: 1, color: theme.palette.success.main }} />
          <Typography variant="h6">Spending Trends</Typography>
        </Box>
        <FormControl size="small" sx={{ minWidth: 120 }}>
          <Select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            displayEmpty
            variant="outlined"
            sx={{ fontSize: '0.875rem' }}
          >
            <MenuItem value="week">Past Week</MenuItem>
            <MenuItem value="month">Past Month</MenuItem>
            <MenuItem value="year">Past Year</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {Object.keys(spendingByCategory).length === 0 ? (
        <Typography variant="body2" sx={{ textAlign: 'center', py: 4 }}>
          No spending data available for the selected period.
        </Typography>
      ) : (
        <>
          <Box height={200} mb={3}>
            <Pie data={chartData} options={chartOptions} />
          </Box>

          <Box mb={2}>
            <Typography variant="subtitle2" gutterBottom>
              TOTAL SPENDING ({getTimeRangeLabel()})
            </Typography>
            <Typography variant="h5" color="error.main" fontWeight="medium">
              {formatCurrency(totalSpending)}
            </Typography>
          </Box>

          <Box>
            <Typography variant="subtitle2" gutterBottom>
              TOP CATEGORIES
            </Typography>
            {Object.entries(spendingByCategory)
              .slice(0, 5) // Show top 5 categories
              .map(([category, amount]) => {
                const percentage = ((amount / totalSpending) * 100).toFixed(1);
                return (
                  <Box
                    key={category}
                    display="flex"
                    justifyContent="space-between"
                    alignItems="center"
                    mb={1}
                  >
                    <Box display="flex" alignItems="center">
                      <Box
                        width={10}
                        height={10}
                        borderRadius="50%"
                        bgcolor={chartData.datasets[0].backgroundColor[
                          chartData.labels.indexOf(category)
                        ]}
                        mr={1}
                      />
                      <Typography variant="body2" noWrap sx={{ maxWidth: 120 }}>
                        {category}
                      </Typography>
                    </Box>
                    <Box textAlign="right">
                      <Typography variant="body2" fontWeight="medium">
                        {formatCurrency(amount)}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {percentage}%
                      </Typography>
                    </Box>
                  </Box>
                );
              })}
          </Box>
        </>
      )}

      <Box mt={2} display="flex" justifyContent="center">
        <Button
          component={RouterLink}
          to="/reports"
          color="primary"
          size="small"
          sx={{ textTransform: 'none' }}
        >
          View Detailed Reports
        </Button>
      </Box>
    </Box>
  );
};

export default SpendingTrendsWidget;