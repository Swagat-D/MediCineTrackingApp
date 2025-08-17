// src/hooks/useNotifications.ts - Create this new file
import { useEffect, useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '../store';
import { 
  fetchNotificationCount, 
  fetchNotifications,
  resetNotifications 
} from '../store/slices/notificationSlice';

export const useNotifications = () => {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector(state => state.auth);
  const { unreadCount, notifications, isLoading } = useAppSelector(state => state.notification);

  const userRole = user?.role || 'patient';

  // Fetch notification count
  const fetchCount = useCallback(() => {
    dispatch(fetchNotificationCount(userRole));
  }, [dispatch, userRole]);

  // Fetch all notifications
  const fetchAll = useCallback(() => {
    dispatch(fetchNotifications(userRole));
  }, [dispatch, userRole]);

  // Reset notifications (useful for logout)
  const resetNotificationState = useCallback(() => {
    dispatch(resetNotifications());
  }, [dispatch]);

  // Auto-fetch count when user changes
  useEffect(() => {
    if (user?.id) {
      fetchCount();
    } else {
      resetNotificationState();
    }
  }, [user?.id, fetchCount, resetNotificationState]);

  return {
    unreadCount,
    notifications,
    isLoading,
    fetchCount,
    fetchAll,
    resetNotificationState,
  };
};

// Custom hook for navbar notification badge
export const useNotificationBadge = () => {
  const { unreadCount, fetchCount } = useNotifications();

  // Refresh notification count
  const refreshCount = useCallback(() => {
    fetchCount();
  }, [fetchCount]);

  return {
    unreadCount,
    refreshCount,
    badgeText: unreadCount > 99 ? '99+' : unreadCount.toString(),
    showBadge: unreadCount > 0,
  };
};