// TODO: remove this component, it's still here only for demonstration purpose
import { Button } from '@mui/material';
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';

export default function _OLD_ClientDetailsPage() {
  return (
    <Box>
      <Stack direction="column" spacing={2} margin={'16px 0'}>
        <Typography
          variant="h5"
          align="center"
          sx={{
            color: 'text.primary',
            fontWeight: 'bold',
          }}
        >
          Name
        </Typography>
        <Stack
          direction="row"
          spacing={2}
          alignItems="center"
          justifyContent="space-around"
        >
          <TextField
            id="outlined-shrink"
            label="Vorname"
            variant="outlined"
            required={true}
          />
          <TextField
            id="outlined-shrink"
            label="Nachname"
            variant="outlined"
            required={true}
          />
          <TextField id="outlined-shrink" label="Firma" variant="outlined" />
        </Stack>
      </Stack>
      <Divider />
      <Stack direction="column" spacing={2} margin={'16px 0'}>
        <Typography
          variant="h5"
          align="center"
          sx={{
            color: 'text.primary',
            fontWeight: 'bold',
          }}
        >
          Addresse
        </Typography>
        <Stack
          direction="row"
          spacing={2}
          alignItems="center"
          justifyContent="space-around"
        >
          <TextField id="outlined-shrink" label="Straße" variant="outlined" />
          <TextField id="outlined-shrink" label="PLZ" variant="outlined" />
          <TextField id="outlined-shrink" label="Stadt" variant="outlined" />
        </Stack>
      </Stack>
      <Divider />
      <Stack direction="column" spacing={2} margin={'16px 0'}>
        <Typography
          variant="h5"
          align="center"
          sx={{
            color: 'text.primary',
            fontWeight: 'bold',
          }}
        >
          Kontaktdaten
        </Typography>
        <Stack
          direction="row"
          spacing={2}
          alignItems="center"
          justifyContent="space-around"
        >
          <TextField id="outlined-shrink" label="Festnetz" variant="outlined" />
          <TextField id="outlined-shrink" label="Mobil" variant="outlined" />
          <TextField id="outlined-shrink" label="E-Mail" variant="outlined" />
        </Stack>
      </Stack>
      <Divider />
      <Stack direction="column" spacing={2} margin={'16px 0'}>
        <Typography
          variant="h5"
          align="center"
          sx={{
            color: 'text.primary',
            fontWeight: 'bold',
          }}
        >
          Sonstiges
        </Typography>
        <Stack
          direction="row"
          spacing={2}
          alignItems={'flex-start'}
          justifyContent="space-around"
        >
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DatePicker label="Geburtstag" />
          </LocalizationProvider>
          <TextField
            id="outlined-shrink"
            label="Kommentar"
            variant="outlined"
            multiline
            rows={4}
            fullWidth={true}
          />
        </Stack>
      </Stack>
      <Divider />
      <Stack direction="column" spacing={2} margin={'16px 0'}>
        <Typography
          variant="h5"
          align="center"
          sx={{
            color: 'text.primary',
            fontWeight: 'bold',
          }}
        >
          Autos
        </Typography>
        <Stack
          direction="row"
          spacing={2}
          alignItems="center"
          justifyContent="space-around"
        >
          <Button variant="contained" color="primary">
            Auto zuordnen
          </Button>
        </Stack>
      </Stack>
      <Divider />
      <Stack
        direction="row"
        spacing={2}
        alignItems="center"
        justifyContent="space-between"
        margin={'16px 0'}
      >
        <Button variant="contained" color="primary">
          Kunden Speichern
        </Button>
        <Button variant="contained" color="primary">
          Kunden Anzeigen
        </Button>
      </Stack>
    </Box>
  );
}
