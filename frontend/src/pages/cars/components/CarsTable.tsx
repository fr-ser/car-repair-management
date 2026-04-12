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

import useConfirmation from '@/src/hooks/confirmation/useConfirmation';
import useNotification from '@/src/hooks/notification/useNotification';
import useTableData from '@/src/hooks/useTableData';
import * as apiClient from '@/src/services/backend-service';
import { BackendCar } from '@/src/types/backend-contracts';
import { tableRowStyles } from '@/src/utils/tableStyles';

type CarsTableProps = {
  handleEditCar: (carId: number) => void;
  handleCreateCar: () => void;
};

export default function CarsTable({
  handleCreateCar,
  handleEditCar,
}: CarsTableProps) {
  const {
    items: cars,
    totalItems,
    isPending,
    page,
    rowsPerPage,
    searchTerm,
    refetch,
    handlers,
  } = useTableData<BackendCar>('cars', (p, l, s) =>
    apiClient.fetchCars(p, l, s),
  );

  const { confirm } = useConfirmation();
  const { showNotification } = useNotification();

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
    await refetch();
  }

  return (
    <Grid sx={{ xs: 12, lg: 4 }}>
      <Card elevation={2}>
        <CardHeader
          title={
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <CarIcon />
              <Typography variant="h6" component="h3" sx={{ fontWeight: 500 }}>
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
              sx={{ width: { xs: '100%', sm: 'auto' } }}
            >
              Auto erstellen
            </Button>
          }
          sx={{
            pb: 1,
            flexWrap: { xs: 'wrap', sm: 'nowrap' },
            '& .MuiCardHeader-action': {
              width: { xs: '100%', sm: 'auto' },
              mt: { xs: 0, sm: '-4px' },
              mr: { xs: 0, sm: '-8px' },
              mb: { xs: 0.5, sm: '-4px' },
            },
          }}
        />
        <CardContent sx={{ pt: 0 }}>
          <TextField
            fullWidth
            placeholder="Suche nach Autonummer oder Kennzeichen"
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
                      <TableCell
                        sx={{ display: { xs: 'none', md: 'table-cell' } }}
                      >
                        Autonummer
                      </TableCell>
                      <TableCell>Kennzeichen</TableCell>
                      <TableCell
                        sx={{ display: { xs: 'none', sm: 'table-cell' } }}
                      >
                        Hersteller
                      </TableCell>
                      <TableCell
                        sx={{ display: { xs: 'none', sm: 'table-cell' } }}
                      >
                        Modell
                      </TableCell>
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
                        onClick={() => handleEditCar(car.id)}
                        data-testid={`car-row-${car.id}`}
                        sx={tableRowStyles}
                      >
                        <TableCell
                          data-testid={`car-number-${car.id}`}
                          sx={{ display: { xs: 'none', md: 'table-cell' } }}
                        >
                          {car.carNumber}
                        </TableCell>
                        <TableCell data-testid={`car-license-plate-${car.id}`}>
                          {car.licensePlate}
                        </TableCell>
                        <TableCell
                          data-testid={`car-manufacturer-${car.id}`}
                          sx={{ display: { xs: 'none', sm: 'table-cell' } }}
                        >
                          {car.manufacturer}
                        </TableCell>
                        <TableCell
                          data-testid={`car-model-${car.id}`}
                          sx={{ display: { xs: 'none', sm: 'table-cell' } }}
                        >
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
                onPageChange={handlers.onPageChange}
                onRowsPerPageChange={handlers.onRowsPerPageChange}
                sx={{
                  '& .MuiTablePagination-selectLabel': {
                    display: { xs: 'none', sm: 'block' },
                  },
                  '& .MuiInputBase-root': {
                    display: { xs: 'none', sm: 'flex' },
                  },
                }}
              />
            </Box>
          )}
        </CardContent>
      </Card>
    </Grid>
  );
}
