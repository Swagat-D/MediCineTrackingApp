// src/screens/shared/NotificationsScreen.tsx
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
import { markAsRead, markAllAsRead, removeNotification } from '../../store/slices/notificationSlice';

const { width } = Dimensions.get('window');

interface Notification {
  id: string;
  type: 'medication_reminder' | 'refill_reminder' | 'sos_alert' | 'missed_dose' | 'low_stock' | 'system' | 'adherence_report' | 'dose_taken';
  title: string;
  message: string;
  timestamp: string;
  isRead: boolean;
  priority: 'low' | 'medium' | 'high' | 'critical';
  relatedId?: string;
  actionable?: boolean;
}

const NotificationsScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector(state => state.auth);
  const isCaregiver = user?.role === 'caregiver';
  
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: '1',
      type: 'sos_alert',
      title: isCaregiver ? 'Emergency Alert from Mary Johnson' : 'Emergency Alert Sent',
      message: isCaregiver 
        ? 'Patient triggered emergency alert and needs immediate assistance'
        : 'Your emergency alert has been sent to your caregivers successfully',
      timestamp: '2024-08-05T14:30:00Z',
      isRead: false,
      priority: 'critical',
      relatedId: 'patient-2',
      actionable: isCaregiver,
    },
    {
      id: '2',
      type: isCaregiver ? 'missed_dose' : 'medication_reminder',
      title: isCaregiver ? 'Missed Medication Alert' : 'Medication Reminder',
      message: isCaregiver 
        ? 'John Smith missed morning Metformin dose. Last taken 18 hours ago'
        : 'Time to take your Metformin 500mg. Remember to take it with food',
      timestamp: '2024-08-05T12:15:00Z',
      isRead: false,
      priority: 'high',
      relatedId: 'med-1',
      actionable: true,
    },
    {
      id: '3',
      type: 'refill_reminder',
      title: isCaregiver ? 'Medication Refill Required' : 'Medication Running Low',
      message: isCaregiver 
        ? 'Sarah Wilson\'s Atorvastatin supply is running low - only 3 days remaining'
        : 'Your Atorvastatin is running low. Only 3 days remaining. Contact your pharmacy soon',
      timestamp: '2024-08-05T09:45:00Z',
      isRead: false,
      priority: 'medium',
      relatedId: 'med-3',
      actionable: true,
    },
    {
      id: '4',
      type: isCaregiver ? 'dose_taken' : 'medication_reminder',
      title: isCaregiver ? 'Medication Successfully Taken' : 'Next Dose Reminder',
      message: isCaregiver 
        ? 'Robert Davis successfully took Lisinopril 10mg at 2:30 PM today'
        : 'Your next Lisinopril dose is due in 30 minutes at 3:00 PM',
      timestamp: '2024-08-05T14:30:00Z',
      isRead: true,
      priority: 'low',
      relatedId: 'med-2',
      actionable: false,
    },
    {
      id: '5',
      type: 'adherence_report',
      title: isCaregiver ? 'Weekly Patient Report' : 'Your Weekly Progress',
      message: isCaregiver 
        ? 'Your patients achieved 94% average medication adherence this week - great progress!'
        : 'Excellent work! You achieved 94% medication adherence this week',
      timestamp: '2024-08-05T08:00:00Z',
      isRead: true,
      priority: 'low',
      relatedId: undefined,
      actionable: false,
    },
    {
      id: '6',
      type: 'system',
      title: 'App Update Available',
      message: 'MediTracker version 1.2.0 is now available with improved barcode scanning and new features',
      timestamp: '2024-08-04T16:20:00Z',
      isRead: true,
      priority: 'low',
      relatedId: undefined,
      actionable: true,
    },
  ]);

  const themeColors = {
    primary: isCaregiver ? '#059669' : '#2563EB',
    primaryLight: isCaregiver ? '#ECFDF5' : '#EBF4FF',
    primaryBorder: isCaregiver ? '#D1FAE5' : '#BFDBFE',
    gradient: isCaregiver ? ['#F0FDF4', '#FFFFFF'] : ['#EBF4FF', '#FFFFFF'],
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    try {
      setIsLoading(true);
      await new Promise(resolve => setTimeout(resolve, 800));
      setIsLoading(false);
    } catch (error) {
      console.error('Error loading notifications:', error);
      setIsLoading(false);
      Alert.alert('Error', 'Failed to load notifications.');
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadNotifications();
    setRefreshing(false);
  };

  const handleMarkAsRead = (notificationId: string) => {
    setNotifications(prev =>
      prev.map(notif =>
        notif.id === notificationId ? { ...notif, isRead: true } : notif
      )
    );
    dispatch(markAsRead(notificationId));
  };

  const handleMarkAllAsRead = () => {
    Alert.alert(
      'Mark All as Read',
      'Mark all notifications as read?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Mark All',
          onPress: () => {
            setNotifications(prev =>
              prev.map(notif => ({ ...notif, isRead: true }))
            );
            dispatch(markAllAsRead());
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
            setNotifications(prev => prev.filter(notif => notif.id !== notificationId));
            dispatch(removeNotification(notificationId));
          }
        }
      ]
    );
  };

  const handleNotificationAction = (notification: Notification) => {
    if (!notification.actionable) {
      handleMarkAsRead(notification.id);
      return;
    }

    switch (notification.type) {
      case 'sos_alert':
        if (isCaregiver) {
          Alert.alert(
            'Emergency Alert',
            'Critical emergency - contact patient immediately',
            [
              { text: 'Call Now', onPress: () => Alert.alert('Calling...', 'Feature coming soon') },
              { text: 'View Details', onPress: () => Alert.alert('Patient Details', 'Feature coming soon') },
              { text: 'Dismiss', style: 'cancel', onPress: () => handleMarkAsRead(notification.id) },
            ]
          );
        }
        break;
        
      case 'missed_dose':
        if (isCaregiver) {
          Alert.alert(
            'Missed Dose Alert',
            'Send reminder to patient?',
            [
              { text: 'Send Reminder', onPress: () => Alert.alert('Sent', 'Patient reminder sent') },
              { text: 'View Details', onPress: () => Alert.alert('Medication', 'Feature coming soon') },
              { text: 'Dismiss', style: 'cancel', onPress: () => handleMarkAsRead(notification.id) },
            ]
          );
        }
        break;

      case 'medication_reminder':
        if (!isCaregiver) {
          Alert.alert(
            'Take Medication',
            'Time for your medication. Scan barcode?',
            [
              { text: 'Scan Now', onPress: () => navigation.navigate('BarcodeScanner') },
              { text: 'Mark Taken', onPress: () => Alert.alert('Marked', 'Medication marked as taken') },
              { text: 'Snooze 10min', style: 'cancel', onPress: () => Alert.alert('Snoozed', 'Reminder snoozed') },
            ]
          );
        }
        break;
        
      case 'refill_reminder':
        Alert.alert(
          'Refill Required',
          'Medication running low. Contact pharmacy?',
          [
            { text: 'Call Pharmacy', onPress: () => Alert.alert('Calling', 'Feature coming soon') },
            { text: 'View Details', onPress: () => Alert.alert('Medication', 'Feature coming soon') },
            { text: 'Dismiss', style: 'cancel', onPress: () => handleMarkAsRead(notification.id) },
          ]
        );
        break;

      case 'system':
        Alert.alert(
          'App Update',
          'New version available. Update now?',
          [
            { text: 'Update', onPress: () => Alert.alert('Updating...', 'Feature coming soon') },
            { text: 'Later', style: 'cancel', onPress: () => handleMarkAsRead(notification.id) },
          ]
        );
        break;
        
      default:
        handleMarkAsRead(notification.id);
    }
  };

  const getNotificationIcon = (type: Notification['type'], priority: Notification['priority']) => {
    switch (type) {
      case 'sos_alert':
        return 'alert-circle';
      case 'missed_dose':
        return 'time-outline';
      case 'refill_reminder':
        return 'medkit-outline';
      case 'medication_reminder':
        return 'notifications-outline';
      case 'dose_taken':
        return 'checkmark-circle-outline';
      case 'adherence_report':
        return 'analytics-outline';
      case 'system':
        return 'settings-outline';
      default:
        return 'information-circle-outline';
    }
  };

  const getPriorityColor = (priority: Notification['priority']) => {
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
    return date.toLocaleDateString();
  };

  const filteredNotifications = notifications.filter(notification => {
    if (filter === 'unread') return !notification.isRead;
    return true;
  });

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const NotificationItem = ({ notification, index }: { notification: Notification, index: number }) => {
    const priorityColor = getPriorityColor(notification.priority);
    
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
              name={getNotificationIcon(notification.type, notification.priority)}
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
                {notification.title}
              </Text>
              <View style={styles.notificationMeta}>
                <Text style={styles.notificationTime}>
                  {formatTimestamp(notification.timestamp)}
                </Text>
                {!notification.isRead && (
                  <View style={[styles.unreadDot, { backgroundColor: themeColors.primary }]} />
                )}
              </View>
            </View>
            
            <Text style={styles.notificationMessage} numberOfLines={2}>
              {notification.message}
            </Text>
            
            {notification.actionable && (
              <View style={styles.actionIndicator}>
                <Ionicons name="chevron-forward" size={14} color={themeColors.primary} />
                <Text style={[styles.actionText, { color: themeColors.primary }]}>Tap to respond</Text>
              </View>
            )}
          </View>
        </View>

        {/* Delete Button */}
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={(e) => {
            e.stopPropagation();
            handleDeleteNotification(notification.id, notification.title);
          }}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="close" size={18} color="#9CA3AF" />
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

  if (isLoading) {
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
              {filteredNotifications.map((notification, index) => (
                <NotificationItem key={notification.id} notification={notification} index={index} />
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