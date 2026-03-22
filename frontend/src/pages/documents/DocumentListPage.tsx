import Box from '@mui/material/Box';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';

import { DocumentsTable } from './components/DocumentsTable';

const queryClient = new QueryClient();

export default function DocumentListPage() {
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
