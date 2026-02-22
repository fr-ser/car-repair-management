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
import { useQuery } from '@tanstack/react-query';
import * as React from 'react';

import useConfirmation from '@/src/hooks/confirmation/useConfirmation';
import useNotification from '@/src/hooks/notification/useNotification';
import useDebounce from '@/src/hooks/useDebounce';
import * as apiClient from '@/src/services/backend-service';
import { BackendArticle } from '@/src/types/backend-contracts';
import { formatNumber } from '@/src/utils/numbers';

type ArticlesTableProps = {
  handleEditArticle: (article: BackendArticle) => void;
  handleCreateArticle: () => void;
};

export default function ArticlesTable({
  handleCreateArticle,
  handleEditArticle,
}: ArticlesTableProps) {
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);
  const [articles, setArticles] = React.useState<BackendArticle[]>([]);
  const [totalItems, setTotalItems] = React.useState<number>(0);
  const [searchTerm, setSearchTerm] = React.useState('');

  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  const { confirm } = useConfirmation();
  const { showNotification } = useNotification();

  async function fetchData(
    _page: number = 0,
    _limit: number = 10,
    _search: string = '',
  ): Promise<BackendArticle[]> {
    try {
      const response = await apiClient.fetchArticles(_page, _limit, _search);
      const data = response.data;
      setArticles(data);
      setTotalItems(response.meta.totalItems);
      return data;
    } catch (err: unknown) {
      if (err instanceof Error) {
        showNotification({ message: err.message, level: 'error' });
      } else {
        showNotification({
          message: 'An unknown error occurred',
          level: 'error',
        });
      }
    }
    return [];
  }

  const queryResult = useQuery({
    queryKey: ['articles', page, rowsPerPage, debouncedSearchTerm],
    queryFn: () => fetchData(page, rowsPerPage, debouncedSearchTerm),
    placeholderData: [],
  });

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
    await fetchData(page, rowsPerPage, debouncedSearchTerm);
  }

  const handleChangePage = async (_: unknown, newPage: number) => {
    setPage(newPage);
    await fetchData(newPage, rowsPerPage, debouncedSearchTerm);
  };

  const handleChangeRowsPerPage = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    setRowsPerPage(+event.target.value);
    setPage(0);
    await fetchData(0, +event.target.value, debouncedSearchTerm);
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newSearchTerm = event.target.value;
    setSearchTerm(newSearchTerm);
  };

  React.useEffect(() => {
    if (debouncedSearchTerm !== searchTerm) {
      setPage(0);
    }
  }, [debouncedSearchTerm, searchTerm]);

  const styles = {
    tableRowStyles: {
      '& .deleteButton': {
        visibility: 'hidden',
      },
      '&:hover .deleteButton': {
        visibility: 'visible',
      },
    },
  };

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
            onChange={handleSearchChange}
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

          {queryResult.isPending ? (
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
                        sx={styles.tableRowStyles}
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
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
              />
            </Box>
          )}
        </CardContent>
      </Card>
    </Grid>
  );
}
