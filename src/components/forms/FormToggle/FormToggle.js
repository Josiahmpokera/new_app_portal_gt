import React from 'react';
import { FormControlLabel, Switch, FormHelperText, Box } from '@mui/material';

const FormToggle = ({
  label,
  name,
  checked,
  onChange,
  error,
  helperText,
  ...props
}) => {
  return (
    <Box>
      <FormControlLabel
        control={
          <Switch
            name={name}
            checked={checked}
            onChange={onChange}
            color="primary"
            {...props}
          />
        }
        label={label}
      />
      {error && (
        <FormHelperText error>{error}</FormHelperText>
      )}
      {helperText && !error && (
        <FormHelperText>{helperText}</FormHelperText>
      )}
    </Box>
  );
};

export default FormToggle;

