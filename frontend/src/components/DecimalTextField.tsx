import * as React from 'react';
import { IMaskInput } from 'react-imask';

import { DECIMAL_SEPARATOR, THOUSANDS_SEPARATOR } from '@/src/utils/numbers';

import MaskedTextField from './MaskedTextField';

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
  error?: string;
}

export default function DecimalTextField(props: DecimalTextFieldProps) {
  const { value, onChange, id, label, error } = props;

  return (
    <MaskedTextField
      value={value}
      onChange={onChange}
      id={id}
      label={label}
      error={error}
      inputComponent={NumberInputMask}
    />
  );
}
