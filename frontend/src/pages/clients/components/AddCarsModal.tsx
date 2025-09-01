import { DirectionsCar as CarIcon } from '@mui/icons-material';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  TextField,
} from '@mui/material';
import 'dayjs/locale/de';
import { useState } from 'react';

import { Car } from '../../../types/cars';

type AddCarsModalProps = {
  isOpen: boolean; // Controls whether modal is shown
  onClose: () => void; // Close callback
  setCars: React.Dispatch<React.SetStateAction<Car[]>>; // Callback to set cars
};

export function AddCarsModal({ isOpen, onClose, setCars }: AddCarsModalProps) {
  const [newCar, setNewCar] = useState({
    marke: '',
    modell: '',
    kennzeichen: '',
    baujahr: '',
  });
  const handleAddCar = () => {
    if (newCar.marke && newCar.modell && newCar.kennzeichen) {
      const car: Car = {
        id: Date.now().toString(),
        ...newCar,
      };
      setCars((prev: Car[]) => [...prev, car]);
      setNewCar({ marke: '', modell: '', kennzeichen: '', baujahr: '' });
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onClose={() => onClose()} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <CarIcon />
          Fahrzeug hinzufügen
        </Box>
      </DialogTitle>
      <DialogContent>
        <Grid container spacing={3} sx={{ mt: 1 }}>
          <Grid sx={{ xs: 12, sm: 6 }}>
            <TextField
              fullWidth
              label="Marke"
              placeholder="BMW"
              value={newCar.marke}
              onChange={(e) =>
                setNewCar((prev) => ({ ...prev, marke: e.target.value }))
              }
            />
          </Grid>
          <Grid sx={{ xs: 12, sm: 6 }}>
            <TextField
              fullWidth
              label="Modell"
              placeholder="3er"
              value={newCar.modell}
              onChange={(e) =>
                setNewCar((prev) => ({ ...prev, modell: e.target.value }))
              }
            />
          </Grid>
          <Grid sx={{ xs: 12, sm: 6 }}>
            <TextField
              fullWidth
              label="Kennzeichen"
              placeholder="M-AB 123"
              value={newCar.kennzeichen}
              onChange={(e) =>
                setNewCar((prev) => ({
                  ...prev,
                  kennzeichen: e.target.value,
                }))
              }
            />
          </Grid>
          <Grid sx={{ xs: 12, sm: 6 }}>
            <TextField
              fullWidth
              label="Baujahr"
              placeholder="2020"
              value={newCar.baujahr}
              onChange={(e) =>
                setNewCar((prev) => ({ ...prev, baujahr: e.target.value }))
              }
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => onClose()}>Abbrechen</Button>
        <Button
          variant="contained"
          onClick={handleAddCar}
          disabled={!newCar.marke || !newCar.modell || !newCar.kennzeichen}
        >
          Hinzufügen
        </Button>
      </DialogActions>
    </Dialog>
  );
}
