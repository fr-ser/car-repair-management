import { Box } from '@mui/material';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import ClientsTable from './components/ClientsTable';
import ClientDetailsModal from './components/modals/ClientDetailsModal';

const queryClient = new QueryClient();

export default function ClientListPage() {
  const { id: idParam } = useParams();
  const navigate = useNavigate();

  const [modalOpen, setModalOpen] = React.useState(false);
  const [selectedId, setSelectedId] = React.useState<number | undefined>(
    undefined,
  );

  React.useEffect(() => {
    if (idParam) {
      setSelectedId(Number(idParam));
      setModalOpen(true);
    } else {
      setModalOpen(false);
      setSelectedId(undefined);
    }
  }, [idParam]);

  const handleOpen = (clientId: number) => {
    setSelectedId(clientId);
    setModalOpen(true);
  };

  const handleCreate = () => {
    setSelectedId(undefined);
    setModalOpen(true);
  };

  const handleClose = () => {
    setModalOpen(false);
    setSelectedId(undefined);
    if (idParam) {
      navigate('/clients', { replace: true });
    }
  };

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
