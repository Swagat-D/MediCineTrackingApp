import 'react-native-url-polyfill/auto';

import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { Provider } from 'react-redux';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { PaperProvider } from 'react-native-paper';
import { registerRootComponent } from 'expo';

import { store } from './src/store';
import MainNavigator from './src/navigation/MainNavigator';
import { COLORS } from './src/constants/themes/theme';

// Paper theme configuration
const paperTheme = {
  colors: {
    primary: COLORS.primary[500],
    secondary: COLORS.secondary[500],
    surface: COLORS.background,
    background: COLORS.background,
    error: COLORS.error,
  },
};

const App: React.FC = () => {
  return (
    <Provider store={store}>
      <SafeAreaProvider>
        <PaperProvider theme={paperTheme}>
          <NavigationContainer>
            <StatusBar style="auto" />
            <MainNavigator />
          </NavigationContainer>
        </PaperProvider>
      </SafeAreaProvider>
    </Provider>
  );
};

export default App;

registerRootComponent(App);