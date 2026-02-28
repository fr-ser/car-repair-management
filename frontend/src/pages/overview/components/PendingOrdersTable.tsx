import { Search as SearchIcon } from '@mui/icons-material';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import CircularProgress from '@mui/material/CircularProgress';
import Grid from '@mui/material/Grid';
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
import Typography from '@mui/material/Typography';

import useTableData from '@/src/hooks/useTableData';
import * as apiClient from '@/src/services/backend-service';
import { BackendPendingOrder } from '@/src/types/backend-contracts';
import { clientDisplayName } from '@/src/utils/clients';

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
        <CardHeader
          title={
            <Typography variant="h6" component="h3" sx={{ fontWeight: 500 }}>
              Offene Aufträge
            </Typography>
          }
          sx={{ pb: 1 }}
        />
        <CardContent sx={{ pt: 0 }}>
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
                      <TableCell>Kennzeichen</TableCell>
                      <TableCell>Fahrzeugnummer</TableCell>
                      <TableCell>Kunde/Unternehmen</TableCell>
                      <TableCell>Datum</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {orders.map((order) => (
                      <TableRow key={order.id}>
                        <TableCell>{order.orderNumber}</TableCell>
                        <TableCell>{order.title}</TableCell>
                        <TableCell>{order.car.licensePlate}</TableCell>
                        <TableCell>{order.car.carNumber}</TableCell>
                        <TableCell>{clientDisplayName(order.client)}</TableCell>
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
