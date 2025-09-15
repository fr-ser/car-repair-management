import { Box } from '@mui/material';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import * as React from 'react';

import { CarDetailsModal } from './components/CarDetailsModal';
import { CarsTable } from './components/CarsTable';

const queryClient = new QueryClient();

export function CarListPage() {
  const [open, setOpen] = React.useState(false);
  const [selected, setSelected] = React.useState<number | undefined>(undefined);

  const handleClose = async () => {
    setOpen(false);
    setSelected(undefined);
  };

  const handleEditCar = (carId: number) => {
    setSelected(carId);
    setOpen(true);
  };

  const handleCreateCar = () => {
    setSelected(undefined);
    setOpen(true);
  };

  return (
    <Box>
      <QueryClientProvider client={queryClient}>
        <CarsTable
          handleEditCar={handleEditCar}
          handleCreateCar={handleCreateCar}
        />
        <CarDetailsModal
          selectedCarId={selected}
          isOpen={open}
          onClose={handleClose}
        />
      </QueryClientProvider>
    </Box>
  );
}
