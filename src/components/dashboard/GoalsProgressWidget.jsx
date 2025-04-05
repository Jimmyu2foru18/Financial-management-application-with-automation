import React from 'react';
import { useSelector } from 'react-redux';
import { Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Button,
  CircularProgress,
  Divider,
  Typography,
  useTheme,
} from '@mui/material';
import FlagIcon from '@mui/icons-material/Flag';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

// Redux selectors
import { 
  selectGoals,
  selectAllGoalProgress 
} from '../../store/reducers/goalsSlice';

// Utilities
import { formatCurrency, formatDate, formatPercentage } from '../../utils/formatters';

const GoalsProgressWidget = () => {
  const theme = useTheme();
  const goals = useSelector(selectGoals);
  const goalProgress = useSelector(selectAllGoalProgress);

  // Sort goals by priority (highest first) and then by percent complete
  const sortedGoals = [...goals].sort((a, b) => {
    // First sort by priority if available
    if (a.priority && b.priority) {
      return b.priority - a.priority;
    }
    
    // Then sort by percent complete
    const aProgress = goalProgress[a.id] || { percentComplete: 0 };
    const bProgress = goalProgress[b.id] || { percentComplete: 0 };
    return bProgress.percentComplete - aProgress.percentComplete;
  }).slice(0, 4); // Show top 4 goals

  return (
    <Box>
      <Box display="flex" alignItems="center" mb={2}>
        <FlagIcon sx={{ mr: 1, color: theme.palette.warning.main }} />
        <Typography variant="h6">Financial Goals</Typography>
      </Box>

      {sortedGoals.length === 0 ? (
        <Typography variant="body2" sx={{ textAlign: 'center', py: 4 }}>
          No financial goals found. Create goals to track your progress.
        </Typography>
      ) : (
        <Box>
          {sortedGoals.map((goal) => {
            const progress = goalProgress[goal.id] || { 
              percentComplete: 0,
              currentAmount: 0,
              targetAmount: goal.targetAmount,
              remaining: goal.targetAmount,
              estimatedCompletionDate: null
            };
            
            const isComplete = progress.percentComplete >= 100;
            
            return (
              <Box key={goal.id} mb={3}>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Box>
                    <Typography variant="body1" fontWeight="medium">
                      {goal.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {goal.category}
                    </Typography>
                  </Box>
                  <Box position="relative" display="inline-flex">
                    <CircularProgress
                      variant="determinate"
                      value={Math.min(progress.percentComplete, 100)}
                      size={50}
                      thickness={4}
                      sx={{
                        color: isComplete ? theme.palette.success.main : theme.palette.primary.main,
                      }}
                    />
                    <Box
                      top={0}
                      left={0}
                      bottom={0}
                      right={0}
                      position="absolute"
                      display="flex"
                      alignItems="center"
                      justifyContent="center"
                    >
                      {isComplete ? (
                        <CheckCircleIcon color="success" fontSize="small" />
                      ) : (
                        <Typography variant="caption" component="div" color="text.secondary">
                          {formatPercentage(progress.percentComplete, 0)}
                        </Typography>
                      )}
                    </Box>
                  </Box>
                </Box>
                
                <Box mt={1}>
                  <Box display="flex" justifyContent="space-between" mb={0.5}>
                    <Typography variant="body2">Target</Typography>
                    <Typography variant="body2" fontWeight="medium">
                      {formatCurrency(progress.targetAmount)}
                    </Typography>
                  </Box>
                  <Box display="flex" justifyContent="space-between" mb={0.5}>
                    <Typography variant="body2">Current</Typography>
                    <Typography variant="body2" fontWeight="medium">
                      {formatCurrency(progress.currentAmount)}
                    </Typography>
                  </Box>
                  <Box display="flex" justifyContent="space-between" mb={0.5}>
                    <Typography variant="body2">Remaining</Typography>
                    <Typography variant="body2" fontWeight="medium">
                      {formatCurrency(progress.remaining)}
                    </Typography>
                  </Box>
                  
                  {progress.estimatedCompletionDate && !isComplete && (
                    <Box display="flex" justifyContent="space-between" mb={0.5}>
                      <Typography variant="body2">Est. Completion</Typography>
                      <Typography variant="body2" fontWeight="medium">
                        {formatDate(progress.estimatedCompletionDate)}
                      </Typography>
                    </Box>
                  )}
                </Box>
                
                <Divider sx={{ mt: 2 }} />
              </Box>
            );
          })}
        </Box>
      )}

      <Box mt={2} display="flex" justifyContent="center">
        <Button
          component={RouterLink}
          to="/goals"
          color="primary"
          size="small"
          sx={{ textTransform: 'none' }}
        >
          View All Goals
        </Button>
      </Box>
    </Box>
  );
};

export default GoalsProgressWidget;