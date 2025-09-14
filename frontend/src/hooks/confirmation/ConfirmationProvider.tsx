import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from '@mui/material';
import React, { ReactNode, createContext, useCallback, useState } from 'react';

import {
  ConfirmationContextType,
  ConfirmationOptions,
  DEFAULT_OPTIONS,
} from './types';

export const ConfirmationContext = createContext<
  ConfirmationContextType | undefined
>(undefined);

interface ConfirmationProviderProps {
  children: ReactNode;
}

export const ConfirmationProvider: React.FC<ConfirmationProviderProps> = ({
  children,
}) => {
  const [promise, setPromise] = useState<{
    resolve: (value: boolean) => void;
  } | null>(null);
  const [open, setOpen] = useState(false);
  const [options, setOptions] = useState<ConfirmationOptions>(DEFAULT_OPTIONS);

  const confirm = useCallback(
    (confirmOptions: ConfirmationOptions): Promise<boolean> => {
      setOptions({
        ...DEFAULT_OPTIONS,
        ...confirmOptions,
      });
      setOpen(true);

      return new Promise((resolve) => {
        setPromise({ resolve });
      });
    },
    [],
  );

  const handleClose = useCallback(() => {
    setOpen(false);
    if (!promise) return; // Edge case - i.e. double clicking buttons

    promise.resolve(false);
    setPromise(null);
  }, [promise]);

  const handleConfirm = useCallback(() => {
    setOpen(false);
    if (!promise) return; // Edge case - i.e. double clicking buttons

    promise.resolve(true);
    setPromise(null);
  }, [promise]);

  return (
    <ConfirmationContext.Provider value={{ confirm }}>
      {children}
      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>{options.title}</DialogTitle>
        <DialogContent>
          <DialogContentText>{options.message}</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>{options.cancelText}</Button>
          <Button
            onClick={handleConfirm}
            variant="contained"
            autoFocus
            data-testid="confirm-dialog-button-confirm"
          >
            {options.confirmText}
          </Button>
        </DialogActions>
      </Dialog>
    </ConfirmationContext.Provider>
  );
};
