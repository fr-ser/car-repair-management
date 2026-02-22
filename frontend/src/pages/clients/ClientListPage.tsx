import { Box } from '@mui/material';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import useModalState from '@/src/hooks/useModalState';
import { BackendClient } from '@/src/types/backend-contracts';

import ClientsTable from './components/ClientsTable';
import ClientDetailsModal from './components/modals/ClientDetailsModal';

const queryClient = new QueryClient();

export default function ClientListPage() {
  const { open, selected, handleOpen, handleCreate, handleClose } =
    useModalState<BackendClient>();

  return (
    <Box>
      <QueryClientProvider client={queryClient}>
        <ClientsTable
          handleEditClient={handleOpen}
          handleCreateClient={handleCreate}
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
