import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Grid,
  Alert,
  CircularProgress,
} from '@mui/material';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { addHours } from 'date-fns';
import FormInput from '../../components/forms/FormInput';
import FormToggle from '../../components/forms/FormToggle';

const FlashNewsDialog = ({ open, onClose, onSave, flashNews = null }) => {
  const [formData, setFormData] = useState({
    headline: '',
    expiryTime: addHours(new Date(), 24),
    status: false,
  });
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (flashNews) {
      setFormData({
        headline: flashNews.title || flashNews.headline || '',
        expiryTime: flashNews.expires_at ? new Date(flashNews.expires_at) : addHours(new Date(), 24),
        status: flashNews.status === 'on' || flashNews.status === true,
      });
    } else {
      setFormData({
        headline: '',
        expiryTime: addHours(new Date(), 24),
        status: false,
      });
    }
    setErrors({});
    setSubmitError('');
  }, [flashNews, open]);

  const handleChange = (e) => {
    const { name, value, checked, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
    setSubmitError('');
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.headline.trim()) {
      newErrors.headline = 'Headline is required';
    }
    if (!formData.expiryTime) {
      newErrors.expiryTime = 'Expiry time is required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;

    try {
      setLoading(true);
      setSubmitError('');
      await onSave(formData);
    } catch (err) {
      setSubmitError(err.message || 'Failed to save flash news');
      if (err.errors) {
        setErrors(err.errors);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
        <DialogTitle>{flashNews ? 'Edit Flash News' : 'Create Flash News'}</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            {submitError && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {submitError}
              </Alert>
            )}
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <FormInput
                  label="Flash Headline"
                  name="headline"
                  value={formData.headline}
                  onChange={handleChange}
                  error={errors.headline || errors.title}
                  required
                  multiline
                  rows={3}
                />
              </Grid>
              <Grid item xs={12}>
                <DateTimePicker
                  label="Expiry Time"
                  value={formData.expiryTime}
                  onChange={(date) =>
                    setFormData((prev) => ({ ...prev, expiryTime: date }))
                  }
                  minDateTime={new Date()}
                  slotProps={{
                    textField: {
                      error: !!errors.expiryTime || !!errors.expires_at,
                      helperText: errors.expiryTime || errors.expires_at,
                      fullWidth: true,
                    },
                  }}
                />
              </Grid>
              <Grid item xs={12}>
                <FormToggle
                  label="Status (ON/OFF)"
                  name="status"
                  checked={formData.status}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, status: e.target.checked }))
                  }
                />
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={handleSave} variant="contained" disabled={loading}>
            {loading ? (
              <CircularProgress size={20} sx={{ mr: 1 }} />
            ) : null}
            {flashNews ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </LocalizationProvider>
  );
};

export default FlashNewsDialog;

