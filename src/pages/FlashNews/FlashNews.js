import React, { useState, useEffect } from 'react';
import {
  Box,
  IconButton,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import PageHeader from '../../components/common/PageHeader';
import DataTable from '../../components/common/DataTable';
import StatusChip from '../../components/forms/StatusChip';
import FlashNewsDialog from './FlashNewsDialog';
import { formatDateTime } from '../../utils/formatDate';
import { api } from '../../utils/api';

const FlashNews = () => {
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedFlashNews, setSelectedFlashNews] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(15);
  const [flashNewsList, setFlashNewsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [totalRows, setTotalRows] = useState(0);

  const fetchFlashNews = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await api.flashNews.list(page + 1, rowsPerPage);
      
      if (response.success) {
        setFlashNewsList(response.data || []);
        setTotalRows(response.pagination?.total || 0);
      }
    } catch (err) {
      console.error('Error fetching flash news:', err);
      setError(err.message || 'Failed to fetch flash news');
      setFlashNewsList([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFlashNews();
  }, [page, rowsPerPage]);

  const handleCreate = () => {
    setSelectedFlashNews(null);
    setOpenDialog(true);
  };

  const handleEdit = (flashNews) => {
    setSelectedFlashNews(flashNews);
    setOpenDialog(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this flash news?')) {
      try {
        const response = await api.flashNews.delete(id);
        if (response.success) {
          fetchFlashNews();
        }
      } catch (err) {
        alert(err.message || 'Failed to delete flash news');
      }
    }
  };

  const handleSave = async (formData) => {
    try {
      let response;
      const submitData = {
        title: formData.headline,
        expires_at: formData.expiryTime ? formData.expiryTime.toISOString().slice(0, 19).replace('T', ' ') : undefined,
        status: formData.status ? 'on' : 'off',
      };

      if (selectedFlashNews) {
        response = await api.flashNews.update({
          id: selectedFlashNews.id,
          ...submitData,
        });
      } else {
        response = await api.flashNews.create(submitData);
      }

      if (response.success) {
        setOpenDialog(false);
        setSelectedFlashNews(null);
        fetchFlashNews();
      }
    } catch (err) {
      throw err; // Let the dialog handle the error
    }
  };

  const columns = [
    {
      id: 'title',
      label: 'Headline',
      render: (value, row) => row.title || value,
    },
    {
      id: 'expires_at',
      label: 'Expiry Time',
      render: (value) => value ? formatDateTime(new Date(value)) : '-',
    },
    {
      id: 'status',
      label: 'Status',
      render: (value) => <StatusChip status={value === 'on' ? 'ON' : 'OFF'} />,
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
      <PageHeader
        title="Flash News"
        actionLabel="Create Flash News"
        onAction={handleCreate}
      />

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
          rows={flashNewsList}
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

      <FlashNewsDialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        onSave={handleSave}
        flashNews={selectedFlashNews}
      />
    </Box>
  );
};

export default FlashNews;

