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

import App from './App.tsx';
import './globals.css';
import { ConfirmationProvider } from './hooks/confirmation/ConfirmationProvider.tsx';
import { NotificationProvider } from './hooks/notification/NotificationProvider.tsx';
import ArticleListPage from './pages/articles/ArticleListPage.tsx';
import LoginPage from './pages/auth/LoginPage.tsx';
import CarListPage from './pages/cars/CarListPage.tsx';
import ClientListPage from './pages/clients/ClientListPage.tsx';
import OrderListPage from './pages/orders/OrderListPage.tsx';
import OverviewPage from './pages/overview/OverviewPage.tsx';
import theme from './theme.ts';

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      { index: true, element: <Navigate to="/documents" replace /> },
      { path: '/clients', element: <ClientListPage /> },
      { path: '/clients/:id', element: <ClientListPage /> },
      { path: '/cars', element: <CarListPage /> },
      { path: '/cars/:id', element: <CarListPage /> },
      { path: '/orders', element: <OrderListPage /> },
      { path: '/orders/:id', element: <OrderListPage /> },
      { path: '/overview', element: <OverviewPage /> },
      { path: '/documents', element: <div>/documents</div> },
      { path: '/articles', element: <ArticleListPage /> },
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
