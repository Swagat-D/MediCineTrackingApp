import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { AuthStackScreenProps } from '../../types/navigation.types';
import { UserRole } from '../../types/auth.types';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS, SHADOWS } from '../../constants/themes/theme';

const { width } = Dimensions.get('window');

type Props = AuthStackScreenProps<'RoleSelection'>;

const RoleSelectionScreen: React.FC<Props> = ({ navigation }) => {
  const handleRoleSelection = (role: UserRole) => {
    navigation.navigate('Login', { role });
  };

  const renderRoleCard = (
    role: UserRole,
    title: string,
    description: string,
    icon: keyof typeof Ionicons.glyphMap,
    gradient: [string, string]
  ) => (
    <TouchableOpacity
      style={styles.roleCard}
      onPress={() => handleRoleSelection(role)}
      activeOpacity={0.8}
    >
      <LinearGradient
        colors={gradient}
        style={styles.cardGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.cardContent}>
          <View style={styles.iconContainer}>
            <Ionicons name={icon} size={48} color={COLORS.background} />
          </View>
          
          <Text style={styles.cardTitle}>{title}</Text>
          <Text style={styles.cardDescription}>{description}</Text>
          
          <View style={styles.cardFooter}>
            <Text style={styles.cardFooterText}>Continue as {title}</Text>
            <Ionicons name="arrow-forward" size={20} color={COLORS.background} />
          </View>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary[700]} />
      
      <LinearGradient
        colors={[COLORS.primary[500], COLORS.primary[700]]}
        style={styles.backgroundGradient}
      >
        <View style={styles.content}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.logoContainer}>
              <Ionicons name="medical" size={60} color={COLORS.background} />
            </View>
            <Text style={styles.title}>Welcome to MediTracker</Text>
            <Text style={styles.subtitle}>
              Choose your role to get started with personalized medication management
            </Text>
          </View>

          {/* Role Cards */}
          <View style={styles.rolesContainer}>
            {renderRoleCard(
              'caregiver',
              'Caregiver',
              'Manage medications for multiple patients, set reminders, and monitor adherence',
              'people',
              [COLORS.secondary[400], COLORS.secondary[600]]
            )}

            {renderRoleCard(
              'patient',
              'Patient',
              'Track your medications, receive reminders, and manage your health routine',
              'person',
              [COLORS.primary[400], COLORS.primary[600]]
            )}
          </View>

          {/* Features Info */}
          <View style={styles.featuresContainer}>
            <Text style={styles.featuresTitle}>What you get:</Text>
            <View style={styles.featuresList}>
              <View style={styles.featureItem}>
                <Ionicons name="checkmark-circle" size={16} color={COLORS.background} />
                <Text style={styles.featureText}>Smart medication reminders</Text>
              </View>
              <View style={styles.featureItem}>
                <Ionicons name="checkmark-circle" size={16} color={COLORS.background} />
                <Text style={styles.featureText}>Barcode scanning for accuracy</Text>
              </View>
              <View style={styles.featureItem}>
                <Ionicons name="checkmark-circle" size={16} color={COLORS.background} />
                <Text style={styles.featureText}>Secure and private data</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <TouchableOpacity 
            style={styles.helpButton}
            onPress={() => {/* Handle help */}}
          >
            <Ionicons name="help-circle-outline" size={20} color={COLORS.background} />
            <Text style={styles.helpText}>Need help choosing?</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backgroundGradient: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: SPACING[6],
    paddingTop: SPACING[8],
  },
  header: {
    alignItems: 'center',
    marginBottom: SPACING[10],
  },
  logoContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING[4],
  },
  title: {
    fontSize: TYPOGRAPHY.fontSize['3xl'],
    fontWeight: 'bold',
    color: COLORS.background,
    textAlign: 'center',
    marginBottom: SPACING[3],
  },
  subtitle: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.background,
    textAlign: 'center',
    opacity: 0.9,
    lineHeight: 24,
    maxWidth: width * 0.85,
  },
  rolesContainer: {
    flex: 1,
    gap: SPACING[4],
  },
  roleCard: {
    borderRadius: RADIUS.xl,
    ...SHADOWS.lg,
  },
  cardGradient: {
    borderRadius: RADIUS.xl,
    padding: SPACING[6],
    minHeight: 180,
  },
  cardContent: {
    alignItems: 'center',
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING[4],
  },
  cardTitle: {
    fontSize: TYPOGRAPHY.fontSize['2xl'],
    fontWeight: 'bold',
    color: COLORS.background,
    marginBottom: SPACING[2],
  },
  cardDescription: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.background,
    textAlign: 'center',
    opacity: 0.9,
    lineHeight: 20,
    marginBottom: SPACING[4],
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING[2],
  },
  cardFooterText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: '600',
    color: COLORS.background,
  },
  featuresContainer: {
    marginVertical: SPACING[6],
    paddingHorizontal: SPACING[4],
  },
  featuresTitle: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: '600',
    color: COLORS.background,
    marginBottom: SPACING[3],
    textAlign: 'center',
  },
  featuresList: {
    gap: SPACING[2],
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING[2],
  },
  featureText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.background,
    opacity: 0.9,
  },
  footer: {
    paddingHorizontal: SPACING[6],
    paddingBottom: SPACING[6],
    alignItems: 'center',
  },
  helpButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING[2],
    paddingVertical: SPACING[3],
    paddingHorizontal: SPACING[4],
    borderRadius: RADIUS.full,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  helpText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.background,
    fontWeight: '500',
  },
});

export default RoleSelectionScreen;