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
  Typography,
  Paper,
  IconButton,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import {
  CloudUpload as CloudUploadIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import FormInput from '../../components/forms/FormInput';
import FormSelect from '../../components/forms/FormSelect';

const VisuallyHiddenInput = styled('input')({
  clip: 'rect(0 0 0 0)',
  clipPath: 'inset(50%)',
  height: 1,
  overflow: 'hidden',
  position: 'absolute',
  bottom: 0,
  left: 0,
  whiteSpace: 'nowrap',
  width: 1,
});

const CategoryDialog = ({ open, onClose, onSave, category = null }) => {
  const [formData, setFormData] = useState({
    name: '',
    status: 'active',
    icon: null,
    banner_image: null,
  });
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (category) {
      setFormData({
        name: category.name || '',
        status: category.status || 'active',
        icon: category.icon_url || null,
        banner_image: category.banner_image_url || null,
      });
    } else {
      setFormData({
        name: '',
        status: 'active',
        icon: null,
        banner_image: null,
      });
    }
    setErrors({});
    setSubmitError('');
  }, [category, open]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
    setSubmitError('');
  };

  const handleIconChange = (event) => {
    const file = event.target.files?.[0];
    if (file) {
      setFormData((prev) => ({ ...prev, icon: file }));
    }
  };

  const handleBannerChange = (event) => {
    const file = event.target.files?.[0];
    if (file) {
      setFormData((prev) => ({ ...prev, banner_image: file }));
    }
  };

  const handleRemoveIcon = () => {
    setFormData((prev) => ({ ...prev, icon: null }));
  };

  const handleRemoveBanner = () => {
    setFormData((prev) => ({ ...prev, banner_image: null }));
  };

  const getPreviewUrl = (file) => {
    if (!file) return null;
    if (typeof file === 'string') return file; // URL string
    if (file instanceof File) return URL.createObjectURL(file);
    return null;
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) {
      newErrors.name = 'Category name is required';
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
      setSubmitError(err.message || 'Failed to save category');
      if (err.errors) {
        setErrors(err.errors);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>{category ? 'Edit Category' : 'Create Category'}</DialogTitle>
      <DialogContent>
        <Box sx={{ pt: 2 }}>
          {submitError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {submitError}
            </Alert>
          )}
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <FormInput
                label="Category Name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                error={errors.name}
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormSelect
                label="Status"
                name="status"
                value={formData.status}
                onChange={handleChange}
                options={[
                  { value: 'active', label: 'Active' },
                  { value: 'inactive', label: 'Inactive' },
                ]}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>
                Upload Icon
              </Typography>
              {getPreviewUrl(formData.icon) ? (
                <Paper
                  elevation={2}
                  sx={{
                    position: 'relative',
                    width: '100%',
                    maxWidth: 300,
                    height: 200,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    overflow: 'hidden',
                    mb: 2,
                  }}
                >
                  <img
                    src={getPreviewUrl(formData.icon)}
                    alt="Icon preview"
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                    }}
                  />
                  <IconButton
                    size="small"
                    onClick={handleRemoveIcon}
                    sx={{
                      position: 'absolute',
                      top: 8,
                      right: 8,
                      bgcolor: 'error.main',
                      color: 'white',
                      '&:hover': { bgcolor: 'error.dark' },
                    }}
                  >
                    <DeleteIcon />
                  </IconButton>
                </Paper>
              ) : null}
              <Button
                component="label"
                role={undefined}
                variant="contained"
                tabIndex={-1}
                startIcon={<CloudUploadIcon />}
                fullWidth
              >
                Upload Icon
                <VisuallyHiddenInput
                  type="file"
                  accept="image/*"
                  onChange={handleIconChange}
                />
              </Button>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>
                Upload Banner Image
              </Typography>
              {getPreviewUrl(formData.banner_image) ? (
                <Paper
                  elevation={2}
                  sx={{
                    position: 'relative',
                    width: '100%',
                    maxWidth: 300,
                    height: 200,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    overflow: 'hidden',
                    mb: 2,
                  }}
                >
                  <img
                    src={getPreviewUrl(formData.banner_image)}
                    alt="Banner preview"
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                    }}
                  />
                  <IconButton
                    size="small"
                    onClick={handleRemoveBanner}
                    sx={{
                      position: 'absolute',
                      top: 8,
                      right: 8,
                      bgcolor: 'error.main',
                      color: 'white',
                      '&:hover': { bgcolor: 'error.dark' },
                    }}
                  >
                    <DeleteIcon />
                  </IconButton>
                </Paper>
              ) : null}
              <Button
                component="label"
                role={undefined}
                variant="contained"
                tabIndex={-1}
                startIcon={<CloudUploadIcon />}
                fullWidth
              >
                Upload Banner Image
                <VisuallyHiddenInput
                  type="file"
                  accept="image/*"
                  onChange={handleBannerChange}
                />
              </Button>
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
          {category ? 'Update' : 'Create'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CategoryDialog;

