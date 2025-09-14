import * as React from 'react';
import { IMaskInput } from 'react-imask';

import MaskedTextField from '@/src/components/MaskedTextField';

interface CustomProps {
  onChange: (event: { target: { value: string } }) => void;
}

const TireInputMask = React.forwardRef<HTMLInputElement, CustomProps>(
  function TireTextField(props, ref) {
    const { onChange, ...other } = props;

    return (
      <IMaskInput
        {...other}
        mask={'000/00 R00 000A'}
        definitions={{
          '0': /[0-9]/,
          A: /[A-Z]/,
        }}
        lazy={true}
        placeholder="265/60 R18 110H"
        inputRef={ref}
        onAccept={(value) => {
          onChange({ target: { value } });
        }}
      />
    );
  },
);

interface InputProps {
  value: string;
  onChange: (value: string) => void;
  id: string;
  label: string;
  error?: string;
}

export default function TireTextField(props: InputProps) {
  const { value, onChange, id, label, error } = props;

  return (
    <MaskedTextField
      value={value}
      onChange={onChange}
      id={id}
      label={label}
      error={error}
      inputComponent={TireInputMask}
    />
  );
}
