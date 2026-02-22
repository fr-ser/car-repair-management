import { Box } from '@mui/material';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import useModalState from '@/src/hooks/useModalState';

import CarDetailsModal from './components/CarDetailsModal';
import CarsTable from './components/CarsTable';

const queryClient = new QueryClient();

export default function CarListPage() {
  const { open, selected, handleOpen, handleCreate, handleClose } =
    useModalState<number>();

  return (
    <Box>
      <QueryClientProvider client={queryClient}>
        <CarsTable handleEditCar={handleOpen} handleCreateCar={handleCreate} />
        <CarDetailsModal
          selectedCarId={selected}
          isOpen={open}
          onClose={handleClose}
        />
      </QueryClientProvider>
    </Box>
  );
}
