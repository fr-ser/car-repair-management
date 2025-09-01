import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';
import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider } from '@mui/material/styles';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { RouterProvider, createBrowserRouter } from 'react-router-dom';

import MenuBar from './components/MenuBar.tsx';
import './globals.css';
import LoginPage from './pages/auth/LoginPage.tsx';
import RegisterPage from './pages/auth/RegisterPage.tsx';
import { ClientDetailsPage } from './pages/clients/ClientDetailsPage.tsx';
import _OLD_ClientDetailsPage from './pages/clients/_OLD_ClientDetailsPage.tsx';
import theme from './theme.ts';

const router = createBrowserRouter([
  {
    path: '/',
    element: <ClientDetailsPage />,
  },
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/register',
    element: <RegisterPage />,
  },
  {
    path: '/clients',
    element: <ClientDetailsPage />,
  },
  {
    path: '/cars',
    element: <_OLD_ClientDetailsPage />,
  },
  {
    path: '/orders',
    element: <MenuBar current={'/orders'} />,
  },
  {
    path: '/overview',
    element: <MenuBar current={'/overview'} />,
  },
  {
    path: '/documents',
    element: <MenuBar current={'/documents'} />,
  },
  {
    path: '/articles',
    element: <MenuBar current={'/articles'} />,
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
