import Box from '@mui/material/Box';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';

import { PendingOrdersTable } from './components/PendingOrdersTable';

const queryClient = new QueryClient();

export default function OverviewPage() {
  const [selectedReport, setSelectedReport] = useState('pending-orders');

  return (
    <Box>
      <QueryClientProvider client={queryClient}>
        <Tabs
          value={selectedReport}
          onChange={(_e, value: string) => setSelectedReport(value)}
          sx={{ mb: 2 }}
        >
          <Tab label="Offene Aufträge" value="pending-orders" />
        </Tabs>
        {selectedReport === 'pending-orders' && <PendingOrdersTable />}
      </QueryClientProvider>
    </Box>
  );
}
