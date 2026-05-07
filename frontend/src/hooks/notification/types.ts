import { AlertColor } from '@mui/material/Alert';
import { createContext } from 'react';

export interface NotificationOptions {
  message: string;
  level?: AlertColor;
  autoHideDuration?: number;
}

export interface NotificationContextType {
  showNotification: (options: NotificationOptions) => void;
}

export const DEFAULT_NOTIFICATION_OPTIONS = {
  level: 'info' as AlertColor,
  autoHideDuration: 6000,
};

export const NotificationContext = createContext<
  NotificationContextType | undefined
>(undefined);
