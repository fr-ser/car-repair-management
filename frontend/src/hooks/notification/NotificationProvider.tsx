import { Snackbar, SnackbarCloseReason } from '@mui/material';
import Alert from '@mui/material/Alert';
import React, { ReactNode, createContext, useCallback, useState } from 'react';

import {
  DEFAULT_NOTIFICATION_OPTIONS,
  NotificationContextType,
  NotificationOptions,
} from './types';

export const NotificationContext = createContext<
  NotificationContextType | undefined
>(undefined);

interface NotificationProviderProps {
  children: ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({
  children,
}) => {
  const [open, setOpen] = useState(false);
  const [options, setOptions] = useState<NotificationOptions>({
    message: '',
    ...DEFAULT_NOTIFICATION_OPTIONS,
  });

  const showNotification = useCallback(
    (notificationOptions: NotificationOptions): void => {
      setOptions({
        ...DEFAULT_NOTIFICATION_OPTIONS,
        ...notificationOptions,
      });
      setOpen(true);
    },
    [],
  );

  const handleClose = useCallback(
    (_?: React.SyntheticEvent | Event, reason?: SnackbarCloseReason) => {
      if (reason === 'clickaway') {
        return;
      }
      setOpen(false);
    },
    [],
  );

  return (
    <NotificationContext.Provider value={{ showNotification }}>
      {children}
      <Snackbar
        open={open}
        autoHideDuration={options.autoHideDuration}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert onClose={handleClose} severity={options.level} variant="filled">
          {options.message}
        </Alert>
      </Snackbar>
    </NotificationContext.Provider>
  );
};
