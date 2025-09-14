import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';
import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider } from '@mui/material/styles';
import 'dayjs/locale/de';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import {
  Navigate,
  RouterProvider,
  createBrowserRouter,
} from 'react-router-dom';

import { App } from './App.tsx';
import './globals.css';
import { ConfirmationProvider } from './hooks/confirmation/ConfirmationProvider.tsx';
import { NotificationProvider } from './hooks/notification/NotificationProvider.tsx';
import LoginPage from './pages/auth/LoginPage.tsx';
import { CarDetailsPage } from './pages/cars/CarDetailsPage.tsx';
import { ClientListPage } from './pages/clients/ClientListPage.tsx';
import theme from './theme.ts';

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      { index: true, element: <Navigate to="/documents" replace /> },
      { path: '/clients', element: <ClientListPage /> },
      { path: '/cars', element: <CarDetailsPage /> },
      { path: '/orders', element: <div>/orders</div> },
      { path: '/overview', element: <div>/overview</div> },
      { path: '/documents', element: <div>/documents</div> },
      { path: '/articles', element: <div>/articles</div> },
      { path: '/login', element: <LoginPage /> },
    ],
  },
]);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline enableColorScheme />
      <NotificationProvider>
        <ConfirmationProvider>
          <RouterProvider router={router} />
        </ConfirmationProvider>
      </NotificationProvider>
    </ThemeProvider>
  </StrictMode>,
);
