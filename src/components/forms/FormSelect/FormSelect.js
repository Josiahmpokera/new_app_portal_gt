import React from 'react';
import { TextField, MenuItem } from '@mui/material';

const FormSelect = ({
  label,
  name,
  value,
  onChange,
  options = [],
  error,
  helperText,
  required = false,
  fullWidth = true,
  ...props
}) => {
  return (
    <TextField
      select
      label={label}
      name={name}
      value={value}
      onChange={onChange}
      error={!!error}
      helperText={error || helperText}
      required={required}
      fullWidth={fullWidth}
      variant="outlined"
      {...props}
    >
      {options.map((option) => (
        <MenuItem key={option.value} value={option.value}>
          {option.label}
        </MenuItem>
      ))}
    </TextField>
  );
};

export default FormSelect;

