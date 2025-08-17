import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
  Platform,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { LoadingSpinner } from '../../components/common/Loading/LoadingSpinner';
import CaregiverSecondaryNavbar from '../../components/common/SecondaryNavbar';
import PatientSecondaryNavbar from '../../components/common/PatientSecondaryNavbar';
import { TYPOGRAPHY, SPACING, RADIUS } from '../../constants/themes/theme';
import { useAppDispatch, useAppSelector } from '../../store';
import { 
  fetchNotifications, 
  markNotificationAsRead, 
  markAllNotificationsAsRead,
  removeNotification,
  clearError
} from '../../store/slices/notificationSlice';

const { width } = Dimensions.get('window');

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

const NotificationsScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector(state => state.auth);
  const { notifications, unreadCount, isLoading, error } = useAppSelector(state => state.notification);
  
  const isCaregiver = user?.role === 'caregiver';
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  const themeColors = {
    primary: isCaregiver ? '#059669' : '#2563EB',
    primaryLight: isCaregiver ? '#ECFDF5' : '#EBF4FF',
    primaryBorder: isCaregiver ? '#D1FAE5' : '#BFDBFE',
    gradient: isCaregiver ? ['#F0FDF4', '#FFFFFF'] : ['#EBF4FF', '#FFFFFF'],
  };

  useEffect(() => {
    loadNotifications();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (error) {
      Alert.alert('Error', error);
      dispatch(clearError());
    }
  }, [error, dispatch]);

  const loadNotifications = async () => {
    try {
      await dispatch(fetchNotifications(user?.role || 'patient')).unwrap();
    } catch (error: any) {
      console.error('Error loading notifications:', error);
      // Error is handled by the slice
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadNotifications();
    setRefreshing(false);
  };

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await dispatch(markNotificationAsRead({ 
        notificationId, 
        userRole: user?.role || 'patient' 
      })).unwrap();
    } catch (error: any) {
      console.error('Error marking notification as read:', error);
      Alert.alert('Error', 'Failed to mark notification as read');
    }
  };

  const handleMarkAllAsRead = () => {
    Alert.alert(
      'Mark All as Read',
      'Mark all notifications as read?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Mark All',
          onPress: async () => {
            try {
              await dispatch(markAllNotificationsAsRead(user?.role || 'patient')).unwrap();
            } catch (error: any) {
              console.error('Error marking all as read:', error);
              Alert.alert('Error', 'Failed to mark all notifications as read');
            }
          }
        }
      ]
    );
  };

  const handleDeleteNotification = (notificationId: string, title: string) => {
    Alert.alert(
      'Delete Notification',
      `Delete "${title}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            dispatch(removeNotification(notificationId));
          }
        }
      ]
    );
  };

  const handleNotificationAction = (notification: Notification) => {
    // Mark as read first
    if (!notification.isRead) {
      handleMarkAsRead(notification.id);
    }

    // Handle different notification types based on user role
    if (isCaregiver) {
      // Caregiver-specific actions
      switch (notification.type) {
        case 'sos_alert':
          Alert.alert(
            'Emergency Alert',
            `Critical emergency from ${(notification as any).patient?.name || 'patient'} - contact immediately`,
            [
              { text: 'Call Patient', onPress: () => Alert.alert('Calling...', 'Feature coming soon') },
              { text: 'View Patient', onPress: () => {
                if ((notification as any).patient?.id) {
                  navigation.navigate('PatientDetails', { patientId: (notification as any).patient.id });
                }
              }},
              { text: 'Dismiss', style: 'cancel' },
            ]
          );
          break;
          
        case 'dose_missed':
          Alert.alert(
            'Missed Dose Alert',
            `${(notification as any).patient?.name || 'Patient'} missed a medication dose`,
            [
              { text: 'Send Reminder', onPress: () => Alert.alert('Sent', 'Patient reminder sent') },
              { text: 'View Patient', onPress: () => {
                if ((notification as any).patient?.id) {
                  navigation.navigate('PatientDetails', { patientId: (notification as any).patient.id });
                }
              }},
              { text: 'Dismiss', style: 'cancel' },
            ]
          );
          break;

        case 'dose_taken':
          Alert.alert(
            'Medication Taken',
            `${(notification as any).patient?.name || 'Patient'} has successfully taken their medication`,
            [
              { text: 'View Patient', onPress: () => {
                if ((notification as any).patient?.id) {
                  navigation.navigate('PatientDetails', { patientId: (notification as any).patient.id });
                }
              }},
              { text: 'OK' }
            ]
          );
          break;

        case 'low_stock':
          Alert.alert(
            'Low Stock Alert',
            `${(notification as any).patient?.name || 'Patient'}'s medication is running low`,
            [
              { text: 'View Medications', onPress: () => {
                if ((notification as any).patient?.id) {
                  navigation.navigate('PatientDetails', { patientId: (notification as any).patient.id });
                }
              }},
              { text: 'Dismiss', style: 'cancel' },
            ]
          );
          break;

        case 'medication_added':
          Alert.alert(
            'Medication Added',
            `New medication added for ${(notification as any).patient?.name || 'patient'}`,
            [
              { text: 'View Patient', onPress: () => {
                if ((notification as any).patient?.id) {
                  navigation.navigate('PatientDetails', { patientId: (notification as any).patient.id });
                }
              }},
              { text: 'OK' }
            ]
          );
          break;
          
        default:
          // Just mark as read for other notification types
          break;
      }
    } else {
      // Patient-specific actions
      switch (notification.type) {
        case 'sos_alert':
          Alert.alert(
            'Emergency Alert',
            'Your emergency alert has been sent to your caregivers',
            [{ text: 'OK' }]
          );
          break;

        case 'dose_taken':
          Alert.alert(
            'Medication Taken',
            'Your medication dose has been recorded',
            [{ text: 'OK' }]
          );
          break;

        case 'low_stock':
          Alert.alert(
            'Low Stock Alert',
            'Your medication is running low. Contact pharmacy?',
            [
              { text: 'Call Pharmacy', onPress: () => Alert.alert('Calling', 'Feature coming soon') },
              { text: 'View Medications', onPress: () => navigation.navigate('Medications') },
              { text: 'Dismiss', style: 'cancel' },
            ]
          );
          break;

        case 'medication_added':
          Alert.alert(
            'New Medication',
            'A new medication has been added to your treatment plan',
            [
              { text: 'View Medications', onPress: () => navigation.navigate('Medications') },
              { text: 'OK' },
            ]
          );
          break;
          
        default:
          // Just mark as read for other notification types
          break;
      }
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'sos_alert':
        return 'alert-circle';
      case 'dose_missed':
        return 'time-outline';
      case 'low_stock':
        return 'medkit-outline';
      case 'dose_taken':
        return 'checkmark-circle-outline';
      case 'medication_added':
        return 'add-circle-outline';
      default:
        return 'information-circle-outline';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical':
        return '#EF4444';
      case 'high':
        return '#F59E0B';
      case 'medium':
        return themeColors.primary;
      case 'low':
        return '#6B7280';
      default:
        return '#6B7280';
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    if (diffInMinutes < 10080) return `${Math.floor(diffInMinutes / 1440)}d ago`;
    return date.toLocaleDateString();
  };

  const getCaregiverNotificationTitle = (type: string): string => {
    switch (type) {
      case 'dose_taken': 
        return 'Patient Took Medication';
      case 'dose_missed': 
        return 'Patient Missed Dose';
      case 'low_stock': 
        return 'Low Medication Stock';
      case 'sos_alert': 
        return 'Emergency Alert from Patient';
      case 'medication_added': 
        return 'Medication Added Successfully';
      default: 
        return 'Notification';
    }
  };

  const getPatientNotificationTitle = (type: string): string => {
    switch (type) {
      case 'dose_taken': 
        return 'Dose Recorded';
      case 'dose_missed': 
        return 'Missed Dose';
      case 'low_stock': 
        return 'Low Stock Alert';
      case 'sos_alert': 
        return 'Emergency Alert Sent';
      case 'medication_added': 
        return 'New Medication Added';
      default: 
        return 'Notification';
    }
  };

  const getNotificationTitle = (type: string): string => {
    return isCaregiver ? getCaregiverNotificationTitle(type) : getPatientNotificationTitle(type);
  };

  const filteredNotifications = notifications.filter(notification => {
    if (filter === 'unread') return !notification.isRead;
    return true;
  });

  const NotificationItem = ({ notification }: { notification: Notification }) => {
    const priorityColor = getPriorityColor(notification.priority);
    const displayTitle = notification.title || getNotificationTitle(notification.type);
    
    // Show patient name for caregiver notifications
    const patientName = isCaregiver && (notification as any).patient?.name;
    const fullTitle = patientName ? `${displayTitle} - ${patientName}` : displayTitle;
    
    return (
      <TouchableOpacity
        style={[
          styles.notificationItem,
          !notification.isRead && styles.unreadNotification,
        ]}
        onPress={() => handleNotificationAction(notification)}
        activeOpacity={0.7}
      >
        <View style={styles.notificationContent}>
          {/* Priority Indicator */}
          <View style={[styles.priorityIndicator, { backgroundColor: priorityColor }]} />
          
          {/* Icon */}
          <View style={[styles.notificationIconContainer, { backgroundColor: priorityColor + '15' }]}>
            <Ionicons
              name={getNotificationIcon(notification.type)}
              size={22}
              color={priorityColor}
            />
          </View>
          
          {/* Content */}
          <View style={styles.notificationTextContainer}>
            <View style={styles.notificationHeader}>
              <Text style={[
                styles.notificationTitle,
                !notification.isRead && styles.unreadTitle
              ]} numberOfLines={1}>
                {fullTitle}
              </Text>
              <View style={styles.notificationMeta}>
                <Text style={styles.notificationTime}>
                  {formatTimestamp(notification.createdAt)}
                </Text>
                {!notification.isRead && (
                  <View style={[styles.unreadDot, { backgroundColor: themeColors.primary }]} />
                )}
              </View>
            </View>
            
            <Text style={styles.notificationMessage} numberOfLines={2}>
              {notification.message}
            </Text>
            
            <View style={styles.actionIndicator}>
              <Ionicons name="chevron-forward" size={14} color={themeColors.primary} />
              <Text style={[styles.actionText, { color: themeColors.primary }]}>Tap to view</Text>
            </View>
          </View>
        </View>

        {/* Delete Button */}
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={(e) => {
            e.stopPropagation();
            handleDeleteNotification(notification.id, fullTitle);
          }}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="close" size={18} color="#9CA3AF" />
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

  if (isLoading && notifications.length === 0) {
    return (
      <View style={styles.container}>
        {isCaregiver ? (
          <CaregiverSecondaryNavbar
            title="Notifications"
            onBackPress={() => navigation.goBack()}
          />
        ) : (
          <PatientSecondaryNavbar
            title="Notifications"
            onBackPress={() => navigation.goBack()}
            onSOSPress={() => navigation.navigate('SOS')}
          />
        )}
        <View style={styles.loadingContainer}>
          <LoadingSpinner size="large" />
          <Text style={styles.loadingText}>Loading notifications...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {isCaregiver ? (
        <CaregiverSecondaryNavbar
          title="Notifications"
          subtitle={unreadCount > 0 ? `${unreadCount} unread` : 'All caught up'}
          onBackPress={() => navigation.goBack()}
          rightActions={
            unreadCount > 0 ? (
              <TouchableOpacity
                style={[styles.markAllButton, { backgroundColor: themeColors.primaryLight, borderColor: themeColors.primaryBorder }]}
                onPress={handleMarkAllAsRead}
              >
                <Text style={[styles.markAllButtonText, { color: themeColors.primary }]}>
                  Mark All
                </Text>
              </TouchableOpacity>
            ) : null
          }
        />
      ) : (
        <PatientSecondaryNavbar
          title="Notifications"
          subtitle={unreadCount > 0 ? `${unreadCount} unread` : 'All caught up'}
          onBackPress={() => navigation.goBack()}
          onSOSPress={() => navigation.navigate('SOS')}
          rightActions={
            unreadCount > 0 ? (
              <TouchableOpacity
                style={[styles.markAllButton, { backgroundColor: themeColors.primaryLight, borderColor: themeColors.primaryBorder }]}
                onPress={handleMarkAllAsRead}
              >
                <Text style={[styles.markAllButtonText, { color: themeColors.primary }]}>
                  Mark All
                </Text>
              </TouchableOpacity>
            ) : null
          }
        />
      )}

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={themeColors.primary}
            colors={[themeColors.primary]}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Filter Toggle */}
        <View style={styles.filterSection}>
          <View style={styles.filterToggle}>
            <TouchableOpacity
              style={[
                styles.filterOption,
                filter === 'all' && styles.activeFilter,
                filter === 'all' && { backgroundColor: themeColors.primary }
              ]}
              onPress={() => setFilter('all')}
            >
              <Text style={[
                styles.filterText,
                filter === 'all' && styles.activeFilterText
              ]}>
                All ({notifications.length})
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[
                styles.filterOption,
                filter === 'unread' && styles.activeFilter,
                filter === 'unread' && { backgroundColor: themeColors.primary }
              ]}
              onPress={() => setFilter('unread')}
            >
              <Text style={[
                styles.filterText,
                filter === 'unread' && styles.activeFilterText
              ]}>
                Unread ({unreadCount})
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Notifications List */}
        <View style={styles.notificationsSection}>
          {filteredNotifications.length === 0 ? (
            <View style={styles.emptyState}>
              <LinearGradient
                colors={[themeColors.primaryLight, '#FFFFFF']}
                style={styles.emptyBackground}
              >
                <View style={styles.emptyIconContainer}>
                  <Ionicons 
                    name={filter === 'all' ? 'notifications-off-outline' : 'checkmark-circle-outline'} 
                    size={48} 
                    color={themeColors.primary} 
                  />
                </View>
                <Text style={styles.emptyTitle}>
                  {filter === 'all' 
                    ? 'No notifications yet' 
                    : 'All caught up!'
                  }
                </Text>
                <Text style={styles.emptyMessage}>
                  {filter === 'all' 
                    ? 'New notifications will appear here'
                    : 'You\'ve read all your notifications'
                  }
                </Text>
              </LinearGradient>
            </View>
          ) : (
            <View style={styles.notificationsList}>
              {filteredNotifications.map((notification) => (
                <NotificationItem key={notification.id} notification={notification} />
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING[8],
  },
  emptyBackground: {
    borderRadius: RADIUS.xl,
    padding: SPACING[6],
    alignItems: 'center',
    justifyContent: 'center',
    width: width - SPACING[10],
    alignSelf: 'center',
    shadowColor: '#64748B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  scrollView: {
    flex: 1,
    marginTop: Platform.OS === 'ios' ? 114 : 70,
  },
  scrollContent: {
    paddingBottom: SPACING[8],
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: Platform.OS === 'ios' ? 114 : 70,
  },
  loadingText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: '#64748B',
    marginTop: SPACING[4],
  },
  markAllButton: {
    paddingHorizontal: SPACING[3],
    paddingVertical: SPACING[2],
    borderRadius: RADIUS.md,
    borderWidth: 1,
  },
  markAllButtonText: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    fontWeight: '600',
  },
  filterSection: {
    paddingHorizontal: SPACING[5],
    paddingTop: SPACING[10],
    paddingBottom: SPACING[4],
  },
  filterToggle: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: RADIUS.xl,
    padding: SPACING[1],
    shadowColor: '#64748B',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  filterOption: {
    flex: 1,
    paddingVertical: SPACING[3],
    alignItems: 'center',
    borderRadius: RADIUS.lg,
  },
  activeFilter: {
    backgroundColor: '#2563EB',
  },
  filterText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: '500',
    color: '#64748B',
  },
  activeFilterText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  notificationsSection: {
    paddingHorizontal: SPACING[5],
  },
  notificationsList: {
    gap: SPACING[2],
  },
  notificationItem: {
    backgroundColor: '#FFFFFF',
    borderRadius: RADIUS.xl,
    marginBottom: SPACING[2],
    shadowColor: '#64748B',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    overflow: 'hidden',
  },
  unreadNotification: {
    backgroundColor: '#FEFEFF',
    shadowColor: '#2563EB',
    shadowOpacity: 0.08,
    elevation: 3,
  },
  notificationContent: {
    flexDirection: 'row',
    padding: SPACING[4],
    alignItems: 'flex-start',
  },
  priorityIndicator: {
    width: 3,
    height: '100%',
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
  },
  notificationIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING[3],
    marginLeft: SPACING[2],
  },
  notificationTextContainer: {
    flex: 1,
  },
  notificationHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: SPACING[1],
  },
  notificationTitle: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: '500',
    color: '#1E293B',
    flex: 1,
    marginRight: SPACING[2],
  },
  unreadTitle: {
    fontWeight: '600',
    color: '#0F172A',
  },
  notificationMeta: {
    alignItems: 'flex-end',
    gap: SPACING[1],
  },
  notificationTime: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: '#94A3B8',
    fontWeight: '500',
  },
  unreadDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  notificationMessage: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: '#64748B',
    lineHeight: 20,
    marginBottom: SPACING[2],
  },
  actionIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING[1],
  },
  actionText: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    fontWeight: '500',
  },
  deleteButton: {
    position: 'absolute',
    top: SPACING[2],
    right: SPACING[2],
    padding: SPACING[2],
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: RADIUS.full,
    shadowColor: '#64748B',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  emptyIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING[4],
    shadowColor: '#64748B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  emptyTitle: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: SPACING[2],
    textAlign: 'center',
  },
  emptyMessage: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 22,
  },
});

export default NotificationsScreen;