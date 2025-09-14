import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import OutlinedInput from '@mui/material/OutlinedInput';
import * as React from 'react';
import { IMaskInput } from 'react-imask';

import { DECIMAL_SEPARATOR, THOUSANDS_SEPARATOR } from '@/src/utils/numbers';

interface CustomProps {
  onChange: (event: { target: { value: string } }) => void;
}

const NumberInputMask = React.forwardRef<HTMLInputElement, CustomProps>(
  function NumberTextField(props, ref) {
    const { onChange, ...other } = props;
    return (
      <IMaskInput
        {...other}
        mask={Number}
        scale={5}
        thousandsSeparator={THOUSANDS_SEPARATOR}
        radix={DECIMAL_SEPARATOR}
        inputRef={ref}
        onAccept={(value) => onChange({ target: { value } })}
        overwrite
      />
    );
  },
);

interface DecimalTextFieldProps {
  value: string;
  onChange: (value: string) => void;
  id: string;
  label: string;
}

export default function DecimalTextField(props: DecimalTextFieldProps) {
  const { value, onChange, id, label } = props;

  return (
    <FormControl fullWidth>
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
        inputComponent={NumberInputMask as any}
      />
    </FormControl>
  );
}
