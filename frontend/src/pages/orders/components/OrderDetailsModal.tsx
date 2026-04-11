import {
  Assignment as AssignmentIcon,
  Close as CloseIcon,
  OpenInNew as OpenInNewIcon,
  Receipt as ReceiptIcon,
  Save as SaveIcon,
} from '@mui/icons-material';
import Autocomplete from '@mui/material/Autocomplete';
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
import IconButton from '@mui/material/IconButton';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import React from 'react';
import { useNavigate } from 'react-router-dom';

import DecimalTextField from '@/src/components/DecimalTextField';
import useNotification from '@/src/hooks/notification/useNotification';
import useDebounce from '@/src/hooks/useDebounce';
import { useOrderForm } from '@/src/pages/orders/useOrderForm.hook';
import * as apiService from '@/src/services/backend-service';
import {
  BackendCar,
  BackendClient,
  BackendDocument,
} from '@/src/types/backend-contracts';
import { DOCUMENT_TYPE } from '@/src/types/documents';
import { ORDER_STATUS, PAYMENT_METHOD } from '@/src/types/orders';
import { clientOptionLabel } from '@/src/utils/clients';
import { getVatRate } from '@/src/utils/helpers';
import { formatNumber } from '@/src/utils/numbers';

import OrderPositionsEditor from './OrderPositionsEditor';

type OrderDetailsModalProps = {
  selectedOrderId?: number;
  isOpen: boolean;
  onClose: () => void;
};

function CarAutocomplete({
  carId,
  errorMessage,
  onChange,
}: {
  carId: number | null;
  errorMessage?: string;
  onChange: (id: number | null) => void;
}) {
  const [search, setSearch] = React.useState('');
  const [inputValue, setInputValue] = React.useState('');
  const debouncedSearch = useDebounce(search, 300);

  const { data: carsData } = useQuery({
    queryKey: ['cars', { search: debouncedSearch }],
    queryFn: () => apiService.fetchCars(0, 20, debouncedSearch),
  });

  const { data: selectedCarData } = useQuery({
    queryKey: ['car', carId],
    queryFn: () => apiService.fetchCar(carId!),
    enabled: carId != null,
  });

  const carOptions = carsData?.data ?? [];

  const selectedCar =
    carId != null
      ? (carOptions.find((c) => c.id === carId) ?? selectedCarData ?? null)
      : null;

  React.useEffect(() => {
    if (selectedCar) {
      setInputValue(
        `${selectedCar.carNumber ?? ''} – ${selectedCar.licensePlate}`,
      );
    }
  }, [selectedCar]);

  const handleChange = (_: React.SyntheticEvent, value: BackendCar | null) => {
    onChange(value?.id ?? null);
    if (value) {
      setInputValue(`${value.carNumber ?? ''} – ${value.licensePlate}`);
    }
  };

  return (
    <Autocomplete
      options={carOptions}
      getOptionLabel={(option) =>
        `${option.carNumber ?? ''} – ${option.licensePlate}`
      }
      value={selectedCar}
      onChange={handleChange}
      inputValue={inputValue}
      onInputChange={(_, value) => {
        setInputValue(value);
        setSearch(value);
      }}
      filterOptions={(x) => x}
      renderInput={(params) => (
        <TextField
          {...params}
          label="Fahrzeug"
          required
          error={!!errorMessage}
          helperText={errorMessage}
          slotProps={{
            htmlInput: {
              ...params.inputProps,
              'data-testid': 'order-autocomplete-car',
            },
          }}
        />
      )}
    />
  );
}

function ClientAutocomplete({
  clientId,
  errorMessage,
  onChange,
}: {
  clientId: number | null;
  errorMessage?: string;
  onChange: (id: number | null) => void;
}) {
  const [search, setSearch] = React.useState('');
  const [inputValue, setInputValue] = React.useState('');
  const debouncedSearch = useDebounce(search, 300);

  const { data: clientsData } = useQuery({
    queryKey: ['clients', { search: debouncedSearch }],
    queryFn: () => apiService.fetchClients(0, 20, debouncedSearch),
  });

  const { data: selectedClientData } = useQuery({
    queryKey: ['client', clientId],
    queryFn: () => apiService.fetchClient(clientId!),
    enabled: clientId != null,
  });

  const clientOptions = clientsData?.data ?? [];

  const selectedClient =
    clientId != null
      ? (clientOptions.find((c) => c.id === clientId) ??
        (selectedClientData as BackendClient | undefined) ??
        null)
      : null;

  React.useEffect(() => {
    if (selectedClient) {
      setInputValue(clientOptionLabel(selectedClient));
    }
  }, [selectedClient]);

  const handleChange = (
    _: React.SyntheticEvent,
    value: BackendClient | null,
  ) => {
    onChange(value?.id ?? null);
    if (value) {
      setInputValue(clientOptionLabel(value));
    }
  };

  return (
    <Autocomplete
      options={clientOptions}
      getOptionLabel={(option) => clientOptionLabel(option)}
      value={selectedClient}
      onChange={handleChange}
      inputValue={inputValue}
      onInputChange={(_, value) => {
        setInputValue(value);
        setSearch(value);
      }}
      filterOptions={(x) => x}
      renderInput={(params) => (
        <TextField
          {...params}
          label="Kunde"
          required
          error={!!errorMessage}
          helperText={errorMessage}
          slotProps={{
            htmlInput: {
              ...params.inputProps,
              'data-testid': 'order-autocomplete-client',
            },
          }}
        />
      )}
    />
  );
}

function documentTypeLabel(type: string) {
  if (type === DOCUMENT_TYPE.INVOICE) return 'Rechnung';
  if (type === DOCUMENT_TYPE.OFFER) return 'Kostenvoranschlag';
  return type;
}

function OrderDocumentsCard({ orderId }: { orderId: number }) {
  const navigate = useNavigate();

  const { data: documents, isPending } = useQuery({
    queryKey: ['documents', 'by-order', orderId],
    queryFn: () => apiService.fetchDocumentsByOrder(orderId),
  });

  return (
    <Card elevation={2}>
      <CardContent>
        <Typography
          variant="overline"
          sx={{ color: 'text.secondary', fontWeight: 600, display: 'block' }}
        >
          Dokumente
        </Typography>
        {isPending && <CircularProgress size={20} />}
        {!isPending && (!documents || documents.length === 0) && (
          <Typography variant="body2" color="text.secondary">
            Noch keine Dokumente
          </Typography>
        )}
        {documents && documents.length > 0 && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
            {documents.map((doc: BackendDocument) => (
              <Box
                key={doc.id}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 1,
                  py: 0.5,
                  borderBottom: '1px solid',
                  borderColor: 'divider',
                  '&:last-child': { borderBottom: 'none' },
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <AssignmentIcon
                    fontSize="small"
                    sx={{ color: 'text.secondary' }}
                  />
                  <Typography variant="body2">
                    {documentTypeLabel(doc.type)} {doc.documentNumber}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {doc.documentDate}
                  </Typography>
                </Box>
                <Button
                  size="small"
                  endIcon={<OpenInNewIcon fontSize="small" />}
                  onClick={() => navigate(`/documents/${doc.id}`)}
                >
                  Öffnen
                </Button>
              </Box>
            ))}
          </Box>
        )}
      </CardContent>
    </Card>
  );
}

export default function OrderDetailsModal({
  selectedOrderId,
  isOpen,
  onClose,
}: OrderDetailsModalProps) {
  const { showNotification } = useNotification();
  const navigate = useNavigate();

  const { data: selectedOrder, isLoading: isOrderLoading } = useQuery({
    queryKey: ['order', selectedOrderId],
    queryFn: () => apiService.fetchOrder(selectedOrderId!),
    enabled: !!selectedOrderId && isOpen,
  });

  const {
    formData,
    reloadForm,
    onFormInputChange,
    addHeading,
    addItem,
    updatePosition,
    movePosition,
    removePosition,
    getPayload,
  } = useOrderForm(selectedOrder);

  const queryClient = useQueryClient();

  async function handleSubmit() {
    if (selectedOrderId != undefined) {
      await apiService.updateOrder(selectedOrderId, getPayload());
    } else {
      await apiService.createOrder(getPayload());
    }
  }

  const mutation = useMutation({
    mutationFn: handleSubmit,
    onSuccess: () => {
      showNotification({
        level: 'success',
        message:
          selectedOrderId != undefined
            ? 'Auftrag aktualisiert'
            : 'Auftrag erstellt',
      });
      onCleanAndClose();
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
    onError: (error: unknown) => {
      showNotification({
        level: 'error',
        message:
          error instanceof Error ? error.message : 'Ein Fehler ist aufgetreten',
      });
    },
  });

  const saveAsDocumentMutation = useMutation({
    mutationFn: (type: (typeof DOCUMENT_TYPE)[keyof typeof DOCUMENT_TYPE]) =>
      apiService.createDocument({
        orderId: selectedOrderId!,
        type,
        documentDate: new Date().toISOString().slice(0, 10),
      }),
    onSuccess: (doc) => {
      showNotification({ level: 'success', message: 'Dokument erstellt' });
      onClose();
      navigate(`/documents/${doc.id}`);
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
    reloadForm(selectedOrder);
  }, [selectedOrder, reloadForm]);

  const netTotal = formData.positions
    .filter((p) => p.type === 'item')
    .reduce((s, p) => s + (p.netSum ?? 0), 0);
  const vatRate = getVatRate(
    formData.orderDate.value?.format('YYYY-MM-DD') ?? undefined,
  );
  const vatAmount = netTotal * vatRate;
  const grossTotal = netTotal + vatAmount;

  return (
    <Dialog open={isOpen} onClose={onCleanAndClose} maxWidth="xl" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <ReceiptIcon />
          Auftrag bearbeiten/erstellen
          <IconButton
            onClick={onCleanAndClose}
            sx={{ ml: 'auto' }}
            aria-label="Schließen"
          >
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      <DialogContent>
        {isOrderLoading && selectedOrderId ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <Grid container spacing={4} pt={1}>
            <Grid size={{ xs: 12, lg: 8 }}>
              {/* Daten card */}
              <Card elevation={2} sx={{ mb: 3 }}>
                <CardContent>
                  <Typography
                    variant="overline"
                    sx={{
                      color: 'text.secondary',
                      fontWeight: 600,
                      display: 'block',
                    }}
                  >
                    Daten
                  </Typography>
                  <Grid container spacing={3}>
                    <Grid size={{ xs: 12, md: 6 }}>
                      <TextField
                        fullWidth
                        label="Titel"
                        required
                        value={formData.title.value}
                        onChange={(e) =>
                          onFormInputChange('title', e.target.value)
                        }
                        error={!!formData.title.errorMessage}
                        helperText={formData.title.errorMessage}
                      />
                    </Grid>
                    {selectedOrderId != undefined && (
                      <Grid size={{ xs: 12, md: 3 }}>
                        <TextField
                          fullWidth
                          label="Auftrags-Nr"
                          value={selectedOrder?.orderNumber ?? ''}
                          slotProps={{ input: { readOnly: true } }}
                        />
                      </Grid>
                    )}
                    <Grid size={{ xs: 12, md: 3 }}>
                      <DatePicker
                        label="Auftragsdatum"
                        value={formData.orderDate.value}
                        onChange={(newValue) =>
                          onFormInputChange('orderDate', newValue)
                        }
                        slotProps={{
                          textField: {
                            fullWidth: true,
                            required: true,
                            error: !!formData.orderDate.errorMessage,
                            helperText: formData.orderDate.errorMessage,
                          },
                        }}
                      />
                    </Grid>
                    <Grid size={{ xs: 12, md: 3 }}>
                      <TextField
                        fullWidth
                        select
                        label="Status"
                        value={formData.status.value}
                        onChange={(e) =>
                          onFormInputChange('status', e.target.value)
                        }
                      >
                        <MenuItem value={ORDER_STATUS.IN_PROGRESS}>
                          In Arbeit
                        </MenuItem>
                        <MenuItem value={ORDER_STATUS.DONE}>Fertig</MenuItem>
                        <MenuItem value={ORDER_STATUS.CANCELLED}>
                          Abgebrochen
                        </MenuItem>
                      </TextField>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>

              {/* Info card */}
              <Card elevation={2} sx={{ mb: 3 }}>
                <CardContent>
                  <Typography
                    variant="overline"
                    sx={{
                      color: 'text.secondary',
                      fontWeight: 600,
                      display: 'block',
                    }}
                  >
                    Info
                  </Typography>
                  <Grid container spacing={3}>
                    <Grid size={{ xs: 12, md: 4 }}>
                      <DecimalTextField
                        id="kmStand"
                        label="km-Stand"
                        value={formData.kmStand.value}
                        onChange={(value) =>
                          onFormInputChange('kmStand', value)
                        }
                        error={formData.kmStand.errorMessage}
                      />
                    </Grid>
                    <Grid size={{ xs: 12, md: 4 }}>
                      <TextField
                        fullWidth
                        select
                        label="Zahlungsart"
                        value={formData.paymentMethod.value}
                        onChange={(e) =>
                          onFormInputChange('paymentMethod', e.target.value)
                        }
                      >
                        <MenuItem value="">–</MenuItem>
                        <MenuItem value={PAYMENT_METHOD.CASH}>Bar</MenuItem>
                        <MenuItem value={PAYMENT_METHOD.BANK_TRANSFER}>
                          Überweisung
                        </MenuItem>
                      </TextField>
                    </Grid>
                    <Grid size={{ xs: 12, md: 4 }}>
                      <DatePicker
                        label="Zahlungsziel"
                        value={formData.paymentDueDate.value}
                        onChange={(newValue) =>
                          onFormInputChange('paymentDueDate', newValue)
                        }
                        slotProps={{ textField: { fullWidth: true } }}
                      />
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>

              {/* Beschreibung card */}
              <Card elevation={2} sx={{ mb: 3 }}>
                <CardContent>
                  <Typography
                    variant="overline"
                    sx={{
                      color: 'text.secondary',
                      fontWeight: 600,
                      display: 'block',
                    }}
                  >
                    Beschreibung
                  </Typography>
                  <TextField
                    fullWidth
                    multiline
                    rows={4}
                    label="Beschreibung"
                    value={formData.description.value}
                    onChange={(e) =>
                      onFormInputChange('description', e.target.value)
                    }
                  />
                </CardContent>
              </Card>

              {/* Positionen card */}
              <Card elevation={2}>
                <CardContent>
                  <Typography
                    variant="overline"
                    sx={{
                      color: 'text.secondary',
                      fontWeight: 600,
                      display: 'block',
                    }}
                  >
                    Positionen
                  </Typography>
                  <OrderPositionsEditor
                    positions={formData.positions}
                    onAddHeading={addHeading}
                    onAddItem={addItem}
                    onUpdate={updatePosition}
                    onMove={movePosition}
                    onRemove={removePosition}
                  />
                  <Divider sx={{ mt: 2, mb: 1 }} />
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'flex-end',
                      gap: 3,
                      alignItems: 'baseline',
                    }}
                  >
                    <Typography variant="body2">
                      Netto: {formatNumber(netTotal, { currency: true })}
                    </Typography>
                    <Typography variant="body2">
                      MwSt ({Math.round(vatRate * 100)}%):{' '}
                      {formatNumber(vatAmount, { currency: true })}
                    </Typography>
                    <Typography variant="body1" fontWeight={600}>
                      Brutto: {formatNumber(grossTotal, { currency: true })}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid size={{ xs: 12, lg: 4 }}>
              {/* Fahrzeug card */}
              <Card elevation={2} sx={{ mb: 3 }}>
                <CardContent>
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                  >
                    <Typography
                      variant="overline"
                      sx={{ color: 'text.secondary', fontWeight: 600 }}
                    >
                      Fahrzeug
                    </Typography>
                    {formData.carId.value != null && (
                      <Tooltip title="In neuem Tab öffnen">
                        <IconButton
                          component="a"
                          href={`/cars/${formData.carId.value}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          size="small"
                          sx={{ color: 'action.active' }}
                        >
                          <OpenInNewIcon sx={{ fontSize: 16 }} />
                        </IconButton>
                      </Tooltip>
                    )}
                  </Box>
                  <CarAutocomplete
                    carId={formData.carId.value}
                    errorMessage={formData.carId.errorMessage}
                    onChange={(id) => onFormInputChange('carId', id)}
                  />
                </CardContent>
              </Card>

              {/* Kunde card */}
              <Card elevation={2} sx={{ mb: 3 }}>
                <CardContent>
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                  >
                    <Typography
                      variant="overline"
                      sx={{ color: 'text.secondary', fontWeight: 600 }}
                    >
                      Kunde
                    </Typography>
                    {formData.clientId.value != null && (
                      <Tooltip title="In neuem Tab öffnen">
                        <IconButton
                          component="a"
                          href={`/clients/${formData.clientId.value}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          size="small"
                          sx={{ color: 'action.active' }}
                        >
                          <OpenInNewIcon sx={{ fontSize: 16 }} />
                        </IconButton>
                      </Tooltip>
                    )}
                  </Box>
                  <ClientAutocomplete
                    clientId={formData.clientId.value}
                    errorMessage={formData.clientId.errorMessage}
                    onChange={(id) => onFormInputChange('clientId', id)}
                  />
                </CardContent>
              </Card>

              {/* Dokumente card — only when editing an existing order */}
              {selectedOrderId != undefined && (
                <OrderDocumentsCard orderId={selectedOrderId} />
              )}
            </Grid>
          </Grid>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onCleanAndClose}>Abbrechen</Button>
        {selectedOrderId != undefined && (
          <>
            <Button
              variant="outlined"
              size="small"
              onClick={() => saveAsDocumentMutation.mutate(DOCUMENT_TYPE.OFFER)}
              disabled={saveAsDocumentMutation.isPending}
              data-testid="button-order-save-as-offer"
            >
              Als Kostenvoranschlag speichern
            </Button>
            <Button
              variant="outlined"
              size="small"
              onClick={() =>
                saveAsDocumentMutation.mutate(DOCUMENT_TYPE.INVOICE)
              }
              disabled={saveAsDocumentMutation.isPending}
              data-testid="button-order-save-as-invoice"
            >
              Als Rechnung speichern
            </Button>
          </>
        )}
        <Button
          variant="contained"
          startIcon={
            mutation.isPending ? <CircularProgress size={20} /> : <SaveIcon />
          }
          onClick={() => mutation.mutate()}
          sx={{ flex: { xs: 1, sm: 'none' } }}
          data-testid="button-order-save"
        >
          Auftrag Speichern
        </Button>
      </DialogActions>
    </Dialog>
  );
}
