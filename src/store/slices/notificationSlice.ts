import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import { patientAPI } from '../../services/api/patientAPI';
import { caregiverAPI } from '../../services/api/caregiverAPI';

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  priority: 'low' | 'medium' | 'high' | 'critical';
  createdAt: string;
  data?: any;
}

interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
  error: string | null;
}

const initialState: NotificationState = {
  notifications: [],
  unreadCount: 0,
  isLoading: false,
  error: null,
};

// Async thunks for API calls
export const fetchNotifications = createAsyncThunk(
  'notifications/fetchNotifications',
  async (userRole: 'patient' | 'caregiver') => {
    if (userRole === 'patient') {
      const response = await patientAPI.getNotifications();
      return response;
    } else {
      const response = await caregiverAPI.getNotifications();
      return response;
    }
  }
);

export const markNotificationAsRead = createAsyncThunk(
  'notifications/markAsRead',
  async ({ notificationId, userRole }: { notificationId: string; userRole: 'patient' | 'caregiver' }) => {
    if (userRole === 'patient') {
      await patientAPI.markNotificationAsRead(notificationId);
    } else {
      await caregiverAPI.markNotificationAsRead(notificationId);
    }
    return notificationId;
  }
);

export const markAllNotificationsAsRead = createAsyncThunk(
  'notifications/markAllAsRead',
  async (userRole: 'patient' | 'caregiver') => {
    if (userRole === 'patient') {
      await patientAPI.markAllNotificationsAsRead();
    } else {
      await caregiverAPI.markAllNotificationsAsRead();
    }
    return true;
  }
);

export const fetchNotificationCount = createAsyncThunk(
  'notifications/fetchCount',
  async (userRole: 'patient' | 'caregiver') => {
    if (userRole === 'patient') {
      const response: Notification[] | { unreadCount: number } = await patientAPI.getNotifications();
      const unreadCount = Array.isArray(response)
        ? response.filter((n: Notification) => !n.isRead).length
        : (response as { unreadCount: number }).unreadCount || 0;
      return unreadCount;
    } else {
      const response: { unreadCount: number } = await caregiverAPI.getDashboardNotifications();
      return response.unreadCount || 0;
    }
  }
);

const notificationSlice = createSlice({
  name: 'notification',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    addNotification: (state, action: PayloadAction<Notification>) => {
      state.notifications.unshift(action.payload);
      if (!action.payload.isRead) {
        state.unreadCount += 1;
      }
    },
    removeNotification: (state, action: PayloadAction<string>) => {
      const notification = state.notifications.find(n => n.id === action.payload);
      if (notification && !notification.isRead) {
        state.unreadCount -= 1;
      }
      state.notifications = state.notifications.filter(n => n.id !== action.payload);
    },
    updateUnreadCount: (state, action: PayloadAction<number>) => {
      state.unreadCount = action.payload;
    },
    resetNotifications: (state) => {
      state.notifications = [];
      state.unreadCount = 0;
      state.isLoading = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch notifications
      .addCase(fetchNotifications.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.isLoading = false;
        if (Array.isArray(action.payload)) {
          state.notifications = action.payload;
          state.unreadCount = action.payload.filter((n: Notification) => !n.isRead).length;
        } else {
          state.notifications = (action.payload.notifications || []).map((n: any) => ({
            id: n.id,
            type: n.type,
            title: n.title ?? '',
            message: n.message ?? '',
            isRead: n.isRead ?? false,
            priority: n.priority ?? 'low',
            createdAt: n.createdAt ?? '',
            data: n.data,
          }));
          state.unreadCount = action.payload.unreadCount || 0;
        }
      })
      .addCase(fetchNotifications.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to fetch notifications';
      })
      // Mark as read
      .addCase(markNotificationAsRead.fulfilled, (state, action) => {
        const notification = state.notifications.find(n => n.id === action.payload);
        if (notification && !notification.isRead) {
          notification.isRead = true;
          state.unreadCount = Math.max(0, state.unreadCount - 1);
        }
      })
      // Mark all as read
      .addCase(markAllNotificationsAsRead.fulfilled, (state) => {
        state.notifications.forEach(notification => {
          notification.isRead = true;
        });
        state.unreadCount = 0;
      })
      // Fetch notification count
      .addCase(fetchNotificationCount.fulfilled, (state, action) => {
        state.unreadCount = action.payload;
      });
  },
});

export const { 
  clearError, 
  addNotification, 
  removeNotification,
  updateUnreadCount,
  resetNotifications
} = notificationSlice.actions;

export default notificationSlice.reducer;