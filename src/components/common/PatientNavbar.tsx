// src/components/common/PatientNavbar.tsx - Fixed version
import React, {useEffect} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { TYPOGRAPHY, SPACING } from '../../constants/themes/theme';
import { useAppDispatch, useAppSelector } from '../../store';
import { fetchNotificationCount } from '../../store/slices/notificationSlice';

interface PatientNavbarProps {
  title?: string;
  showBackButton?: boolean;
  onBackPress?: () => void;
  onNotificationPress?: () => void;
  onSOSPress?: () => void;
  notificationCount?: number;
  rightActions?: React.ReactNode;
}

const PatientNavbar: React.FC<PatientNavbarProps> = ({
  title = 'MediTracker',
  showBackButton = false,
  onBackPress,
  onNotificationPress,
  onSOSPress,
  notificationCount = 0,
  rightActions,
}) => {

  const dispatch = useAppDispatch();
  const { unreadCount } = useAppSelector(state => state.notification);
  const { user } = useAppSelector(state => state.auth);

  useEffect(() => {
    // Fetch notification count when component mounts
    if (user?.role === 'patient') {
      dispatch(fetchNotificationCount('patient'));
    }
  }, [dispatch, user?.role]);

  const handleNotificationPress = () => {
    if (onNotificationPress) {
      onNotificationPress();
    }
  };

  return (
    <View style={styles.navbarContainer}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <View style={styles.navbar}>
        <View style={styles.navLeft}>
          {showBackButton ? (
            <TouchableOpacity
              style={styles.backButton}
              onPress={onBackPress}
              activeOpacity={0.7}
            >
              <Ionicons name="arrow-back" size={24} color="#475569" />
            </TouchableOpacity>
          ) : null}
          
          <View style={styles.titleContainer}>
            <Text style={styles.appTitle}>{title}</Text>
            <View style={styles.titleUnderline} />
          </View>
        </View>

        <View style={styles.navRight}>
          {rightActions || (
            <>
              {/* Notification Button - FIXED */}
              {onNotificationPress && (
                <TouchableOpacity 
                  style={[
                    styles.navButton,
                    unreadCount > 0 && styles.notificationActive
                  ]} 
                  onPress={handleNotificationPress}
                  activeOpacity={0.7}
                >
                  <Ionicons 
                    name={unreadCount > 0 ? "notifications" : "notifications-outline"} 
                    size={22} 
                    color={unreadCount > 0 ? "#2563EB" : "#64748B"} 
                  />
                  {unreadCount > 0 && (
                    <View style={styles.notificationBadge}>
                      <Text style={styles.notificationBadgeText}>
                        {unreadCount > 99 ? '99+' : unreadCount}
                      </Text>
                    </View>
                  )}
                </TouchableOpacity>
              )}

              {/* SOS Button */}
              {onSOSPress && (
                <TouchableOpacity
                  style={styles.sosButton}
                  onPress={onSOSPress}
                  activeOpacity={0.7}
                >
                  <Ionicons name="alert-circle" size={20} color="#FFFFFF" />
                  <Text style={styles.sosText}>SOS</Text>
                </TouchableOpacity>
              )}
            </>
          )}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  navbarContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
    backgroundColor: '#FFFFFF',
    paddingTop: Platform.OS === 'ios' ? 44 : 0,
  },
  navbar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING[5],
    paddingTop: SPACING[10],
    paddingBottom: SPACING[3],
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    minHeight: 70,
  },
  navLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING[3],
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  titleContainer: {
    alignItems: 'flex-start',
  },
  appTitle: {
    fontSize: TYPOGRAPHY.fontSize.xl,
    fontWeight: '700',
    color: '#2563EB',
    letterSpacing: -0.5,
  },
  titleUnderline: {
    width: 24,
    height: 2,
    backgroundColor: '#2563EB',
    borderRadius: 1,
    marginTop: 2,
  },
  navRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING[2],
  },
  navButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  sosButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EF4444',
    paddingHorizontal: SPACING[3],
    paddingVertical: SPACING[2],
    borderRadius: SPACING[5],
    gap: SPACING[1],
    shadowColor: '#EF4444',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  sosText: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  notificationActive: {
    backgroundColor: '#EBF4FF',
    borderColor: '#BFDBFE',
  },
  notificationBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: '#EF4444',
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  notificationBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
});

export default PatientNavbar;