import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  TextField,
  IconButton,
  Avatar,
  Chip,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  Add as AddIcon,
} from '@mui/icons-material';
import PageHeader from '../../components/common/PageHeader';
import DataTable from '../../components/common/DataTable';
import StatusChip from '../../components/forms/StatusChip';
import NewsForm from './NewsForm';
import { formatDate, formatDateTime } from '../../utils/formatDate';
import { api } from '../../utils/api';

const News = () => {
  const navigate = useNavigate();
  const [showForm, setShowForm] = useState(false);
  const [selectedNews, setSelectedNews] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(15);
  const [newsList, setNewsList] = useState([]);
  const [categories, setCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [totalRows, setTotalRows] = useState(0);

  const fetchCategories = async () => {
    try {
      const response = await api.public.categories();
      if (response.success) {
        setCategories(response.data || []);
      }
    } catch (err) {
      console.error('Error fetching categories:', err);
    }
  };

  const fetchSubCategories = async (categoryId = null) => {
    try {
      const response = await api.public.subCategories(categoryId);
      if (response.success) {
        setSubCategories(response.data || []);
      }
    } catch (err) {
      console.error('Error fetching sub-categories:', err);
    }
  };

  const fetchNews = async () => {
    try {
      setLoading(true);
      setError('');
      const filters = {
        page: page + 1,
        perPage: rowsPerPage,
        search: searchTerm || undefined,
        categoryId: categoryFilter !== 'all' ? parseInt(categoryFilter) : undefined,
        newsType: typeFilter !== 'all' ? typeFilter : undefined,
        publishStatus: statusFilter !== 'all' ? statusFilter : undefined,
      };
      
      const response = await api.news.list(filters);
      
      if (response.success) {
        setNewsList(response.data || []);
        setTotalRows(response.pagination?.total || 0);
      }
    } catch (err) {
      console.error('Error fetching news:', err);
      setError(err.message || 'Failed to fetch news');
      setNewsList([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
    fetchSubCategories();
  }, []);

  useEffect(() => {
    fetchNews();
  }, [page, rowsPerPage, categoryFilter, typeFilter, statusFilter]);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (page === 0) {
        fetchNews();
      } else {
        setPage(0);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  const getCategoryName = (categoryId) => {
    if (!categoryId) return '-';
    const category = categories.find((cat) => cat.id === parseInt(categoryId));
    return category ? category.name : (typeof categoryId === 'object' ? categoryId?.name : '-');
  };

  const getSubCategoryName = (subCategoryId) => {
    if (!subCategoryId) return '-';
    const subCategory = subCategories.find((sub) => sub.id === parseInt(subCategoryId));
    return subCategory ? subCategory.name : (typeof subCategoryId === 'object' ? subCategoryId?.name : '-');
  };

  const handleCreate = () => {
    setSelectedNews(null);
    setShowForm(true);
  };

  const handleEdit = (news) => {
    setSelectedNews(news);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this news?')) {
      try {
        const response = await api.news.delete(id);
        if (response.success) {
          fetchNews();
        }
      } catch (err) {
        alert(err.message || 'Failed to delete news');
      }
    }
  };

  // Helper function to extract plain text from HTML
  const stripHtml = (html) => {
    if (!html) return '';
    const tmp = document.createElement('DIV');
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || '';
  };

  const handleSave = async (formData) => {
    try {
      let response;
      
      // Extract plain text from HTML for full_description
      const fullDescriptionText = stripHtml(formData.fullDescription || '').trim();
      
      // Ensure thumbnail_image is a File object, not a URL string
      let thumbnailImage = formData.thumbnail;
      if (!thumbnailImage || (typeof thumbnailImage === 'string')) {
        // If it's a URL string or null, don't include it (only send File objects)
        thumbnailImage = undefined;
      }
      
      // Filter gallery images to only include File objects
      let galleryImages = undefined;
      if (formData.gallery && Array.isArray(formData.gallery) && formData.gallery.length > 0) {
        galleryImages = formData.gallery.filter(img => img instanceof File);
        if (galleryImages.length === 0) {
          galleryImages = undefined;
        }
      }
      
      const submitData = {
        title: formData.title,
        short_description: formData.shortDescription,
        full_description: fullDescriptionText, // Send as plain text string
        category_id: parseInt(formData.category),
        sub_category_id: formData.subCategory ? parseInt(formData.subCategory) : undefined,
        publish_status: formData.publishStatus,
        published_at: formData.scheduledPublishDate ? formData.scheduledPublishDate.toISOString().slice(0, 19).replace('T', ' ') : undefined,
        author_name: formData.authorName,
        news_type: formData.newsType,
        tags: formData.tags && formData.tags.length > 0 ? formData.tags : undefined,
        seo_title: formData.seoTitle,
        seo_description: formData.seoDescription,
        seo_keywords: formData.seoKeywords,
      };
      
      // Only add thumbnail_image if it's a File object
      if (thumbnailImage instanceof File) {
        submitData.thumbnail_image = thumbnailImage;
      }
      
      // Only add gallery_images if there are File objects
      if (galleryImages && galleryImages.length > 0) {
        submitData.gallery_images = galleryImages;
      }

      if (selectedNews) {
        response = await api.news.update({
          id: selectedNews.id,
          ...submitData,
        });
      } else {
        response = await api.news.create(submitData);
      }

      if (response.success) {
        setShowForm(false);
        setSelectedNews(null);
        fetchNews();
      }
    } catch (err) {
      throw err; // Let the form handle the error
    }
  };

  const columns = [
    {
      id: 'thumbnail',
      label: 'Thumbnail',
      render: (value, row) => {
        const imageUrl = row.thumbnail_image_url || value;
        return imageUrl ? (
          <Avatar src={imageUrl} variant="rounded" sx={{ width: 60, height: 60 }} />
        ) : (
          <Chip label="No Image" size="small" variant="outlined" />
        );
      },
    },
    {
      id: 'title',
      label: 'Title',
    },
    {
      id: 'category_id',
      label: 'Category',
      render: (value, row) => {
        const categoryId = value || row.category?.id;
        return getCategoryName(categoryId);
      },
    },
    {
      id: 'sub_category_id',
      label: 'Sub-Category',
      render: (value, row) => {
        const subCategoryId = value || row.sub_category?.id;
        return getSubCategoryName(subCategoryId);
      },
    },
    {
      id: 'news_type',
      label: 'Type',
      render: (value) => {
        const type = value || 'normal';
        return (
          <Chip
            label={type?.charAt(0).toUpperCase() + type?.slice(1)}
            size="small"
            color={type === 'featured' ? 'primary' : type === 'trending' ? 'warning' : 'default'}
          />
        );
      },
    },
    {
      id: 'publish_status',
      label: 'Status',
      render: (value) => <StatusChip status={value} />,
    },
    {
      id: 'created_at',
      label: 'Created At',
      render: (value) => formatDate(value),
    },
    {
      id: 'actions',
      label: 'Actions',
      align: 'right',
      render: (value, row) => (
        <Box>
          <IconButton
            size="small"
            onClick={() => handleEdit(row)}
            color="primary"
          >
            <EditIcon />
          </IconButton>
          <IconButton
            size="small"
            onClick={() => handleDelete(row.id)}
            color="error"
          >
            <DeleteIcon />
          </IconButton>
        </Box>
      ),
    },
  ];

  if (showForm) {
    return (
      <Box>
        <PageHeader
          title={selectedNews ? 'Edit News' : 'Create News'}
        />
        <NewsForm
          news={selectedNews}
          categories={categories}
          subCategories={subCategories}
          onSave={handleSave}
          onCancel={() => {
            setShowForm(false);
            setSelectedNews(null);
          }}
        />
      </Box>
    );
  }

  return (
    <Box>
      <PageHeader
        title="News"
        actionLabel="Create News"
        onAction={handleCreate}
      />

      <Box sx={{ mb: 3, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
        <TextField
          placeholder="Search by title..."
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setPage(0);
          }}
          InputProps={{
            startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />,
          }}
          sx={{ minWidth: 250 }}
        />
        <TextField
          select
          label="Category"
          value={categoryFilter}
          onChange={(e) => {
            setCategoryFilter(e.target.value);
            setPage(0);
          }}
          SelectProps={{
            native: true,
          }}
          sx={{ minWidth: 150 }}
        >
          <option value="all">All</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id.toString()}>
              {cat.name}
            </option>
          ))}
        </TextField>
        <TextField
          select
          label="Type"
          value={typeFilter}
          onChange={(e) => {
            setTypeFilter(e.target.value);
            setPage(0);
          }}
          SelectProps={{
            native: true,
          }}
          sx={{ minWidth: 150 }}
        >
          <option value="all">All</option>
          <option value="normal">Normal</option>
          <option value="featured">Featured</option>
          <option value="trending">Trending</option>
        </TextField>
        <TextField
          select
          label="Status"
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setPage(0);
          }}
          SelectProps={{
            native: true,
          }}
          sx={{ minWidth: 150 }}
        >
          <option value="all">All</option>
          <option value="draft">Draft</option>
          <option value="published">Published</option>
          <option value="scheduled">Scheduled</option>
        </TextField>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <DataTable
          columns={columns}
          rows={newsList}
          page={page}
          rowsPerPage={rowsPerPage}
          onPageChange={setPage}
          onRowsPerPageChange={(newRowsPerPage) => {
            setRowsPerPage(newRowsPerPage);
            setPage(0);
          }}
          totalRows={totalRows}
        />
      )}
    </Box>
  );
};

export default News;

