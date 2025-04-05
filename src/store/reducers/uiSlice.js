// UI slice for Redux store
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  theme: 'light', // 'light' or 'dark'
  sidebarOpen: true,
  notifications: [],
  activeModal: null,
  isMobile: false,
  dashboardLayout: {
    widgets: [
      { id: 'account-summary', visible: true, order: 1 },
      { id: 'recent-transactions', visible: true, order: 2 },
      { id: 'budget-overview', visible: true, order: 3 },
      { id: 'goals-progress', visible: true, order: 4 },
      { id: 'spending-trends', visible: true, order: 5 },
      { id: 'upcoming-bills', visible: true, order: 6 },
    ],
  },
  preferences: {
    currency: 'USD',
    dateFormat: 'MM/DD/YYYY',
    language: 'en',
    startOfWeek: 'sunday', // 'sunday' or 'monday'
    notifications: {
      email: true,
      push: true,
      budgetAlerts: true,
      goalReminders: true,
      billReminders: true,
    },
  },
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    // Toggle theme between light and dark
    toggleTheme: (state) => {
      state.theme = state.theme === 'light' ? 'dark' : 'light';
    },
    // Set specific theme
    setTheme: (state, action) => {
      state.theme = action.payload;
    },
    // Toggle sidebar visibility
    toggleSidebar: (state) => {
      state.sidebarOpen = !state.sidebarOpen;
    },
    // Set sidebar visibility
    setSidebarOpen: (state, action) => {
      state.sidebarOpen = action.payload;
    },
    // Add a notification
    addNotification: (state, action) => {
      const notification = {
        id: Date.now().toString(),
        timestamp: new Date().toISOString(),
        read: false,
        ...action.payload,
      };
      state.notifications.unshift(notification);
    },
    // Remove a notification
    removeNotification: (state, action) => {
      state.notifications = state.notifications.filter(
        (notification) => notification.id !== action.payload
      );
    },
    // Mark a notification as read
    markNotificationAsRead: (state, action) => {
      const notification = state.notifications.find(
        (notification) => notification.id === action.payload
      );
      if (notification) {
        notification.read = true;
      }
    },
    // Mark all notifications as read
    markAllNotificationsAsRead: (state) => {
      state.notifications.forEach((notification) => {
        notification.read = true;
      });
    },
    // Clear all notifications
    clearNotifications: (state) => {
      state.notifications = [];
    },
    // Set active modal
    setActiveModal: (state, action) => {
      state.activeModal = action.payload;
    },
    // Set mobile status
    setIsMobile: (state, action) => {
      state.isMobile = action.payload;
    },
    // Update dashboard layout
    updateDashboardLayout: (state, action) => {
      state.dashboardLayout = {
        ...state.dashboardLayout,
        ...action.payload,
      };
    },
    // Update widget visibility
    updateWidgetVisibility: (state, action) => {
      const { widgetId, visible } = action.payload;
      const widgetIndex = state.dashboardLayout.widgets.findIndex(
        (widget) => widget.id === widgetId
      );
      if (widgetIndex !== -1) {
        state.dashboardLayout.widgets[widgetIndex].visible = visible;
      }
    },
    // Update widget order
    updateWidgetOrder: (state, action) => {
      state.dashboardLayout.widgets = action.payload;
    },
    // Update user preferences
    updatePreferences: (state, action) => {
      state.preferences = {
        ...state.preferences,
        ...action.payload,
      };
    },
    // Update notification preferences
    updateNotificationPreferences: (state, action) => {
      state.preferences.notifications = {
        ...state.preferences.notifications,
        ...action.payload,
      };
    },
    // Reset UI state
    resetUI: (state) => {
      return initialState;
    },
  },
});

// Export actions
export const {
  toggleTheme,
  setTheme,
  toggleSidebar,
  setSidebarOpen,
  addNotification,
  removeNotification,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  clearNotifications,
  setActiveModal,
  setIsMobile,
  updateDashboardLayout,
  updateWidgetVisibility,
  updateWidgetOrder,
  updatePreferences,
  updateNotificationPreferences,
  resetUI,
} = uiSlice.actions;

// Export selectors
export const selectTheme = (state) => state.ui.theme;
export const selectSidebarOpen = (state) => state.ui.sidebarOpen;
export const selectNotifications = (state) => state.ui.notifications;
export const selectUnreadNotifications = (state) =>
  state.ui.notifications.filter((notification) => !notification.read);
export const selectActiveModal = (state) => state.ui.activeModal;
export const selectIsMobile = (state) => state.ui.isMobile;
export const selectDashboardLayout = (state) => state.ui.dashboardLayout;
export const selectWidgets = (state) => state.ui.dashboardLayout.widgets;
export const selectVisibleWidgets = (state) =>
  state.ui.dashboardLayout.widgets
    .filter((widget) => widget.visible)
    .sort((a, b) => a.order - b.order);
export const selectPreferences = (state) => state.ui.preferences;
export const selectNotificationPreferences = (state) =>
  state.ui.preferences.notifications;

// Export reducer
export default uiSlice.reducer;