import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  Button,
  Alert,
  CircularProgress,
} from '@mui/material';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import FormInput from '../../components/forms/FormInput';
import FormSelect from '../../components/forms/FormSelect';
import FormToggle from '../../components/forms/FormToggle';
import ImageUploader from '../../components/forms/ImageUploader';
import RichTextEditor from '../../components/forms/RichTextEditor';
import TagSelector from '../../components/forms/TagSelector';
import { api } from '../../utils/api';

const NewsForm = ({ news = null, categories: propCategories = [], subCategories: propSubCategories = [], onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    title: '',
    shortDescription: '',
    fullDescription: '',
    category: '',
    subCategory: '',
    tags: [],
    thumbnail: null,
    gallery: [],
    publishStatus: 'draft',
    scheduledPublishDate: null,
    authorName: '',
    newsType: 'normal',
    seoTitle: '',
    seoDescription: '',
    seoKeywords: '',
  });
  const [errors, setErrors] = useState({});
  const [categories, setCategories] = useState([]);
  const [availableSubCategories, setAvailableSubCategories] = useState([]);
  const [submitError, setSubmitError] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingSubCategories, setLoadingSubCategories] = useState(false);

  // Fetch categories on mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await api.categories.dropdown();
        if (response.success) {
          setCategories(response.data || []);
        }
      } catch (err) {
        console.error('Error fetching categories:', err);
        // Fallback to prop categories if API fails
        if (propCategories.length > 0) {
          setCategories(propCategories);
        }
      }
    };
    fetchCategories();
  }, []);

  // Fetch sub-categories when category changes
  useEffect(() => {
    const fetchSubCategories = async () => {
      if (formData.category) {
        try {
          setLoadingSubCategories(true);
          const response = await api.subCategories.byCategory(parseInt(formData.category));
          if (response.success) {
            const subCats = response.data || [];
            setAvailableSubCategories(subCats);
            // Clear sub-category if it's not in the new list
            if (formData.subCategory && !subCats.find((sub) => sub.id === parseInt(formData.subCategory))) {
              setFormData((prev) => ({ ...prev, subCategory: '' }));
            }
          }
        } catch (err) {
          console.error('Error fetching sub-categories:', err);
          setAvailableSubCategories([]);
        } finally {
          setLoadingSubCategories(false);
        }
      } else {
        setAvailableSubCategories([]);
        setFormData((prev) => ({ ...prev, subCategory: '' }));
      }
    };
    fetchSubCategories();
  }, [formData.category]);

  useEffect(() => {
    if (news) {
      const categoryId = news.category_id?.toString() || news.category?.toString() || '';
      const subCategoryId = news.sub_category_id?.toString() || news.sub_category?.id?.toString() || news.subCategory?.toString() || '';
      
      setFormData({
        title: news.title || '',
        shortDescription: news.short_description || news.shortDescription || '',
        fullDescription: news.full_description || news.fullDescription || '',
        category: categoryId,
        subCategory: subCategoryId,
        tags: news.tags?.map(t => typeof t === 'object' ? t.tag : t) || [],
        thumbnail: news.thumbnail_image_url || news.thumbnail || null,
        gallery: news.gallery_images_urls || news.gallery_images || news.gallery || [],
        publishStatus: news.publish_status || news.publishStatus || 'draft',
        scheduledPublishDate: news.published_at ? new Date(news.published_at) : (news.scheduledPublishDate ? new Date(news.scheduledPublishDate) : null),
        authorName: news.author_name || news.authorName || '',
        newsType: news.news_type || news.newsType || 'normal',
        seoTitle: news.seo_title || news.seoTitle || '',
        seoDescription: news.seo_description || news.seoDescription || '',
        seoKeywords: news.seo_keywords || news.seoKeywords || '',
      });
      
      // If category is set, fetch sub-categories
      if (categoryId) {
        api.subCategories.byCategory(parseInt(categoryId))
          .then((response) => {
            if (response.success) {
              setAvailableSubCategories(response.data || []);
            }
          })
          .catch((err) => {
            console.error('Error fetching sub-categories:', err);
          });
      }
    }
    setErrors({});
  }, [news]);

  const handleChange = (e) => {
    const { name, value, checked, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
    if (submitError) {
      setSubmitError('');
    }
  };

  const handleRichTextChange = (value) => {
    setFormData((prev) => ({ ...prev, fullDescription: value }));
  };

  // Helper function to extract plain text from HTML
  const stripHtml = (html) => {
    if (!html) return '';
    const tmp = document.createElement('DIV');
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || '';
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }
    if (!formData.shortDescription.trim()) {
      newErrors.shortDescription = 'Short description is required';
    }
    const fullDescText = stripHtml(formData.fullDescription || '');
    if (!fullDescText.trim() || fullDescText.trim() === '') {
      newErrors.fullDescription = 'Full description is required';
    }
    if (!formData.category) {
      newErrors.category = 'Category is required';
    }
    if (!formData.subCategory) {
      newErrors.subCategory = 'Sub-category is required';
    }
    if (!news && (!formData.thumbnail || typeof formData.thumbnail === 'string')) {
      // Thumbnail is required for new news (must be a File object)
      newErrors.thumbnail = 'Thumbnail image is required';
    }
    if (formData.publishStatus === 'scheduled' && !formData.scheduledPublishDate) {
      newErrors.scheduledPublishDate = 'Scheduled publish date is required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    try {
      setLoading(true);
      setSubmitError('');
      await onSave(formData);
    } catch (err) {
      setSubmitError(err.message || 'Failed to save news');
      if (err.errors) {
        setErrors(err.errors);
      }
    } finally {
      setLoading(false);
    }
  };

  const categoryOptions = categories.map((cat) => ({
    value: cat.id.toString(),
    label: cat.name || cat.value,
  }));

  const subCategoryOptions = availableSubCategories.map((sub) => ({
    value: sub.id.toString(),
    label: sub.name || sub.value,
  }));

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box>
        {submitError && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {submitError}
          </Alert>
        )}
        <Paper variant="outlined" sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 700, mb: 3, color: '#1a1a1a' }}>
            Basic Info
          </Typography>
          <Grid container spacing={2.5}>
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', gap: 2.5, flexWrap: { xs: 'wrap', md: 'nowrap' } }}>
                <Box sx={{ flex: '0 0 30%', minWidth: 0 }}>
                  <FormInput
                    label="Title"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    error={errors.title}
                    required
                    size="small"
                    fullWidth
                  />
                </Box>
                <Box sx={{ flex: '0 0 60%', minWidth: 0 }}>
                  <FormInput
                    label="Short Description"
                    name="shortDescription"
                    value={formData.shortDescription}
                    onChange={handleChange}
                    error={errors.shortDescription}
                    required
                    size="small"
                    fullWidth
                  />
                </Box>
              </Box>
            </Grid>
            <Grid item xs={12}>
              <Typography variant="body2" sx={{ mb: 1.5, fontWeight: 500, color: '#666' }}>
                Full Description *
              </Typography>
              <RichTextEditor
                value={formData.fullDescription}
                onChange={handleRichTextChange}
                error={errors.fullDescription}
              />
            </Grid>
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', gap: 2.5, flexWrap: { xs: 'wrap', md: 'nowrap' } }}>
                <Box sx={{ flex: '0 0 30%', minWidth: 0 }}>
                  <FormSelect
                    label="Category"
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    options={categoryOptions}
                    error={errors.category}
                    required
                    size="small"
                    fullWidth
                  />
                </Box>
                <Box sx={{ flex: '0 0 30%', minWidth: 0 }}>
                  <FormSelect
                    label="Sub-Category"
                    name="subCategory"
                    value={formData.subCategory}
                    onChange={handleChange}
                    options={subCategoryOptions}
                    error={errors.subCategory}
                    required
                    disabled={!formData.category || loadingSubCategories}
                    size="small"
                    helperText={loadingSubCategories ? 'Loading sub-categories...' : ''}
                    fullWidth
                  />
                </Box>
                <Box sx={{ flex: '0 0 30%', minWidth: 0 }}>
                  <TagSelector
                    label="Tags"
                    value={formData.tags}
                    onChange={(tags) => setFormData((prev) => ({ ...prev, tags }))}
                  />
                </Box>
              </Box>
            </Grid>
          </Grid>
        </Paper>

        <Paper variant="outlined" sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 700, mb: 3, color: '#1a1a1a' }}>
            Images
          </Typography>
          <Grid container spacing={2.5}>
            <Grid item xs={12} md={6}>
              <ImageUploader
                label="Thumbnail"
                value={formData.thumbnail}
                onChange={(file) => {
                  setFormData((prev) => ({ ...prev, thumbnail: file }));
                  if (errors.thumbnail) {
                    setErrors((prev) => ({ ...prev, thumbnail: '' }));
                  }
                }}
                error={errors.thumbnail}
                helperText={errors.thumbnail}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <ImageUploader
                label="Gallery Images"
                value={formData.gallery}
                onChange={(files) => setFormData((prev) => ({ ...prev, gallery: files }))}
                multiple
              />
            </Grid>
          </Grid>
        </Paper>

        <Paper variant="outlined" sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 700, mb: 3, color: '#1a1a1a' }}>
            Publishing
          </Typography>
          <Grid container spacing={2.5}>
            <Grid item xs={12} md={6}>
              <FormSelect
                label="Publish Status"
                name="publishStatus"
                value={formData.publishStatus}
                onChange={handleChange}
                options={[
                  { value: 'draft', label: 'Draft' },
                  { value: 'published', label: 'Published' },
                  { value: 'scheduled', label: 'Scheduled' },
                ]}
                size="small"
              />
            </Grid>
            {formData.publishStatus === 'scheduled' && (
              <Grid item xs={12} md={6}>
                <DateTimePicker
                  label="Scheduled Publish Date/Time"
                  value={formData.scheduledPublishDate}
                  onChange={(date) =>
                    setFormData((prev) => ({ ...prev, scheduledPublishDate: date }))
                  }
                  slotProps={{
                    textField: {
                      error: !!errors.scheduledPublishDate,
                      helperText: errors.scheduledPublishDate,
                      fullWidth: true,
                      size: 'small',
                    },
                  }}
                />
              </Grid>
            )}
            <Grid item xs={12} md={6}>
              <FormInput
                label="Author/Reporter Name"
                name="authorName"
                value={formData.authorName}
                onChange={handleChange}
                size="small"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormSelect
                label="News Type"
                name="newsType"
                value={formData.newsType}
                onChange={handleChange}
                options={[
                  { value: 'normal', label: 'Normal' },
                  { value: 'featured', label: 'Featured' },
                  { value: 'trending', label: 'Trending' },
                ]}
                size="small"
              />
            </Grid>
          </Grid>
        </Paper>

        <Paper variant="outlined" sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 700, mb: 3, color: '#1a1a1a' }}>
            SEO Section
          </Typography>
          <Grid container spacing={2.5}>
            <Grid item xs={12}>
              <FormInput
                label="SEO Title"
                name="seoTitle"
                value={formData.seoTitle}
                onChange={handleChange}
                size="small"
              />
            </Grid>
            <Grid item xs={12}>
              <FormInput
                label="SEO Description"
                name="seoDescription"
                value={formData.seoDescription}
                onChange={handleChange}
                multiline
                rows={3}
                size="small"
              />
            </Grid>
            <Grid item xs={12}>
              <FormInput
                label="SEO Keywords"
                name="seoKeywords"
                value={formData.seoKeywords}
                onChange={handleChange}
                helperText="Separate keywords with commas"
                size="small"
              />
            </Grid>
          </Grid>
        </Paper>

        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 3 }}>
          <Button variant="outlined" onClick={onCancel} size="medium" disabled={loading}>
            Cancel
          </Button>
          <Button variant="contained" onClick={handleSubmit} size="medium" disabled={loading}>
            {loading ? (
              <>
                <CircularProgress size={20} sx={{ mr: 1 }} />
                {news ? 'Updating...' : 'Creating...'}
              </>
            ) : (
              news ? 'Update News' : 'Create News'
            )}
          </Button>
        </Box>
      </Box>
    </LocalizationProvider>
  );
};

export default NewsForm;

