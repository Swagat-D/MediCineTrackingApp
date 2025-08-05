import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LoadingSpinner } from '../../components/common/Loading/LoadingSpinner';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS, SHADOWS } from '../../constants/themes/theme';
import { useAppDispatch, useAppSelector } from '../../store';
import { markAsRead, markAllAsRead, removeNotification } from '../../store/slices/notificationSlice';

interface Notification {
  id: string;
  type: 'medication_reminder' | 'refill_reminder' | 'sos_alert' | 'missed_dose' | 'low_stock' | 'system' | 'adherence_report';
  title: string;
  message: string;
  timestamp: string;
  isRead: boolean;
  priority: 'low' | 'medium' | 'high' | 'critical';
  relatedId?: string; // medicationId, patientId, etc.
  actionable?: boolean;
}

const NotificationsScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector(state => state.auth);
  
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<'all' | 'unread' | 'critical'>('all');
  
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: '1',
      type: 'sos_alert',
      title: 'SOS Alert - Mary Johnson',
      message: 'Emergency alert triggered by patient. Immediate attention required.',
      timestamp: '2024-08-05T14:30:00Z',
      isRead: false,
      priority: 'critical',
      relatedId: 'patient-2',
      actionable: true,
    },
    {
      id: '2',
      type: 'missed_dose',
      title: 'Missed Medication - John Smith',
      message: 'Patient missed morning dose of Metformin (500mg). Last taken 18 hours ago.',
      timestamp: '2024-08-05T12:15:00Z',
      isRead: false,
      priority: 'high',
      relatedId: 'med-1',
      actionable: true,
    },
    {
      id: '3',
      type: 'refill_reminder',
      title: 'Refill Required - Sarah Wilson',
      message: 'Atorvastatin supply running low. Only 3 days remaining.',
      timestamp: '2024-08-05T09:45:00Z',
      isRead: false,
      priority: 'medium',
      relatedId: 'med-3',
      actionable: true,
    },
    {
      id: '4',
      type: 'medication_reminder',
      title: 'Upcoming Dose - Robert Davis',
      message: 'Next dose of Lisinopril due in 30 minutes (3:00 PM).',
      timestamp: '2024-08-05T14:30:00Z',
      isRead: true,
      priority: 'low',
      relatedId: 'med-2',
      actionable: false,
    },
    {
      id: '5',
      type: 'adherence_report',
      title: 'Weekly Adherence Report',
      message: 'Your patients achieved 94% average medication adherence this week.',
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
      message: 'Version 1.2.0 is now available with improved barcode scanning.',
      timestamp: '2024-08-04T16:20:00Z',
      isRead: true,
      priority: 'low',
      relatedId: undefined,
      actionable: true,
    },
  ]);

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    try {
      setIsLoading(true);
      // TODO: Implement API call to fetch notifications
      // const notifs = await notificationAPI.getNotifications();
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
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
    setNotifications(prev =>
      prev.map(notif => ({ ...notif, isRead: true }))
    );
    dispatch(markAllAsRead());
  };

  const handleDeleteNotification = (notificationId: string) => {
    setNotifications(prev => prev.filter(notif => notif.id !== notificationId));
    dispatch(removeNotification(notificationId));
  };

  const handleNotificationAction = (notification: Notification) => {
    switch (notification.type) {
      case 'sos_alert':
        Alert.alert(
          'SOS Alert',
          'This is a critical emergency alert. Contact the patient immediately.',
          [
            { text: 'Call Patient', onPress: () => handleCallPatient(notification.relatedId!) },
            { text: 'View Details', onPress: () => handleViewPatient(notification.relatedId!) },
            { text: 'Dismiss', style: 'cancel' },
          ]
        );
        break;
        
      case 'missed_dose':
        Alert.alert(
          'Missed Dose',
          'Patient has missed a scheduled medication. Would you like to send a reminder?',
          [
            { text: 'Send Reminder', onPress: () => handleSendReminder(notification.relatedId!) },
            { text: 'View Medication', onPress: () => handleViewMedication(notification.relatedId!) },
            { text: 'Dismiss', style: 'cancel' },
          ]
        );
        break;
        
      case 'refill_reminder':
        Alert.alert(
          'Refill Required',
          'This medication is running low. Would you like to contact the pharmacy?',
          [
            { text: 'Contact Pharmacy', onPress: () => handleContactPharmacy() },
            { text: 'View Medication', onPress: () => handleViewMedication(notification.relatedId!) },
            { text: 'Dismiss', style: 'cancel' },
          ]
        );
        break;
        
      default:
        handleMarkAsRead(notification.id);
    }
  };

  const handleCallPatient = (patientId: string) => {
    // TODO: Implement calling functionality
    Alert.alert('Feature Coming Soon', 'Direct calling will be available in a future update.');
  };

  const handleViewPatient = (patientId: string) => {
    if (user?.role === 'caregiver') {
      navigation.navigate('PatientDetails', { patientId });
    }
  };

  const handleViewMedication = (medicationId: string) => {
    // TODO: Navigate to medication details
    Alert.alert('Feature Coming Soon', 'Medication details navigation will be implemented.');
  };

  const handleSendReminder = (medicationId: string) => {
    Alert.alert('Reminder Sent', 'A medication reminder has been sent to the patient.');
  };

  const handleContactPharmacy = () => {
    Alert.alert('Contact Pharmacy', 'Opening pharmacy contact options...');
  };

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'sos_alert':
        return 'alert-circle';
      case 'missed_dose':
        return 'time-outline';
      case 'refill_reminder':
        return 'medical-outline';
      case 'medication_reminder':
        return 'notifications-outline';
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
        return COLORS.error;
      case 'high':
        return COLORS.warning;
      case 'medium':
        return COLORS.primary[500];
      case 'low':
        return COLORS.gray[500];
      default:
        return COLORS.gray[500];
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
    switch (filter) {
      case 'unread':
        return !notification.isRead;
      case 'critical':
        return notification.priority === 'critical' || notification.priority === 'high';
      default:
        return true;
    }
  });

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const renderNotificationItem = (notification: Notification) => (
    <TouchableOpacity
      key={notification.id}
      style={[
        styles.notificationItem,
        !notification.isRead && styles.unreadNotification,
      ]}
      onPress={() => {
        if (!notification.isRead) {
          handleMarkAsRead(notification.id);
        }
        if (notification.actionable) {
          handleNotificationAction(notification);
        }
      }}
      activeOpacity={0.8}
    >
      <View style={styles.notificationContent}>
        <View style={styles.notificationHeader}>
          <View style={[
            styles.notificationIcon,
            { backgroundColor: getPriorityColor(notification.priority) + '20' }
          ]}>
            <Ionicons
              name={getNotificationIcon(notification.type)}
              size={20}
              color={getPriorityColor(notification.priority)}
            />
          </View>
          
          <View style={styles.notificationText}>
            <Text style={[
              styles.notificationTitle,
              !notification.isRead && styles.unreadTitle
            ]}>
              {notification.title}
            </Text>
            <Text style={styles.notificationMessage}>
              {notification.message}
            </Text>
          </View>

          <View style={styles.notificationMeta}>
            <Text style={styles.notificationTime}>
              {formatTimestamp(notification.timestamp)}
            </Text>
            {!notification.isRead && <View style={styles.unreadDot} />}
          </View>
        </View>

        {notification.actionable && (
          <View style={styles.notificationActions}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => handleNotificationAction(notification)}
            >
              <Text style={styles.actionButtonText}>Take Action</Text>
              <Ionicons name="chevron-forward" size={16} color={COLORS.primary[500]} />
            </TouchableOpacity>
          </View>
        )}
      </View>

      <TouchableOpacity
        style={styles.deleteButton}
        onPress={() => handleDeleteNotification(notification.id)}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <Ionicons name="close" size={16} color={COLORS.gray[400]} />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <LoadingSpinner size="large" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={COLORS.primary[500]} />
        </TouchableOpacity>
        
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Notifications</Text>
          {unreadCount > 0 && (
            <View style={styles.unreadBadge}>
              <Text style={styles.unreadBadgeText}>{unreadCount}</Text>
            </View>
          )}
        </View>
        
        <TouchableOpacity
          style={styles.headerAction}
          onPress={handleMarkAllAsRead}
          disabled={unreadCount === 0}
        >
          <Text style={[
            styles.headerActionText,
            unreadCount === 0 && styles.disabledText
          ]}>
            Mark All Read
          </Text>
        </TouchableOpacity>
      </View>

      {/* Filter Tabs */}
      <View style={styles.filterContainer}>
        {[
          { key: 'all', label: 'All', count: notifications.length },
          { key: 'unread', label: 'Unread', count: unreadCount },
          { key: 'critical', label: 'Critical', count: notifications.filter(n => n.priority === 'critical' || n.priority === 'high').length },
        ].map((filterOption) => (
          <TouchableOpacity
            key={filterOption.key}
            style={[
              styles.filterTab,
              filter === filterOption.key && styles.activeFilterTab,
            ]}
            onPress={() => setFilter(filterOption.key as any)}
          >
            <Text style={[
              styles.filterTabText,
              filter === filterOption.key && styles.activeFilterTabText,
            ]}>
              {filterOption.label} ({filterOption.count})
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Notifications List */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={COLORS.primary[500]}
            colors={[COLORS.primary[500]]}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {filteredNotifications.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="notifications-off-outline" size={80} color={COLORS.gray[300]} />
            <Text style={styles.emptyTitle}>
              {filter === 'all' ? 'No notifications' : `No ${filter} notifications`}
            </Text>
            <Text style={styles.emptyMessage}>
              {filter === 'all' 
                ? 'You\'re all caught up! New notifications will appear here.'
                : `You don't have any ${filter} notifications right now.`
              }
            </Text>
          </View>
        ) : (
          <View style={styles.notificationsList}>
            {filteredNotifications.map(renderNotificationItem)}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING[6],
    paddingVertical: SPACING[4],
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray[200],
  },
  backButton: {
    padding: SPACING[2],
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: TYPOGRAPHY.fontSize.xl,
    fontWeight: 'bold',
    color: COLORS.text.primary,
  },
  unreadBadge: {
    backgroundColor: COLORS.error,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: SPACING[2],
  },
  unreadBadgeText: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    fontWeight: 'bold',
    color: COLORS.background,
  },
  headerAction: {
    padding: SPACING[2],
  },
  headerActionText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: '500',
    color: COLORS.primary[500],
  },
  disabledText: {
    color: COLORS.gray[400],
  },
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: SPACING[6],
    paddingVertical: SPACING[3],
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray[200],
  },
  filterTab: {
    flex: 1,
    paddingVertical: SPACING[2],
    paddingHorizontal: SPACING[3],
    borderRadius: RADIUS.md,
    alignItems: 'center',
  },
  activeFilterTab: {
    backgroundColor: COLORS.primary[50],
  },
  filterTabText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: '500',
    color: COLORS.text.secondary,
  },
  activeFilterTabText: {
    color: COLORS.primary[500],
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: SPACING[6],
    paddingVertical: SPACING[4],
  },
  notificationsList: {
    gap: SPACING[3],
  },
  notificationItem: {
    backgroundColor: COLORS.background,
    borderRadius: RADIUS.xl,
    padding: SPACING[4],
    ...SHADOWS.sm,
    borderWidth: 1,
    borderColor: COLORS.gray[100],
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  unreadNotification: {
    borderColor: COLORS.primary[200],
    backgroundColor: COLORS.primary[50],
  },
  notificationContent: {
    flex: 1,
  },
  notificationHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  notificationIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING[3],
  },
  notificationText: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: '500',
    color: COLORS.text.primary,
    marginBottom: SPACING[1],
  },
  unreadTitle: {
    fontWeight: '600',
  },
  notificationMessage: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.text.secondary,
    lineHeight: 20,
  },
  notificationMeta: {
    alignItems: 'flex-end',
    marginLeft: SPACING[2],
  },
  notificationTime: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.text.hint,
    marginBottom: SPACING[1],
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.primary[500],
  },
  notificationActions: {
    marginTop: SPACING[3],
    paddingTop: SPACING[3],
    borderTopWidth: 1,
    borderTopColor: COLORS.gray[100],
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingVertical: SPACING[2],
    paddingHorizontal: SPACING[3],
    backgroundColor: COLORS.primary[50],
    borderRadius: RADIUS.md,
    gap: SPACING[1],
  },
  actionButtonText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: '500',
    color: COLORS.primary[500],
  },
  deleteButton: {
    padding: SPACING[2],
    marginLeft: SPACING[2],
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: SPACING[16],
  },
  emptyTitle: {
    fontSize: TYPOGRAPHY.fontSize.xl,
    fontWeight: 'bold',
    color: COLORS.text.primary,
    marginTop: SPACING[4],
    marginBottom: SPACING[2],
  },
  emptyMessage: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.text.secondary,
    textAlign: 'center',
    lineHeight: 24,
    maxWidth: '80%',
  },
});

export default NotificationsScreen;