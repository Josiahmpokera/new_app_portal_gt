import React, { useState, useEffect } from 'react';
import {
  Box,
  TextField,
  IconButton,
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
import SubCategoryDialog from './SubCategoryDialog';
import Breadcrumbs from '../../components/common/Breadcrumbs';
import { formatDate } from '../../utils/formatDate';
import { api } from '../../utils/api';

const SubCategories = () => {
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedSubCategory, setSelectedSubCategory] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(15);
  const [subCategories, setSubCategories] = useState([]);
  const [categories, setCategories] = useState([]);
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

  const fetchSubCategories = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await api.subCategories.list(page + 1, rowsPerPage);
      
      if (response.success) {
        let data = response.data || [];
        
        // Filter by search term if provided
        if (searchTerm) {
          data = data.filter((sub) =>
            sub.name.toLowerCase().includes(searchTerm.toLowerCase())
          );
        }
        
        setSubCategories(data);
        setTotalRows(response.pagination?.total || data.length);
      }
    } catch (err) {
      console.error('Error fetching sub-categories:', err);
      setError(err.message || 'Failed to fetch sub-categories');
      setSubCategories([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchSubCategories();
  }, [page, rowsPerPage]);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (page === 0) {
        fetchSubCategories();
      } else {
        setPage(0);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  const getCategoryName = (categoryId) => {
    const category = categories.find((cat) => cat.id === categoryId);
    return category ? category.name : '-';
  };

  const handleCreate = () => {
    setSelectedSubCategory(null);
    setOpenDialog(true);
  };

  const handleEdit = (subCategory) => {
    setSelectedSubCategory(subCategory);
    setOpenDialog(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this sub-category?')) {
      try {
        const response = await api.subCategories.delete(id);
        if (response.success) {
          fetchSubCategories();
        }
      } catch (err) {
        alert(err.message || 'Failed to delete sub-category');
      }
    }
  };

  const handleSave = async (formData) => {
    try {
      let response;
      const submitData = {
        ...formData,
        category_id: formData.parentCategory,
      };
      delete submitData.parentCategory;

      if (selectedSubCategory) {
        response = await api.subCategories.update({
          id: selectedSubCategory.id,
          ...submitData,
        });
      } else {
        response = await api.subCategories.create(submitData);
      }

      if (response.success) {
        setOpenDialog(false);
        setSelectedSubCategory(null);
        fetchSubCategories();
      }
    } catch (err) {
      throw err; // Let the dialog handle the error
    }
  };

  const filteredSubCategories = subCategories.filter((sub) => {
    if (!searchTerm) return true;
    return sub.name.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const columns = [
    {
      id: 'name',
      label: 'Name',
    },
    {
      id: 'category_id',
      label: 'Parent Category',
      render: (value, row) => {
        const categoryId = value || row.category?.id;
        return getCategoryName(categoryId);
      },
    },
    {
      id: 'status',
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

  return (
    <Box>
      {/* Page Header with Title and Breadcrumb */}
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        mb: 3,
        width: '100%',
      }}>
        <Typography 
          variant="h5" 
          component="h1" 
          sx={{ 
            fontWeight: 700, 
            color: '#1a1a1a',
            fontSize: '1.5rem',
            flex: '0 0 auto',
          }}
        >
          Sub-Categories
        </Typography>
        <Box sx={{ 
          display: 'flex', 
          gap: 2, 
          alignItems: 'center',
          flex: '0 0 auto',
          ml: 'auto',
        }}>
          <Breadcrumbs />
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleCreate}
          >
            Create Sub-Category
          </Button>
        </Box>
      </Box>

      <Box sx={{ mb: 3 }}>
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
          rows={filteredSubCategories}
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

      <SubCategoryDialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        onSave={handleSave}
        subCategory={selectedSubCategory}
        categories={categories}
      />
    </Box>
  );
};

export default SubCategories;

