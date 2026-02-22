import { DirectionsCar as CarIcon } from '@mui/icons-material';
import Autocomplete from '@mui/material/Autocomplete';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import TextField from '@mui/material/TextField';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';

import useNotification from '@/src/hooks/notification/useNotification';
import useDebounce from '@/src/hooks/useDebounce';
import * as apiService from '@/src/services/backend-service';
import { BackendCar } from '@/src/types/backend-contracts';

type AddCarsModalProps = {
  isOpen: boolean;
  onClose: () => void;
  clientId: number;
};

export default function AddCarsModal({
  isOpen,
  onClose,
  clientId,
}: AddCarsModalProps) {
  const { showNotification } = useNotification();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [selectedCar, setSelectedCar] = useState<BackendCar | null>(null);
  const debouncedSearch = useDebounce(search, 300);

  const { data: carsData, isLoading } = useQuery({
    queryKey: ['cars', { search: debouncedSearch }],
    queryFn: () => apiService.fetchCars(0, 20, debouncedSearch),
    enabled: isOpen,
  });

  const unassignedCars = (carsData?.data ?? []).filter(
    (car) => car.clientId == null,
  );

  const assignMutation = useMutation({
    mutationFn: (car: BackendCar) => apiService.updateCar(car.id, { clientId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['client', clientId] });
      handleClose();
    },
    onError: (error: unknown) => {
      showNotification({
        level: 'error',
        message:
          error instanceof Error ? error.message : 'Ein Fehler ist aufgetreten',
      });
    },
  });

  const handleClose = () => {
    setSearch('');
    setSelectedCar(null);
    onClose();
  };

  return (
    <Dialog open={isOpen} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <CarIcon />
          Fahrzeug hinzufügen
        </Box>
      </DialogTitle>
      <DialogContent>
        <Autocomplete
          sx={{ mt: 2 }}
          options={unassignedCars}
          getOptionLabel={(option) =>
            `${option.licensePlate} – ${option.manufacturer} ${option.model}`
          }
          loading={isLoading}
          value={selectedCar}
          onChange={(_, value) => setSelectedCar(value)}
          inputValue={search}
          onInputChange={(_, value) => setSearch(value)}
          filterOptions={(x) => x}
          renderInput={(params) => (
            <TextField
              {...params}
              label="Fahrzeug suchen"
              placeholder="Kennzeichen, Hersteller oder Modell"
            />
          )}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Abbrechen</Button>
        <Button
          variant="contained"
          onClick={() => selectedCar && assignMutation.mutate(selectedCar)}
          disabled={!selectedCar || assignMutation.isPending}
          startIcon={
            assignMutation.isPending ? (
              <CircularProgress size={18} />
            ) : undefined
          }
        >
          Hinzufügen
        </Button>
      </DialogActions>
    </Dialog>
  );
}
