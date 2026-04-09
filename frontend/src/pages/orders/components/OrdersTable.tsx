import {
  AddBox as AddBoxIcon,
  Delete as DeleteIcon,
  OpenInNew as OpenInNewIcon,
  Receipt as ReceiptIcon,
  Search as SearchIcon,
} from '@mui/icons-material';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import Grid from '@mui/material/Grid';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TablePagination from '@mui/material/TablePagination';
import TableRow from '@mui/material/TableRow';
import TextField from '@mui/material/TextField';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import { useQuery } from '@tanstack/react-query';

import useConfirmation from '@/src/hooks/confirmation/useConfirmation';
import useNotification from '@/src/hooks/notification/useNotification';
import useTableData from '@/src/hooks/useTableData';
import * as apiClient from '@/src/services/backend-service';
import { BackendOrderWithPositions } from '@/src/types/backend-contracts';
import { ORDER_STATUS, OrderStatus } from '@/src/types/orders';
import { clientDisplayName, clientOptionLabel } from '@/src/utils/clients';

const ORDER_STATUS_LABEL: Record<OrderStatus, string> = {
  [ORDER_STATUS.IN_PROGRESS]: 'In Arbeit',
  [ORDER_STATUS.DONE]: 'Fertig',
  [ORDER_STATUS.CANCELLED]: 'Abgebrochen',
};

type OrdersTableProps = {
  handleEditOrder: (orderId: number) => void;
  handleCreateOrder: () => void;
  initialSearch?: string;
  clientId?: number;
  onClearClientFilter?: () => void;
  carId?: number;
  onClearCarFilter?: () => void;
};

const tableRowStyles = {
  '& .deleteButton': {
    visibility: 'hidden',
  },
  '&:hover .deleteButton': {
    visibility: 'visible',
  },
};

function statusColor(
  status: string,
): 'warning' | 'success' | 'error' | 'default' {
  if (status === ORDER_STATUS.DONE) return 'success';
  if (status === ORDER_STATUS.IN_PROGRESS) return 'warning';
  if (status === ORDER_STATUS.CANCELLED) return 'error';
  return 'default';
}

export default function OrdersTable({
  handleCreateOrder,
  handleEditOrder,
  initialSearch,
  clientId,
  onClearClientFilter,
  carId,
  onClearCarFilter,
}: OrdersTableProps) {
  const {
    items: orders,
    totalItems,
    isPending,
    page,
    rowsPerPage,
    searchTerm,
    refetch,
    handlers,
  } = useTableData<BackendOrderWithPositions>(
    'orders',
    (p, l, s) => apiClient.fetchOrders(p, l, s, clientId, carId),
    initialSearch,
  );

  const { data: clientData } = useQuery({
    queryKey: ['client', clientId],
    queryFn: () => apiClient.fetchClient(clientId!),
    enabled: clientId != null,
  });

  const { data: carData } = useQuery({
    queryKey: ['car', carId],
    queryFn: () => apiClient.fetchCar(carId!),
    enabled: carId != null,
  });

  const { confirm } = useConfirmation();
  const { showNotification } = useNotification();

  async function handleDeleteOrder(order: BackendOrderWithPositions) {
    const isConfirmed = await confirm({
      title: `Bestätigung - Auftrag löschen - ${order.title}`,
      message:
        `Möchten Sie den Auftrag "${order.title}" wirklich löschen? ` +
        'Diese Aktion kann nicht rückgängig gemacht werden.',
    });
    if (!isConfirmed) return;

    await apiClient.deleteOrder(order.id);
    showNotification({ message: 'Auftrag wurde gelöscht' });
    await refetch();
  }

  return (
    <Grid sx={{ xs: 12 }}>
      <Card elevation={2}>
        <CardHeader
          title={
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <ReceiptIcon />
              <Typography
                variant="h6"
                component="h3"
                sx={{ fontWeight: 500, pr: 14 }}
              >
                Aufträge
              </Typography>
            </Box>
          }
          action={
            <Button
              variant="contained"
              color="secondary"
              startIcon={<AddBoxIcon />}
              size="small"
              onClick={handleCreateOrder}
              data-testid="button-order-create"
            >
              Auftrag erstellen
            </Button>
          }
          sx={{ pb: 1 }}
        />
        <CardContent sx={{ pt: 0 }}>
          {(clientId || carId) && (
            <Box sx={{ mb: 1, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              {clientId && (
                <Chip
                  label={
                    clientData
                      ? `Kunde: ${clientDisplayName(clientData)}`
                      : 'Gefiltert nach Kunde'
                  }
                  onDelete={onClearClientFilter}
                  color="primary"
                  variant="outlined"
                  size="small"
                />
              )}
              {carId && (
                <Chip
                  label={
                    carData
                      ? `Fahrzeug: ${[carData.carNumber, carData.licensePlate].filter(Boolean).join(' – ')}`
                      : 'Gefiltert nach Fahrzeug'
                  }
                  onDelete={onClearCarFilter}
                  color="primary"
                  variant="outlined"
                  size="small"
                />
              )}
            </Box>
          )}
          <TextField
            fullWidth
            placeholder="Suche nach Auftrags-Nr oder Titel"
            value={searchTerm}
            onChange={handlers.onSearchChange}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              },
            }}
            sx={{ mb: 2 }}
          />

          {isPending ? (
            <div style={{ textAlign: 'center', padding: '2rem' }}>
              <CircularProgress />
            </div>
          ) : (
            <Box>
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Auftrags-Nr</TableCell>
                      <TableCell>Titel</TableCell>
                      <TableCell>Kennzeichen</TableCell>
                      <TableCell>Kunde</TableCell>
                      <TableCell>Datum</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>{/* actions */}</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {orders.map((order) => (
                      <TableRow
                        key={order.id}
                        hover
                        style={{ cursor: 'pointer' }}
                        onClick={() => handleEditOrder(order.id)}
                        data-testid={`order-row-${order.id}`}
                        sx={tableRowStyles}
                      >
                        <TableCell>{order.orderNumber}</TableCell>
                        <TableCell>{order.title}</TableCell>
                        <TableCell>
                          <Box
                            component="span"
                            sx={{
                              display: 'inline-flex',
                              alignItems: 'center',
                            }}
                          >
                            {[order.car.carNumber, order.car.licensePlate]
                              .filter(Boolean)
                              .join(' – ')}
                            <Tooltip title="In neuem Tab öffnen">
                              <IconButton
                                component="a"
                                href={`/cars/${order.carId}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                size="small"
                                sx={{
                                  p: 0.25,
                                  ml: 0.5,
                                  color: 'action.active',
                                }}
                                onClick={(e) => e.stopPropagation()}
                              >
                                <OpenInNewIcon sx={{ fontSize: 14 }} />
                              </IconButton>
                            </Tooltip>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Box
                            component="span"
                            sx={{
                              display: 'inline-flex',
                              alignItems: 'center',
                            }}
                          >
                            {clientOptionLabel(order.client)}
                            <Tooltip title="In neuem Tab öffnen">
                              <IconButton
                                component="a"
                                href={`/clients/${order.clientId}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                size="small"
                                sx={{
                                  p: 0.25,
                                  ml: 0.5,
                                  color: 'action.active',
                                }}
                                onClick={(e) => e.stopPropagation()}
                              >
                                <OpenInNewIcon sx={{ fontSize: 14 }} />
                              </IconButton>
                            </Tooltip>
                          </Box>
                        </TableCell>
                        <TableCell>{order.orderDate}</TableCell>
                        <TableCell>
                          <Chip
                            label={
                              ORDER_STATUS_LABEL[order.status as OrderStatus] ??
                              order.status
                            }
                            color={statusColor(order.status)}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          <IconButton
                            className="deleteButton"
                            edge="end"
                            size="small"
                            onClick={(event) => {
                              event.stopPropagation();
                              handleDeleteOrder(order);
                            }}
                            color="error"
                            data-testid={`button-order-delete-${order.id}`}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
              <TablePagination
                rowsPerPageOptions={[3, 10, 25, 100]}
                component="div"
                count={totalItems}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={handlers.onPageChange}
                onRowsPerPageChange={handlers.onRowsPerPageChange}
              />
            </Box>
          )}
        </CardContent>
      </Card>
    </Grid>
  );
}
