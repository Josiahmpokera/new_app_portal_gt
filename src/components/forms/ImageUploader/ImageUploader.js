import React, { useState, useRef } from 'react';
import {
  Box,
  Button,
  IconButton,
  Typography,
  Paper,
  Stack,
} from '@mui/material';
import {
  CloudUpload as CloudUploadIcon,
  Delete as DeleteIcon,
  Image as ImageIcon,
} from '@mui/icons-material';

const ImageUploader = ({
  label = 'Upload Image',
  value,
  onChange,
  multiple = false,
  accept = 'image/*',
  error,
  helperText,
}) => {
  const fileInputRef = useRef(null);
  const [preview, setPreview] = useState(value || (multiple ? [] : null));

  const handleFileChange = (event) => {
    const files = Array.from(event.target.files);
    
    if (multiple) {
      const newFiles = [...(preview || []), ...files];
      setPreview(newFiles);
      onChange?.(newFiles);
    } else {
      const file = files[0];
      if (file) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setPreview(reader.result);
          onChange?.(file);
        };
        reader.readAsDataURL(file);
      }
    }
  };

  const handleRemove = (index) => {
    if (multiple) {
      const newFiles = preview.filter((_, i) => i !== index);
      setPreview(newFiles);
      onChange?.(newFiles);
    } else {
      setPreview(null);
      onChange?.(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <Box>
      <Typography variant="body2" sx={{ mb: 1 }}>
        {label}
      </Typography>
      
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        onChange={handleFileChange}
        style={{ display: 'none' }}
      />

      {multiple ? (
        <Stack spacing={2}>
          <Button
            variant="outlined"
            startIcon={<CloudUploadIcon />}
            onClick={handleClick}
            fullWidth
          >
            Upload Images
          </Button>
          {preview && preview.length > 0 && (
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
              {preview.map((file, index) => (
                <Paper
                  key={index}
                  elevation={2}
                  sx={{
                    position: 'relative',
                    width: 150,
                    height: 150,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    overflow: 'hidden',
                  }}
                >
                  <img
                    src={file instanceof File ? URL.createObjectURL(file) : file}
                    alt={`Preview ${index + 1}`}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                    }}
                  />
                  <IconButton
                    size="small"
                    onClick={() => handleRemove(index)}
                    sx={{
                      position: 'absolute',
                      top: 4,
                      right: 4,
                      bgcolor: 'error.main',
                      color: 'white',
                      '&:hover': { bgcolor: 'error.dark' },
                    }}
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Paper>
              ))}
            </Box>
          )}
        </Stack>
      ) : (
        <Box>
          {preview ? (
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
                src={preview instanceof File ? URL.createObjectURL(preview) : preview}
                alt="Preview"
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                }}
              />
              <IconButton
                size="small"
                onClick={() => handleRemove()}
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
          ) : (
            <Paper
              elevation={1}
              sx={{
                p: 3,
                textAlign: 'center',
                border: '2px dashed',
                borderColor: 'divider',
                cursor: 'pointer',
                '&:hover': { borderColor: 'primary.main' },
              }}
              onClick={handleClick}
            >
              <ImageIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 1 }} />
              <Typography variant="body2" color="text.secondary">
                Click to upload or drag and drop
              </Typography>
            </Paper>
          )}
        </Box>
      )}

      {error && (
        <Typography variant="caption" color="error" sx={{ mt: 0.5, display: 'block' }}>
          {error}
        </Typography>
      )}
      {helperText && !error && (
        <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
          {helperText}
        </Typography>
      )}
    </Box>
  );
};

export default ImageUploader;

