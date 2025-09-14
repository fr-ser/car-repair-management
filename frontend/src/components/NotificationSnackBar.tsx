import { Snackbar, SnackbarCloseReason } from '@mui/material';
import Alert, { AlertColor } from '@mui/material/Alert';
import * as React from 'react';

type NotificationSnackBarProps = {
  open: boolean;
  message: string;
  level: AlertColor | undefined;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  onClose?: (
    event?: React.SyntheticEvent | Event,
    reason?: SnackbarCloseReason,
  ) => void;
};

export function NotificationSnackBar({
  open,
  message,
  level,
  setOpen,
  onClose,
}: NotificationSnackBarProps) {
  // Snack bar state
  const handleSnackBarClose = (
    _?: React.SyntheticEvent | Event,
    reason?: SnackbarCloseReason,
  ) => {
    if (onClose != undefined) {
      onClose(_, reason);
      return;
    }
    if (reason === 'clickaway') {
      return;
    }

    setOpen(false);
  };

  return (
    <>
      <Snackbar
        open={open}
        autoHideDuration={6000}
        onClose={handleSnackBarClose}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert
          onClose={handleSnackBarClose}
          severity={level}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {message}
        </Alert>
      </Snackbar>
    </>
  );
}
