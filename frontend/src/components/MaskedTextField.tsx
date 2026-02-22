import FormControl from '@mui/material/FormControl';
import FormHelperText from '@mui/material/FormHelperText';
import InputLabel from '@mui/material/InputLabel';
import OutlinedInput from '@mui/material/OutlinedInput';
import * as React from 'react';

interface MaskedTextFieldProps {
  value: string;
  onChange: (value: string) => void;
  id: string;
  label: string;
  error?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  inputComponent: React.ComponentType<any>;
}

export default function MaskedTextField(props: MaskedTextFieldProps) {
  const { value, onChange, id, label, error, inputComponent } = props;

  return (
    <FormControl fullWidth error={!!error}>
      <InputLabel
        sx={{
          '&:not(.MuiInputLabel-shrink)': {
            top: '-6px',
          },
        }}
        htmlFor={id}
      >
        {label}
      </InputLabel>
      <OutlinedInput
        value={value}
        label={label}
        onChange={(e) => onChange(e.target.value)}
        id={id}
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        inputComponent={inputComponent as any}
      />
      {error && <FormHelperText>{error}</FormHelperText>}
    </FormControl>
  );
}
