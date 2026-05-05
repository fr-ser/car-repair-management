import { Box } from '@mui/material';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useNavigate, useParams } from 'react-router-dom';

import { NEW_ENTITY_ID } from '@/src/utils/routes';

import CarDetailsModal from './components/CarDetailsModal';
import CarsTable from './components/CarsTable';

const queryClient = new QueryClient();

export default function CarListPage() {
  const { id: idParam } = useParams();
  const navigate = useNavigate();

  const modalOpen = !!idParam;
  const selectedId =
    idParam && idParam !== NEW_ENTITY_ID ? Number(idParam) : undefined;

  const handleOpen = (carId: number) => navigate(`/cars/${carId}`);
  const handleCreate = () => navigate(`/cars/${NEW_ENTITY_ID}`);
  const handleClose = () => navigate('/cars', { replace: true });

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
