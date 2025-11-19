import React, { useState, useEffect } from 'react';
import {
  Box,
  TextField,
  IconButton,
  Avatar,
  CircularProgress,
  Alert,
  Typography,
  Button,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  Add as AddIcon,
  Block as BlockIcon,
  CheckCircle as CheckCircleIcon,
} from '@mui/icons-material';
import DataTable from '../../components/common/DataTable';
import Breadcrumbs from '../../components/common/Breadcrumbs';
import StatusChip from '../../components/forms/StatusChip';
import { formatDate } from '../../utils/formatDate';
import { api } from '../../utils/api';
import UserDialog from './UserDialog';

const UserManagement = () => {
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(15);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [totalRows, setTotalRows] = useState(0);
  const [confirmDialog, setConfirmDialog] = useState({
    open: false,
    action: null,
    user: null,
  });
  const [confirmLoading, setConfirmLoading] = useState(false);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError('');
      const role = roleFilter === 'all' ? null : roleFilter;
      const search = searchTerm || null;
      const status = statusFilter === 'all' ? null : statusFilter;
      const response = await api.users.list(page + 1, rowsPerPage, role, search, status);
      
      if (response.success) {
        setUsers(response.data || []);
        setTotalRows(response.pagination?.total || 0);
      }
    } catch (err) {
      console.error('Error fetching users:', err);
      setError(err.message || 'Failed to fetch users');
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [page, rowsPerPage, roleFilter, statusFilter]);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (page === 0) {
        fetchUsers();
      } else {
        setPage(0);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  const handleCreate = () => {
    setSelectedUser(null);
    setOpenDialog(true);
  };

  const handleEdit = (user) => {
    setSelectedUser(user);
    setOpenDialog(true);
  };

  const handleDelete = async (id) => {
    try {
      const response = await api.users.delete(id);
      if (response.success) {
        fetchUsers();
      }
    } catch (err) {
      alert(err.message || 'Failed to delete user');
    }
  };

  const handleActivate = async (id) => {
    try {
      const response = await api.users.activate(id);
      if (response.success) {
        fetchUsers();
      }
    } catch (err) {
      alert(err.message || 'Failed to activate user');
    }
  };

  const handleDeactivate = async (id) => {
    try {
      const response = await api.users.deactivate(id);
      if (response.success) {
        fetchUsers();
      }
    } catch (err) {
      alert(err.message || 'Failed to deactivate user');
    }
  };

  const openConfirmDialog = (action, user) => {
    setConfirmDialog({
      open: true,
      action,
      user,
    });
  };

  const closeConfirmDialog = () => {
    setConfirmDialog({
      open: false,
      action: null,
      user: null,
    });
    setConfirmLoading(false);
  };

  const handleConfirmAction = async () => {
    const { action, user } = confirmDialog;
    if (!action || !user) return;

    try {
      setConfirmLoading(true);
      if (action === 'delete') {
        await handleDelete(user.id);
      } else if (action === 'deactivate') {
        await handleDeactivate(user.id);
      } else if (action === 'activate') {
        await handleActivate(user.id);
      }
    } finally {
      closeConfirmDialog();
    }
  };

  const handleSave = async (formData) => {
    try {
      let response;
      if (selectedUser) {
        response = await api.users.update({
          id: selectedUser.id,
          ...formData,
        });
      } else {
        response = await api.users.create(formData);
      }

      if (response.success) {
        setOpenDialog(false);
        setSelectedUser(null);
        fetchUsers();
      }
    } catch (err) {
      throw err; // Let the dialog handle the error
    }
  };

  const getUserInitials = (name) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getRoleColor = (role) => {
    switch (role?.toLowerCase()) {
      case 'admin':
        return 'error';
      case 'editor':
        return 'primary';
      case 'reporter':
        return 'info';
      default:
        return 'default';
    }
  };

  const columns = [
    {
      id: 'name',
      label: 'Name',
      render: (value, row) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Avatar
            sx={{
              width: 40,
              height: 40,
              bgcolor: '#2e7d32',
              fontSize: '0.875rem',
              fontWeight: 600,
            }}
          >
            {getUserInitials(value || row.name)}
          </Avatar>
          <Typography variant="body2" sx={{ fontWeight: 500 }}>
            {value || row.name}
          </Typography>
        </Box>
      ),
    },
    {
      id: 'email',
      label: 'Email',
    },
    {
      id: 'role',
      label: 'Role',
      render: (value) => (
        <Chip
          label={value || 'N/A'}
          size="small"
          color={getRoleColor(value)}
          sx={{ fontWeight: 500 }}
        />
      ),
    },
    {
      id: 'status',
      label: 'Status',
      render: (value, row) => {
        const status = value || row.status || 'active';
        return <StatusChip status={status} />;
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
      render: (value, row) => {
        const status = row.status || 'active';
        const isActive = status === 'active';
        
        return (
          <Box sx={{ display: 'flex', gap: 0.5 }}>
            <IconButton
              size="small"
              onClick={() => handleEdit(row)}
              color="primary"
              title="Edit User"
            >
              <EditIcon />
            </IconButton>
            {isActive ? (
              <IconButton
                size="small"
                onClick={() => openConfirmDialog('deactivate', row)}
                color="warning"
                title="Deactivate User"
              >
                <BlockIcon />
              </IconButton>
            ) : (
              <IconButton
                size="small"
                onClick={() => openConfirmDialog('activate', row)}
                color="success"
                title="Activate User"
              >
                <CheckCircleIcon />
              </IconButton>
            )}
            <IconButton
              size="small"
              onClick={() => openConfirmDialog('delete', row)}
              color="error"
              title="Delete User Permanently"
            >
              <DeleteIcon />
            </IconButton>
          </Box>
        );
      },
    },
  ];

  return (
    <Box>
      {/* Page Header with Title and Breadcrumb */}
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        mb: 4,
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
          User Management
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
            Create User
          </Button>
        </Box>
      </Box>

      <Box sx={{ mb: 3, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
        <TextField
          placeholder="Search by name or email..."
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setPage(0);
          }}
          InputProps={{
            startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />,
          }}
          sx={{ minWidth: 250 }}
          size="small"
        />
        <TextField
          select
          label="Role"
          value={roleFilter}
          onChange={(e) => {
            setRoleFilter(e.target.value);
            setPage(0);
          }}
          SelectProps={{
            native: true,
          }}
          sx={{ minWidth: 150 }}
          size="small"
        >
          <option value="all">All Roles</option>
          <option value="Admin">Admin</option>
          <option value="Editor">Editor</option>
          <option value="Reporter">Reporter</option>
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
          size="small"
        >
          <option value="all">All Status</option>
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
          rows={users}
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

      <UserDialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        onSave={handleSave}
        user={selectedUser}
      />

      <Dialog
        open={confirmDialog.open}
        onClose={confirmLoading ? undefined : closeConfirmDialog}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>
          {confirmDialog.action === 'delete'
            ? 'Delete User'
            : confirmDialog.action === 'deactivate'
            ? 'Deactivate User'
            : 'Activate User'}
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            {confirmDialog.action === 'delete'
              ? 'Are you sure you want to permanently delete this user? This action cannot be undone.'
              : confirmDialog.action === 'deactivate'
              ? 'Are you sure you want to deactivate this user? They will lose access to the platform until reactivated.'
              : 'Are you sure you want to activate this user? They will regain access to the platform.'}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeConfirmDialog} disabled={confirmLoading}>
            Cancel
          </Button>
          <Button
            onClick={handleConfirmAction}
            variant="contained"
            color={
              confirmDialog.action === 'delete'
                ? 'error'
                : confirmDialog.action === 'deactivate'
                ? 'warning'
                : 'success'
            }
            disabled={confirmLoading}
          >
            {confirmLoading ? (
              <CircularProgress size={20} sx={{ color: 'white' }} />
            ) : confirmDialog.action === 'delete' ? (
              'Delete'
            ) : confirmDialog.action === 'deactivate' ? (
              'Deactivate'
            ) : (
              'Activate'
            )}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default UserManagement;

