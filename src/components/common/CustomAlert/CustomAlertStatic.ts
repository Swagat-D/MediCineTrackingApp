import { AlertButton } from './CustomAlert';

interface StaticAlertConfig {
  title?: string;
  message?: string;
  buttons?: AlertButton[];
  type?: 'info' | 'success' | 'warning' | 'error';
}

// Global state for the static alert
let globalAlertHandler: ((config: StaticAlertConfig) => void) | null = null;

export const registerGlobalAlertHandler = (handler: (config: StaticAlertConfig) => void) => {
  globalAlertHandler = handler;
};

export const unregisterGlobalAlertHandler = () => {
  globalAlertHandler = null;
};

// Static alert function that mimics React Native's Alert.alert
export const CustomAlertStatic = {
  alert: (
    title?: string,
    message?: string,
    buttons?: AlertButton[],
    options?: { type?: 'info' | 'success' | 'warning' | 'error' }
  ) => {
    if (globalAlertHandler) {
      globalAlertHandler({
        title,
        message,
        buttons: buttons || [{ text: 'OK' }],
        type: options?.type || 'info',
      });
    } else {
      console.warn('CustomAlert: No global alert handler registered. Make sure to wrap your app with CustomAlertProvider.');
    }
  },
};