import { Box } from '@mui/material';
import { AlertColor } from '@mui/material/Alert';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import * as React from 'react';

import { NotificationSnackBar } from '@/src/components/NotificationSnackBar';
import { BackendClient } from '@/src/types/backend-contracts';

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
  // Snack bar end

  const [open, setOpen] = React.useState(false);
  const [selected, setSelected] = React.useState<BackendClient | undefined>(
    undefined,
  );

  function setError(message: string) {
    setSnackBarMessage(message);
    setSnackBarLevel('error');
    setSnackBarOpen(true);
  }

  const handleClose = async () => {
    setOpen(false);
    setSelected(undefined);
  };

  const handleEditClient = (client: BackendClient) => {
    setSelected(client);
    setOpen(true);
  };

  const handleCreateClient = () => {
    setSelected(undefined);
    setOpen(true);
  };

  return (
    <Box>
      <NotificationSnackBar
        open={snackBarOpen}
        message={snackBarMessage}
        level={snackBarLevel}
        setOpen={setSnackBarOpen}
      />
      <QueryClientProvider client={queryClient}>
        <ClientsTable
          handleEditClient={handleEditClient}
          handleCreateClient={handleCreateClient}
          setError={setError}
        />
        <ClientDetailsModal
          selectedClient={selected}
          isOpen={open}
          onClose={handleClose}
        />
      </QueryClientProvider>
    </Box>
  );
}
