import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import {
  Dimensions,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { RADIUS, SPACING, TYPOGRAPHY } from '../../constants/themes/theme';
import { formatTimestamp } from '../../utils/dateUtils';

const { height } = Dimensions.get('window');

interface NotificationDetailModalProps {
  visible: boolean;
  onClose: () => void;
  notification: any;
  isCaregiver: boolean;
  onAction: (action: string) => void;
  themeColors: {
    primary: string;
    primaryLight: string;
    primaryBorder: string;
    gradient: [string, string, ...string[]];
  };
}

const NotificationDetailModal: React.FC<NotificationDetailModalProps> = ({
  visible,
  onClose,
  notification,
  isCaregiver,
  onAction,
  themeColors
}) => {
  if (!notification) return null;

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

  const getActionButtons = () => {
    if (isCaregiver) {
      switch (notification.type) {
        case 'sos_alert':
          return [
            { label: 'Call Patient', action: 'call', icon: 'call', style: 'critical' },
            { label: 'View Patient', action: 'view_patient', icon: 'person', style: 'primary' },
          ];
        case 'dose_missed':
          return [
            { label: 'Send Reminder', action: 'send_reminder', icon: 'notifications', style: 'primary' },
            { label: 'View Patient', action: 'view_patient', icon: 'person', style: 'secondary' },
          ];
        case 'low_stock':
          return [
            { label: 'View Medications', action: 'view_medications', icon: 'medkit', style: 'primary' },
          ];
        default:
          return [
            { label: 'View Patient', action: 'view_patient', icon: 'person', style: 'primary' },
          ];
      }
    } else {
      switch (notification.type) {
        case 'low_stock':
          return [
            { label: 'Call Pharmacy', action: 'call_pharmacy', icon: 'call', style: 'primary' },
            { label: 'View Medications', action: 'view_medications', icon: 'medkit', style: 'secondary' },
          ];
        case 'medication_added':
          return [
            { label: 'View Medications', action: 'view_medications', icon: 'medkit', style: 'primary' },
          ];
        default:
          return [];
      }
    }
  };

  // Helper function to extract patient name from notification message
  const extractPatientNameFromMessage = (message: string): string | null => {
    // Pattern 1: "Emergency alert from [Name]. Immediate assistance required."
    const sosPattern = /Emergency alert from (.+?)\./;
    const sosMatch = message.match(sosPattern);
    if (sosMatch) return sosMatch[1];
    
    // Pattern 2: "New medication [Med] added for [Name]"
    const medicationPattern = /added for (.+)$/;
    const medicationMatch = message.match(medicationPattern);
    if (medicationMatch) return medicationMatch[1];
    
    // Pattern 3: "Patient [Name] added to your care"
    const patientAddedPattern = /Patient (.+?) added to your care/;
    const patientAddedMatch = message.match(patientAddedPattern);
    if (patientAddedMatch) return patientAddedMatch[1];
    
    return null;
  };

  const priorityColor = getPriorityColor(notification.priority);
  const timestamp = formatTimestamp(notification.createdAt);
  const actionButtons = getActionButtons();
  const patientName = isCaregiver && (
    notification.patient?.name || 
    notification.patientName || 
    extractPatientNameFromMessage(notification.message)
  );

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <LinearGradient
            colors={themeColors.gradient}
            style={styles.modalHeader}
          >
            {/* Priority Indicator */}
            <View style={[styles.priorityBar, { backgroundColor: priorityColor }]} />
            
            {/* Header Content */}
            <View style={styles.headerContent}>
              <View style={styles.headerLeft}>
                <View style={[styles.iconContainer, { backgroundColor: priorityColor + '15' }]}>
                  <Ionicons
                    name={getNotificationIcon(notification.type)}
                    size={28}
                    color={priorityColor}
                  />
                </View>
                <View style={styles.headerText}>
                  <Text style={styles.notificationType}>
                    {notification.type.replace('_', ' ').toUpperCase()}
                  </Text>
                  <Text style={styles.priorityText}>
                    {notification.priority.toUpperCase()} PRIORITY
                  </Text>
                </View>
              </View>
              
              <TouchableOpacity
                style={styles.closeButton}
                onPress={onClose}
              >
                <Ionicons name="close" size={24} color="#64748B" />
              </TouchableOpacity>
            </View>
          </LinearGradient>

          <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
            {/* Title */}
            <View style={styles.titleSection}>
              <Text style={styles.title}>
                {notification.title || 'Notification'}
              </Text>
              {patientName && (
                <View style={styles.patientBadge}>
                  <Ionicons name="person" size={14} color={themeColors.primary} />
                  <Text style={[styles.patientName, { color: themeColors.primary }]}>
                    {patientName}
                  </Text>
                </View>
              )}
            </View>

            {/* Message */}
            <View style={styles.messageSection}>
              <Text style={styles.message}>
                {notification.message}
              </Text>
            </View>

            {/* Timestamp */}
            <View style={styles.timestampSection}>
              <View style={styles.timestampRow}>
                <Ionicons name="calendar-outline" size={16} color="#64748B" />
                <Text style={styles.timestampText}>{timestamp.date}</Text>
              </View>
              <View style={styles.timestampRow}>
                <Ionicons name="time-outline" size={16} color="#64748B" />
                <Text style={styles.timestampText}>{timestamp.time}</Text>
              </View>
            </View>

            {/* Additional Data */}
            {notification.data && (
              <View style={styles.dataSection}>
                <Text style={styles.dataTitle}>Additional Information</Text>
                <View style={styles.dataContainer}>
                  {Object.entries(notification.data).map(([key, value]) => (
                    <View key={key} style={styles.dataRow}>
                      <Text style={styles.dataKey}>{key.replace('_', ' ')}:</Text>
                      <Text style={styles.dataValue}>{String(value)}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}
          </ScrollView>

          {/* Action Buttons */}
          {actionButtons.length > 0 && (
            <View style={styles.actionsSection}>
              {actionButtons.map((button, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.actionButton,
                    button.style === 'critical' && styles.criticalButton,
                    button.style === 'primary' && { backgroundColor: themeColors.primary },
                    button.style === 'secondary' && styles.secondaryButton,
                  ]}
                  onPress={() => {
                    onAction(button.action);
                    onClose();
                  }}
                >
                  <Ionicons 
                    name={button.icon as any} 
                    size={18} 
                    color={button.style === 'secondary' ? themeColors.primary : '#FFFFFF'} 
                  />
                  <Text style={[
                    styles.actionButtonText,
                    button.style === 'secondary' && { color: themeColors.primary }
                  ]}>
                    {button.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: RADIUS['2xl'],
    borderTopRightRadius: RADIUS['2xl'],
    maxHeight: height * 0.85,
    width: '100%',
  },
  modalHeader: {
    borderTopLeftRadius: RADIUS['2xl'],
    borderTopRightRadius: RADIUS['2xl'],
    paddingTop: SPACING[6],
    paddingBottom: SPACING[4],
    position: 'relative',
  },
  priorityBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 4,
    borderTopLeftRadius: RADIUS['2xl'],
    borderTopRightRadius: RADIUS['2xl'],
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: SPACING[6],
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING[4],
  },
  headerText: {
    flex: 1,
  },
  notificationType: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: SPACING[1],
  },
  priorityText: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    fontWeight: '600',
    color: '#64748B',
    letterSpacing: 0.5,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    flex: 1,
    paddingHorizontal: SPACING[6],
  },
  titleSection: {
    paddingTop: SPACING[6],
    paddingBottom: SPACING[4],
  },
  title: {
    fontSize: TYPOGRAPHY.fontSize.xl,
    fontWeight: '600',
    color: '#1E293B',
    lineHeight: 28,
    marginBottom: SPACING[3],
  },
  patientBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    paddingHorizontal: SPACING[3],
    paddingVertical: SPACING[2],
    borderRadius: RADIUS.lg,
    alignSelf: 'flex-start',
    gap: SPACING[2],
  },
  patientName: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: '500',
  },
  messageSection: {
    paddingBottom: SPACING[6],
  },
  message: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: '#64748B',
    lineHeight: 24,
  },
  timestampSection: {
    paddingBottom: SPACING[6],
    gap: SPACING[2],
  },
  timestampRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING[2],
  },
  timestampText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: '#64748B',
    fontWeight: '500',
  },
  dataSection: {
    paddingBottom: SPACING[6],
  },
  dataTitle: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: SPACING[3],
  },
  dataContainer: {
    backgroundColor: '#F8FAFC',
    borderRadius: RADIUS.lg,
    padding: SPACING[4],
    gap: SPACING[2],
  },
  dataRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dataKey: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: '#64748B',
    fontWeight: '500',
    textTransform: 'capitalize',
  },
  dataValue: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: '#1E293B',
    fontWeight: '500',
  },
  actionsSection: {
    paddingHorizontal: SPACING[6],
    paddingVertical: SPACING[4],
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    gap: SPACING[3],
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING[4],
    borderRadius: RADIUS.lg,
    gap: SPACING[2],
  },
  criticalButton: {
    backgroundColor: '#EF4444',
  },
  secondaryButton: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  actionButtonText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});

export default NotificationDetailModal;