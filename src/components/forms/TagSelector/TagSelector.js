import React, { useState } from 'react';
import {
  Box,
  TextField,
  Chip,
  Stack,
  Autocomplete,
} from '@mui/material';

const TagSelector = ({
  label = 'Tags',
  value = [],
  onChange,
  options = [],
  error,
  helperText,
  freeSolo = true,
  ...props
}) => {
  return (
    <Box>
      <Autocomplete
        multiple
        freeSolo={freeSolo}
        options={options}
        value={value}
        onChange={(event, newValue) => {
          onChange?.(newValue);
        }}
        renderTags={(value, getTagProps) =>
          value.map((option, index) => (
            <Chip
              variant="outlined"
              label={option}
              {...getTagProps({ index })}
              key={index}
            />
          ))
        }
        renderInput={(params) => (
          <TextField
            {...params}
            label={label}
            error={!!error}
            helperText={error || helperText}
            variant="outlined"
            {...props}
          />
        )}
      />
    </Box>
  );
};

export default TagSelector;

