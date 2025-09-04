import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Paper from '@mui/material/Paper';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { Outlet } from 'react-router-dom';

import MenuBar from './components/MenuBar.tsx';

export function App() {
  return (
    <Box
      sx={{
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      <MenuBar />
      <Box sx={{ overflow: 'auto' }}>
        <Container maxWidth="lg">
          <Paper sx={{ borderRadius: 0, mb: 1 }}>
            <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="de">
              <Outlet />
            </LocalizationProvider>
          </Paper>
        </Container>
      </Box>
    </Box>
  );
}
