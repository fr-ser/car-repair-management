import Box from '@mui/material/Box';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { DocumentsTable } from './components/DocumentsTable';

export default function DocumentListPage() {
  const [queryClient] = useState(() => new QueryClient());
  const navigate = useNavigate();

  const handleViewDocument = (documentId: number) => {
    navigate(`/documents/${documentId}`);
  };

  return (
    <Box>
      <QueryClientProvider client={queryClient}>
        <DocumentsTable handleViewDocument={handleViewDocument} />
      </QueryClientProvider>
    </Box>
  );
}
