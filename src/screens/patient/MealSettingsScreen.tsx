// src/screens/patient/MealSettingsScreen.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { StackScreenProps } from '@react-navigation/stack';
import { PatientStackParamList } from '../../types/navigation.types';
import { TYPOGRAPHY, SPACING, RADIUS } from '../../constants/themes/theme';
import Button from '../../components/common/Button/Button';
import PatientSecondaryNavbar from '../../components/common/PatientSecondaryNavbar';

type Props = StackScreenProps<PatientStackParamList, 'MealSettings'>;

interface MealTime {
  id: string;
  name: string;
  time: string;
  icon: keyof typeof Ionicons.glyphMap;
  description: string;
  enabled: boolean;
}

const MealSettingsScreen: React.FC<Props> = ({ navigation }) => {
  const [mealTimes, setMealTimes] = useState<MealTime[]>([
    {
      id: 'breakfast',
      name: 'Breakfast',
      time: '08:00',
      icon: 'sunny',
      description: 'Morning meal time',
      enabled: true,
    },
    {
      id: 'lunch',
      name: 'Lunch',
      time: '12:30',
      icon: 'partly-sunny',
      description: 'Afternoon meal time',
      enabled: true,
    },
    {
      id: 'dinner',
      name: 'Dinner',
      time: '19:00',
      icon: 'moon',
      description: 'Evening meal time',
      enabled: true,
    },
    {
      id: 'snack',
      name: 'Snack',
      time: '15:30',
      icon: 'cafe',
      description: 'Optional snack time',
      enabled: false,
    },
  ]);

  const [hasChanges, setHasChanges] = useState(false);

  const showTimePicker = (mealId: string, currentTime: string) => {
    // In a real app, you would use a proper time picker
    Alert.alert(
      'Set Time',
      `Current time: ${currentTime}`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Change Time', onPress: () => updateMealTime(mealId, '10:00') },
      ]
    );
  };

  const updateMealTime = (mealId: string, newTime: string) => {
    setMealTimes(prev => 
      prev.map(meal => 
        meal.id === mealId ? { ...meal, time: newTime } : meal
      )
    );
    setHasChanges(true);
  };

  const toggleMealEnabled = (mealId: string) => {
    setMealTimes(prev => 
      prev.map(meal => 
        meal.id === mealId ? { ...meal, enabled: !meal.enabled } : meal
      )
    );
    setHasChanges(true);
  };

  const saveMealSettings = () => {
    // Save settings logic here
    Alert.alert(
      'Settings Saved',
      'Your meal times have been updated successfully!',
      [
        {
          text: 'OK',
          onPress: () => {
            setHasChanges(false);
            navigation.goBack();
          },
        },
      ]
    );
  };

  const resetToDefaults = () => {
    Alert.alert(
      'Reset to Defaults',
      'Are you sure you want to reset all meal times to default values?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: () => {
            setMealTimes([
              { id: 'breakfast', name: 'Breakfast', time: '08:00', icon: 'sunny', description: 'Morning meal time', enabled: true },
              { id: 'lunch', name: 'Lunch', time: '12:30', icon: 'partly-sunny', description: 'Afternoon meal time', enabled: true },
              { id: 'dinner', name: 'Dinner', time: '19:00', icon: 'moon', description: 'Evening meal time', enabled: true },
              { id: 'snack', name: 'Snack', time: '15:30', icon: 'cafe', description: 'Optional snack time', enabled: false },
            ]);
            setHasChanges(true);
          },
        },
      ]
    );
  };

  const MealTimeCard = ({ meal }: { meal: MealTime }) => (
    <View style={[styles.mealCard, !meal.enabled && styles.mealCardDisabled]}>
      <View style={styles.mealHeader}>
        <View style={styles.mealIconContainer}>
          <Ionicons 
            name={meal.icon} 
            size={24} 
            color={meal.enabled ? '#2563EB' : '#9CA3AF'} 
          />
        </View>
        <View style={styles.mealInfo}>
          <Text style={[styles.mealName, !meal.enabled && styles.mealNameDisabled]}>
            {meal.name}
          </Text>
          <Text style={[styles.mealDescription, !meal.enabled && styles.mealDescriptionDisabled]}>
            {meal.description}
          </Text>
        </View>
        <TouchableOpacity
          style={[styles.enableToggle, meal.enabled && styles.enableToggleActive]}
          onPress={() => toggleMealEnabled(meal.id)}
        >
          <Ionicons 
            name={meal.enabled ? "checkmark" : "close"} 
            size={16} 
            color={meal.enabled ? "#FFFFFF" : "#9CA3AF"} 
          />
        </TouchableOpacity>
      </View>

      {meal.enabled && (
        <View style={styles.mealContent}>
          <TouchableOpacity
            style={styles.timeSelector}
            onPress={() => showTimePicker(meal.id, meal.time)}
          >
            <View style={styles.timeDisplay}>
              <Ionicons name="time-outline" size={20} color="#2563EB" />
              <Text style={styles.timeText}>{meal.time}</Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color="#9CA3AF" />
          </TouchableOpacity>

          <View style={styles.medicationHints}>
            <Text style={styles.hintsTitle}>Medications related to this meal:</Text>
            <View style={styles.medicationTags}>
              {meal.id === 'breakfast' && (
                <>
                  <View style={styles.medicationTag}>
                    <Text style={styles.medicationTagText}>Metformin</Text>
                  </View>
                  <View style={styles.medicationTag}>
                    <Text style={styles.medicationTagText}>Lisinopril</Text>
                  </View>
                </>
              )}
              {meal.id === 'dinner' && (
                <View style={styles.medicationTag}>
                  <Text style={styles.medicationTagText}>Atorvastatin</Text>
                </View>
              )}
              {(meal.id === 'lunch' || meal.id === 'snack') && (
                <Text style={styles.noMedicationsText}>No medications scheduled</Text>
              )}
            </View>
          </View>
        </View>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      <PatientSecondaryNavbar
        title="Meal Times"
        subtitle="Set your daily meal schedule"
        onBackPress={() => {
          if (hasChanges) {
            Alert.alert(
              'Unsaved Changes',
              'You have unsaved changes. Do you want to save them?',
              [
                { text: 'Discard', style: 'destructive', onPress: () => navigation.goBack() },
                { text: 'Save', onPress: saveMealSettings },
              ]
            );
          } else {
            navigation.goBack();
          }
        }}
        onSOSPress={() => navigation.navigate('SOS')}
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header Section */}
        <LinearGradient
          colors={['#EBF4FF', '#FFFFFF']}
          style={styles.headerSection}
        >
          <View style={styles.headerContent}>
            <View style={styles.headerIcon}>
              <Ionicons name="restaurant" size={32} color="#2563EB" />
            </View>
            <Text style={styles.headerTitle}>Meal Time Settings</Text>
            <Text style={styles.headerSubtitle}>
              Set your meal times to help schedule medication reminders accurately
            </Text>
          </View>
        </LinearGradient>

        {/* Info Card */}
        <View style={styles.infoSection}>
          <View style={styles.infoCard}>
            <View style={styles.infoIcon}>
              <Ionicons name="information-circle" size={20} color="#2563EB" />
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoTitle}>Why set meal times?</Text>
              <Text style={styles.infoText}>
                Many medications need to be taken with or without food. Setting your meal times helps us send you reminders at the right time.
              </Text>
            </View>
          </View>
        </View>

        {/* Meal Times */}
        <View style={styles.mealTimesSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Your Meal Schedule</Text>
            <TouchableOpacity
              style={styles.resetButton}
              onPress={resetToDefaults}
            >
              <Ionicons name="refresh" size={16} color="#64748B" />
              <Text style={styles.resetButtonText}>Reset</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.mealsList}>
            {mealTimes.map((meal) => (
              <MealTimeCard key={meal.id} meal={meal} />
            ))}
          </View>
        </View>

        {/* Tips Section */}
        <View style={styles.tipsSection}>
          <Text style={styles.sectionTitle}>Tips for Better Medication Timing</Text>
          <View style={styles.tipsList}>
            <View style={styles.tipItem}>
              <View style={styles.tipIcon}>
                <Ionicons name="checkmark-circle" size={16} color="#059669" />
              </View>
              <Text style={styles.tipText}>
                Eat meals at consistent times each day
              </Text>
            </View>
            <View style={styles.tipItem}>
              <View style={styles.tipIcon}>
                <Ionicons name="checkmark-circle" size={16} color="#059669" />
              </View>
              <Text style={styles.tipText}>
                Take medications as prescribed relative to meals
              </Text>
            </View>
            <View style={styles.tipItem}>
              <View style={styles.tipIcon}>
                <Ionicons name="checkmark-circle" size={16} color="#059669" />
              </View>
              <Text style={styles.tipText}>
                Update meal times if your schedule changes
              </Text>
            </View>
          </View>
        </View>

        {/* Save Button */}
        {hasChanges && (
          <View style={styles.saveSection}>
            <Button
              title="Save Meal Settings"
              onPress={saveMealSettings}
              style={styles.saveButton}
              icon={<Ionicons name="checkmark" size={18} color="#FFFFFF" />}
            />
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  scrollView: {
    flex: 1,
    marginTop: Platform.OS === 'ios' ? 114 : 70,
  },
  scrollContent: {
    paddingBottom: SPACING[8],
  },
  headerSection: {
    paddingHorizontal: SPACING[5],
    paddingBottom: SPACING[6],
    paddingTop: SPACING[10],
    alignItems: 'center',
  },
  headerContent: {
    alignItems: 'center',
  },
  headerIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING[4],
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  headerTitle: {
    fontSize: TYPOGRAPHY.fontSize['2xl'],
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: SPACING[2],
  },
  headerSubtitle: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 22,
    maxWidth: '90%',
  },
  infoSection: {
    paddingHorizontal: SPACING[5],
    paddingBottom: SPACING[6],
  },
  infoCard: {
    flexDirection: 'row',
    backgroundColor: '#EBF4FF',
    borderRadius: RADIUS.lg,
    padding: SPACING[4],
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  infoIcon: {
    marginRight: SPACING[3],
    marginTop: 2,
  },
  infoContent: {
    flex: 1,
  },
  infoTitle: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: '600',
    color: '#1E40AF',
    marginBottom: SPACING[1],
  },
  infoText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: '#1D4ED8',
    lineHeight: 20,
  },
  mealTimesSection: {
    paddingHorizontal: SPACING[5],
    paddingBottom: SPACING[6],
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING[4],
  },
  sectionTitle: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: '600',
    color: '#1E293B',
  },
  resetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING[3],
    paddingVertical: SPACING[2],
    backgroundColor: '#F8FAFC',
    borderRadius: RADIUS.md,
    gap: SPACING[1],
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  resetButtonText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: '#64748B',
    fontWeight: '500',
  },
  mealsList: {
    gap: SPACING[4],
  },
  mealCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: RADIUS.xl,
    padding: SPACING[5],
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#64748B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  mealCardDisabled: {
    backgroundColor: '#F8FAFC',
    opacity: 0.7,
  },
  mealHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING[4],
  },
  mealIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#EBF4FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING[4],
  },
  mealInfo: {
    flex: 1,
  },
  mealName: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: SPACING[1],
  },
  mealNameDisabled: {
    color: '#9CA3AF',
  },
  mealDescription: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: '#64748B',
  },
  mealDescriptionDisabled: {
    color: '#9CA3AF',
  },
  enableToggle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  enableToggleActive: {
    backgroundColor: '#2563EB',
    borderColor: '#2563EB',
  },
  mealContent: {
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingTop: SPACING[4],
  },
  timeSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F8FAFC',
    borderRadius: RADIUS.lg,
    padding: SPACING[4],
    marginBottom: SPACING[4],
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  timeDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING[2],
  },
  timeText: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: '600',
    color: '#1E293B',
  },
  medicationHints: {
    marginTop: SPACING[2],
  },
  hintsTitle: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: '500',
    color: '#64748B',
    marginBottom: SPACING[2],
  },
  medicationTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING[2],
  },
  medicationTag: {
    backgroundColor: '#EBF4FF',
    paddingHorizontal: SPACING[2],
    paddingVertical: SPACING[1],
    borderRadius: RADIUS.sm,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  medicationTagText: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: '#1D4ED8',
    fontWeight: '500',
  },
  noMedicationsText: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: '#9CA3AF',
    fontStyle: 'italic',
  },
  tipsSection: {
    paddingHorizontal: SPACING[5],
    paddingBottom: SPACING[6],
  },
  tipsList: {
    backgroundColor: '#FFFFFF',
    borderRadius: RADIUS.lg,
    padding: SPACING[4],
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: SPACING[3],
    paddingRight: SPACING[2],
  },
  tipIcon: {
    marginRight: SPACING[3],
    marginTop: 2,
  },
  tipText: {
    flex: 1,
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: '#475569',
    lineHeight: 20,
  },
  saveSection: {
    paddingHorizontal: SPACING[5],
    paddingTop: SPACING[4],
  },
  saveButton: {
    backgroundColor: '#2563EB',
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
});

export default MealSettingsScreen;