import { Box } from '@mui/material';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import useModalState from '@/src/hooks/useModalState';
import { BackendArticle } from '@/src/types/backend-contracts';

import ArticleDetailsModal from './components/ArticleDetailsModal';
import ArticlesTable from './components/ArticlesTable';

const queryClient = new QueryClient();

export default function ArticleListPage() {
  const { open, selected, handleOpen, handleCreate, handleClose } =
    useModalState<BackendArticle>();

  return (
    <Box>
      <QueryClientProvider client={queryClient}>
        <ArticlesTable
          handleEditArticle={handleOpen}
          handleCreateArticle={handleCreate}
        />
        <ArticleDetailsModal
          selectedArticle={selected}
          isOpen={open}
          onClose={handleClose}
        />
      </QueryClientProvider>
    </Box>
  );
}
