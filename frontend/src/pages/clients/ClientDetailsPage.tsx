import {
  CalendarToday as CalendarIcon,
  People as PeopleIcon,
  Save as SaveIcon,
  Visibility as VisibilityIcon,
} from '@mui/icons-material';
import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Chip,
  Container,
  Divider,
  Grid,
  InputAdornment,
  TextField,
  Typography,
} from '@mui/material';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import dayjs from 'dayjs';
import 'dayjs/locale/de';
import { useState } from 'react';

import MenuBar from '../../components/MenuBar';
import { Car } from '../../types/cars';
import { ClientForm } from '../../types/clients';
import { AddCarsModal } from './components/AddCarsModal';
import { CarsCard } from './components/CarsCard';

export function ClientDetailsPage() {
  // cars
  const [cars, setCars] = useState<Car[]>([]);
  const [carDialogOpen, setCarDialogOpen] = useState(false);

  //end cars

  const [formData, setFormData] = useState<ClientForm>({
    // TODO: improve this form to also have errorMessage
    vorname: '',
    nachname: '',
    firma: '',
    strasse: '',
    plz: '',
    stadt: '',
    festnetz: '',
    mobil: '',
    email: '',
    geburtstag: new Date(),
    kommentar: '',
  });

  const handleInputChange = (
    field: keyof ClientForm,
    value: string | Date | null,
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="de">
      <MenuBar current="/clients" />
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
                          value={formData.vorname}
                          onChange={(e) =>
                            handleInputChange('vorname', e.target.value)
                          }
                        />
                      </Grid>
                      <Grid sx={{ xs: 12, md: 4 }}>
                        <TextField
                          fullWidth
                          label="Nachname"
                          placeholder="Mustermann"
                          value={formData.nachname}
                          onChange={(e) =>
                            handleInputChange('nachname', e.target.value)
                          }
                        />
                      </Grid>
                      <Grid sx={{ xs: 12, md: 4 }}>
                        <TextField
                          fullWidth
                          label="Firma"
                          placeholder="Musterfirma GmbH"
                          value={formData.firma}
                          onChange={(e) =>
                            handleInputChange('firma', e.target.value)
                          }
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
                          value={formData.strasse}
                          onChange={(e) =>
                            handleInputChange('strasse', e.target.value)
                          }
                        />
                      </Grid>
                      <Grid sx={{ xs: 12, md: 4 }}>
                        <TextField
                          fullWidth
                          label="PLZ"
                          placeholder="12345"
                          value={formData.plz}
                          onChange={(e) =>
                            handleInputChange('plz', e.target.value)
                          }
                        />
                      </Grid>
                      <Grid sx={{ xs: 12, md: 4 }}>
                        <TextField
                          fullWidth
                          label="Stadt"
                          placeholder="Musterstadt"
                          value={formData.stadt}
                          onChange={(e) =>
                            handleInputChange('stadt', e.target.value)
                          }
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
                          value={formData.festnetz}
                          onChange={(e) =>
                            handleInputChange('festnetz', e.target.value)
                          }
                        />
                      </Grid>
                      <Grid sx={{ xs: 12, md: 4 }}>
                        <TextField
                          fullWidth
                          label="Mobil"
                          placeholder="+49 170 1234567"
                          value={formData.mobil}
                          onChange={(e) =>
                            handleInputChange('mobil', e.target.value)
                          }
                        />
                      </Grid>
                      <Grid sx={{ xs: 12, md: 4 }}>
                        <TextField
                          fullWidth
                          label="E-Mail"
                          type="email"
                          placeholder="max@musterfirma.de"
                          value={formData.email}
                          onChange={(e) =>
                            handleInputChange('email', e.target.value)
                          }
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
                          value={dayjs(formData.geburtstag)}
                          onChange={(newValue) =>
                            handleInputChange(
                              'geburtstag',
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
                          value={formData.kommentar}
                          onChange={(e) =>
                            handleInputChange('kommentar', e.target.value)
                          }
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
