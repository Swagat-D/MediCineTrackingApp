import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useState } from 'react';
import {
  Dimensions,
  Linking,
  Platform,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { CustomAlertStatic } from '../../components/common/CustomAlert';
import { LoadingSpinner } from '../../components/common/Loading/LoadingSpinner';
import NotificationDetailModal from '../../components/common/NotificationDetailModal';
import PatientSecondaryNavbar from '../../components/common/PatientSecondaryNavbar';
import CaregiverSecondaryNavbar from '../../components/common/SecondaryNavbar';
import { RADIUS, SPACING, TYPOGRAPHY } from '../../constants/themes/theme';
import { caregiverAPI } from '../../services/api/caregiverAPI';
import { useAppDispatch, useAppSelector } from '../../store';
import {
  clearError,
  deleteMultipleNotifications,
  deleteNotification,
  fetchNotifications,
  markAllNotificationsAsRead,
  markNotificationAsRead
} from '../../store/slices/notificationSlice';
import { formatRelativeTime } from '../../utils/dateUtils';

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
  // Updated to match actual API response structure
  patientId?: string;
  patientName?: string;
  patient?: {
    id: string;
    name?: string;
    phoneNumber?: string;
  };
}

const NotificationsScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector(state => state.auth);
  const { notifications, unreadCount, isLoading, error } = useAppSelector(state => state.notification);
  
  const isCaregiver = user?.role === 'caregiver';
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedNotifications, setSelectedNotifications] = useState<Set<string>>(new Set());
  const [modalNotification, setModalNotification] = useState<Notification | null>(null);

  const themeColors: {
    primary: string;
    primaryLight: string;
    primaryBorder: string;
    gradient: [string, string, ...string[]];
  } = {
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
      CustomAlertStatic.alert('Error', error);
      dispatch(clearError());
    }
  }, [error, dispatch]);

  const loadNotifications = async () => {
    try {
      await dispatch(fetchNotifications(user?.role || 'patient')).unwrap();
    } catch (error: any) {
      console.error('Error loading notifications:', error);
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
      CustomAlertStatic.alert('Error', 'Failed to mark notification as read');
    }
  };

  const handleMarkAllAsRead = () => {
    CustomAlertStatic.alert(
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
              CustomAlertStatic.alert('Error', 'Failed to mark all notifications as read');
            }
          }
        }
      ]
    );
  };

  const handleDeleteNotification = async (notificationId: string) => {
    try {
      await dispatch(deleteNotification({ 
        notificationId, 
        userRole: user?.role || 'patient' 
      })).unwrap();
    } catch (error: any) {
      console.error('Error deleting notification:', error);
      CustomAlertStatic.alert('Error', 'Failed to delete notification');
    }
  };

  const handleDeleteSelected = () => {
    if (selectedNotifications.size === 0) return;

    CustomAlertStatic.alert(
      'Delete Notifications',
      `Delete ${selectedNotifications.size} selected notification${selectedNotifications.size > 1 ? 's' : ''}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await dispatch(deleteMultipleNotifications({
                notificationIds: Array.from(selectedNotifications),
                userRole: user?.role || 'patient'
              })).unwrap();
              setSelectedNotifications(new Set());
              setSelectionMode(false);
            } catch (error: any) {
              console.error('Error deleting notifications:', error);
              CustomAlertStatic.alert('Error', 'Failed to delete notifications');
            }
          }
        }
      ]
    );
  };

  const toggleSelection = (notificationId: string) => {
    const newSelection = new Set(selectedNotifications);
    if (newSelection.has(notificationId)) {
      newSelection.delete(notificationId);
    } else {
      newSelection.add(notificationId);
    }
    setSelectedNotifications(newSelection);
  };

  const selectAll = () => {
    setSelectedNotifications(new Set(filteredNotifications.map(n => n.id)));
  };

  const clearSelection = () => {
    setSelectedNotifications(new Set());
    setSelectionMode(false);
  };

  const handleNotificationAction = (notification: Notification) => {
    if (selectionMode) {
      toggleSelection(notification.id);
      return;
    }

    if (!notification.isRead) {
      handleMarkAsRead(notification.id);
    }

    // Show modal
    setModalNotification(notification);
  };

  const extractPatientNameFromMessage = (message: string): string | null => {
    const sosPattern = /Emergency alert from (.+?)\./;
    const sosMatch = message.match(sosPattern);
    if (sosMatch) return sosMatch[1];
    
    const medicationPattern = /added for (.+)$/;
    const medicationMatch = message.match(medicationPattern);
    if (medicationMatch) return medicationMatch[1];
    
    const patientAddedPattern = /Patient (.+?) added to your care/;
    const patientAddedMatch = message.match(patientAddedPattern);
    if (patientAddedMatch) return patientAddedMatch[1];
    
    return null;
  };

  const findPatientIdByName = async (patientName: string, notification: any): Promise<string | null> => {
    try {
      const patients = await caregiverAPI.getPatients();
      const matchingPatients = patients.filter(p => p.name.toLowerCase() === patientName.toLowerCase());
      
      console.log(`Found ${matchingPatients.length} patients with name "${patientName}"`);
      
      if (matchingPatients.length === 0) {
        console.log('No patients found with that name');
        return null;
      }
      
      if (matchingPatients.length === 1) {
        console.log('Single patient found:', matchingPatients[0].id);
        return matchingPatients[0].id;
      }
      
      console.log('Multiple patients found with same name, applying disambiguation strategies...');
      
      if (notification.createdAt) {
        const notificationDate = new Date(notification.createdAt);
        let bestMatch = matchingPatients[0];
        let bestScore = 0;
        
        for (const patient of matchingPatients) {
          let score = 0;
          
          if (patient.lastActivity) {
            const activityDate = new Date(patient.lastActivity);
            const daysDiff = Math.abs((notificationDate.getTime() - activityDate.getTime()) / (1000 * 60 * 60 * 24));
            
            if (daysDiff <= 30) {
              score += 10;
            }
          }
          
          if (patient.status === 'active') {
            score += 5;
          } else if (patient.status === 'critical') {
            score += 8;
          }
          
          if (notification.type === 'sos_alert' && patient.alerts > 0) {
            score += patient.alerts;
          }
          
          console.log(`Patient ${patient.name} (${patient.id}) score: ${score}`);
          
          if (score > bestScore) {
            bestScore = score;
            bestMatch = patient;
          }
        }
        
        console.log(`Selected patient: ${bestMatch.name} (${bestMatch.id}) with score ${bestScore}`);
        return bestMatch.id;
      }
      
      return await showPatientSelectionDialog(matchingPatients, patientName);
      
    } catch (error) {
      console.error('Error fetching patients:', error);
      return null;
    }
  };

  const showPatientSelectionDialog = (patients: any[], patientName: string): Promise<string | null> => {
    return new Promise((resolve) => {
      const options = [
        ...patients.map(p => ({
          text: `${p.name} (Age: ${p.age}, Status: ${p.status})`,
          onPress: () => resolve(p.id)
        })),
        {
          text: 'Cancel',
          onPress: () => resolve(null)
        }
      ];
      
      CustomAlertStatic.alert(
        'Multiple Patients Found',
        `Multiple patients named "${patientName}" found. Please select the correct one:`,
        options
      );
    });
  };

  const handleModalAction = async (action: string) => {
    if (!modalNotification) return;

    console.log('Notification structure:', JSON.stringify(modalNotification, null, 2));

    if (isCaregiver) {
      switch (action) {
        case 'call':
          try {
            let patientId = modalNotification.patientId || 
                           modalNotification.patient?.id || 
                           modalNotification.data?.patientId;
            
            if (!patientId) {
              const patientName = extractPatientNameFromMessage(modalNotification.message);
              console.log('Extracted patient name:', patientName);
              
              if (patientName) {
                patientId = await findPatientIdByName(patientName, modalNotification);
                console.log('Found patient ID by name:', patientId);
              }
            }
                             
            console.log('Patient ID found:', patientId);
                             
            if (!patientId) {
              CustomAlertStatic.alert('Error', 'Patient information not available');
              return;
            }

            const patientDetails = await caregiverAPI.getPatientDetails(patientId);
            console.log('Patient details:', patientDetails);
            const phoneNumber = patientDetails.patient.phoneNumber;
            
            if (phoneNumber) {
              const phoneURL = `tel:${phoneNumber}`;
              
              Linking.canOpenURL(phoneURL)
                .then(supported => {
                  if (supported) {
                    Linking.openURL(phoneURL);
                    setModalNotification(null); // Close modal
                  } else {
                    CustomAlertStatic.alert('Error', 'Phone calling is not supported on this device');
                  }
                })
                .catch(err => {
                  console.error('Error opening phone dialer:', err);
                  CustomAlertStatic.alert('Error', 'Could not open phone dialer');
                });
            } else {
              CustomAlertStatic.alert('No Phone Number', 'Patient phone number not available');
            }
          } catch (error) {
            console.error('Error fetching patient details:', error);
            CustomAlertStatic.alert('Error', 'Could not fetch patient information');
          }
          break;
        case 'view_patient':
          let patientId = modalNotification.patientId || 
                         modalNotification.patient?.id || 
                         modalNotification.data?.patientId;
          
          if (!patientId) {
            const patientName = extractPatientNameFromMessage(modalNotification.message);
            console.log('View patient - Extracted patient name:', patientName);
            
            if (patientName) {
              patientId = await findPatientIdByName(patientName, modalNotification);
              console.log('View patient - Found patient ID by name:', patientId);
            }
          }
          
          console.log('View patient - Patient ID:', patientId);
          if (patientId) {
            navigation.navigate('PatientDetails', { patientId });
            setModalNotification(null); // Close modal
          } else {
            CustomAlertStatic.alert('Error', 'Patient information not available');
          }
          break;
        case 'send_reminder':
          CustomAlertStatic.alert('Sent', 'Patient reminder sent', undefined, { type: 'success' });
          setModalNotification(null); // Close modal
          break;
        case 'view_medications':
          let medicationPatientId = modalNotification.patientId || 
                                   modalNotification.patient?.id || 
                                   modalNotification.data?.patientId;
          
          if (!medicationPatientId) {
            const patientName = extractPatientNameFromMessage(modalNotification.message);
            console.log('View medications - Extracted patient name:', patientName);
            
            if (patientName) {
              medicationPatientId = await findPatientIdByName(patientName, modalNotification);
              console.log('View medications - Found patient ID by name:', medicationPatientId);
            }
          }
          
          if (medicationPatientId) {
            navigation.navigate('PatientDetails', { patientId: medicationPatientId });
            setModalNotification(null); // Close modal
          } else {
            CustomAlertStatic.alert('Error', 'Patient information not available');
          }
          break;
      }
    } else {
      switch (action) {
        case 'call_pharmacy':
          CustomAlertStatic.alert('Calling', 'Feature coming soon', undefined, { type: 'info' });
          break;
        case 'view_medications':
          navigation.navigate('Medications');
          setModalNotification(null); // Close modal
          break;
      }
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'sos_alert': return 'alert-circle';
      case 'dose_missed': return 'time-outline';
      case 'low_stock': return 'medkit-outline';
      case 'dose_taken': return 'checkmark-circle-outline';
      case 'medication_added': return 'add-circle-outline';
      default: return 'information-circle-outline';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return '#EF4444';
      case 'high': return '#F59E0B';
      case 'medium': return themeColors.primary;
      case 'low': return '#6B7280';
      default: return '#6B7280';
    }
  };

  const filteredNotifications = notifications.filter(notification => {
    if (filter === 'unread') return !notification.isRead;
    return true;
  });

  const NotificationItem = ({ notification }: { notification: Notification }) => {
    const priorityColor = getPriorityColor(notification.priority);
    const isSelected = selectedNotifications.has(notification.id);
    const patientName = isCaregiver && notification.patient?.name;
    const displayTitle = notification.title || 'Notification';
    const fullTitle = patientName ? `${displayTitle} - ${patientName}` : displayTitle;
    
    return (
      <TouchableOpacity
        style={[
          styles.notificationItem,
          !notification.isRead && styles.unreadNotification,
          isSelected && styles.selectedNotification,
        ]}
        onPress={() => handleNotificationAction(notification)}
        onLongPress={() => {
          setSelectionMode(true);
          toggleSelection(notification.id);
        }}
        activeOpacity={0.7}
      >
        <View style={styles.notificationContent}>
          {/* Selection Checkbox */}
          {selectionMode && (
            <TouchableOpacity
              style={styles.checkbox}
              onPress={() => toggleSelection(notification.id)}
            >
              <View style={[
                styles.checkboxInner,
                isSelected && { backgroundColor: themeColors.primary }
              ]}>
                {isSelected && (
                  <Ionicons name="checkmark" size={14} color="#FFFFFF" />
                )}
              </View>
            </TouchableOpacity>
          )}

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
                  {formatRelativeTime(notification.createdAt)}
                </Text>
                {!notification.isRead && (
                  <View style={[styles.unreadDot, { backgroundColor: themeColors.primary }]} />
                )}
              </View>
            </View>
            
            <Text style={styles.notificationMessage} numberOfLines={2}>
              {notification.message}
            </Text>
            
            {!selectionMode && (
              <View style={styles.actionIndicator}>
                <Ionicons name="chevron-forward" size={14} color={themeColors.primary} />
                <Text style={[styles.actionText, { color: themeColors.primary }]}>Tap to view</Text>
              </View>
            )}
          </View>
        </View>

        {/* Delete Button (only when not in selection mode) */}
        {!selectionMode && (
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={(e) => {
              e.stopPropagation();
              handleDeleteNotification(notification.id);
            }}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="trash-outline" size={18} color="#EF4444" />
          </TouchableOpacity>
        )}
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
          title={selectionMode ? `${selectedNotifications.size} Selected` : "Notifications"}
          subtitle={selectionMode ? 
            `${selectedNotifications.size} of ${filteredNotifications.length} notifications` :
            (unreadCount > 0 ? `${unreadCount} unread` : 'All caught up')
          }
          onBackPress={selectionMode ? clearSelection : () => navigation.goBack()}
          rightActions={
            selectionMode ? (
              <View style={styles.selectionActions}>
                <TouchableOpacity
                  style={[styles.selectionButton, { backgroundColor: themeColors.primaryLight }]}
                  onPress={selectAll}
                >
                  <Text style={[styles.selectionButtonText, { color: themeColors.primary }]}>
                    All
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.selectionButton, styles.deleteSelectionButton]}
                  onPress={handleDeleteSelected}
                  disabled={selectedNotifications.size === 0}
                >
                  <Ionicons name="trash-outline" size={16} color="#FFFFFF" />
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.headerActions}>
                {unreadCount > 0 && (
                  <TouchableOpacity
                    style={[styles.markAllButton, { backgroundColor: themeColors.primaryLight, borderColor: themeColors.primaryBorder }]}
                    onPress={handleMarkAllAsRead}
                  >
                    <Text style={[styles.markAllButtonText, { color: themeColors.primary }]}>
                      Mark All
                    </Text>
                  </TouchableOpacity>
                )}
                <TouchableOpacity
                  style={styles.selectButton}
                  onPress={() => setSelectionMode(true)}
                >
                  <Ionicons name="checkmark-circle-outline" size={18} color={themeColors.primary} />
                </TouchableOpacity>
              </View>
            )
          }
        />
      ) : (
        <PatientSecondaryNavbar
          title={selectionMode ? `${selectedNotifications.size} Selected` : "Notifications"}
          subtitle={selectionMode ? 
            `${selectedNotifications.size} of ${filteredNotifications.length} notifications` :
            (unreadCount > 0 ? `${unreadCount} unread` : 'All caught up')
          }
          onBackPress={selectionMode ? clearSelection : () => navigation.goBack()}
          onSOSPress={() => navigation.navigate('SOS')}
          rightActions={
            selectionMode ? (
              <View style={styles.selectionActions}>
                <TouchableOpacity
                  style={[styles.selectionButton, { backgroundColor: themeColors.primaryLight }]}
                  onPress={selectAll}
                >
                  <Text style={[styles.selectionButtonText, { color: themeColors.primary }]}>
                    All
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.selectionButton, styles.deleteSelectionButton]}
                  onPress={handleDeleteSelected}
                  disabled={selectedNotifications.size === 0}
                >
                  <Ionicons name="trash-outline" size={16} color="#FFFFFF" />
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.headerActions}>
                {unreadCount > 0 && (
                  <TouchableOpacity
                    style={[styles.markAllButton, { backgroundColor: themeColors.primaryLight, borderColor: themeColors.primaryBorder }]}
                    onPress={handleMarkAllAsRead}
                  >
                    <Text style={[styles.markAllButtonText, { color: themeColors.primary }]}>
                      Mark All
                    </Text>
                  </TouchableOpacity>
                )}
                <TouchableOpacity
                  style={styles.selectButton}
                  onPress={() => setSelectionMode(true)}
                >
                  <Ionicons name="checkmark-circle-outline" size={18} color={themeColors.primary} />
                </TouchableOpacity>
              </View>
            )
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
        {!selectionMode && (
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
        )}

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

      {/* Notification Detail Modal */}
      <NotificationDetailModal
        visible={!!modalNotification}
        onClose={() => setModalNotification(null)}
        notification={modalNotification}
        isCaregiver={isCaregiver}
        onAction={handleModalAction}
        themeColors={themeColors}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING[2],
  },
  selectButton: {
    padding: SPACING[2],
  },
  selectionActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING[2],
  },
  selectionButton: {
    paddingHorizontal: SPACING[3],
    paddingVertical: SPACING[2],
    borderRadius: RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteSelectionButton: {
    backgroundColor: '#EF4444',
    minWidth: 36,
  },
  selectionButtonText: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    fontWeight: '600',
  },
  selectedNotification: {
    backgroundColor: '#F0F9FF',
    borderColor: '#0EA5E9',
    borderWidth: 1,
  },
  checkbox: {
    marginRight: SPACING[2],
    padding: SPACING[1],
  },
  checkboxInner: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    alignItems: 'center',
    justifyContent: 'center',
  },
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
    top: SPACING[12],
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