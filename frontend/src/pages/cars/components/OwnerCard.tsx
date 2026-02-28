import {
  Close as CloseIcon,
  OpenInNew as OpenInNewIcon,
  Person as PersonIcon,
} from '@mui/icons-material';
import Autocomplete from '@mui/material/Autocomplete';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import CircularProgress from '@mui/material/CircularProgress';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Grid from '@mui/material/Grid';
import IconButton from '@mui/material/IconButton';
import TextField from '@mui/material/TextField';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import { useQuery } from '@tanstack/react-query';
import React from 'react';

import useDebounce from '@/src/hooks/useDebounce';
import * as apiService from '@/src/services/backend-service';
import { BackendClient } from '@/src/types/backend-contracts';
import { clientDisplayName, clientOptionLabel } from '@/src/utils/clients';

type OwnerCardProps = {
  clientId: number | null;
  onFormInputChange: (field: 'clientId', value: number | null) => void;
};

export default function OwnerCard({
  clientId,
  onFormInputChange,
}: OwnerCardProps) {
  const [assignDialogOpen, setAssignDialogOpen] = React.useState(false);
  const [search, setSearch] = React.useState('');
  const [selectedOption, setSelectedOption] =
    React.useState<BackendClient | null>(null);
  const debouncedSearch = useDebounce(search, 300);

  const { data: ownerData } = useQuery({
    queryKey: ['client', clientId],
    queryFn: () => apiService.fetchClient(clientId!),
    enabled: clientId != null,
  });

  const { data: clientsData, isLoading: isSearching } = useQuery({
    queryKey: ['clients', { search: debouncedSearch }],
    queryFn: () => apiService.fetchClients(0, 20, debouncedSearch),
    enabled: assignDialogOpen,
  });

  const handleAssign = () => {
    if (selectedOption) {
      onFormInputChange('clientId', selectedOption.id);
    }
    setAssignDialogOpen(false);
    setSearch('');
    setSelectedOption(null);
  };

  const handleRemove = () => {
    onFormInputChange('clientId', null);
  };

  const clientOptions = clientsData?.data ?? [];

  return (
    <Grid size={{ xs: 12, lg: 4 }}>
      <Card elevation={2} data-testid="owner-card">
        <CardHeader
          title={
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <PersonIcon />
              <Typography variant="h6" component="h3" sx={{ fontWeight: 500 }}>
                Eigentümer
              </Typography>
            </Box>
          }
          action={
            <Button
              variant="contained"
              color="secondary"
              startIcon={<PersonIcon />}
              size="small"
              onClick={() => setAssignDialogOpen(true)}
              data-testid="button-car-assign-owner"
            >
              Eigentümer zuordnen
            </Button>
          }
          sx={{ pb: 1 }}
        />
        <CardContent sx={{ pt: 0 }}>
          {clientId == null ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <PersonIcon
                sx={{ fontSize: 48, color: 'text.disabled', mb: 2 }}
              />
              <Typography variant="body2" color="text.secondary">
                Kein Eigentümer zugeordnet
              </Typography>
            </Box>
          ) : ownerData ? (
            <Box
              sx={{
                display: 'flex',
                alignItems: 'flex-start',
                justifyContent: 'space-between',
              }}
            >
              <Box>
                <Box
                  component="span"
                  sx={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 0.5,
                  }}
                >
                  <Typography variant="body1" fontWeight={500}>
                    {clientDisplayName(ownerData)}
                  </Typography>
                  <Tooltip title="In neuem Tab öffnen">
                    <IconButton
                      component="a"
                      href={`/clients/${ownerData.id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      size="small"
                      sx={{ p: 0.25, color: 'action.active' }}
                    >
                      <OpenInNewIcon sx={{ fontSize: 14 }} />
                    </IconButton>
                  </Tooltip>
                </Box>
                <Typography
                  variant="caption"
                  display="block"
                  color="text.secondary"
                >
                  {ownerData.clientNumber}
                </Typography>
                {ownerData.phoneNumber && (
                  <Typography
                    variant="caption"
                    display="block"
                    color="text.secondary"
                  >
                    {ownerData.phoneNumber}
                  </Typography>
                )}
              </Box>
              <IconButton
                size="small"
                onClick={handleRemove}
                color="error"
                title="Eigentümer entfernen"
              >
                <CloseIcon fontSize="small" />
              </IconButton>
            </Box>
          ) : (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
              <CircularProgress size={24} />
            </Box>
          )}
        </CardContent>
      </Card>

      <Dialog
        open={assignDialogOpen}
        onClose={() => setAssignDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Eigentümer zuordnen</DialogTitle>
        <DialogContent>
          <Autocomplete
            sx={{ mt: 2 }}
            options={clientOptions}
            getOptionLabel={(option) => clientOptionLabel(option)}
            loading={isSearching}
            value={selectedOption}
            onChange={(_, value) => setSelectedOption(value)}
            inputValue={search}
            onInputChange={(_, value) => setSearch(value)}
            filterOptions={(x) => x}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Kunde suchen"
                slotProps={{
                  htmlInput: {
                    ...params.inputProps,
                    'data-testid': 'owner-autocomplete',
                  },
                }}
              />
            )}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAssignDialogOpen(false)}>Abbrechen</Button>
          <Button
            variant="contained"
            onClick={handleAssign}
            disabled={!selectedOption}
            data-testid="button-owner-save"
          >
            Zuordnen
          </Button>
        </DialogActions>
      </Dialog>
    </Grid>
  );
}
