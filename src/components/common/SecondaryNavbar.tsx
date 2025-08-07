// src/components/common/SecondaryNavbar.tsx
import React from 'react';
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

interface SecondaryNavbarProps {
  title: string;
  onBackPress: () => void;
  rightActions?: React.ReactNode;
  subtitle?: string;
}

const SecondaryNavbar: React.FC<SecondaryNavbarProps> = ({
  title,
  onBackPress,
  rightActions,
  subtitle,
}) => {
  return (
    <View style={styles.navbarContainer}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <View style={styles.navbar}>
        <View style={styles.navLeft}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={onBackPress}
            activeOpacity={0.7}
          >
            <Ionicons name="arrow-back" size={24} color="#475569" />
          </TouchableOpacity>
          
          <View style={styles.titleContainer}>
            <Text style={styles.appTitle} numberOfLines={1}>
              {title}
            </Text>
            {subtitle && (
              <Text style={styles.subtitle} numberOfLines={1}>
                {subtitle}
              </Text>
            )}
          </View>
        </View>

        <View style={styles.navRight}>
          {rightActions}
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
    flex: 1,
  },
  appTitle: {
    fontSize: TYPOGRAPHY.fontSize.xl,
    fontWeight: '700',
    color: '#059669',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: '#64748B',
    fontWeight: '500',
    marginTop: 2,
  },
  navRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING[2],
  },
});

export default SecondaryNavbar;