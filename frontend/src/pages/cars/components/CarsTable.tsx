import {
  AddBox as AddBoxIcon,
  DirectionsCar as CarIcon,
  Delete as DeleteIcon,
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
import { BackendCar } from '@/src/types/backend-contracts';

type CarsTableProps = {
  handleEditCar: (car: BackendCar) => void;
  handleCreateCar: () => void;
};

export function CarsTable({ handleCreateCar, handleEditCar }: CarsTableProps) {
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);
  const [cars, setCars] = React.useState<BackendCar[]>([]);
  const [totalItems, setTotalItems] = React.useState<number>(0);
  const [searchTerm, setSearchTerm] = React.useState('');

  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  const { confirm } = useConfirmation();
  const { showNotification } = useNotification();

  async function fetchData(
    _page: number = 0,
    _limit: number = 10,
    _search: string = '',
  ): Promise<BackendCar[]> {
    try {
      const response = await apiClient.fetchCars(_page, _limit, _search);
      const data = response.data;
      setCars(data);
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
    queryKey: ['cars', page, rowsPerPage, debouncedSearchTerm],
    queryFn: () => fetchData(page, rowsPerPage, debouncedSearchTerm),
    placeholderData: [],
  });

  async function handleDelete(car: BackendCar) {
    const carText = `${car.licensePlate} ${car.manufacturer}`;
    const isConfirmed = await confirm({
      title: `Bestätigung - Auto löschen - ${carText}`,
      message:
        `Möchten Sie das Auto "${carText}" wirklich löschen? ` +
        'Diese Aktion kann nicht rückgängig gemacht werden.',
    });
    if (!isConfirmed) return;

    await apiClient.deleteCar(car.id);
    showNotification({ message: `Auto wurde gelöscht` });
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
              <CarIcon />
              <Typography
                variant="h6"
                component="h3"
                sx={{ fontWeight: 500, pr: 14 }}
              >
                Autos
              </Typography>
            </Box>
          }
          action={
            <Button
              variant="contained"
              color="secondary"
              startIcon={<AddBoxIcon />}
              size="small"
              onClick={handleCreateCar}
              data-testid="button-car-create"
            >
              Auto erstellen
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
                      <TableCell>Autonummer</TableCell>
                      <TableCell>Kennzeichen</TableCell>
                      <TableCell>Hersteller</TableCell>
                      <TableCell>Modell</TableCell>
                      <TableCell>
                        {/* placeholder for actions, e.g. delete */}
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {cars.map((car) => (
                      <TableRow
                        key={car.id}
                        hover
                        style={{ cursor: 'pointer' }}
                        onClick={() => handleEditCar(car)}
                        data-testid={`car-row-${car.id}`}
                        sx={styles.tableRowStyles}
                      >
                        <TableCell data-testid={`car-number-${car.id}`}>
                          {car.carNumber}
                        </TableCell>
                        <TableCell data-testid={`car-license-plate-${car.id}`}>
                          {car.licensePlate}
                        </TableCell>
                        <TableCell data-testid={`car-manufacturer-${car.id}`}>
                          {car.manufacturer}
                        </TableCell>
                        <TableCell data-testid={`car-model-${car.id}`}>
                          {car.model}
                        </TableCell>
                        <TableCell>
                          <IconButton
                            className="deleteButton"
                            edge="end"
                            size="small"
                            onClick={(event) => {
                              event.stopPropagation();
                              handleDelete(car);
                            }}
                            color="error"
                            data-testid={`button-car-delete-${car.id}`}
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
