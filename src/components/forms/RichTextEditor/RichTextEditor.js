import React, { useEffect, useRef, useMemo } from 'react';
import Quill from 'quill';
import { Box, Typography } from '@mui/material';

const RichTextEditor = ({
  value,
  onChange,
  error,
  helperText,
  placeholder = 'Enter content...',
}) => {
  const editorRef = useRef(null);
  const quillRef = useRef(null);
  const containerRef = useRef(null);

  const modules = useMemo(
    () => ({
      toolbar: [
        [{ header: [1, 2, 3, 4, 5, 6, false] }],
        [{ font: [] }],
        [{ size: [] }],
        ['bold', 'italic', 'underline', 'strike', 'blockquote'],
        [{ list: 'ordered' }, { list: 'bullet' }, { indent: '-1' }, { indent: '+1' }],
        [{ script: 'sub' }, { script: 'super' }],
        [{ color: [] }, { background: [] }],
        [{ align: [] }],
        ['link', 'image', 'video'],
        ['clean'],
      ],
    }),
    []
  );

  useEffect(() => {
    if (!containerRef.current || quillRef.current) return;

    // Create editor container
    const editor = document.createElement('div');
    editorRef.current = editor;
    containerRef.current.appendChild(editor);

    // Initialize Quill
    const quill = new Quill(editor, {
      theme: 'snow',
      modules: modules,
      placeholder: placeholder,
    });

    // Set initial value
    if (value) {
      quill.root.innerHTML = value;
    }

    // Handle text changes
    let isUpdatingFromProp = false;
    quill.on('text-change', () => {
      if (!isUpdatingFromProp && onChange) {
        const html = quill.root.innerHTML;
        onChange(html);
      }
    });

    quillRef.current = quill;

    return () => {
      if (containerRef.current && editorRef.current) {
        try {
          containerRef.current.removeChild(editorRef.current);
        } catch (e) {
          // Element might already be removed
        }
      }
      quillRef.current = null;
      editorRef.current = null;
    };
  }, []); // Only run once on mount

  // Update content when value prop changes (but not from user input)
  useEffect(() => {
    if (quillRef.current && value !== undefined) {
      const currentContent = quillRef.current.root.innerHTML;
      // Only update if the content is different and not empty HTML
      const normalizedValue = value || '<p><br></p>';
      const normalizedCurrent = currentContent || '<p><br></p>';
      
      if (normalizedCurrent !== normalizedValue) {
        const selection = quillRef.current.getSelection();
        quillRef.current.root.innerHTML = normalizedValue;
        // Restore selection if it existed
        if (selection) {
          quillRef.current.setSelection(selection);
        }
      }
    }
  }, [value]);

  return (
    <Box>
      <Box
        ref={containerRef}
        sx={{
          backgroundColor: 'white',
          minHeight: '300px',
          '& .ql-container': {
            minHeight: '250px',
            fontSize: '1rem',
          },
          '& .ql-editor': {
            minHeight: '250px',
          },
          '& .ql-toolbar': {
            borderTop: '1px solid #e0e0e0',
            borderLeft: '1px solid #e0e0e0',
            borderRight: '1px solid #e0e0e0',
            borderBottom: 'none',
            borderRadius: '4px 4px 0 0',
          },
          '& .ql-container': {
            borderBottom: '1px solid #e0e0e0',
            borderLeft: '1px solid #e0e0e0',
            borderRight: '1px solid #e0e0e0',
            borderTop: 'none',
            borderRadius: '0 0 4px 4px',
          },
          ...(error && {
            '& .ql-container': {
              borderColor: '#d32f2f',
            },
            '& .ql-toolbar': {
              borderColor: '#d32f2f',
            },
          }),
        }}
      />
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

export default RichTextEditor;

