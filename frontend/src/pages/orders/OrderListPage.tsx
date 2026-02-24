import { Box } from '@mui/material';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import useModalState from '@/src/hooks/useModalState';

import OrderDetailsModal from './components/OrderDetailsModal';
import OrdersTable from './components/OrdersTable';

const queryClient = new QueryClient();

export default function OrderListPage() {
  const { open, selected, handleOpen, handleCreate, handleClose } =
    useModalState<number>();

  return (
    <Box>
      <QueryClientProvider client={queryClient}>
        <OrdersTable
          handleEditOrder={handleOpen}
          handleCreateOrder={handleCreate}
        />
        <OrderDetailsModal
          selectedOrderId={selected}
          isOpen={open}
          onClose={handleClose}
        />
      </QueryClientProvider>
    </Box>
  );
}
