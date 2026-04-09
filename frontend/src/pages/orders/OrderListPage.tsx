import { Box } from '@mui/material';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';

import OrderDetailsModal from './components/OrderDetailsModal';
import OrdersTable from './components/OrdersTable';

const queryClient = new QueryClient();

export default function OrderListPage() {
  const { id: idParam } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialSearch = searchParams.get('search') ?? undefined;
  const clientIdParam = searchParams.get('clientId');
  const clientId = clientIdParam ? Number(clientIdParam) : undefined;
  const carIdParam = searchParams.get('carId');
  const carId = carIdParam ? Number(carIdParam) : undefined;

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

  const handleOpen = (orderId: number) => {
    setSelectedId(orderId);
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
      navigate('/orders', { replace: true });
    }
  };

  return (
    <Box>
      <QueryClientProvider client={queryClient}>
        <OrdersTable
          handleEditOrder={handleOpen}
          handleCreateOrder={handleCreate}
          initialSearch={initialSearch}
          clientId={clientId}
          onClearClientFilter={
            clientId ? () => navigate('/orders', { replace: true }) : undefined
          }
          carId={carId}
          onClearCarFilter={
            carId ? () => navigate('/orders', { replace: true }) : undefined
          }
        />
        <OrderDetailsModal
          selectedOrderId={selectedId}
          isOpen={modalOpen}
          onClose={handleClose}
        />
      </QueryClientProvider>
    </Box>
  );
}
