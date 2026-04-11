import {
  Article as ArticleIcon,
  Close as CloseIcon,
  Save as SaveIcon,
} from '@mui/icons-material';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CircularProgress from '@mui/material/CircularProgress';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Grid from '@mui/material/Grid';
import IconButton from '@mui/material/IconButton';
import TextField from '@mui/material/TextField';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import React from 'react';

import DecimalTextField from '@/src/components/DecimalTextField';
import useNotification from '@/src/hooks/notification/useNotification';
import { useArticleForm } from '@/src/pages/articles/useArticleForm.hook';
import * as apiService from '@/src/services/backend-service';
import { BackendArticle } from '@/src/types/backend-contracts';

type ArticleDetailsModalProps = {
  selectedArticle?: BackendArticle;
  isOpen: boolean;
  onClose: () => void;
};

export default function ArticleDetailsModal({
  selectedArticle,
  isOpen,
  onClose,
}: ArticleDetailsModalProps) {
  const { showNotification } = useNotification();

  const { formData, reloadForm, onFormInputChange, getPayload } =
    useArticleForm(selectedArticle);

  const queryClient = useQueryClient();

  async function handleSubmit() {
    if (selectedArticle !== undefined) {
      await apiService.updateArticle(selectedArticle.id, getPayload());
    } else {
      await apiService.createArticle(getPayload());
    }
  }

  const mutation = useMutation({
    mutationFn: handleSubmit,
    onSuccess: () => {
      showNotification({
        level: 'success',
        message:
          selectedArticle !== undefined
            ? 'Artikel aktualisiert'
            : 'Artikel erstellt',
      });
      onCleanAndClose();
      queryClient.invalidateQueries({ queryKey: ['articles'] });
    },
    onError: (error: unknown) => {
      showNotification({
        level: 'error',
        message:
          error instanceof Error ? error.message : 'Ein Fehler ist aufgetreten',
      });
    },
  });

  const onCleanAndClose = () => {
    reloadForm();
    onClose();
  };

  React.useEffect(() => {
    reloadForm(selectedArticle);
  }, [selectedArticle, reloadForm]);

  return (
    <Dialog open={isOpen} onClose={onCleanAndClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <ArticleIcon />
          Artikel bearbeiten/erstellen
          <IconButton
            onClick={onCleanAndClose}
            sx={{ ml: 'auto' }}
            aria-label="Schließen"
          >
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      <DialogContent>
        <Grid container spacing={4} pt={1}>
          <Grid size={{ xs: 12 }}>
            <Card elevation={2}>
              <CardContent>
                <Grid container spacing={3}>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      fullWidth
                      label="Artikel-Nr"
                      required
                      value={formData.id.value}
                      onChange={(e) => onFormInputChange('id', e.target.value)}
                      error={!!formData.id.errorMessage}
                      helperText={formData.id.errorMessage}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      fullWidth
                      label="Bezeichnung"
                      required
                      value={formData.description.value}
                      onChange={(e) =>
                        onFormInputChange('description', e.target.value)
                      }
                      error={!!formData.description.errorMessage}
                      helperText={formData.description.errorMessage}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <DecimalTextField
                      id="price"
                      label="Preis / Einheit"
                      value={formData.price.value}
                      onChange={(value) => onFormInputChange('price', value)}
                      error={formData.price.errorMessage}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <DecimalTextField
                      id="amount"
                      label="Menge"
                      value={formData.amount.value}
                      onChange={(value) => onFormInputChange('amount', value)}
                      error={formData.amount.errorMessage}
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onCleanAndClose}>Abbrechen</Button>
        <Button
          variant="contained"
          startIcon={
            mutation.isPending ? <CircularProgress size={24} /> : <SaveIcon />
          }
          size="large"
          onClick={() => mutation.mutate()}
          sx={{ flex: { xs: 1, sm: 'none' } }}
          data-testid="button-article-save"
        >
          Artikel Speichern
        </Button>
      </DialogActions>
    </Dialog>
  );
}
