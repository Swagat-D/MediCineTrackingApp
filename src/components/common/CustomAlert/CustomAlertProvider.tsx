import React, { useEffect } from 'react';
import CustomAlert from './CustomAlert';
import { registerGlobalAlertHandler, unregisterGlobalAlertHandler } from './CustomAlertStatic';
import { useCustomAlert } from './useCustomAlert';

interface CustomAlertProviderProps {
  children: React.ReactNode;
}

export const CustomAlertProvider: React.FC<CustomAlertProviderProps> = ({ children }) => {
  const { showAlert, hideAlert, alertVisible, alertConfig } = useCustomAlert();

  useEffect(() => {
    registerGlobalAlertHandler(showAlert);
    return () => {
      unregisterGlobalAlertHandler();
    };
  }, [showAlert]);

  return (
    <>
      {children}
      <CustomAlert
        visible={alertVisible}
        title={alertConfig.title}
        message={alertConfig.message}
        buttons={alertConfig.buttons}
        onClose={hideAlert}
        type={alertConfig.type}
      />
    </>
  );
};