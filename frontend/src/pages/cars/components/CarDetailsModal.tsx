import { Person as PersonIcon, Save as SaveIcon } from '@mui/icons-material';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CircularProgress from '@mui/material/CircularProgress';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Divider from '@mui/material/Divider';
import Grid from '@mui/material/Grid';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import React from 'react';

import DecimalInput from '@/src/components/DecimalTextField';
import { useNotification } from '@/src/hooks/notification/useNotification';
import useCarForm from '@/src/pages/cars/useCarForm.hook';
import * as apiService from '@/src/services/backend-service';

import TireTextField from './TireTextField';

type CarDetailsPageProps = {
  selectedCarId?: number;
  isOpen: boolean;
  onClose: () => void;
};

export function CarDetailsModal({
  selectedCarId,
  isOpen,
  onClose,
}: CarDetailsPageProps) {
  const { showNotification } = useNotification();

  const { data: selectedCar, isLoading: isCarLoading } = useQuery({
    queryKey: ['car', selectedCarId],
    queryFn: () => apiService.fetchCar(selectedCarId!),
    enabled: !!selectedCarId && isOpen,
  });

  const { formData, reloadForm, onFormInputChange, getPayload } =
    useCarForm(selectedCar);

  const queryClient = useQueryClient();

  async function handleSubmit() {
    if (selectedCarId != undefined) {
      await apiService.updateCar(selectedCarId, getPayload());
    } else {
      await apiService.createCar(getPayload());
    }
  }

  const mutation = useMutation({
    mutationFn: handleSubmit,
    onSuccess: () => {
      showNotification({
        level: 'success',
        message:
          selectedCarId != undefined
            ? 'Autodaten aktualisiert'
            : 'Auto erstellt',
      });
      onCleanAndClose();
      queryClient.invalidateQueries({ queryKey: ['cars'] });
      queryClient.invalidateQueries({ queryKey: ['car', selectedCarId] });
    },
    onError: (error: unknown) => {
      showNotification({
        level: 'error',
        message:
          error instanceof Error ? error.message : 'Ein Fehler ist aufgetreten',
      });
    },
  });

  const onCleanAndClose = () => {
    reloadForm();
    onClose();
  };

  React.useEffect(() => {
    reloadForm(selectedCar);
  }, [selectedCar, reloadForm]);

  return (
    <Dialog open={isOpen} onClose={onCleanAndClose} maxWidth="xl" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <PersonIcon />
          Auto bearbeiten/erstellen
        </Box>
      </DialogTitle>
      <DialogContent>
        {isCarLoading && selectedCarId ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <Grid container spacing={4} pt={1}>
            <Grid size={{ xs: 12, lg: 8 }}>
              <Card elevation={2}>
                <CardContent sx={{ pt: 0 }}>
                  <Box>
                    <Typography
                      variant="overline"
                      sx={{
                        color: 'text.secondary',
                        fontWeight: 600,
                        display: 'block',
                      }}
                    >
                      Allgemeines
                    </Typography>
                    <Grid container spacing={3}>
                      <Grid size={{ xs: 12, md: 3 }}>
                        <TextField
                          fullWidth
                          label="Kennzeichen"
                          required={!!formData.licensePlate.required}
                          value={formData.licensePlate.value}
                          onChange={(e) =>
                            onFormInputChange('licensePlate', e.target.value)
                          }
                          error={!!formData.licensePlate.errorMessage}
                          helperText={formData.licensePlate.errorMessage}
                        />
                      </Grid>
                      <Grid size={{ xs: 12, md: 3 }}>
                        <TextField
                          fullWidth
                          label="Hersteller"
                          required={!!formData.manufacturer.required}
                          value={formData.manufacturer.value}
                          onChange={(e) =>
                            onFormInputChange('manufacturer', e.target.value)
                          }
                          error={!!formData.manufacturer.errorMessage}
                          helperText={formData.manufacturer.errorMessage}
                        />
                      </Grid>
                      <Grid size={{ xs: 12, md: 3 }}>
                        <TextField
                          fullWidth
                          label="Modell"
                          required={!!formData.model.required}
                          value={formData.model.value}
                          onChange={(e) =>
                            onFormInputChange('model', e.target.value)
                          }
                          error={!!formData.model.errorMessage}
                          helperText={formData.model.errorMessage}
                        />
                      </Grid>
                      <Grid size={{ xs: 12, md: 3 }}>
                        <DatePicker
                          label="Erstzulassung"
                          value={formData.firstRegistration.value}
                          onChange={(newValue) =>
                            onFormInputChange(
                              'firstRegistration',
                              newValue?.toDate() || null,
                            )
                          }
                          slotProps={{ textField: { fullWidth: true } }}
                        />
                      </Grid>
                    </Grid>
                  </Box>
                  <Divider sx={{ mt: 2, mb: 1 }} />
                  <Box>
                    <Typography
                      variant="overline"
                      sx={{
                        color: 'text.secondary',
                        fontWeight: 600,
                        display: 'block',
                      }}
                    >
                      Technisches
                    </Typography>
                    <Grid container spacing={3}>
                      <Grid size={{ xs: 12, md: 4 }}>
                        <TextField
                          fullWidth
                          label="Hubraum"
                          required={!!formData.engineCapacity.required}
                          value={formData.engineCapacity.value}
                          onChange={(e) =>
                            onFormInputChange('engineCapacity', e.target.value)
                          }
                          error={!!formData.engineCapacity.errorMessage}
                          helperText={formData.engineCapacity.errorMessage}
                        />
                      </Grid>
                      <Grid size={{ xs: 12, md: 4 }}>
                        <TextField
                          fullWidth
                          label="Leistung"
                          required={!!formData.enginePower.required}
                          value={formData.enginePower.value}
                          onChange={(e) =>
                            onFormInputChange('enginePower', e.target.value)
                          }
                          error={!!formData.enginePower.errorMessage}
                          helperText={formData.enginePower.errorMessage}
                        />
                      </Grid>
                      <Grid size={{ xs: 12, md: 4 }}>
                        <TireTextField
                          value={formData.tires.value}
                          onChange={(value) =>
                            onFormInputChange('tires', value)
                          }
                          id="tires"
                          label="Reifen"
                          error={formData.tires.errorMessage}
                        />
                      </Grid>
                    </Grid>
                  </Box>
                  <Divider sx={{ mt: 2, mb: 1 }} />
                  <Box>
                    <Typography
                      variant="overline"
                      sx={{
                        color: 'text.secondary',
                        fontWeight: 600,
                        display: 'block',
                      }}
                    >
                      Sonstiges
                    </Typography>
                    <Grid container spacing={3}>
                      <Grid size={{ xs: 12, md: 4 }}>
                        <TextField
                          fullWidth
                          label="VIN"
                          required={!!formData.vin.required}
                          value={formData.vin.value}
                          onChange={(e) =>
                            onFormInputChange('vin', e.target.value)
                          }
                          error={!!formData.vin.errorMessage}
                          helperText={formData.vin.errorMessage}
                        />
                      </Grid>
                      <Grid size={{ xs: 12, md: 2 }}>
                        <TextField
                          fullWidth
                          label="zu 2"
                          required={!!formData.documentField2.required}
                          value={formData.documentField2.value}
                          onChange={(e) =>
                            onFormInputChange('documentField2', e.target.value)
                          }
                          error={!!formData.documentField2.errorMessage}
                          helperText={formData.documentField2.errorMessage}
                        />
                      </Grid>
                      <Grid size={{ xs: 12, md: 2 }}>
                        <TextField
                          fullWidth
                          label="zu 3"
                          required={!!formData.documentField3.required}
                          value={formData.documentField3.value}
                          onChange={(e) =>
                            onFormInputChange('documentField3', e.target.value)
                          }
                          error={!!formData.documentField3.errorMessage}
                          helperText={formData.documentField3.errorMessage}
                        />
                      </Grid>
                      <Grid size={{ xs: 12, md: 4 }}>
                        <TextField
                          fullWidth
                          label="Farbe"
                          required={!!formData.color.required}
                          value={formData.color.value}
                          onChange={(e) =>
                            onFormInputChange('color', e.target.value)
                          }
                          error={!!formData.color.errorMessage}
                          helperText={formData.color.errorMessage}
                        />
                      </Grid>
                    </Grid>
                  </Box>
                  <Divider sx={{ mt: 2, mb: 1 }} />
                  <Box>
                    <Typography
                      variant="overline"
                      sx={{
                        color: 'text.secondary',
                        fontWeight: 600,
                        display: 'block',
                      }}
                    >
                      letzter Zahnriemenwechsel
                    </Typography>
                    <Grid container spacing={3}>
                      <Grid size={{ xs: 12, md: 6 }}>
                        <DecimalInput
                          id="timingBeltKm"
                          label="Zahnriemen [km]"
                          value={formData.timingBeltKm.value}
                          onChange={(value) =>
                            onFormInputChange('timingBeltKm', value)
                          }
                        />
                      </Grid>
                      <Grid size={{ xs: 12, md: 6 }}>
                        <DatePicker
                          label="Zahnriemen [Datum]"
                          value={formData.timingBeltDate.value}
                          onChange={(newValue) =>
                            onFormInputChange(
                              'timingBeltDate',
                              newValue?.toDate() || null,
                            )
                          }
                          slotProps={{ textField: { fullWidth: true } }}
                        />
                      </Grid>
                    </Grid>
                  </Box>
                  <Divider sx={{ mt: 2, mb: 1 }} />
                  <Box>
                    <Typography
                      variant="overline"
                      sx={{
                        color: 'text.secondary',
                        fontWeight: 600,
                        display: 'block',
                      }}
                    >
                      letzter Ölwechsel
                    </Typography>
                    <Grid container spacing={3}>
                      <Grid size={{ xs: 12, md: 6 }}>
                        <DecimalInput
                          id="oilChangeKm"
                          label="Ölwechsel [km]"
                          value={formData.oilChangeKm.value}
                          onChange={(value) =>
                            onFormInputChange('oilChangeKm', value)
                          }
                        />
                      </Grid>
                      <Grid size={{ xs: 12, md: 6 }}>
                        <DatePicker
                          label="Ölwechsel [Datum]"
                          value={formData.oilChangeDate.value}
                          onChange={(newValue) =>
                            onFormInputChange(
                              'oilChangeDate',
                              newValue?.toDate() || null,
                            )
                          }
                          slotProps={{ textField: { fullWidth: true } }}
                        />
                      </Grid>
                    </Grid>
                  </Box>
                  <Divider sx={{ mt: 2, mb: 1 }} />
                  <Box>
                    <Typography
                      variant="overline"
                      sx={{
                        color: 'text.secondary',
                        fontWeight: 600,
                        display: 'block',
                      }}
                    >
                      TÜV & Kommentar
                    </Typography>
                    <Grid container spacing={3}>
                      <Grid size={{ xs: 12, md: 6 }}>
                        <DatePicker
                          label="nächster TÜV [Datum]"
                          value={formData.inspectionDate.value}
                          onChange={(newValue) =>
                            onFormInputChange(
                              'inspectionDate',
                              newValue?.toDate() || null,
                            )
                          }
                          slotProps={{ textField: { fullWidth: true } }}
                        />
                      </Grid>
                      <Grid size={{ xs: 12, md: 6 }}>
                        <TextField
                          fullWidth
                          label="Kommentar"
                          multiline
                          rows={3}
                          required={!!formData.comment.required}
                          value={formData.comment.value}
                          onChange={(e) =>
                            onFormInputChange('comment', e.target.value)
                          }
                          error={!!formData.comment.errorMessage}
                          helperText={formData.comment.errorMessage}
                        />
                      </Grid>
                    </Grid>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onCleanAndClose}>Abbrechen</Button>
        <Button
          variant="contained"
          startIcon={
            mutation.isPending ? <CircularProgress size={24} /> : <SaveIcon />
          }
          size="large"
          onClick={() => mutation.mutate()}
          sx={{ flex: { xs: 1, sm: 'none' } }}
          data-testid="button-car-save"
        >
          Auto Speichern
        </Button>
      </DialogActions>
    </Dialog>
  );
}
