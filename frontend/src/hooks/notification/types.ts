import { AlertColor } from '@mui/material/Alert';

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
