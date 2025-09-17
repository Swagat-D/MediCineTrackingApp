import { useCallback, useState } from 'react';
import { AlertButton } from './CustomAlert';

interface AlertConfig {
  title?: string;
  message?: string;
  buttons?: AlertButton[];
  type?: 'info' | 'success' | 'warning' | 'error';
}

interface UseCustomAlertReturn {
  showAlert: (config: AlertConfig) => void;
  hideAlert: () => void;
  alertVisible: boolean;
  alertConfig: AlertConfig;
}

export const useCustomAlert = (): UseCustomAlertReturn => {
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertConfig, setAlertConfig] = useState<AlertConfig>({});

  const showAlert = useCallback((config: AlertConfig) => {
    setAlertConfig(config);
    setAlertVisible(true);
  }, []);

  const hideAlert = useCallback(() => {
    setAlertVisible(false);
    setAlertConfig({});
  }, []);

  return {
    showAlert,
    hideAlert,
    alertVisible,
    alertConfig,
  };
};