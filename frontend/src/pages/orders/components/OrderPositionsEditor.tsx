import {
  ArrowDownward as ArrowDownwardIcon,
  ArrowUpward as ArrowUpwardIcon,
  Delete as DeleteIcon,
  Inventory as InventoryIcon,
} from '@mui/icons-material';
import Autocomplete from '@mui/material/Autocomplete';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import TextField from '@mui/material/TextField';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import { useQuery } from '@tanstack/react-query';
import React from 'react';

import DecimalTextField from '@/src/components/DecimalTextField';
import useDebounce from '@/src/hooks/useDebounce';
import * as apiService from '@/src/services/backend-service';
import { BackendArticle } from '@/src/types/backend-contracts';
import { PositionFormRow } from '@/src/types/orders';
import { formatNumber } from '@/src/utils/numbers';

type OrderPositionsEditorProps = {
  positions: PositionFormRow[];
  onAddHeading: () => void;
  onAddItem: () => void;
  onUpdate: (
    index: number,
    field: keyof PositionFormRow,
    value: string,
  ) => void;
  onMove: (index: number, direction: 'up' | 'down') => void;
  onRemove: (index: number) => void;
};

type ItemRowProps = {
  pos: PositionFormRow;
  index: number;
  onUpdate: (
    index: number,
    field: keyof PositionFormRow,
    value: string,
  ) => void;
  onMove: (index: number, direction: 'up' | 'down') => void;
  onRemove: (index: number) => void;
  isFirst: boolean;
  isLast: boolean;
};

function ItemRow({
  pos,
  index,
  onUpdate,
  onMove,
  onRemove,
  isFirst,
  isLast,
}: ItemRowProps) {
  const [articleSearch, setArticleSearch] = React.useState('');
  const [articleInputValue, setArticleInputValue] = React.useState(
    pos.articleId.value,
  );
  const [localSelectedArticle, setLocalSelectedArticle] =
    React.useState<BackendArticle | null>(null);
  const hasUserEdited = React.useRef(false);
  const debouncedSearch = useDebounce(articleSearch, 300);

  const { data: articlesData } = useQuery({
    queryKey: ['articles', { search: debouncedSearch }],
    queryFn: () => apiService.fetchArticles(0, 20, debouncedSearch),
  });

  const articleOptions = React.useMemo(
    () => articlesData?.data ?? [],
    [articlesData],
  );

  // Sync display value from form state until the user edits the field.
  // Upgrades a raw article ID to the full "id – description" label once options load.
  React.useEffect(() => {
    if (hasUserEdited.current || localSelectedArticle) return;
    if (!pos.articleId.value) {
      setArticleInputValue('');
      return;
    }
    const found = articleOptions.find((a) => a.id === pos.articleId.value);
    if (found) {
      setLocalSelectedArticle(found);
      setArticleInputValue(`${found.id} – ${found.description}`);
    } else {
      setArticleInputValue(pos.articleId.value);
    }
  }, [pos.articleId.value, articleOptions, localSelectedArticle]);

  const selectedArticle = pos.articleId.value
    ? (articleOptions.find((a) => a.id === pos.articleId.value) ??
      localSelectedArticle)
    : null;

  const handleArticleChange = (
    _: React.SyntheticEvent,
    value: BackendArticle | string | null,
  ) => {
    if (value && typeof value === 'object') {
      setLocalSelectedArticle(value);
      onUpdate(index, 'articleId', value.id);
      onUpdate(index, 'description', value.description);
      onUpdate(index, 'pricePerUnit', value.price.toString());
      setArticleInputValue(`${value.id} – ${value.description}`);
    } else if (typeof value === 'string') {
      setLocalSelectedArticle(null);
      onUpdate(index, 'articleId', value);
      setArticleInputValue(value);
    } else {
      setLocalSelectedArticle(null);
      onUpdate(index, 'articleId', '');
    }
  };

  return (
    <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-start', mb: 1 }}>
      <Box sx={{ display: 'flex', flexDirection: 'column' }}>
        <IconButton
          size="small"
          onClick={() => onMove(index, 'up')}
          disabled={isFirst}
        >
          <ArrowUpwardIcon fontSize="small" />
        </IconButton>
        <IconButton
          size="small"
          onClick={() => onMove(index, 'down')}
          disabled={isLast}
        >
          <ArrowDownwardIcon fontSize="small" />
        </IconButton>
      </Box>
      <Autocomplete
        freeSolo
        sx={{ minWidth: 180 }}
        options={articleOptions}
        getOptionLabel={(option) =>
          typeof option === 'string'
            ? option
            : `${option.id} – ${option.description}`
        }
        value={selectedArticle}
        onChange={handleArticleChange}
        inputValue={articleInputValue}
        onInputChange={(_, value, reason) => {
          setArticleInputValue(value);
          if (reason === 'input') {
            hasUserEdited.current = true;
            setArticleSearch(value);
            setLocalSelectedArticle(null);
          } else if (reason === 'clear') {
            setArticleSearch('');
            setLocalSelectedArticle(null);
            onUpdate(index, 'articleId', '');
          }
        }}
        filterOptions={(x) => x}
        renderInput={(params) => (
          <TextField
            {...params}
            label="Artikel"
            size="small"
            error={!!pos.articleId.errorMessage}
            helperText={pos.articleId.errorMessage}
            onBlur={() => {
              if (!localSelectedArticle) {
                onUpdate(index, 'articleId', articleInputValue);
              }
            }}
            slotProps={{
              htmlInput: {
                ...params.inputProps,
                'data-testid': `position-article-${index}`,
              },
              input: {
                ...params.InputProps,
                startAdornment: pos.articleId.value ? (
                  <InputAdornment position="start">
                    <Tooltip
                      title={
                        localSelectedArticle
                          ? 'Bestandsartikel'
                          : 'Kein Bestandsartikel'
                      }
                    >
                      <span style={{ display: 'flex' }}>
                        <InventoryIcon
                          fontSize="small"
                          color={localSelectedArticle ? 'success' : 'disabled'}
                        />
                      </span>
                    </Tooltip>
                  </InputAdornment>
                ) : undefined,
              },
            }}
          />
        )}
      />
      <TextField
        label="Beschreibung"
        size="small"
        value={pos.description.value}
        onChange={(e) => onUpdate(index, 'description', e.target.value)}
        error={!!pos.description.errorMessage}
        helperText={pos.description.errorMessage}
        sx={{ flex: 1 }}
        slotProps={{
          htmlInput: { 'data-testid': `position-description-${index}` },
        }}
      />
      <Box sx={{ width: 120 }}>
        <DecimalTextField
          id={`pricePerUnit-${index}`}
          label="Preis/Einheit"
          value={pos.pricePerUnit.value}
          onChange={(value) => onUpdate(index, 'pricePerUnit', value)}
          error={pos.pricePerUnit.errorMessage}
        />
      </Box>
      <Box sx={{ width: 100 }}>
        <DecimalTextField
          id={`amount-${index}`}
          label="Menge"
          value={pos.amount.value}
          onChange={(value) => onUpdate(index, 'amount', value)}
          error={pos.amount.errorMessage}
        />
      </Box>
      <Box sx={{ width: 100 }}>
        <DecimalTextField
          id={`discount-${index}`}
          label="Rabatt %"
          value={pos.discount.value}
          onChange={(value) => onUpdate(index, 'discount', value)}
          error={pos.discount.errorMessage}
        />
      </Box>
      <TextField
        label="Netto"
        size="small"
        value={
          pos.netSum != null ? formatNumber(pos.netSum, { currency: true }) : ''
        }
        disabled
        sx={{ width: 120 }}
      />
      <IconButton size="small" color="error" onClick={() => onRemove(index)}>
        <DeleteIcon fontSize="small" />
      </IconButton>
    </Box>
  );
}

type HeadingRowProps = {
  pos: PositionFormRow;
  index: number;
  onUpdate: (
    index: number,
    field: keyof PositionFormRow,
    value: string,
  ) => void;
  onMove: (index: number, direction: 'up' | 'down') => void;
  onRemove: (index: number) => void;
  isFirst: boolean;
  isLast: boolean;
};

function HeadingRow({
  pos,
  index,
  onUpdate,
  onMove,
  onRemove,
  isFirst,
  isLast,
}: HeadingRowProps) {
  return (
    <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', mb: 1 }}>
      <Box sx={{ display: 'flex', flexDirection: 'column' }}>
        <IconButton
          size="small"
          onClick={() => onMove(index, 'up')}
          disabled={isFirst}
        >
          <ArrowUpwardIcon fontSize="small" />
        </IconButton>
        <IconButton
          size="small"
          onClick={() => onMove(index, 'down')}
          disabled={isLast}
        >
          <ArrowDownwardIcon fontSize="small" />
        </IconButton>
      </Box>
      <Typography
        variant="caption"
        sx={{ minWidth: 80, color: 'text.secondary' }}
      >
        Überschrift
      </Typography>
      <TextField
        label="Text"
        size="small"
        fullWidth
        value={pos.text.value}
        onChange={(e) => onUpdate(index, 'text', e.target.value)}
        error={!!pos.text.errorMessage}
        helperText={pos.text.errorMessage}
        slotProps={{ htmlInput: { 'data-testid': `position-text-${index}` } }}
      />
      <IconButton size="small" color="error" onClick={() => onRemove(index)}>
        <DeleteIcon fontSize="small" />
      </IconButton>
    </Box>
  );
}

export default function OrderPositionsEditor({
  positions,
  onAddHeading,
  onAddItem,
  onUpdate,
  onMove,
  onRemove,
}: OrderPositionsEditorProps) {
  return (
    <Box>
      {positions.map((pos, index) =>
        pos.type === 'heading' ? (
          <HeadingRow
            key={index}
            pos={pos}
            index={index}
            onUpdate={onUpdate}
            onMove={onMove}
            onRemove={onRemove}
            isFirst={index === 0}
            isLast={index === positions.length - 1}
          />
        ) : (
          <ItemRow
            key={index}
            pos={pos}
            index={index}
            onUpdate={onUpdate}
            onMove={onMove}
            onRemove={onRemove}
            isFirst={index === 0}
            isLast={index === positions.length - 1}
          />
        ),
      )}
      <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
        <Button size="small" variant="outlined" onClick={onAddHeading}>
          Überschrift hinzufügen
        </Button>
        <Button size="small" variant="outlined" onClick={onAddItem}>
          Position hinzufügen
        </Button>
      </Box>
    </Box>
  );
}
