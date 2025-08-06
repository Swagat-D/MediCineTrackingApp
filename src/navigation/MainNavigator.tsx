import React, { useEffect } from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { useAppDispatch, useAppSelector } from '../store';
import { checkAuthStatus } from '../store/slices/authSlice';

// Navigators
import AuthNavigator from './AuthNavigator';
import CaregiverNavigator from './CaregiverNavigator';
import PatientNavigator from './PatientNavigator';
import SplashScreen from '../screens/auth/SplashScreen';
import { RootStackParamList } from '../types/navigation.types';

const Stack = createStackNavigator<RootStackParamList>();

const MainNavigator: React.FC = () => {
  const dispatch = useAppDispatch();
  const { isAuthenticated, user, isLoading } = useAppSelector((state) => state.auth);

  useEffect(() => {
    // Check if user is already logged in on app start
    dispatch(checkAuthStatus());
  }, [dispatch]);

  if (isLoading) {
    return <SplashScreen />;
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {isAuthenticated && user ? (
        // User is authenticated - show role-based navigation
        user.role === 'caregiver' ? (
          <Stack.Screen 
            name="CaregiverStack" 
            component={CaregiverNavigator} 
          />
        ) : (
          <Stack.Screen 
            name="PatientStack" 
            component={PatientNavigator} 
          />
        )
      ) : (
        // User is not authenticated - show auth navigation
        <Stack.Screen 
          name="Auth" 
          component={AuthNavigator} 
        />
      )}
    </Stack.Navigator>
  );
};

export default MainNavigator;