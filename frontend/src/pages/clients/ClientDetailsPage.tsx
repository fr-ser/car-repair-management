import {
  CalendarToday as CalendarIcon,
  People as PeopleIcon,
  Save as SaveIcon,
  Visibility as VisibilityIcon,
} from '@mui/icons-material';
import Alert, { AlertColor } from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import Chip from '@mui/material/Chip';
import Container from '@mui/material/Container';
import Divider from '@mui/material/Divider';
import Grid from '@mui/material/Grid';
import InputAdornment from '@mui/material/InputAdornment';
import Snackbar, { SnackbarCloseReason } from '@mui/material/Snackbar';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import dayjs from 'dayjs';
import 'dayjs/locale/de';
import { useState } from 'react';

import { AddCarsModal } from '@/pages/clients/components/AddCarsModal';
import { CarsCard } from '@/pages/clients/components/CarsCard';
import { Car } from '@/types/cars';
import { ClientForm, IClientForm } from '@/types/clients';
import { FormItem } from '@/types/common';

import * as apiService from '../../services/backend-service';

export function ClientDetailsPage() {
  const [errorSnackBarOpen, setErrorSnackBarOpen] = useState(false);
  const [snackBarMessage, setsnackBarMessage] = useState('');
  const [snackBarLevel, setsnackBarLevel] = useState<AlertColor | undefined>(
    undefined,
  );
  const handleErrorSnackBarClose = (
    _?: React.SyntheticEvent | Event,
    reason?: SnackbarCloseReason,
  ) => {
    if (reason === 'clickaway') {
      return;
    }

    setErrorSnackBarOpen(false);
  };

  const [cars, setCars] = useState<Car[]>([]);
  const [carDialogOpen, setCarDialogOpen] = useState(false);

  const [formData, setFormData] = useState<IClientForm>(() => new ClientForm());

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

  const handleSaveClient = async () => {
    try {
      await apiService.createClient((formData as ClientForm).getReqest());
      setsnackBarLevel('success');
      setsnackBarMessage('Client created!');
      setErrorSnackBarOpen(true);
      setFormData(new ClientForm());
    } catch (err: unknown) {
      console.error(err);
      setsnackBarLevel('error');
      setsnackBarMessage(
        err instanceof Error ? err.message : 'An unknown error occurred',
      );
      setErrorSnackBarOpen(true);
    }
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="de">
      <Snackbar
        open={errorSnackBarOpen}
        autoHideDuration={6000}
        onClose={handleErrorSnackBarClose}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert
          onClose={handleErrorSnackBarClose}
          severity={snackBarLevel}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {snackBarMessage}
        </Alert>
      </Snackbar>
      <Box
        sx={{
          flexGrow: 1,
          minHeight: '100vh',
          bgcolor: 'background.default',
        }}
      >
        {/* Main Content */}
        <Container maxWidth="lg" sx={{ py: 4 }}>
          <Box sx={{ mb: 4 }}>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                mb: 1,
              }}
            >
              <Typography
                variant="h2"
                component="h2"
                sx={{ color: 'text.primary' }}
              >
                Kundenverwaltung
              </Typography>
              <Chip
                icon={<PeopleIcon />}
                label="Aktiver Kunde"
                color="secondary"
                variant="outlined"
              />
            </Box>
            <Typography variant="body1" color="text.secondary">
              Verwalten Sie Ihre Kundendaten effizient und übersichtlich
            </Typography>
          </Box>

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

                  <Divider sx={{ my: 4 }} />

                  <Box
                    sx={{
                      display: 'flex',
                      flexDirection: { xs: 'column', sm: 'row' },
                      gap: 2,
                      pt: 2,
                    }}
                  >
                    <Button
                      variant="contained"
                      startIcon={<SaveIcon />}
                      size="large"
                      onClick={handleSaveClient}
                      sx={{ flex: { xs: 1, sm: 'none' } }}
                    >
                      Kunden Speichern
                    </Button>
                    <Button
                      variant="outlined"
                      startIcon={<VisibilityIcon />}
                      size="large"
                      sx={{ flex: { xs: 1, sm: 'none' } }}
                    >
                      Kunden Anzeigen
                    </Button>
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
        </Container>
        {/* car modal */}
        <AddCarsModal
          isOpen={carDialogOpen}
          onClose={() => setCarDialogOpen(false)}
          setCars={setCars}
        />
        {/* end car modal */}
      </Box>
    </LocalizationProvider>
  );
}
