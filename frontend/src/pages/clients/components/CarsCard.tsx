import {
  Add as AddIcon,
  DirectionsCar as CarIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Grid,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Typography,
} from '@mui/material';
import 'dayjs/locale/de';

import { Car } from '@/types/cars';

type CarsCardProps = {
  cars: Car[]; // List of cars
  setCars: React.Dispatch<React.SetStateAction<Car[]>>; // Callback to set cars
  setCarModalOpen: React.Dispatch<React.SetStateAction<boolean>>; // Callback to open car modal
};

export function CarsCard({ cars, setCars, setCarModalOpen }: CarsCardProps) {
  const handleRemoveCar = (carId: string) => {
    setCars((prev) => prev.filter((car) => car.id !== carId));
  };

  return (
    <Grid sx={{ xs: 12, lg: 4 }}>
      <Card elevation={2}>
        <CardHeader
          title={
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <CarIcon />
              <Typography
                variant="h6"
                component="h3"
                sx={{ fontWeight: 500, pr: 14 }}
              >
                Fahrzeuge
              </Typography>
            </Box>
          }
          action={
            <Button
              variant="contained"
              color="secondary"
              startIcon={<AddIcon />}
              size="small"
              onClick={() => setCarModalOpen(true)}
            >
              Auto Zuordnen
            </Button>
          }
          sx={{ pb: 1 }}
        />
        <CardContent sx={{ pt: 0 }}>
          {cars.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <CarIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 2 }} />
              <Typography variant="body2" color="text.secondary">
                Noch keine Fahrzeuge zugeordnet
              </Typography>
              <Typography variant="caption" color="text.disabled">
                Klicken Sie auf "Auto Zuordnen" um ein Fahrzeug hinzuzufügen
              </Typography>
            </Box>
          ) : (
            <List dense>
              {cars.map((car) => (
                <ListItem
                  key={car.id}
                  divider
                  secondaryAction={
                    <IconButton
                      edge="end"
                      size="small"
                      onClick={() => handleRemoveCar(car.id)}
                      color="error"
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  }
                >
                  <ListItemText
                    primary={`${car.marke} ${car.modell}`}
                    secondary={
                      <Box>
                        <Typography variant="caption" display="block">
                          Kennzeichen: {car.kennzeichen}
                        </Typography>
                        {car.baujahr && (
                          <Typography variant="caption" display="block">
                            Baujahr: {car.baujahr}
                          </Typography>
                        )}
                      </Box>
                    }
                  />
                </ListItem>
              ))}
            </List>
          )}
        </CardContent>
      </Card>
    </Grid>
  );
}
