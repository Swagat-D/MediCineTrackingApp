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
  deleteLoading: boolean;
}

const initialState: NotificationState = {
  notifications: [],
  unreadCount: 0,
  isLoading: false,
  error: null,
  deleteLoading: false,
};

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

export const deleteNotification = createAsyncThunk(
  'notifications/delete',
  async ({ notificationId, userRole }: { notificationId: string; userRole: 'patient' | 'caregiver' }) => {
    if (userRole === 'patient') {
      const response = await patientAPI.deleteNotification(notificationId);
      console.log('✅ Delete notification response:', response);
      return { notificationId, response };
    } else {
      const response = await caregiverAPI.deleteNotification(notificationId);
      console.log('✅ Delete notification response:', response);
      return { notificationId, response };
    }
  }
);

export const deleteMultipleNotifications = createAsyncThunk(
  'notifications/deleteMultiple',
  async ({ notificationIds, userRole }: { notificationIds: string[]; userRole: 'patient' | 'caregiver' }) => {
    if (userRole === 'patient') {
      const response = await patientAPI.deleteMultipleNotifications(notificationIds);
      console.log('✅ Delete multiple notifications response:', response);
      return { notificationIds, response };
    } else {
      const response = await caregiverAPI.deleteMultipleNotifications(notificationIds);
      console.log('✅ Delete multiple notifications response:', response);
      return { notificationIds, response };
    }
  }
);

export const deleteAllNotifications = createAsyncThunk(
  'notifications/deleteAll',
  async (userRole: 'patient' | 'caregiver') => {
    if (userRole === 'patient') {
      const response = await patientAPI.deleteAllNotifications();
      console.log('✅ Delete all notifications response:', response);
      return response;
    } else {
      // Add deleteAllNotifications to caregiverAPI if needed
      throw new Error('Delete all notifications not implemented for caregivers');
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
    removeNotifications: (state, action: PayloadAction<string[]>) => {
      const idsToRemove = new Set(action.payload);
      const removedUnreadCount = state.notifications
        .filter(n => idsToRemove.has(n.id) && !n.isRead)
        .length;
      
      state.notifications = state.notifications.filter(n => !idsToRemove.has(n.id));
      state.unreadCount = Math.max(0, state.unreadCount - removedUnreadCount);
    },
    updateUnreadCount: (state, action: PayloadAction<number>) => {
      state.unreadCount = action.payload;
    },
    resetNotifications: (state) => {
      state.notifications = [];
      state.unreadCount = 0;
      state.isLoading = false;
      state.deleteLoading = false;
      state.error = null;
    },
    setDeleteLoading: (state, action: PayloadAction<boolean>) => {
      state.deleteLoading = action.payload;
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
      .addCase(markNotificationAsRead.rejected, (state, action) => {
        state.error = action.error.message || 'Failed to mark notification as read';
      })
      
      // Mark all as read
      .addCase(markAllNotificationsAsRead.fulfilled, (state) => {
        state.notifications.forEach(notification => {
          notification.isRead = true;
        });
        state.unreadCount = 0;
      })
      .addCase(markAllNotificationsAsRead.rejected, (state, action) => {
        state.error = action.error.message || 'Failed to mark all notifications as read';
      })
      
      // Fetch notification count
      .addCase(fetchNotificationCount.fulfilled, (state, action) => {
        state.unreadCount = action.payload;
      })
      .addCase(fetchNotificationCount.rejected, (state, action) => {
        state.error = action.error.message || 'Failed to fetch notification count';
      })
      
      // Delete single notification
      .addCase(deleteNotification.pending, (state) => {
        state.deleteLoading = true;
        state.error = null;
      })
      .addCase(deleteNotification.fulfilled, (state, action) => {
        state.deleteLoading = false;
        const { notificationId, response } = action.payload;
        
        // Log success message
        console.log(`✅ Notification deleted: ${response.message}`);
        
        // Remove from state
        const notification = state.notifications.find(n => n.id === notificationId);
        if (notification && !notification.isRead) {
          state.unreadCount = Math.max(0, state.unreadCount - 1);
        }
        state.notifications = state.notifications.filter(n => n.id !== notificationId);
      })
      .addCase(deleteNotification.rejected, (state, action) => {
        state.deleteLoading = false;
        state.error = action.error.message || 'Failed to delete notification';
        console.error('❌ Delete notification failed:', action.error.message);
      })
      
      // Delete multiple notifications
      .addCase(deleteMultipleNotifications.pending, (state) => {
        state.deleteLoading = true;
        state.error = null;
      })
      .addCase(deleteMultipleNotifications.fulfilled, (state, action) => {
        state.deleteLoading = false;
        const { notificationIds, response } = action.payload;
        
        // Log success message with counts
        console.log(`✅ Multiple notifications deleted: ${response.message}`, response.data);
        
        // Remove from state
        const idsToRemove = new Set(notificationIds);
        const removedUnreadCount = state.notifications
          .filter(n => idsToRemove.has(n.id) && !n.isRead)
          .length;
        
        state.notifications = state.notifications.filter(n => !idsToRemove.has(n.id));
        state.unreadCount = Math.max(0, state.unreadCount - removedUnreadCount);
        
        // Show success message if some notifications couldn't be deleted
        if (response.data && response.data.deletedCount !== response.data.requestedCount) {
          state.error = `${response.data.deletedCount} of ${response.data.requestedCount} notifications were deleted`;
        }
      })
      .addCase(deleteMultipleNotifications.rejected, (state, action) => {
        state.deleteLoading = false;
        state.error = action.error.message || 'Failed to delete notifications';
        console.error('❌ Delete multiple notifications failed:', action.error.message);
      })
      
      // Delete all notifications
      .addCase(deleteAllNotifications.pending, (state) => {
        state.deleteLoading = true;
        state.error = null;
      })
      .addCase(deleteAllNotifications.fulfilled, (state, action) => {
        state.deleteLoading = false;
        const response = action.payload;
        
        // Log success message
        console.log(`✅ All notifications deleted: ${response.message}`, response.data);
        
        // Clear all notifications
        state.notifications = [];
        state.unreadCount = 0;
      })
      .addCase(deleteAllNotifications.rejected, (state, action) => {
        state.deleteLoading = false;
        state.error = action.error.message || 'Failed to delete all notifications';
        console.error('❌ Delete all notifications failed:', action.error.message);
      });
  },
});

export const { 
  clearError, 
  addNotification, 
  removeNotifications,
  updateUnreadCount,
  resetNotifications,
  setDeleteLoading,
} = notificationSlice.actions;

export default notificationSlice.reducer;