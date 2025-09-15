import {
  AddBox as AddBoxIcon,
  Delete as DeleteIcon,
  People as PeopleIcon,
  Search as SearchIcon,
} from '@mui/icons-material';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
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
import Typography from '@mui/material/Typography';
import { useQuery } from '@tanstack/react-query';
import * as React from 'react';

import { useConfirmation } from '@/src/hooks/confirmation/useConfirmation';
import { useNotification } from '@/src/hooks/notification/useNotification';
import { useDebounce } from '@/src/hooks/useDebounce';
import * as apiClient from '@/src/services/backend-service';
import { BackendClient } from '@/src/types/backend-contracts';

type ClientsTableProps = {
  handleEditClient: (client: BackendClient) => void;
  handleCreateClient: () => void;
};

export function ClientsTable({
  handleCreateClient,
  handleEditClient,
}: ClientsTableProps) {
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);
  const [clients, setClients] = React.useState<BackendClient[]>([]);
  const [totalItems, setTotalItems] = React.useState<number>(0);
  const [searchTerm, setSearchTerm] = React.useState('');

  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  const { confirm } = useConfirmation();
  const { showNotification } = useNotification();

  async function fetchData(
    _page: number = 0,
    _limit: number = 10,
    _search: string = '',
  ): Promise<BackendClient[]> {
    try {
      const response = await apiClient.fetchClients(_page, _limit, _search);
      const data = response.data;
      setClients(data);
      setTotalItems(response.meta.totalItems);
      return data;
    } catch (err: unknown) {
      if (err instanceof Error) {
        showNotification({ message: err.message, level: 'error' });
      } else {
        showNotification({
          message: 'An unknown error occurred',
          level: 'error',
        });
      }
    }
    return [];
  }

  const queryResult = useQuery({
    queryKey: ['clients', page, rowsPerPage, debouncedSearchTerm],
    queryFn: () => fetchData(page, rowsPerPage, debouncedSearchTerm),
    placeholderData: [],
  });

  async function handleDeleteClient(client: BackendClient) {
    const clientText = `${client.firstName ?? ''} ${client.lastName ?? ''} ${client.company ?? ''}`;
    const isConfirmed = await confirm({
      title: `Bestätigung - Kunden löschen - ${clientText}`,
      message:
        `Möchten Sie den Kunden "${clientText}" wirklich löschen? ` +
        'Diese Aktion kann nicht rückgängig gemacht werden.',
    });
    if (!isConfirmed) return;

    await apiClient.deleteClient(client.id);
    showNotification({ message: `Kunde wurde gelöscht` });
    await fetchData(page, rowsPerPage, debouncedSearchTerm);
  }

  const handleChangePage = async (_: unknown, newPage: number) => {
    setPage(newPage);
    await fetchData(newPage, rowsPerPage, debouncedSearchTerm);
  };

  const handleChangeRowsPerPage = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    setRowsPerPage(+event.target.value);
    setPage(0);
    await fetchData(0, +event.target.value, debouncedSearchTerm);
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newSearchTerm = event.target.value;
    setSearchTerm(newSearchTerm);
    // the page is reset on the debounced search term
  };

  React.useEffect(() => {
    if (debouncedSearchTerm !== searchTerm) {
      setPage(0);
    }
  }, [debouncedSearchTerm, searchTerm]);

  const styles = {
    tableRowStyles: {
      '& .deleteButton': {
        visibility: 'hidden',
      },
      '&:hover .deleteButton': {
        visibility: 'visible',
      },
    },
  };

  return (
    <Grid sx={{ xs: 12, lg: 4 }}>
      <Card elevation={2}>
        <CardHeader
          title={
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <PeopleIcon />
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
              startIcon={<AddBoxIcon />}
              size="small"
              onClick={handleCreateClient}
              data-testid="button-client-create"
            >
              Kunden erstellen
            </Button>
          }
          sx={{ pb: 1 }}
        />
        <CardContent sx={{ pt: 0 }}>
          <TextField
            fullWidth
            placeholder="Suche nach Autonummer oder Kennzeichen"
            value={searchTerm}
            onChange={handleSearchChange}
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

          {queryResult.isPending ? (
            <div style={{ textAlign: 'center', padding: '2rem' }}>
              <CircularProgress />
            </div>
          ) : (
            <Box>
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Kundennummer</TableCell>
                      <TableCell>Name</TableCell>
                      <TableCell>Firma</TableCell>
                      <TableCell>
                        {/* placeholder for actions, e.g. delete */}
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {clients.map((client) => (
                      <TableRow
                        key={client.id}
                        hover
                        style={{ cursor: 'pointer' }}
                        onClick={() => handleEditClient(client)}
                        data-testid={`client-row-${client.id}`}
                        sx={styles.tableRowStyles}
                      >
                        <TableCell data-testid={`client-number-${client.id}`}>
                          {client.clientNumber}
                        </TableCell>
                        <TableCell data-testid={`client-name-${client.id}`}>
                          {client.firstName}&nbsp;
                          {client.lastName}
                        </TableCell>
                        <TableCell data-testid={`client-company-${client.id}`}>
                          {client.company}
                        </TableCell>
                        <TableCell>
                          <IconButton
                            className="deleteButton"
                            edge="end"
                            size="small"
                            onClick={(event) => {
                              event.stopPropagation();
                              handleDeleteClient(client);
                            }}
                            color="error"
                            data-testid={`button-client-delete-${client.id}`}
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
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
              />
            </Box>
          )}
        </CardContent>
      </Card>
    </Grid>
  );
}
