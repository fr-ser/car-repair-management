import { Box } from '@mui/material';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import CarDetailsModal from './components/CarDetailsModal';
import CarsTable from './components/CarsTable';

const queryClient = new QueryClient();

export default function CarListPage() {
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

  const handleOpen = (carId: number) => {
    setSelectedId(carId);
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
      navigate('/cars', { replace: true });
    }
  };

  return (
    <Box>
      <QueryClientProvider client={queryClient}>
        <CarsTable handleEditCar={handleOpen} handleCreateCar={handleCreate} />
        <CarDetailsModal
          selectedCarId={selectedId}
          isOpen={modalOpen}
          onClose={handleClose}
        />
      </QueryClientProvider>
    </Box>
  );
}
