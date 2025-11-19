import React from 'react';
import { TextField } from '@mui/material';

const FormInput = ({
  label,
  name,
  value,
  onChange,
  error,
  helperText,
  type = 'text',
  required = false,
  fullWidth = true,
  multiline = false,
  rows = 1,
  ...props
}) => {
  return (
    <TextField
      label={label}
      name={name}
      value={value}
      onChange={onChange}
      error={!!error}
      helperText={error || helperText}
      type={type}
      required={required}
      fullWidth={fullWidth}
      multiline={multiline}
      rows={rows}
      variant="outlined"
      {...props}
    />
  );
};

export default FormInput;

