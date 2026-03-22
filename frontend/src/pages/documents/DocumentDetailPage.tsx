import {
  ArrowBack as ArrowBackIcon,
  Assignment as AssignmentIcon,
  PictureAsPdf as PictureAsPdfIcon,
  Receipt as ReceiptIcon,
} from '@mui/icons-material';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import CircularProgress from '@mui/material/CircularProgress';
import Typography from '@mui/material/Typography';
import {
  QueryClient,
  QueryClientProvider,
  useQuery,
} from '@tanstack/react-query';
import { useNavigate, useParams } from 'react-router-dom';

import * as apiService from '@/src/services/backend-service';
import { DOCUMENT_TYPE } from '@/src/types/documents';

import { DocumentView } from './components/DocumentView';

const queryClient = new QueryClient();

function DocumentDetailContent() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const documentId = Number(id);

  const {
    data: document,
    isPending,
    isError,
  } = useQuery({
    queryKey: ['document', documentId],
    queryFn: () => apiService.fetchDocument(documentId),
    enabled: !isNaN(documentId),
  });

  return (
    <Box>
      <Card elevation={2} sx={{ mb: 2 }}>
        <CardHeader
          title={
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <AssignmentIcon />
              <Typography variant="h6" component="h3" sx={{ fontWeight: 500 }}>
                {document
                  ? `${document.type === DOCUMENT_TYPE.INVOICE ? 'Rechnung' : 'Kostenvoranschlag'} ${document.documentNumber ?? ''}`
                  : 'Dokument'}
              </Typography>
            </Box>
          }
          action={
            <Box sx={{ display: 'flex', gap: 1 }}>
              {document && (
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<PictureAsPdfIcon />}
                  size="small"
                  onClick={() =>
                    apiService.downloadDocumentPdf(
                      document.id,
                      `${document.documentNumber ?? document.id}.pdf`,
                    )
                  }
                  data-testid="button-document-download-pdf"
                >
                  PDF herunterladen
                </Button>
              )}
              {document && (
                <Button
                  variant="contained"
                  color="secondary"
                  startIcon={<ReceiptIcon />}
                  size="small"
                  onClick={() => navigate(`/orders/${document.orderId}`)}
                  data-testid="button-document-go-to-order"
                >
                  Zum Auftrag
                </Button>
              )}
              <Button
                variant="contained"
                color="secondary"
                startIcon={<ArrowBackIcon />}
                size="small"
                onClick={() => navigate('/documents')}
                data-testid="button-document-back"
              >
                Zurück zur Liste
              </Button>
            </Box>
          }
        />
      </Card>

      {isPending && (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
          <CircularProgress />
        </Box>
      )}

      {isError && (
        <Typography color="error">
          Dokument konnte nicht geladen werden.
        </Typography>
      )}

      {document && (
        <Card elevation={2} sx={{ maxWidth: '210mm', mx: 'auto' }}>
          <DocumentView document={document} />
        </Card>
      )}
    </Box>
  );
}

export default function DocumentDetailPage() {
  return (
    <QueryClientProvider client={queryClient}>
      <DocumentDetailContent />
    </QueryClientProvider>
  );
}
