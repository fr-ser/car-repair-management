import {
  CalendarToday as CalendarIcon,
  Person as PersonIcon,
  Save as SaveIcon,
} from '@mui/icons-material';
import { AlertColor } from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CircularProgress from '@mui/material/CircularProgress';
import Container from '@mui/material/Container';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Divider from '@mui/material/Divider';
import Grid from '@mui/material/Grid';
import InputAdornment from '@mui/material/InputAdornment';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import React, { useState } from 'react';

import { NotificationSnackBar } from '@/src/components/NotificationSnackBar';
import { CarsCard } from '@/src/pages/clients/components/CarsCard';
import { AddCarsModal } from '@/src/pages/clients/components/modals/AddCarsModal';
import useClientForm from '@/src/pages/clients/hooks/useClientForm';
import * as apiService from '@/src/services/backend-service';
import { BackendClient } from '@/src/types/backend-contracts';
import { Car } from '@/src/types/cars';

type ClientDetailsPageProps = {
  selectedClient?: BackendClient;
  isOpen: boolean;
  onClose: () => void;
};

export function ClientDetailsModal({
  selectedClient,
  isOpen,
  onClose,
}: ClientDetailsPageProps) {
  const { formData, reloadForm, onFormInputChange, getPayload } =
    useClientForm(selectedClient);
  // Snack bar state
  const [snackBarOpen, setSnackBarOpen] = React.useState(false);
  const [snackBarMessage, setSnackBarMessage] = React.useState('');
  const [snackBarLevel, setSnackBarLevel] = React.useState<
    AlertColor | undefined
  >(undefined);
  // Snack bar end
  const [cars, setCars] = useState<Car[]>([]);
  const [carDialogOpen, setCarDialogOpen] = useState(false);

  const queryClient = useQueryClient();

  async function handleSubmit() {
    if (selectedClient !== undefined) {
      await apiService.updateClient(selectedClient.id, getPayload());
    } else {
      await apiService.createClient(getPayload());
    }
  }

  const mutation = useMutation({
    mutationFn: handleSubmit,
    onSuccess: () => {
      setSnackBarLevel('success');
      setSnackBarMessage(
        selectedClient !== undefined
          ? 'Kundendaten aktualisiert'
          : 'Kunde erstellt',
      );
      setSnackBarOpen(true);
      onCleanAndClose();
      queryClient.invalidateQueries({ queryKey: ['clients'] });
    },
    onError: (error: unknown) => {
      setSnackBarLevel('error');
      setSnackBarMessage(
        error instanceof Error ? error.message : 'Ein Fehler ist aufgetreten',
      );
      setSnackBarOpen(true);
    },
  });

  const onCleanAndClose = () => {
    reloadForm();
    onClose();
  };

  React.useEffect(() => {
    reloadForm(selectedClient);
  }, [selectedClient, reloadForm]);

  return (
    <>
      <Container>
        <NotificationSnackBar
          open={snackBarOpen}
          message={snackBarMessage}
          level={snackBarLevel}
          setOpen={setSnackBarOpen}
        />
        <Dialog
          open={isOpen}
          onClose={onCleanAndClose}
          maxWidth="lg"
          keepMounted={false}
        >
          <DialogTitle>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <PersonIcon />
              Kunden bearbeiten/erstellen
            </Box>
          </DialogTitle>
          <DialogContent>
            <Grid container spacing={4} pt={1}>
              {/* Customer Information Card */}
              <Grid size={{ xs: 12, lg: 8 }}>
                <Card elevation={2}>
                  <CardContent sx={{ pt: 0 }}>
                    {/* Personal Information Section */}
                    <Box>
                      <Typography
                        variant="overline"
                        sx={{
                          color: 'text.secondary',
                          fontWeight: 600,
                          display: 'block',
                        }}
                      >
                        Persönliche Daten
                      </Typography>
                      <Grid container spacing={3}>
                        <Grid size={{ xs: 12, md: 4 }}>
                          <TextField
                            fullWidth
                            label="Vorname"
                            value={formData.firstName.value}
                            onChange={(e) =>
                              onFormInputChange('firstName', e.target.value)
                            }
                            error={!!formData.firstName.errorMessage}
                            helperText={formData.firstName.errorMessage}
                          />
                        </Grid>
                        <Grid size={{ xs: 12, md: 4 }}>
                          <TextField
                            fullWidth
                            label="Nachname"
                            value={formData.lastName.value}
                            onChange={(e) =>
                              onFormInputChange('lastName', e.target.value)
                            }
                            error={!!formData.lastName.errorMessage}
                            helperText={formData.lastName.errorMessage}
                          />
                        </Grid>
                        <Grid size={{ xs: 12, md: 4 }}>
                          <TextField
                            fullWidth
                            label="Firma"
                            value={formData.company.value}
                            onChange={(e) =>
                              onFormInputChange('company', e.target.value)
                            }
                            error={!!formData.company.errorMessage}
                            helperText={formData.company.errorMessage}
                          />
                        </Grid>
                      </Grid>
                    </Box>

                    <Divider sx={{ mt: 2, mb: 1 }} />

                    {/* Address Section */}
                    <Box>
                      <Typography
                        variant="overline"
                        sx={{
                          color: 'text.secondary',
                          fontWeight: 600,
                          display: 'block',
                        }}
                      >
                        Adresse
                      </Typography>
                      <Grid container spacing={3}>
                        <Grid size={{ xs: 12, md: 4 }}>
                          <TextField
                            fullWidth
                            label="Straße und Nr."
                            value={formData.street.value}
                            onChange={(e) =>
                              onFormInputChange('street', e.target.value)
                            }
                            error={!!formData.street.errorMessage}
                            helperText={formData.street.errorMessage}
                          />
                        </Grid>
                        <Grid size={{ xs: 12, md: 4 }}>
                          <TextField
                            fullWidth
                            label="PLZ"
                            value={formData.postalCode.value}
                            onChange={(e) =>
                              onFormInputChange('postalCode', e.target.value)
                            }
                            error={!!formData.postalCode.errorMessage}
                            helperText={formData.postalCode.errorMessage}
                          />
                        </Grid>
                        <Grid size={{ xs: 12, md: 4 }}>
                          <TextField
                            fullWidth
                            label="Stadt"
                            value={formData.city.value}
                            onChange={(e) =>
                              onFormInputChange('city', e.target.value)
                            }
                            error={!!formData.city.errorMessage}
                            helperText={formData.city.errorMessage}
                          />
                        </Grid>
                      </Grid>
                    </Box>

                    <Divider sx={{ mt: 2, mb: 1 }} />

                    {/* Contact Information Section */}
                    <Box>
                      <Typography
                        variant="overline"
                        sx={{
                          color: 'text.secondary',
                          fontWeight: 600,
                          display: 'block',
                        }}
                      >
                        Kontaktdaten
                      </Typography>
                      <Grid container spacing={3}>
                        <Grid size={{ xs: 12, md: 4 }}>
                          <TextField
                            fullWidth
                            label="Festnetz"
                            value={formData.landline.value}
                            onChange={(e) =>
                              onFormInputChange('landline', e.target.value)
                            }
                            error={!!formData.landline.errorMessage}
                            helperText={formData.landline.errorMessage}
                          />
                        </Grid>
                        <Grid size={{ xs: 12, md: 4 }}>
                          <TextField
                            fullWidth
                            label="Mobil"
                            value={formData.phoneNumber.value}
                            onChange={(e) =>
                              onFormInputChange('phoneNumber', e.target.value)
                            }
                            error={!!formData.phoneNumber.errorMessage}
                            helperText={formData.phoneNumber.errorMessage}
                          />
                        </Grid>
                        <Grid size={{ xs: 12, md: 4 }}>
                          <TextField
                            fullWidth
                            label="E-Mail"
                            type="email"
                            value={formData.email.value}
                            onChange={(e) =>
                              onFormInputChange('email', e.target.value)
                            }
                            error={!!formData.email.errorMessage}
                            helperText={formData.email.errorMessage}
                          />
                        </Grid>
                      </Grid>
                    </Box>

                    <Divider sx={{ mt: 2, mb: 1 }} />

                    {/* Additional Information Section */}
                    <Box>
                      <Typography
                        variant="overline"
                        sx={{
                          color: 'text.secondary',
                          fontWeight: 600,
                          display: 'block',
                        }}
                      >
                        Zusätzliche Informationen
                      </Typography>
                      <Grid container spacing={3}>
                        <Grid size={{ xs: 12, md: 6 }}>
                          <DatePicker
                            label="Geburtstag"
                            value={formData.birthday.value}
                            onChange={(newValue) =>
                              onFormInputChange(
                                'birthday',
                                newValue?.toDate() || null,
                              )
                            }
                            slotProps={{
                              textField: {
                                fullWidth: true,
                                InputProps: {
                                  startAdornment: (
                                    <InputAdornment position="start">
                                      <CalendarIcon fontSize="small" />
                                    </InputAdornment>
                                  ),
                                },
                              },
                            }}
                          />
                        </Grid>
                        <Grid size={{ xs: 12, md: 6 }}>
                          <TextField
                            fullWidth={true}
                            label="Kommentar"
                            multiline
                            rows={3}
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

              <CarsCard
                cars={cars}
                setCars={setCars}
                setCarModalOpen={setCarDialogOpen}
              />
            </Grid>
            <AddCarsModal
              isOpen={carDialogOpen}
              onClose={() => setCarDialogOpen(false)}
              setCars={setCars}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={onCleanAndClose}>Abbrechen</Button>
            <Button
              variant="contained"
              startIcon={
                mutation.isPending ? (
                  <CircularProgress size={24} />
                ) : (
                  <SaveIcon />
                )
              }
              size="large"
              onClick={() => mutation.mutate()}
              sx={{ flex: { xs: 1, sm: 'none' } }}
              data-testid="button-client-save"
            >
              Kunden Speichern
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </>
  );
}
