import { Box } from '@mui/material';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';

import { NEW_ENTITY_ID } from '@/src/utils/routes';

import OrderDetailsModal from './components/OrderDetailsModal';
import OrdersTable from './components/OrdersTable';

export default function OrderListPage() {
  const [queryClient] = useState(() => new QueryClient());
  const { id: idParam } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialSearch = searchParams.get('search') ?? undefined;
  const clientIdParam = searchParams.get('clientId');
  const clientId = clientIdParam ? Number(clientIdParam) : undefined;
  const carIdParam = searchParams.get('carId');
  const carId = carIdParam ? Number(carIdParam) : undefined;

  const modalOpen = !!idParam;
  const selectedId =
    idParam && idParam !== NEW_ENTITY_ID ? Number(idParam) : undefined;

  const handleOpen = (orderId: number) => navigate(`/orders/${orderId}`);
  const handleCreate = () => navigate(`/orders/${NEW_ENTITY_ID}`);
  const handleClose = () => navigate('/orders', { replace: true });

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
