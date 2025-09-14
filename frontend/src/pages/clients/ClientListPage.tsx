import { Box } from '@mui/material';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import * as React from 'react';

import { BackendClient } from '@/src/types/backend-contracts';

import { ClientsTable } from './components/ClientsTable';
import { ClientDetailsModal } from './components/modals/ClientDetailsModal';

const queryClient = new QueryClient();

export function ClientListPage() {
  const [open, setOpen] = React.useState(false);
  const [selected, setSelected] = React.useState<BackendClient | undefined>(
    undefined,
  );

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
      <QueryClientProvider client={queryClient}>
        <ClientsTable
          handleEditClient={handleEditClient}
          handleCreateClient={handleCreateClient}
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
