import React from 'react';
import { Chip } from '@mui/material';

const StatusChip = ({ status, variant = 'outlined' }) => {
  const getStatusColor = (status) => {
    const statusLower = status?.toLowerCase();
    
    if (statusLower === 'active' || statusLower === 'published' || statusLower === 'on') {
      return 'success';
    }
    if (statusLower === 'inactive' || statusLower === 'draft' || statusLower === 'off') {
      return 'default';
    }
    if (statusLower === 'scheduled') {
      return 'warning';
    }
    return 'default';
  };

  return (
    <Chip
      label={status || '-'}
      color={getStatusColor(status)}
      variant={variant}
      size="small"
    />
  );
};

export default StatusChip;

