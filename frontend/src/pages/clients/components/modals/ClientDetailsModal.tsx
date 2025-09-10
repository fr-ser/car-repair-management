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
import CardHeader from '@mui/material/CardHeader';
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
import dayjs from 'dayjs';
import 'dayjs/locale/de';
import { useEffect, useState } from 'react';
import React from 'react';

import { NotificationSnackBar } from '@/src/components/NotificationSnackBar';
import { CarsCard } from '@/src/pages/clients/components/CarsCard';
import { AddCarsModal } from '@/src/pages/clients/components/modals/AddCarsModal';
import * as apiService from '@/src/services/backend-service';
import { BEClient } from '@/src/types/be-contracts';
import { Car } from '@/src/types/cars';
import { ClientForm, IClientForm } from '@/src/types/clients';
import { FormItem } from '@/src/types/common';

type ClientDetailsPageProps = {
  selectedClient?: BEClient;
  isOpen: boolean; // Controls whether modal is shown
  onClose: () => void; // Close callback
};

export function ClientDetailsModal({
  selectedClient,
  isOpen,
  onClose,
}: ClientDetailsPageProps) {
  // Snack bar state
  const [snackBarOpen, setSnackBarOpen] = React.useState(false);
  const [snackBarMessage, setSnackBarMessage] = React.useState('');
  const [snackBarLevel, setSnackBarLevel] = React.useState<
    AlertColor | undefined
  >(undefined);
  // Snack bar end
  const [cars, setCars] = useState<Car[]>([]);
  const [carDialogOpen, setCarDialogOpen] = useState(false);

  const [formData, setFormData] = useState<IClientForm>(() => new ClientForm());

  const queryClient = useQueryClient();

  const handleInputChange = (
    field: keyof IClientForm,
    value: string | Date | null,
  ) => {
    setFormData((prev) =>
      prev.withUpdate({
        [field]: {
          value: value as string,
          errorMessage: value ? null : 'Should not be empty',
          required: (prev[field] as FormItem).required,
        },
      }),
    );
  };

  function closeSelf() {
    onClose();
    setFormData(() => new ClientForm());
    setCars([]);
  }

  async function handleSubmit() {
    const isValid = (formData as ClientForm).validate();
    if (!isValid) {
      throw new Error('Please fix validation errors before submitting');
    }
    if (selectedClient !== undefined) {
      await apiService.updateClient(
        selectedClient.id,
        (formData as ClientForm).getReqest(),
      );
    } else {
      await apiService.createClient((formData as ClientForm).getReqest());
    }
  }

  const mutation = useMutation({
    mutationFn: handleSubmit,
    onSuccess: () => {
      // Invalidate cache to refetch clients table
      setSnackBarLevel('success');
      setSnackBarMessage(
        selectedClient !== undefined ? 'Client updated!' : 'Client created!',
      );
      setSnackBarOpen(true);
      closeSelf();
      queryClient.invalidateQueries({ queryKey: ['clients'] });
    },
    onError: (error: unknown) => {
      setSnackBarLevel('error');
      setSnackBarMessage(
        error instanceof Error ? error.message : 'An unknown error occurred',
      );
      setSnackBarOpen(true);
    },
  });

  useEffect(() => {
    const FormKeys = Object.keys(formData) as (keyof IClientForm)[];
    if (selectedClient !== undefined) {
      for (const field in selectedClient) {
        if (!FormKeys.includes(field as keyof IClientForm)) continue;
        setFormData((prev) =>
          prev.withUpdate({
            [field]: {
              value: (selectedClient[field as keyof BEClient] as string) || '',
              errorMessage: null,
              required:
                (prev[field as keyof IClientForm] as FormItem)?.required ||
                false,
            },
          }),
        );
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedClient]);

  return (
    <>
      <Container>
        <NotificationSnackBar
          open={snackBarOpen}
          message={snackBarMessage}
          level={snackBarLevel}
          setOpen={setSnackBarOpen}
        />
        <Dialog open={isOpen} onClose={() => closeSelf()} maxWidth="lg">
          <DialogTitle>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <PersonIcon />
              Kunde bearbeiten/erstellen
            </Box>
          </DialogTitle>
          <DialogContent>
            <Grid container spacing={4}>
              {/* Customer Information Card */}
              <Grid sx={{ xs: 12, lg: 8 }}>
                <Card elevation={2}>
                  <CardHeader
                    title={
                      <Typography
                        variant="h6"
                        component="h3"
                        sx={{ fontWeight: 500 }}
                      >
                        Kundeninformationen
                      </Typography>
                    }
                    sx={{ pb: 2 }}
                  />
                  <CardContent sx={{ pt: 0 }}>
                    {/* Personal Information Section */}
                    <Box sx={{ mb: 4 }}>
                      <Typography
                        variant="overline"
                        sx={{
                          color: 'text.secondary',
                          fontWeight: 600,
                          letterSpacing: 1.2,
                          mb: 2,
                          display: 'block',
                        }}
                      >
                        Persönliche Daten
                      </Typography>
                      <Grid container spacing={3}>
                        <Grid sx={{ xs: 12, md: 4 }}>
                          <TextField
                            fullWidth
                            label="Vorname"
                            placeholder="Max"
                            value={formData.firstName.value}
                            onChange={(e) =>
                              handleInputChange('firstName', e.target.value)
                            }
                            required
                            error={!!formData.firstName.errorMessage}
                            helperText={formData.firstName.errorMessage}
                          />
                        </Grid>
                        <Grid sx={{ xs: 12, md: 4 }}>
                          <TextField
                            fullWidth
                            label="Nachname"
                            placeholder="Mustermann"
                            value={formData.lastName.value}
                            onChange={(e) =>
                              handleInputChange('lastName', e.target.value)
                            }
                            required
                            error={!!formData.lastName.errorMessage}
                            helperText={formData.lastName.errorMessage}
                          />
                        </Grid>
                        <Grid sx={{ xs: 12, md: 4 }}>
                          <TextField
                            fullWidth
                            label="Firma"
                            placeholder="Musterfirma GmbH"
                            value={formData.company.value}
                            onChange={(e) =>
                              handleInputChange('company', e.target.value)
                            }
                            error={!!formData.company.errorMessage}
                            helperText={formData.company.errorMessage}
                          />
                        </Grid>
                      </Grid>
                    </Box>

                    <Divider sx={{ my: 4 }} />

                    {/* Address Section */}
                    <Box sx={{ mb: 4 }}>
                      <Typography
                        variant="overline"
                        sx={{
                          color: 'text.secondary',
                          fontWeight: 600,
                          letterSpacing: 1.2,
                          mb: 2,
                          display: 'block',
                        }}
                      >
                        Adresse
                      </Typography>
                      <Grid container spacing={3}>
                        <Grid sx={{ xs: 12, md: 4 }}>
                          <TextField
                            fullWidth
                            label="Straße und Nr."
                            placeholder="Musterstraße 123"
                            value={formData.street.value}
                            onChange={(e) =>
                              handleInputChange('street', e.target.value)
                            }
                            error={!!formData.street.errorMessage}
                            helperText={formData.street.errorMessage}
                          />
                        </Grid>
                        <Grid sx={{ xs: 12, md: 4 }}>
                          <TextField
                            fullWidth
                            label="PLZ"
                            placeholder="12345"
                            value={formData.postalCode.value}
                            onChange={(e) =>
                              handleInputChange('postalCode', e.target.value)
                            }
                            error={!!formData.postalCode.errorMessage}
                            helperText={formData.postalCode.errorMessage}
                          />
                        </Grid>
                        <Grid sx={{ xs: 12, md: 4 }}>
                          <TextField
                            fullWidth
                            label="Stadt"
                            placeholder="Musterstadt"
                            value={formData.city.value}
                            onChange={(e) =>
                              handleInputChange('city', e.target.value)
                            }
                            error={!!formData.city.errorMessage}
                            helperText={formData.city.errorMessage}
                          />
                        </Grid>
                      </Grid>
                    </Box>

                    <Divider sx={{ my: 4 }} />

                    {/* Contact Information Section */}
                    <Box sx={{ mb: 4 }}>
                      <Typography
                        variant="overline"
                        sx={{
                          color: 'text.secondary',
                          fontWeight: 600,
                          letterSpacing: 1.2,
                          mb: 2,
                          display: 'block',
                        }}
                      >
                        Kontaktdaten
                      </Typography>
                      <Grid container spacing={3}>
                        <Grid sx={{ xs: 12, md: 4 }}>
                          <TextField
                            fullWidth
                            label="Festnetz"
                            placeholder="+49 123 456789"
                            value={formData.landline.value}
                            onChange={(e) =>
                              handleInputChange('landline', e.target.value)
                            }
                            error={!!formData.landline.errorMessage}
                            helperText={formData.landline.errorMessage}
                          />
                        </Grid>
                        <Grid sx={{ xs: 12, md: 4 }}>
                          <TextField
                            fullWidth
                            label="Mobil"
                            placeholder="+49 170 1234567"
                            value={formData.phoneNumber.value}
                            onChange={(e) =>
                              handleInputChange('phoneNumber', e.target.value)
                            }
                            error={!!formData.phoneNumber.errorMessage}
                            helperText={formData.phoneNumber.errorMessage}
                          />
                        </Grid>
                        <Grid sx={{ xs: 12, md: 4 }}>
                          <TextField
                            fullWidth
                            label="E-Mail"
                            type="email"
                            placeholder="max@musterfirma.de"
                            value={formData.email.value}
                            onChange={(e) =>
                              handleInputChange('email', e.target.value)
                            }
                            error={!!formData.email.errorMessage}
                            helperText={formData.email.errorMessage}
                          />
                        </Grid>
                      </Grid>
                    </Box>

                    <Divider sx={{ my: 4 }} />

                    {/* Additional Information Section */}
                    <Box sx={{ mb: 4 }}>
                      <Typography
                        variant="overline"
                        sx={{
                          color: 'text.secondary',
                          fontWeight: 600,
                          letterSpacing: 1.2,
                          mb: 2,
                          display: 'block',
                        }}
                      >
                        Zusätzliche Informationen
                      </Typography>
                      <Grid container spacing={3}>
                        <Grid sx={{ xs: 12, md: 6 }}>
                          <DatePicker
                            label="Geburtstag"
                            value={dayjs(formData.birthday.value || new Date())}
                            onChange={(newValue) =>
                              handleInputChange(
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
                        <Grid sx={{ xs: 12, md: 6 }}>
                          <TextField
                            fullWidth
                            label="Kommentar"
                            placeholder="Zusätzliche Notizen zum Kunden..."
                            multiline
                            rows={3}
                            value={formData.comment.value}
                            onChange={(e) =>
                              handleInputChange('comment', e.target.value)
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
            {/* car modal */}
            <AddCarsModal
              isOpen={carDialogOpen}
              onClose={() => setCarDialogOpen(false)}
              setCars={setCars}
            />
            {/* end car modal */}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => closeSelf()}>Abbrechen</Button>
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
