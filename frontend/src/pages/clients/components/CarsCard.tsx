import {
  Add as AddIcon,
  DirectionsCar as CarIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import Grid from '@mui/material/Grid';
import IconButton from '@mui/material/IconButton';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import Typography from '@mui/material/Typography';

import { BackendCar } from '@/src/types/backend-contracts';

type CarsCardProps = {
  cars: BackendCar[];
  setCars: React.Dispatch<React.SetStateAction<BackendCar[]>>;
  setCarModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
};

export function CarsCard({ cars, setCars, setCarModalOpen }: CarsCardProps) {
  const handleRemoveCar = (carId: number) => {
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
                    primary={`${car.manufacturer} ${car.model}`}
                    secondary={
                      <Box>
                        <Typography variant="caption" display="block">
                          Kennzeichen: {car.licensePlate}
                        </Typography>
                        {car.firstRegistration && (
                          <Typography variant="caption" display="block">
                            Erstzulassung: {car.firstRegistration}
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
