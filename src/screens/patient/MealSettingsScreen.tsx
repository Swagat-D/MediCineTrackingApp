import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Platform,
  ActivityIndicator,
  StyleSheet,
  Switch,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useAppSelector, useAppDispatch } from '../../store';
import { 
  setLoading, 
  setMealTimes, 
  setConnectionStatus,
  setError 
} from '../../store/slices/patientSlice';
import { patientAPI } from '../../services/api/patientAPI';
import { useFocusEffect } from '@react-navigation/native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { TYPOGRAPHY, SPACING, RADIUS } from '../../constants/themes/theme';
import PatientSecondaryNavbar from '../../components/common/PatientSecondaryNavbar';
import { CustomAlertStatic } from '@/components/common/CustomAlert/CustomAlertStatic';

interface Props {
  navigation: any;
}

interface MealTime {
  id: string;
  name: string;
  time: string;
  enabled: boolean;
  icon: keyof typeof Ionicons.glyphMap;
  isOptional: boolean;
  description: string;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const { width } = Dimensions.get('window');

const MealSettingsScreen: React.FC<Props> = ({ navigation }) => {
  const dispatch = useAppDispatch();
  const { isLoading, isConnected } = useAppSelector(state => state.patient);
  
  const [localMealTimes, setLocalMealTimes] = useState<MealTime[]>([]);
  const [hasChanges, setHasChanges] = useState(false);
  const [savingChanges, setSavingChanges] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState<{
    visible: boolean;
    mealId: string;
    currentTime: Date;
  }>({ visible: false, mealId: '', currentTime: new Date() });

  // Patient theme colors
  const theme = {
    primary: '#2563EB',
    primaryLight: '#DBEAFE',
    primaryDark: '#1D4ED8',
    gradient: ['#DBEAFE', '#FFFFFF'] as [string, string],
    accent: '#3B82F6',
  };

  useFocusEffect(
    useCallback(() => {
      loadMealTimes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])
  );

  const loadMealTimes = async () => {
    dispatch(setLoading(true));
    try {
      const data = await patientAPI.getMealTimes();
      const mealTimesWithMeta = data.map((meal: any) => ({
        ...meal,
        icon: getIconForMeal(meal.id),
        isOptional: meal.id === 'snack',
        description: getDescriptionForMeal(meal.id),
      }));
      
      dispatch(setMealTimes(data));
      setLocalMealTimes(mealTimesWithMeta);
      dispatch(setConnectionStatus(true));
    } catch (error: any) {
      dispatch(setError(error.message));
      dispatch(setConnectionStatus(false));
      
      // Set default meal times
      const defaultMeals = [
        { 
          id: 'breakfast', 
          name: 'Breakfast', 
          time: '8:00 AM', 
          enabled: true, 
          icon: 'sunny' as keyof typeof Ionicons.glyphMap,
          isOptional: false,
          description: 'Start your day with morning medications'
        },
        { 
          id: 'lunch', 
          name: 'Lunch', 
          time: '12:30 PM', 
          enabled: true, 
          icon: 'partly-sunny' as keyof typeof Ionicons.glyphMap,
          isOptional: false,
          description: 'Midday meal for afternoon medications'
        },
        { 
          id: 'dinner', 
          name: 'Dinner', 
          time: '7:00 PM', 
          enabled: true, 
          icon: 'moon' as keyof typeof Ionicons.glyphMap,
          isOptional: false,
          description: 'Evening meal for nighttime medications'
        },
        { 
          id: 'snack', 
          name: 'Snack', 
          time: '3:30 PM', 
          enabled: false, 
          icon: 'cafe' as keyof typeof Ionicons.glyphMap,
          isOptional: true,
          description: 'Optional snack time for additional medications'
        },
      ];
      setLocalMealTimes(defaultMeals);
    } finally {
      dispatch(setLoading(false));
    }
  };

  const getIconForMeal = (mealId: string): keyof typeof Ionicons.glyphMap => {
    switch (mealId) {
      case 'breakfast': return 'sunny';
      case 'lunch': return 'partly-sunny';
      case 'dinner': return 'moon';
      case 'snack': return 'cafe';
      default: return 'restaurant';
    }
  };

  const getDescriptionForMeal = (mealId: string): string => {
    switch (mealId) {
      case 'breakfast': return 'Start your day with morning medications';
      case 'lunch': return 'Midday meal for afternoon medications';
      case 'dinner': return 'Evening meal for nighttime medications';
      case 'snack': return 'Optional snack time for additional medications';
      default: return '';
    }
  };

  // Convert 24-hour time to 12-hour format
  const convertTo12Hour = (time24: string): string => {
    const [hours, minutes] = time24.split(':').map(Number);
    const period = hours >= 12 ? 'PM' : 'AM';
    const hours12 = hours % 12 || 12;
    return `${hours12}:${minutes.toString().padStart(2, '0')} ${period}`;
  };

  // Convert 12-hour time to 24-hour format
  const convertTo24Hour = (time12: string): string => {
    const [time, period] = time12.split(' ');
    const [hours, minutes] = time.split(':').map(Number);
    const hours24 = period === 'PM' && hours !== 12 ? hours + 12 : period === 'AM' && hours === 12 ? 0 : hours;
    return `${hours24.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  };

  const showTimePickerModal = (mealId: string, currentTime: string) => {
    // Convert 12-hour format to Date object
    const time24 = convertTo24Hour(currentTime);
    const [hours, minutes] = time24.split(':').map(Number);
    const time = new Date();
    time.setHours(hours, minutes, 0, 0);
    
    setShowTimePicker({
      visible: true,
      mealId,
      currentTime: time
    });
  };

  const handleTimeChange = (event: any, selectedTime?: Date) => {
    setShowTimePicker(prev => ({ ...prev, visible: false }));
    
    if (selectedTime) {
      const hours = selectedTime.getHours();
      const minutes = selectedTime.getMinutes();
      const time24 = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
      const time12 = convertTo12Hour(time24);
      updateMealTime(showTimePicker.mealId, time12);
    }
  };

  const updateMealTime = (mealId: string, newTime: string) => {
    setLocalMealTimes(prev => 
      prev.map(meal => 
        meal.id === mealId ? { ...meal, time: newTime } : meal
      )
    );
    setHasChanges(true);
  };

  const toggleMealEnabled = (mealId: string) => {
    const meal = localMealTimes.find(m => m.id === mealId);
    
    // Prevent disabling required meals
    if (meal && !meal.isOptional && meal.enabled) {
      CustomAlertStatic.alert(
        'Required Meal',
        `${meal.name} is required and cannot be disabled. It's essential for proper medication scheduling.`,
        [{ text: 'OK' }]
      );
      return;
    }

    setLocalMealTimes(prev => 
      prev.map(meal => 
        meal.id === mealId ? { ...meal, enabled: !meal.enabled } : meal
      )
    );
    setHasChanges(true);
  };

  const saveMealSettings = async () => {
    if (!hasChanges) return;

    setSavingChanges(true);
    try {
      // Convert times to 24-hour format for API
      const mealTimesData = localMealTimes.reduce((acc, meal) => {
        const time24 = convertTo24Hour(meal.time);
        acc[meal.id] = {
          time: time24,
          enabled: meal.enabled
        };
        return acc;
      }, {} as any);

      await patientAPI.updateMealTimes(mealTimesData);
      dispatch(setMealTimes(localMealTimes));
      
      CustomAlertStatic.alert(
        'Settings Saved',
        'Your meal times have been updated successfully!',
        [{ text: 'OK', onPress: () => {
          setHasChanges(false);
        }}]
      );
    } catch (error: any) {
      dispatch(setError(error.message));
      CustomAlertStatic.alert('Save Failed', error.message || 'Failed to save meal settings');
    } finally {
      setSavingChanges(false);
    }
  };

  const resetToDefaults = () => {
    CustomAlertStatic.alert(
      'Reset to Defaults',
      'Are you sure you want to reset all meal times to default values?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: () => {
            const defaults = [
              { 
                id: 'breakfast', 
                name: 'Breakfast', 
                time: '8:00 AM', 
                enabled: true, 
                icon: 'sunny' as keyof typeof Ionicons.glyphMap,
                isOptional: false,
                description: 'Start your day with morning medications'
              },
              { 
                id: 'lunch', 
                name: 'Lunch', 
                time: '12:30 PM', 
                enabled: true, 
                icon: 'partly-sunny' as keyof typeof Ionicons.glyphMap,
                isOptional: false,
                description: 'Midday meal for afternoon medications'
              },
              { 
                id: 'dinner', 
                name: 'Dinner', 
                time: '7:00 PM', 
                enabled: true, 
                icon: 'moon' as keyof typeof Ionicons.glyphMap,
                isOptional: false,
                description: 'Evening meal for nighttime medications'
              },
              { 
                id: 'snack', 
                name: 'Snack', 
                time: '3:30 PM', 
                enabled: false, 
                icon: 'cafe' as keyof typeof Ionicons.glyphMap,
                isOptional: true,
                description: 'Optional snack time for additional medications'
              },
            ];
            setLocalMealTimes(defaults);
            setHasChanges(true);
          },
        },
      ]
    );
  };

  const handleBackPress = () => {
    if (hasChanges) {
      CustomAlertStatic.alert(
        'Unsaved Changes',
        'You have unsaved changes. What would you like to do?',
        [
          { text: 'Discard Changes', style: 'destructive', onPress: () => navigation.goBack() },
          { text: 'Save Changes', onPress: saveMealSettings },
          { text: 'Cancel', style: 'cancel' },
        ]
      );
    } else {
      navigation.goBack();
    }
  };

  if (isLoading && localMealTimes.length === 0) {
    return (
      <View style={styles.container}>
        <PatientSecondaryNavbar
          title="Meal Times"
          onBackPress={() => navigation.goBack()}
          onSOSPress={() => navigation.navigate('SOS')}
        />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.primary} />
          <Text style={styles.loadingText}>Loading meal settings...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <PatientSecondaryNavbar
        title="Meal Times"
        subtitle="Configure your daily meal schedule"
        onBackPress={handleBackPress}
        onSOSPress={() => navigation.navigate('SOS')}
      />

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <LinearGradient colors={theme.gradient} style={styles.headerSection}>
          <View style={styles.headerContent}>
            <View style={[styles.headerIcon, { backgroundColor: '#FFFFFF', shadowColor: theme.primary }]}>
              <Ionicons name="restaurant" size={32} color={theme.primary} />
            </View>
            <Text style={styles.headerTitle}>Meal Time Settings</Text>
            <Text style={styles.headerSubtitle}>
              Set your meal times to help schedule medication reminders accurately
            </Text>
            <View style={styles.connectionIndicator}>
              <View style={[styles.connectionDot, { backgroundColor: isConnected ? '#059669' : '#EF4444' }]} />
              <Text style={styles.connectionText}>
                {isConnected ? 'Settings will sync automatically' : 'Changes saved locally - will sync when online'}
              </Text>
            </View>
          </View>
        </LinearGradient>

        {/* Quick Stats */}
        <View style={styles.statsSection}>
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Text style={[styles.statNumber, { color: theme.primary }]}>
                {localMealTimes.filter(m => m.enabled && !m.isOptional).length}
              </Text>
              <Text style={styles.statLabel}>Required Meals</Text>
              <View style={[styles.statIndicator, { backgroundColor: theme.primary }]} />
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statNumber, { color: '#059669' }]}>
                {localMealTimes.filter(m => m.enabled && m.isOptional).length}
              </Text>
              <Text style={styles.statLabel}>Optional Meals</Text>
              <View style={[styles.statIndicator, { backgroundColor: '#059669' }]} />
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statNumber, { color: '#F59E0B' }]}>
                {localMealTimes.filter(m => m.enabled).length}
              </Text>
              <Text style={styles.statLabel}>Total Active</Text>
              <View style={[styles.statIndicator, { backgroundColor: '#F59E0B' }]} />
            </View>
          </View>
        </View>

        {/* Meal Times */}
        <View style={styles.mealTimesSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Your Meal Schedule</Text>
            <TouchableOpacity style={styles.resetButton} onPress={resetToDefaults}>
              <Ionicons name="refresh" size={16} color={theme.primary} />
              <Text style={[styles.resetButtonText, { color: theme.primary }]}>Reset</Text>
            </TouchableOpacity>
          </View>

          {localMealTimes.map((meal, index) => (
            <View key={meal.id} style={[
              styles.mealCard, 
              !meal.enabled && styles.mealCardDisabled,
              index === localMealTimes.length - 1 && styles.mealCardLast
            ]}>
              <LinearGradient
                colors={meal.enabled ? ['#FFFFFF', '#F8FAFC'] : ['#F8FAFC', '#F1F5F9']}
                style={styles.mealCardGradient}
              >
                <View style={styles.mealHeader}>
                  <View style={[
                    styles.mealIconContainer,
                    { backgroundColor: meal.enabled ? theme.primaryLight : '#F1F5F9' }
                  ]}>
                    <Ionicons 
                      name={meal.icon} 
                      size={24} 
                      color={meal.enabled ? theme.primary : '#9CA3AF'} 
                    />
                  </View>
                  <View style={styles.mealInfo}>
                    <View style={styles.mealNameRow}>
                      <Text style={[
                        styles.mealName, 
                        !meal.enabled && styles.mealNameDisabled
                      ]}>
                        {meal.name}
                      </Text>
                      {!meal.isOptional && (
                        <View style={styles.requiredBadge}>
                          <Text style={styles.requiredText}>Required</Text>
                        </View>
                      )}
                    </View>
                    <Text style={[
                      styles.mealDescription,
                      !meal.enabled && styles.mealDescriptionDisabled
                    ]}>
                      {meal.description}
                    </Text>
                  </View>
                  {meal.isOptional && (
                    <Switch
                      value={meal.enabled}
                      onValueChange={() => toggleMealEnabled(meal.id)}
                      trackColor={{ false: '#E2E8F0', true: theme.primaryLight }}
                      thumbColor={meal.enabled ? theme.primary : '#94A3B8'}
                      ios_backgroundColor="#E2E8F0"
                    />
                  )}
                </View>

                {meal.enabled && (
                  <TouchableOpacity
                    style={styles.timeSelector}
                    onPress={() => showTimePickerModal(meal.id, meal.time)}
                    activeOpacity={0.7}
                  >
                    <View style={styles.timeDisplay}>
                      <View style={[styles.timeIcon, { backgroundColor: theme.primaryLight }]}>
                        <Ionicons name="time-outline" size={16} color={theme.primary} />
                      </View>
                      <Text style={styles.timeText}>{meal.time}</Text>
                    </View>
                    <View style={styles.timeActions}>
                      <Text style={styles.changeTimeText}>Change Time</Text>
                      <Ionicons name="chevron-forward" size={16} color={theme.primary} />
                    </View>
                  </TouchableOpacity>
                )}
              </LinearGradient>
            </View>
          ))}
        </View>

        {/* Information Section */}
        <View style={styles.infoSection}>
          <View style={styles.infoCard}>
            <View style={styles.infoHeader}>
              <Ionicons name="information-circle" size={20} color={theme.primary} />
              <Text style={styles.infoTitle}>Why Meal Times Matter</Text>
            </View>
            <Text style={styles.infoText}>
              Setting accurate meal times helps us schedule your medication reminders properly. 
              Some medications need to be taken with food, while others should be taken on an empty stomach.
            </Text>
          </View>
        </View>

        {/* Save Button */}
        {hasChanges && (
          <View style={styles.saveSection}>
            <TouchableOpacity
              style={[styles.saveButton, { backgroundColor: theme.primary }, savingChanges && styles.saveButtonDisabled]}
              onPress={saveMealSettings}
              disabled={savingChanges}
            >
              {savingChanges ? (
                <ActivityIndicator size={18} color="#FFFFFF" />
              ) : (
                <Ionicons name="checkmark" size={18} color="#FFFFFF" />
              )}
              <Text style={styles.saveButtonText}>
                {savingChanges ? "Saving..." : "Save Meal Settings"}
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      {/* Time Picker */}
      {showTimePicker.visible && (
        <DateTimePicker
          value={showTimePicker.currentTime}
          mode="time"
          is24Hour={false}
          onChange={handleTimeChange}
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
        />
      )}
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: Platform.OS === 'ios' ? 114 : 70,
  },
  loadingText: {
    marginTop: 16,
    color: '#64748B',
    fontSize: TYPOGRAPHY.fontSize.md,
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
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING[4],
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
    marginBottom: SPACING[4],
  },
  connectionIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    paddingHorizontal: SPACING[3],
    paddingVertical: SPACING[2],
    borderRadius: RADIUS.full,
  },
  connectionDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: SPACING[2],
  },
  connectionText: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: '#64748B',
    fontWeight: '500',
  },
  statsSection: {
    paddingHorizontal: SPACING[5],
    paddingBottom: SPACING[5],
  },
  statsGrid: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: RADIUS.lg,
    padding: SPACING[4],
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: SPACING[4],
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    position: 'relative',
  },
  statNumber: {
    fontSize: TYPOGRAPHY.fontSize['2xl'],
    fontWeight: '700',
    marginBottom: SPACING[1],
  },
  statLabel: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: '#64748B',
    textAlign: 'center',
    fontWeight: '500',
  },
  statIndicator: {
    width: 20,
    height: 2,
    borderRadius: 1,
    marginTop: SPACING[2],
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
    backgroundColor: '#FFFFFF',
    borderRadius: RADIUS.md,
    gap: SPACING[1],
    borderWidth: 1,
    borderColor: '#2563EB',
  },
  resetButtonText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: '500',
  },
  mealCard: {
    marginBottom: SPACING[4],
    borderRadius: RADIUS.xl,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  mealCardDisabled: {
    opacity: 0.7,
  },
  mealCardLast: {
    marginBottom: 0,
  },
  mealCardGradient: {
    padding: SPACING[5],
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
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING[4],
  },
  mealInfo: {
    flex: 1,
  },
  mealNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING[1],
  },
  mealName: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: '600',
    color: '#1E293B',
    marginRight: SPACING[2],
  },
  mealNameDisabled: {
    color: '#9CA3AF',
  },
  requiredBadge: {
    backgroundColor: '#DBEAFE',
    paddingHorizontal: SPACING[2],
    paddingVertical: 2,
    borderRadius: RADIUS.sm,
  },
  requiredText: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: '#2563EB',
    fontWeight: '600',
  },
  mealDescription: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: '#64748B',
    lineHeight: 18,
  },
  mealDescriptionDisabled: {
    color: '#9CA3AF',
  },
  timeSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(37, 99, 235, 0.05)',
    borderRadius: RADIUS.lg,
    padding: SPACING[4],
    borderWidth: 1,
    borderColor: '#DBEAFE',
  },
  timeDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING[3],
  },
  timeIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  timeText: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: '600',
    color: '#1E293B',
  },
  timeActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING[2],
  },
  changeTimeText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: '#2563EB',
    fontWeight: '500',
  },
  infoSection: {
    paddingHorizontal: SPACING[5],
    paddingBottom: SPACING[6],
  },
  infoCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: RADIUS.lg,
    padding: SPACING[4],
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  infoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING[3],
    gap: SPACING[2],
  },
  infoTitle: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: '600',
    color: '#1E293B',
  },
  infoText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: '#64748B',
    lineHeight: 20,
  },
  saveSection: {
    paddingHorizontal: SPACING[5],
    paddingTop: SPACING[4],
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING[4],
    borderRadius: RADIUS.lg,
    gap: SPACING[2],
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});

export default MealSettingsScreen;