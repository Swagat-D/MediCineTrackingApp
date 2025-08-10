import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  Platform,
  ActivityIndicator,
  StyleSheet,
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

interface Props {
  navigation: any;
}

interface MealTime {
  id: string;
  name: string;
  time: string;
  enabled: boolean;
  icon: keyof typeof Ionicons.glyphMap;
}

const MealSettingsScreen: React.FC<Props> = ({ navigation }) => {
  const dispatch = useAppDispatch();
  const { isLoading, isConnected } = useAppSelector(state => state.patient);
  
  const [localMealTimes, setLocalMealTimes] = useState<MealTime[]>([]);
  const [hasChanges, setHasChanges] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState<{
    visible: boolean;
    mealId: string;
    currentTime: Date;
  }>({ visible: false, mealId: '', currentTime: new Date() });

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
      dispatch(setMealTimes(data));
      setLocalMealTimes(data.map(meal => ({
        ...meal,
        icon: getIconForMeal(meal.id),
      })));
      dispatch(setConnectionStatus(true));
    } catch (error: any) {
      dispatch(setError(error.message));
      dispatch(setConnectionStatus(false));
      // Set default meal times
      const defaultMeals = [
        { id: 'breakfast', name: 'Breakfast', time: '08:00', enabled: true, icon: 'sunny' as keyof typeof Ionicons.glyphMap },
        { id: 'lunch', name: 'Lunch', time: '12:30', enabled: true, icon: 'partly-sunny' as keyof typeof Ionicons.glyphMap },
        { id: 'dinner', name: 'Dinner', time: '19:00', enabled: true, icon: 'moon' as keyof typeof Ionicons.glyphMap },
        { id: 'snack', name: 'Snack', time: '15:30', enabled: false, icon: 'cafe' as keyof typeof Ionicons.glyphMap },
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

  const showTimePickerModal = (mealId: string, currentTime: string) => {
    const [hours, minutes] = currentTime.split(':').map(Number);
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
      const timeString = selectedTime.toTimeString().slice(0, 5);
      updateMealTime(showTimePicker.mealId, timeString);
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
    setLocalMealTimes(prev => 
      prev.map(meal => 
        meal.id === mealId ? { ...meal, enabled: !meal.enabled } : meal
      )
    );
    setHasChanges(true);
  };

  const saveMealSettings = async () => {
    if (!hasChanges) return;

    dispatch(setLoading(true));
    try {
      const mealTimesData = localMealTimes.reduce((acc, meal) => {
        acc[meal.id] = {
          time: meal.time,
          enabled: meal.enabled
        };
        return acc;
      }, {} as any);

      await patientAPI.updateMealTimes(mealTimesData);
      dispatch(setMealTimes(localMealTimes));
      
      Alert.alert(
        'Settings Saved',
        'Your meal times have been updated successfully!',
        [{ text: 'OK', onPress: () => {
          setHasChanges(false);
          navigation.goBack();
        }}]
      );
    } catch (error: any) {
      dispatch(setError(error.message));
      Alert.alert('Save Failed', error.message);
    } finally {
      dispatch(setLoading(false));
    }
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
            const defaults = [
              { id: 'breakfast', name: 'Breakfast', time: '08:00', enabled: true, icon: 'sunny' as keyof typeof Ionicons.glyphMap },
              { id: 'lunch', name: 'Lunch', time: '12:30', enabled: true, icon: 'partly-sunny' as keyof typeof Ionicons.glyphMap },
              { id: 'dinner', name: 'Dinner', time: '19:00', enabled: true, icon: 'moon' as keyof typeof Ionicons.glyphMap },
              { id: 'snack', name: 'Snack', time: '15:30', enabled: false, icon: 'cafe' as keyof typeof Ionicons.glyphMap },
            ];
            setLocalMealTimes(defaults);
            setHasChanges(true);
          },
        },
      ]
    );
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
          <ActivityIndicator size="large" color="#2563EB" />
          <Text style={styles.loadingText}>Loading meal settings...</Text>
        </View>
      </View>
    );
  }

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

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Connection Status */}
        <View style={styles.connectionStatus}>
          <View style={[styles.connectionDot, { backgroundColor: isConnected ? '#059669' : '#EF4444' }]} />
          <Text style={styles.connectionText}>
            {isConnected ? 'Settings will sync automatically' : 'Changes saved locally - will sync when online'}
          </Text>
        </View>

        {/* Header */}
        <LinearGradient colors={['#EBF4FF', '#FFFFFF']} style={styles.headerSection}>
          <View style={styles.headerIcon}>
            <Ionicons name="restaurant" size={32} color="#2563EB" />
          </View>
          <Text style={styles.headerTitle}>Meal Time Settings</Text>
          <Text style={styles.headerSubtitle}>
            Set your meal times to help schedule medication reminders accurately
          </Text>
        </LinearGradient>

        {/* Meal Times */}
        <View style={styles.mealTimesSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Your Meal Schedule</Text>
            <TouchableOpacity style={styles.resetButton} onPress={resetToDefaults}>
              <Ionicons name="refresh" size={16} color="#64748B" />
              <Text style={styles.resetButtonText}>Reset</Text>
            </TouchableOpacity>
          </View>

          {localMealTimes.map((meal) => (
            <View key={meal.id} style={[styles.mealCard, !meal.enabled && styles.mealCardDisabled]}>
              <View style={styles.mealHeader}>
                <View style={styles.mealIconContainer}>
                  <Ionicons name={meal.icon} size={24} color={meal.enabled ? '#2563EB' : '#9CA3AF'} />
                </View>
                <View style={styles.mealInfo}>
                  <Text style={[styles.mealName, !meal.enabled && styles.mealNameDisabled]}>
                    {meal.name}
                  </Text>
                </View>
                <TouchableOpacity
                  style={[styles.enableToggle, meal.enabled && styles.enableToggleActive]}
                  onPress={() => toggleMealEnabled(meal.id)}
                >
                  <Ionicons name={meal.enabled ? "checkmark" : "close"} size={16} color={meal.enabled ? "#FFFFFF" : "#9CA3AF"} />
                </TouchableOpacity>
              </View>

              {meal.enabled && (
                <TouchableOpacity
                  style={styles.timeSelector}
                  onPress={() => showTimePickerModal(meal.id, meal.time)}
                >
                  <View style={styles.timeDisplay}>
                    <Ionicons name="time-outline" size={20} color="#2563EB" />
                    <Text style={styles.timeText}>{meal.time}</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={16} color="#9CA3AF" />
                </TouchableOpacity>
              )}
            </View>
          ))}
        </View>

        {/* Save Button */}
        {hasChanges && (
          <View style={styles.saveSection}>
            <TouchableOpacity
              style={[styles.saveButton, isLoading && styles.saveButtonDisabled]}
              onPress={saveMealSettings}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator size={18} color="#FFFFFF" />
              ) : (
                <Ionicons name="checkmark" size={18} color="#FFFFFF" />
              )}
              <Text style={styles.saveButtonText}>
                {isLoading ? "Saving..." : "Save Meal Settings"}
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
          is24Hour={true}
          onChange={handleTimeChange}
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
  },
  connectionStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    paddingHorizontal: SPACING[5],
    paddingVertical: 6,
    backgroundColor: '#F1F5F9',
    marginHorizontal: SPACING[5],
    borderRadius: 12,
    marginTop: SPACING[4],
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
    flex: 1,
  },
  headerSection: {
    paddingHorizontal: SPACING[5],
    paddingVertical: SPACING[6],
    alignItems: 'center',
    marginHorizontal: SPACING[5],
    borderRadius: RADIUS.lg,
    marginBottom: SPACING[6],
  },
  headerIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING[4],
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
  mealCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: RADIUS.lg,
    padding: SPACING[4],
    marginBottom: SPACING[4],
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  mealCardDisabled: {
   backgroundColor: '#F8FAFC',
   opacity: 0.7,
 },
 mealHeader: {
   flexDirection: 'row',
   alignItems: 'center',
   marginBottom: SPACING[3],
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
 },
 mealNameDisabled: {
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
 timeSelector: {
   flexDirection: 'row',
   alignItems: 'center',
   justifyContent: 'space-between',
   backgroundColor: '#F8FAFC',
   borderRadius: RADIUS.lg,
   padding: SPACING[4],
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
 saveSection: {
   paddingHorizontal: SPACING[5],
   paddingTop: SPACING[4],
 },
 saveButton: {
   flexDirection: 'row',
   alignItems: 'center',
   justifyContent: 'center',
   backgroundColor: '#2563EB',
   paddingVertical: SPACING[4],
   borderRadius: RADIUS.lg,
   gap: SPACING[2],
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