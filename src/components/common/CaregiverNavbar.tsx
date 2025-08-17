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
import { TYPOGRAPHY, SPACING  } from '../../constants/themes/theme';
import { useAppDispatch, useAppSelector } from '../../store';
import { fetchNotificationCount } from '../../store/slices/notificationSlice';

interface NavbarProps {
  title?: string;
  showBackButton?: boolean;
  onBackPress?: () => void;
  onNotificationPress?: () => void;
  onSettingsPress?: () => void;
  notificationCount?: number;
  rightActions?: React.ReactNode;
}

const CaregiverNavbar: React.FC<NavbarProps> = ({
  title = 'MediTracker',
  showBackButton = false,
  onBackPress,
  onNotificationPress,
  onSettingsPress,
  notificationCount,
  rightActions,
}) => {

  const dispatch = useAppDispatch();
  const { unreadCount } = useAppSelector(state => state.notification);
  const { user } = useAppSelector(state => state.auth);

  useEffect(() => {
    // Fetch notification count when component mounts
    if (user?.role === 'caregiver') {
      dispatch(fetchNotificationCount('caregiver'));
    }
  }, [dispatch, user?.role]);

  // Add this function to handle notification press
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
              {onSettingsPress && (
                <TouchableOpacity
                  style={styles.navButton}
                  onPress={onSettingsPress}
                  activeOpacity={0.7}
                >
                  <Ionicons name="settings-outline" size={22} color="#475569" />
                </TouchableOpacity>
              )}
              
              {onNotificationPress && (
                <TouchableOpacity 
                  style={styles.navButton} 
                  onPress={handleNotificationPress}
                >
                  <Ionicons name="notifications-outline" size={24} color="#FFFFFF" />
                  {unreadCount > 0 && (
                    <View style={styles.notificationBadge}>
                      <Text style={styles.notificationBadgeText}>
                        {unreadCount > 99 ? '99+' : unreadCount}
                      </Text>
                    </View>
                  )}
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
    color: '#059669',
    letterSpacing: -0.5,
  },
  titleUnderline: {
    width: 24,
    height: 2,
    backgroundColor: '#059669',
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
  notificationActive: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FECACA',
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

export default CaregiverNavbar;