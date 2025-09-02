import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';
import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider } from '@mui/material/styles';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import {
  Navigate,
  RouterProvider,
  createBrowserRouter,
} from 'react-router-dom';

import { Layout } from './App.tsx';
import './globals.css';
import LoginPage from './pages/auth/LoginPage.tsx';
import { ClientDetailsPage } from './pages/clients/ClientDetailsPage.tsx';
import _OLD_ClientDetailsPage from './pages/clients/_OLD_ClientDetailsPage.tsx';
import theme from './theme.ts';

const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      { index: true, element: <Navigate to="/documents" replace /> },
      { path: '/clients', element: <ClientDetailsPage /> },
      { path: '/cars', element: <_OLD_ClientDetailsPage /> },
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
      <RouterProvider router={router} />
    </ThemeProvider>
  </StrictMode>,
);
