import { Box, Snackbar, SnackbarCloseReason } from '@mui/material';
import Alert, { AlertColor } from '@mui/material/Alert';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import * as React from 'react';

import { BEClient } from '@/src/types/be-contracts';

import { ClientsTable } from './components/ClientsTable';
import { ClientDetailsModal } from './components/modals/ClientDetailsModal';

const queryClient = new QueryClient();

export function ClientListPage() {
  // Snack bar state
  const [snackBarOpen, setSnackBarOpen] = React.useState(false);
  const [snackBarMessage, setSnackBarMessage] = React.useState('');
  const [snackBarLevel, setSnackBarLevel] = React.useState<
    AlertColor | undefined
  >(undefined);
  const handleSnackBarClose = (
    _?: React.SyntheticEvent | Event,
    reason?: SnackbarCloseReason,
  ) => {
    if (reason === 'clickaway') {
      return;
    }

    setSnackBarOpen(false);
  };
  // Snack bar end

  const [open, setOpen] = React.useState(false);
  const [selected, setSelected] = React.useState<BEClient | null>(null);

  function setError(message: string) {
    setSnackBarMessage(message);
    setSnackBarLevel('error');
    setSnackBarOpen(true);
  }

  const handleClose = async () => {
    setOpen(false);
    setSelected(null);
    // await fetchData();
  };

  return (
    <>
      <Box>
        <Snackbar
          open={snackBarOpen}
          autoHideDuration={6000}
          onClose={handleSnackBarClose}
          anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        >
          <Alert
            onClose={handleSnackBarClose}
            severity={snackBarLevel}
            variant="filled"
            sx={{ width: '100%' }}
          >
            {snackBarMessage}
          </Alert>
        </Snackbar>
        <QueryClientProvider client={queryClient}>
          <ClientsTable
            setOpenClientModal={setOpen}
            setSelectedClient={setSelected}
            setError={setError}
          />
          <ClientDetailsModal
            selectedClient={selected ?? undefined}
            isOpen={open}
            onClose={handleClose}
            setSnackBarOpen={setSnackBarOpen}
            setSnackBarMessage={setSnackBarMessage}
            setSnackBarLevel={setSnackBarLevel}
          />
        </QueryClientProvider>
      </Box>
    </>
  );
}
