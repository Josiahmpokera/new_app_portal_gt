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
import FormInput from '../../components/forms/FormInput';
import FormSelect from '../../components/forms/FormSelect';

const SubCategoryDialog = ({ open, onClose, onSave, subCategory = null, categories = [] }) => {
  const [formData, setFormData] = useState({
    name: '',
    parentCategory: '',
    status: 'active',
  });
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (subCategory) {
      setFormData({
        name: subCategory.name || '',
        parentCategory: subCategory.category_id || subCategory.parentCategory || '',
        status: subCategory.status || 'active',
      });
    } else {
      setFormData({
        name: '',
        parentCategory: '',
        status: 'active',
      });
    }
    setErrors({});
    setSubmitError('');
  }, [subCategory, open]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
    setSubmitError('');
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) {
      newErrors.name = 'Sub-category name is required';
    }
    if (!formData.parentCategory) {
      newErrors.parentCategory = 'Parent category is required';
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
      setSubmitError(err.message || 'Failed to save sub-category');
      if (err.errors) {
        setErrors(err.errors);
      }
    } finally {
      setLoading(false);
    }
  };

  const categoryOptions = categories.map((cat) => ({
    value: cat.id,
    label: cat.name,
  }));

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{subCategory ? 'Edit Sub-Category' : 'Create Sub-Category'}</DialogTitle>
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
                label="Sub-Category Name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                error={errors.name}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <FormSelect
                label="Parent Category"
                name="parentCategory"
                value={formData.parentCategory}
                onChange={handleChange}
                options={categoryOptions}
                error={errors.parentCategory || errors.category_id}
                required
              />
            </Grid>
            <Grid item xs={12}>
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
          {subCategory ? 'Update' : 'Create'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default SubCategoryDialog;

