import {
  OpenInNew as OpenInNewIcon,
  Search as SearchIcon,
} from '@mui/icons-material';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
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

import useTableData from '@/src/hooks/useTableData';
import * as apiClient from '@/src/services/backend-service';
import { BackendPendingOrder } from '@/src/types/backend-contracts';
import { clientOptionLabel } from '@/src/utils/clients';

export function PendingOrdersTable() {
  const {
    items: orders,
    totalItems,
    isPending,
    page,
    rowsPerPage,
    searchTerm,
    handlers,
  } = useTableData<BackendPendingOrder>('pending-orders', (p, l, s) =>
    apiClient.fetchPendingOrders(p, l, s),
  );

  return (
    <Grid sx={{ xs: 12 }}>
      <Card elevation={2}>
        <CardContent>
          <TextField
            fullWidth
            placeholder="Suche nach Kunde, Unternehmen, ID, Auftrag oder Kennzeichen"
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
                      <TableCell>Fahrzeug</TableCell>
                      <TableCell>Kunde/Unternehmen</TableCell>
                      <TableCell>Datum</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {orders.map((order) => (
                      <TableRow key={order.id}>
                        <TableCell>
                          <EntityLink href={`/orders/${order.id}`}>
                            {order.orderNumber}
                          </EntityLink>
                        </TableCell>
                        <TableCell>{order.title}</TableCell>
                        <TableCell>
                          <EntityLink href={`/cars/${order.carId}`}>
                            {[order.car.carNumber, order.car.licensePlate]
                              .filter(Boolean)
                              .join(' – ')}
                          </EntityLink>
                        </TableCell>
                        <TableCell>
                          <EntityLink href={`/clients/${order.clientId}`}>
                            {clientOptionLabel(order.client)}
                          </EntityLink>
                        </TableCell>
                        <TableCell>{order.orderDate}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
              <TablePagination
                rowsPerPageOptions={[10, 25, 100]}
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

function EntityLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <Box component="span" sx={{ display: 'inline-flex', alignItems: 'center' }}>
      {children}
      <Tooltip title="In neuem Tab öffnen">
        <IconButton
          component="a"
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          size="small"
          sx={{ p: 0.25, ml: 0.5, color: 'action.active' }}
        >
          <OpenInNewIcon sx={{ fontSize: 14 }} />
        </IconButton>
      </Tooltip>
    </Box>
  );
}
