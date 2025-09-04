import {
  Save as SaveIcon,
  Visibility as VisibilityIcon,
} from '@mui/icons-material';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import Grid from '@mui/material/Grid';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';

export function CarDetailsPage() {
  return (
    <Grid
      container
      rowSpacing={1}
      columnSpacing={3}
      paddingX={4}
      paddingBottom={4}
      sx={{ '& .MuiGrid-root': { minWidth: '200px' } }}
    >
      <Grid size={12}>
        <Typography sx={{ mt: 1 }}>Allgemeines</Typography>
      </Grid>
      <Grid container size={12}>
        <Grid size={3}>
          <TextField fullWidth label="Kennzeichen" />
        </Grid>
        <Grid size={3}>
          <TextField fullWidth label="Hersteller" />
        </Grid>
        <Grid size={3}>
          <TextField fullWidth label="Modell" />
        </Grid>
        <Grid size={3}>
          <DatePicker label="Erstzulassung" />
        </Grid>
      </Grid>

      <Grid size={12}>
        <Divider sx={{ my: 2 }} />
        <Typography>Technisches</Typography>
      </Grid>

      <Grid container size={12}>
        <Grid size={4}>
          <TextField fullWidth label="Hubraum" />
        </Grid>
        <Grid size={4}>
          <TextField fullWidth label="Leistung" />
        </Grid>
        <Grid size={4}>
          <TextField fullWidth label="Reifen" />
        </Grid>
      </Grid>

      <Grid size={12}>
        <Divider sx={{ my: 2 }} />
      </Grid>

      <Grid container size={12}>
        <Grid container size={6} columns={6}>
          <Grid size={6}>
            <Typography>letzter Ölwechsel</Typography>
          </Grid>
          <Grid container size={6} columns={6}>
            <Grid size={3}>
              <TextField fullWidth label="Ölwechsel [km]" />
            </Grid>
            <Grid size={3}>
              <DatePicker label="Ölwechsel [Datum]" />
            </Grid>
          </Grid>
        </Grid>

        <Grid container size={6} columns={6}>
          <Grid size={6}>
            <Typography>letzter Zahnriemen</Typography>
          </Grid>
          <Grid container size={6} columns={6}>
            <Grid size={3}>
              <TextField fullWidth label="Zahnriemen [km]" />
            </Grid>
            <Grid size={3}>
              <DatePicker label="Zahnriemen [Datum]" />
            </Grid>
          </Grid>
        </Grid>
      </Grid>

      <Grid size={12}>
        <Divider sx={{ my: 2 }} />
        <Typography>nächster TÜV</Typography>
      </Grid>

      <Grid container size={12}>
        <Grid size={4}>
          <DatePicker label="TÜV [Datum]" />
        </Grid>
      </Grid>

      <Grid size={12}>
        <Divider sx={{ my: 2 }} />
        <Typography>Kommentar</Typography>
      </Grid>

      <Grid size={12}>
        <TextField fullWidth label="Kommentar" multiline rows={3} />
      </Grid>

      <Grid size={12} marginTop={4} justifyContent={'space-between'} container>
        <Button variant="contained" startIcon={<SaveIcon />}>
          Auto speichern
        </Button>
        <Button variant="outlined" startIcon={<VisibilityIcon />}>
          Autoübersicht anzeigen
        </Button>
      </Grid>
    </Grid>
  );
}
