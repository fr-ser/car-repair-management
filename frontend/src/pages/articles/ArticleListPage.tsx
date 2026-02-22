import { Box } from '@mui/material';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import * as React from 'react';

import { BackendArticle } from '@/src/types/backend-contracts';

import ArticleDetailsModal from './components/ArticleDetailsModal';
import ArticlesTable from './components/ArticlesTable';

const queryClient = new QueryClient();

export default function ArticleListPage() {
  const [open, setOpen] = React.useState(false);
  const [selected, setSelected] = React.useState<BackendArticle | undefined>(
    undefined,
  );

  const handleClose = async () => {
    setOpen(false);
    setSelected(undefined);
  };

  const handleEditArticle = (article: BackendArticle) => {
    setSelected(article);
    setOpen(true);
  };

  const handleCreateArticle = () => {
    setSelected(undefined);
    setOpen(true);
  };

  return (
    <Box>
      <QueryClientProvider client={queryClient}>
        <ArticlesTable
          handleEditArticle={handleEditArticle}
          handleCreateArticle={handleCreateArticle}
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
