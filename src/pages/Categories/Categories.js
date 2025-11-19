import React, { useState, useEffect } from 'react';
import {
  Box,
  TextField,
  IconButton,
  Avatar,
  Chip,
  CircularProgress,
  Alert,
  Typography,
  Button,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  Add as AddIcon,
} from '@mui/icons-material';
import DataTable from '../../components/common/DataTable';
import StatusChip from '../../components/forms/StatusChip';
import CategoryDialog from './CategoryDialog';
import Breadcrumbs from '../../components/common/Breadcrumbs';
import { formatDate } from '../../utils/formatDate';
import { api } from '../../utils/api';

const Categories = () => {
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(15);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [totalRows, setTotalRows] = useState(0);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      setError('');
      const status = statusFilter === 'all' ? null : statusFilter;
      const response = await api.categories.list(page + 1, rowsPerPage, status);
      
      if (response.success) {
        let data = response.data || [];
        
        // Filter by search term if provided
        if (searchTerm) {
          data = data.filter((cat) =>
            cat.name.toLowerCase().includes(searchTerm.toLowerCase())
          );
        }
        
        setCategories(data);
        setTotalRows(response.pagination?.total || data.length);
      }
    } catch (err) {
      console.error('Error fetching categories:', err);
      setError(err.message || 'Failed to fetch categories');
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, [page, rowsPerPage, statusFilter]);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (page === 0) {
        fetchCategories();
      } else {
        setPage(0);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  const handleCreate = () => {
    setSelectedCategory(null);
    setOpenDialog(true);
  };

  const handleEdit = (category) => {
    setSelectedCategory(category);
    setOpenDialog(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this category?')) {
      try {
        const response = await api.categories.delete(id);
        if (response.success) {
          fetchCategories();
        }
      } catch (err) {
        alert(err.message || 'Failed to delete category');
      }
    }
  };

  const handleSave = async (formData) => {
    try {
      let response;
      if (selectedCategory) {
        response = await api.categories.update({
          id: selectedCategory.id,
          ...formData,
        });
      } else {
        response = await api.categories.create(formData);
      }

      if (response.success) {
        setOpenDialog(false);
        setSelectedCategory(null);
        fetchCategories();
      }
    } catch (err) {
      throw err; // Let the dialog handle the error
    }
  };

  const filteredCategories = categories.filter((cat) => {
    if (!searchTerm) return true;
    return cat.name.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const columns = [
    {
      id: 'name',
      label: 'Name',
    },
    {
      id: 'status',
      label: 'Status',
      render: (value) => <StatusChip status={value} />,
    },
    {
      id: 'icon',
      label: 'Icon/Banner',
      render: (value, row) => {
        const imageUrl = row.icon_url || row.banner_image_url;
        return imageUrl ? (
          <Avatar src={imageUrl} variant="rounded" sx={{ width: 56, height: 56 }} />
        ) : (
          <Chip label="No Image" size="small" variant="outlined" />
        );
      },
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

  return (
    <Box>
      {/* Page Header with Title and Breadcrumb */}
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        mb: 3,
        flexWrap: 'wrap',
        gap: 2,
      }}>
        <Typography 
          variant="h5" 
          component="h1" 
          sx={{ 
            fontWeight: 700, 
            color: '#1a1a1a',
            fontSize: '1.5rem',
          }}
        >
          Categories
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', ml: 'auto' }}>
          <Breadcrumbs />
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleCreate}
          >
            Create Category
          </Button>
        </Box>
      </Box>

      <Box sx={{ mb: 3, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
        <TextField
          placeholder="Search by name..."
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
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
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
          rows={filteredCategories}
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

      <CategoryDialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        onSave={handleSave}
        category={selectedCategory}
      />
    </Box>
  );
};

export default Categories;

