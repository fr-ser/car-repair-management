import {
  Delete as DeleteIcon,
  PersonAdd as PersonAddIcon,
  Person as PersonIcon,
} from '@mui/icons-material';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import CircularProgress from '@mui/material/CircularProgress';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import Grid from '@mui/material/Grid';
import IconButton from '@mui/material/IconButton';
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TablePagination from '@mui/material/TablePagination';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';
import { useQuery } from '@tanstack/react-query';
import * as React from 'react';

import * as apiClient from '@/src/services/backend-service';
import { BEClient } from '@/src/types/be-contracts';
import { GetClientsResponse } from '@/src/types/clients';

type ClientsTableProps = {
  setOpenClientModal: React.Dispatch<React.SetStateAction<boolean>>;
  setSelectedClient: React.Dispatch<React.SetStateAction<BEClient | null>>;
  setError: (message: string) => void;
};

export function ClientsTable({
  setOpenClientModal,
  setSelectedClient,
  setError,
}: ClientsTableProps) {
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);
  const [loading, setLoading] = React.useState(false);
  const [clients, setClients] = React.useState<BEClient[]>([]);
  const [totalItems, setTotalItems] = React.useState<number>(0);
  const [clientToBeDeleted, setClientToBeDeleted] = React.useState<
    number | null
  >(null);
  const [isOpenedDeleteClientDialog, setIsOpenedDeleteClientDialog] =
    React.useState(false);

  async function fetchData(
    _page: number = 0,
    _limit: number = 10,
  ): Promise<BEClient[]> {
    setLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 500));
    try {
      const response: GetClientsResponse = await apiClient.fetchClients(
        _page,
        _limit,
      );
      const data: BEClient[] = response.data;
      setClients(data);
      setTotalItems(response.meta.totalItems);
      return data;
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unknown error occurred');
      }
    } finally {
      setLoading(false);
    }
    return [];
  }

  useQuery({
    // to refetch on external change
    queryKey: ['clients', page, rowsPerPage], // cache key
    queryFn: () => fetchData(page, rowsPerPage),
    placeholderData: [],
  });

  async function handleDeleteClient() {
    // Implement delete client logic here
    try {
      if (clientToBeDeleted === null) {
        throw new Error('No client selected for deletion');
      }
      await apiClient.deleteClient(clientToBeDeleted);
      setIsOpenedDeleteClientDialog(false);
      setClientToBeDeleted(null);
      await fetchData(page, rowsPerPage);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unknown error occurred');
      }
    }
  }

  const handleChangePage = async (_: unknown, newPage: number) => {
    setPage(newPage);

    await fetchData(newPage, rowsPerPage);
  };

  const handleChangeRowsPerPage = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    setRowsPerPage(+event.target.value);
    setPage(0);
    console.log(+event.target.value);

    await fetchData(0, +event.target.value);
  };

  const handleRowClick = (row: BEClient) => {
    setSelectedClient(row);
    setOpenClientModal(true);
  };

  React.useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Grid sx={{ xs: 12, lg: 4 }}>
      <Card elevation={2}>
        <CardHeader
          title={
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <PersonIcon />
              <Typography
                variant="h6"
                component="h3"
                sx={{ fontWeight: 500, pr: 14 }}
              >
                Kunden
              </Typography>
            </Box>
          }
          action={
            <Button
              variant="contained"
              color="secondary"
              startIcon={<PersonAddIcon />}
              size="small"
              onClick={() => setOpenClientModal(true)}
              data-testid="button-client-create"
            >
              Kunde Zuordnen
            </Button>
          }
          sx={{ pb: 1 }}
        />
        <CardContent sx={{ pt: 0 }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '2rem' }}>
              <CircularProgress />
            </div>
          ) : clients.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <PersonIcon
                sx={{ fontSize: 48, color: 'text.disabled', mb: 2 }}
              />
              <Typography variant="body2" color="text.secondary">
                Noch keine Kunden zugeordnet
              </Typography>
              <Typography variant="caption" color="text.disabled">
                Klicken Sie auf "Kunde Zuordnen" um einen Kunden hinzuzufügen
              </Typography>
            </Box>
          ) : (
            <Box>
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Kunden Nummer</TableCell>
                      <TableCell>Vorname</TableCell>
                      <TableCell>Nachname</TableCell>
                      <TableCell>Email</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {clients.map((client) => (
                      <TableRow
                        key={client.id}
                        hover
                        style={{ cursor: 'pointer' }}
                        onClick={() => handleRowClick(client)}
                        data-testid={`client-row-${client.id}`}
                      >
                        <TableCell data-testid={`client-number-${client.id}`}>
                          {client.clientNumber}
                        </TableCell>
                        <TableCell
                          data-testid={`client-first-name-${client.id}`}
                        >
                          {client.firstName}
                        </TableCell>
                        <TableCell
                          data-testid={`client-last-name-${client.id}`}
                        >
                          {client.lastName}
                        </TableCell>
                        <TableCell data-testid={`client-email-${client.id}`}>
                          {client.email}
                        </TableCell>
                        <IconButton
                          edge="end"
                          size="small"
                          onClick={(event) => {
                            event.stopPropagation();
                            setIsOpenedDeleteClientDialog(true);
                            setClientToBeDeleted(client.id);
                          }}
                          color="error"
                          data-testid={`button-client-delete-${client.id}`}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
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
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
              />
            </Box>
          )}
        </CardContent>
      </Card>
      <Dialog
        open={isOpenedDeleteClientDialog}
        onClose={() => {
          setIsOpenedDeleteClientDialog(false);
          setClientToBeDeleted(null);
        }}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          {'Möchten Sie diesen Client wirklich löschen?'}
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Es wird unmöglich sein, es zurückzubringen!
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={handleDeleteClient}
            color="error"
            variant="outlined"
            data-testid="button-client-delete-confirm"
          >
            Löschen
          </Button>
          <Button
            onClick={() => {
              setIsOpenedDeleteClientDialog(false);
              setClientToBeDeleted(null);
            }}
            autoFocus
          >
            Abbrechen
          </Button>
        </DialogActions>
      </Dialog>
    </Grid>
  );
}
