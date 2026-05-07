import { Box } from '@mui/material';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { NEW_ENTITY_ID } from '@/src/utils/routes';

import ClientsTable from './components/ClientsTable';
import ClientDetailsModal from './components/modals/ClientDetailsModal';

export default function ClientListPage() {
  const [queryClient] = useState(() => new QueryClient());
  const { id: idParam } = useParams();
  const navigate = useNavigate();

  const modalOpen = !!idParam;
  const selectedId =
    idParam && idParam !== NEW_ENTITY_ID ? Number(idParam) : undefined;

  const handleOpen = (clientId: number) => navigate(`/clients/${clientId}`);
  const handleCreate = () => navigate(`/clients/${NEW_ENTITY_ID}`);
  const handleClose = () => navigate('/clients', { replace: true });

  return (
    <Box>
      <QueryClientProvider client={queryClient}>
        <ClientsTable
          handleEditClient={handleOpen}
          handleCreateClient={handleCreate}
        />
        <ClientDetailsModal
          selectedClientId={selectedId}
          isOpen={modalOpen}
          onClose={handleClose}
        />
      </QueryClientProvider>
    </Box>
  );
}
