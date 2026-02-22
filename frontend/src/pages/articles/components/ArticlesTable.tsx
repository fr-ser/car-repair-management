import {
  AddBox as AddBoxIcon,
  Article as ArticleIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
} from '@mui/icons-material';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import CircularProgress from '@mui/material/CircularProgress';
import Grid from '@mui/material/Grid';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TablePagination from '@mui/material/TablePagination';
import TableRow from '@mui/material/TableRow';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

import useConfirmation from '@/src/hooks/confirmation/useConfirmation';
import useNotification from '@/src/hooks/notification/useNotification';
import useTableData from '@/src/hooks/useTableData';
import * as apiClient from '@/src/services/backend-service';
import { BackendArticle } from '@/src/types/backend-contracts';
import { formatNumber } from '@/src/utils/numbers';

type ArticlesTableProps = {
  handleEditArticle: (article: BackendArticle) => void;
  handleCreateArticle: () => void;
};

const tableRowStyles = {
  '& .deleteButton': {
    visibility: 'hidden',
  },
  '&:hover .deleteButton': {
    visibility: 'visible',
  },
};

export default function ArticlesTable({
  handleCreateArticle,
  handleEditArticle,
}: ArticlesTableProps) {
  const {
    items: articles,
    totalItems,
    isPending,
    page,
    rowsPerPage,
    searchTerm,
    refetch,
    handlers,
  } = useTableData<BackendArticle>('articles', (p, l, s) =>
    apiClient.fetchArticles(p, l, s),
  );

  const { confirm } = useConfirmation();
  const { showNotification } = useNotification();

  async function handleDeleteArticle(article: BackendArticle) {
    const isConfirmed = await confirm({
      title: `Bestätigung - Artikel löschen - ${article.description}`,
      message:
        `Möchten Sie den Artikel "${article.description}" wirklich löschen? ` +
        'Diese Aktion kann nicht rückgängig gemacht werden.',
    });
    if (!isConfirmed) return;

    await apiClient.deleteArticle(article.id);
    showNotification({ message: `Artikel wurde gelöscht` });
    await refetch();
  }

  return (
    <Grid sx={{ xs: 12, lg: 4 }}>
      <Card elevation={2}>
        <CardHeader
          title={
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <ArticleIcon />
              <Typography
                variant="h6"
                component="h3"
                sx={{ fontWeight: 500, pr: 14 }}
              >
                Artikel
              </Typography>
            </Box>
          }
          action={
            <Button
              variant="contained"
              color="secondary"
              startIcon={<AddBoxIcon />}
              size="small"
              onClick={handleCreateArticle}
              data-testid="button-article-create"
            >
              Artikel erstellen
            </Button>
          }
          sx={{ pb: 1 }}
        />
        <CardContent sx={{ pt: 0 }}>
          <TextField
            fullWidth
            placeholder="Suche nach Artikel-Nr oder Bezeichnung"
            value={searchTerm}
            onChange={handlers.onSearchChange}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              },
            }}
            sx={{ mb: 2 }}
          />

          {isPending ? (
            <div style={{ textAlign: 'center', padding: '2rem' }}>
              <CircularProgress />
            </div>
          ) : (
            <Box>
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Artikel-Nr</TableCell>
                      <TableCell>Bezeichnung</TableCell>
                      <TableCell>Preis / Einheit</TableCell>
                      <TableCell>Menge</TableCell>
                      <TableCell>
                        {/* placeholder for actions, e.g. delete */}
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {articles.map((article) => (
                      <TableRow
                        key={article.id}
                        hover
                        style={{ cursor: 'pointer' }}
                        onClick={() => handleEditArticle(article)}
                        data-testid={`article-row-${article.id}`}
                        sx={tableRowStyles}
                      >
                        <TableCell data-testid={`article-id-${article.id}`}>
                          {article.id}
                        </TableCell>
                        <TableCell
                          data-testid={`article-description-${article.id}`}
                        >
                          {article.description}
                        </TableCell>
                        <TableCell>
                          {formatNumber(Number(article.price), {
                            currency: true,
                          })}
                        </TableCell>
                        <TableCell>
                          {article.amount != null
                            ? formatNumber(Number(article.amount))
                            : '–'}
                        </TableCell>
                        <TableCell>
                          <IconButton
                            className="deleteButton"
                            edge="end"
                            size="small"
                            onClick={(event) => {
                              event.stopPropagation();
                              handleDeleteArticle(article);
                            }}
                            color="error"
                            data-testid={`button-article-delete-${article.id}`}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
              <TablePagination
                rowsPerPageOptions={[3, 10, 25, 100]}
                component="div"
                count={totalItems}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={handlers.onPageChange}
                onRowsPerPageChange={handlers.onRowsPerPageChange}
              />
            </Box>
          )}
        </CardContent>
      </Card>
    </Grid>
  );
}
