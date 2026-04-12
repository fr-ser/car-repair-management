import {
  Delete as DeleteIcon,
  Description as DescriptionIcon,
  Download as DownloadIcon,
  Search as SearchIcon,
} from '@mui/icons-material';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import Checkbox from '@mui/material/Checkbox';
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
import { useEffect, useState } from 'react';

import useConfirmation from '@/src/hooks/confirmation/useConfirmation';
import useNotification from '@/src/hooks/notification/useNotification';
import useTableData from '@/src/hooks/useTableData';
import * as apiClient from '@/src/services/backend-service';
import { BackendDocument } from '@/src/types/backend-contracts';
import { DOCUMENT_TYPE } from '@/src/types/documents';
import { tableRowStyles } from '@/src/utils/tableStyles';

function documentTypeLabel(type: string) {
  if (type === DOCUMENT_TYPE.INVOICE) return 'Rechnung';
  if (type === DOCUMENT_TYPE.OFFER) return 'Kostenvoranschlag';
  return type;
}

type DocumentsTableProps = {
  handleViewDocument: (documentId: number) => void;
};

export function DocumentsTable({ handleViewDocument }: DocumentsTableProps) {
  const {
    items: documents,
    totalItems,
    isPending,
    page,
    rowsPerPage,
    searchTerm,
    refetch,
    handlers,
  } = useTableData<BackendDocument>('documents', (p, l, s) =>
    apiClient.fetchDocuments(p, l, s),
  );

  const { confirm } = useConfirmation();
  const { showNotification } = useNotification();
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());

  useEffect(() => {
    setSelectedIds(new Set());
  }, [page, searchTerm]);

  const allOnPageSelected =
    documents.length > 0 && documents.every((doc) => selectedIds.has(doc.id));
  const someOnPageSelected =
    documents.some((doc) => selectedIds.has(doc.id)) && !allOnPageSelected;

  function handleSelectAll() {
    if (allOnPageSelected) {
      const updated = new Set(selectedIds);
      documents.forEach((doc) => updated.delete(doc.id));
      setSelectedIds(updated);
    } else {
      const updated = new Set(selectedIds);
      documents.forEach((doc) => updated.add(doc.id));
      setSelectedIds(updated);
    }
  }

  function handleToggleSelect(id: number) {
    const updated = new Set(selectedIds);
    if (updated.has(id)) {
      updated.delete(id);
    } else {
      updated.add(id);
    }
    setSelectedIds(updated);
  }

  async function handleDeleteDocument(doc: BackendDocument) {
    const isConfirmed = await confirm({
      title: `Bestätigung - Dokument löschen - ${doc.documentNumber}`,
      message: `Möchten Sie das Dokument "${doc.documentNumber}" wirklich löschen? Diese Aktion kann nicht rückgängig gemacht werden.`,
    });
    if (!isConfirmed) return;

    await apiClient.deleteDocument(doc.id);
    showNotification({ message: 'Dokument wurde gelöscht' });
    await refetch();
  }

  async function handleDownloadSelected() {
    try {
      await apiClient.downloadDocumentsPdf([...selectedIds]);
    } catch {
      showNotification({
        message: 'PDF-Download fehlgeschlagen',
        level: 'error',
      });
    }
  }

  return (
    <Grid sx={{ xs: 12 }}>
      <Card elevation={2}>
        <CardHeader
          title={
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <DescriptionIcon />
              <Typography variant="h6" component="h3" sx={{ fontWeight: 500 }}>
                Dokumente
              </Typography>
            </Box>
          }
          sx={{ pb: 1 }}
        />
        <CardContent sx={{ pt: 0 }}>
          <Box sx={{ display: 'flex', gap: 2, mb: 2, alignItems: 'center' }}>
            <TextField
              fullWidth
              placeholder="Suche nach Dokumentennummer oder Kunde"
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
            />
            {selectedIds.size > 0 && (
              <Button
                variant="outlined"
                startIcon={<DownloadIcon />}
                onClick={handleDownloadSelected}
                sx={{ whiteSpace: 'nowrap' }}
              >
                PDF ({selectedIds.size})
              </Button>
            )}
          </Box>

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
                      <TableCell padding="checkbox">
                        <Checkbox
                          indeterminate={someOnPageSelected}
                          checked={allOnPageSelected}
                          onChange={handleSelectAll}
                        />
                      </TableCell>
                      <TableCell>Nummer</TableCell>
                      <TableCell
                        sx={{ display: { xs: 'none', sm: 'table-cell' } }}
                      >
                        Typ
                      </TableCell>
                      <TableCell>Datum</TableCell>
                      <TableCell
                        sx={{ display: { xs: 'none', md: 'table-cell' } }}
                      >
                        Kunde
                      </TableCell>
                      <TableCell
                        sx={{ display: { xs: 'none', md: 'table-cell' } }}
                      >
                        Fahrzeug
                      </TableCell>
                      <TableCell>{/* actions */}</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {documents.map((doc) => (
                      <TableRow
                        key={doc.id}
                        hover
                        style={{ cursor: 'pointer' }}
                        onClick={() => handleViewDocument(doc.id)}
                        data-testid={`document-row-${doc.id}`}
                        sx={tableRowStyles}
                      >
                        <TableCell padding="checkbox">
                          <Checkbox
                            checked={selectedIds.has(doc.id)}
                            onClick={(event) => event.stopPropagation()}
                            onChange={() => handleToggleSelect(doc.id)}
                          />
                        </TableCell>
                        <TableCell>{doc.documentNumber}</TableCell>
                        <TableCell
                          sx={{ display: { xs: 'none', sm: 'table-cell' } }}
                        >
                          {documentTypeLabel(doc.type)}
                        </TableCell>
                        <TableCell>{doc.documentDate}</TableCell>
                        <TableCell
                          sx={{ display: { xs: 'none', md: 'table-cell' } }}
                        >
                          {[
                            doc.clientCompany,
                            doc.clientFirstName,
                            doc.clientLastName,
                          ]
                            .filter(Boolean)
                            .join(' ')}
                        </TableCell>
                        <TableCell
                          sx={{ display: { xs: 'none', md: 'table-cell' } }}
                        >
                          {doc.carLicensePlate}
                        </TableCell>
                        <TableCell>
                          <IconButton
                            className="deleteButton"
                            edge="end"
                            size="small"
                            onClick={(event) => {
                              event.stopPropagation();
                              handleDeleteDocument(doc);
                            }}
                            color="error"
                            data-testid={`button-document-delete-${doc.id}`}
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
                sx={{
                  '& .MuiTablePagination-selectLabel': {
                    display: { xs: 'none', sm: 'block' },
                  },
                  '& .MuiInputBase-root': {
                    display: { xs: 'none', sm: 'flex' },
                  },
                }}
              />
            </Box>
          )}
        </CardContent>
      </Card>
    </Grid>
  );
}
