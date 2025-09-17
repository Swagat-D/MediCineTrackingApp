import 'react-native-url-polyfill/auto';

import { NavigationContainer } from '@react-navigation/native';
import { registerRootComponent } from 'expo';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { PaperProvider } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Provider } from 'react-redux';

import { CustomAlertProvider } from './src/components/common/CustomAlert';
import { COLORS } from './src/constants/themes/theme';
import MainNavigator from './src/navigation/MainNavigator';
import { store } from './src/store';

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
          <CustomAlertProvider>
            <NavigationContainer>
              <StatusBar style="auto" />
              <MainNavigator />
            </NavigationContainer>
          </CustomAlertProvider>
        </PaperProvider>
      </SafeAreaProvider>
    </Provider>
  );
};

export default App;

registerRootComponent(App);