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
import CircularProgress from '@mui/material/CircularProgress';
import Grid from '@mui/material/Grid';
import IconButton from '@mui/material/IconButton';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import Typography from '@mui/material/Typography';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { useNotification } from '@/src/hooks/notification/useNotification';
import * as apiService from '@/src/services/backend-service';
import { BackendCar } from '@/src/types/backend-contracts';

type CarsCardProps = {
  cars: BackendCar[];
  clientId: number;
  setCarModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
};

export function CarsCard({ cars, clientId, setCarModalOpen }: CarsCardProps) {
  const { showNotification } = useNotification();
  const queryClient = useQueryClient();

  const removeMutation = useMutation({
    mutationFn: (carId: number) =>
      apiService.updateCar(carId, { clientId: null }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['client', clientId] });
    },
    onError: (error: unknown) => {
      showNotification({
        level: 'error',
        message:
          error instanceof Error ? error.message : 'Ein Fehler ist aufgetreten',
      });
    },
  });

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
                      onClick={() => removeMutation.mutate(car.id)}
                      color="error"
                      disabled={removeMutation.isPending}
                    >
                      {removeMutation.isPending ? (
                        <CircularProgress size={16} />
                      ) : (
                        <DeleteIcon fontSize="small" />
                      )}
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
