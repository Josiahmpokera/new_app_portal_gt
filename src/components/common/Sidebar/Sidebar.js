import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Box,
  Typography,
  Divider,
  Collapse,
} from '@mui/material';
import { Article as ArticleIcon } from '@mui/icons-material';
import { MENU_CATEGORIES } from '../../../constants/menuItems';

const drawerWidthExpanded = 260;
const drawerWidthCollapsed = 70;

const Sidebar = ({ open }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const drawerWidth = open ? drawerWidthExpanded : drawerWidthCollapsed;

  return (
    <Box
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        transition: 'width 0.3s ease',
        overflow: 'hidden',
        height: '100vh',
        position: 'fixed',
        left: 0,
        top: 0,
        zIndex: (theme) => theme.zIndex.drawer,
      }}
    >
      <Drawer
        variant="permanent"
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          height: '100vh',
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
            backgroundColor: '#000000',
            color: 'white',
            borderRight: '1px solid rgba(255, 255, 255, 0.1)',
            position: 'fixed',
            height: '100vh',
            top: 0,
            left: 0,
            transition: 'width 0.3s ease',
            overflowX: 'hidden',
          },
        }}
      >
      <Toolbar
        sx={{
          minHeight: '64px !important',
          backgroundColor: '#1a1a1a',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
          justifyContent: open ? 'flex-start' : 'center',
          px: open ? 2 : 1,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 40,
              height: 40,
              borderRadius: '8px',
              backgroundColor: '#2e7d32',
              flexShrink: 0,
            }}
          >
            <ArticleIcon sx={{ color: 'white', fontSize: 24 }} />
          </Box>
          <Collapse in={open} orientation="horizontal">
            <Typography 
              variant="h6" 
              noWrap 
              component="div" 
              sx={{ 
                fontWeight: 700,
                color: 'white',
                fontSize: '1.25rem',
                whiteSpace: 'nowrap',
              }}
            >
              News Portal
            </Typography>
          </Collapse>
        </Box>
      </Toolbar>
      <Divider sx={{ borderColor: 'rgba(255, 255, 255, 0.1)' }} />
      <Box sx={{ overflow: 'auto', flex: 1, py: 1 }}>
        {MENU_CATEGORIES.map((category, categoryIndex) => (
          <Box key={categoryIndex}>
            {open && (
              <Box sx={{ px: 2, py: 1 }}>
                <Typography
                  variant="caption"
                  sx={{
                    color: 'rgba(255, 255, 255, 0.5)',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                  }}
                >
                  {category.title}
                </Typography>
              </Box>
            )}
            <List sx={{ px: open ? 1.5 : 0.5 }}>
              {category.items.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                
                return (
                  <ListItem 
                    key={item.path} 
                    disablePadding 
                    sx={{ mb: 0.5 }}
                  >
                    <ListItemButton
                      onClick={() => navigate(item.path)}
                      sx={{
                        borderRadius: 2,
                        py: open ? 0.875 : 1,
                        px: open ? 2 : 1,
                        justifyContent: open ? 'flex-start' : 'center',
                        backgroundColor: isActive 
                          ? '#2e7d32' 
                          : 'transparent',
                        color: isActive ? 'white' : 'rgba(255, 255, 255, 0.7)',
                        transition: 'all 0.2s ease',
                        minHeight: 40,
                        '&:hover': {
                          backgroundColor: isActive 
                            ? '#2e7d32' 
                            : 'rgba(46, 125, 50, 0.15)',
                          transform: open ? 'translateX(4px)' : 'none',
                        },
                        '& .MuiListItemIcon-root': {
                          color: isActive ? 'white' : 'rgba(255, 255, 255, 0.7)',
                          minWidth: open ? 40 : 'auto',
                          justifyContent: 'center',
                        },
                        '& .MuiListItemText-primary': {
                          fontWeight: isActive ? 600 : 500,
                          fontSize: '0.9375rem',
                        },
                      }}
                      title={!open ? item.label : ''}
                    >
                      <ListItemIcon>
                        <Icon />
                      </ListItemIcon>
                      <Collapse in={open} orientation="horizontal">
                        <ListItemText primary={item.label} />
                      </Collapse>
                    </ListItemButton>
                  </ListItem>
                );
              })}
            </List>
            {categoryIndex < MENU_CATEGORIES.length - 1 && open && (
              <Divider sx={{ borderColor: 'rgba(255, 255, 255, 0.1)', my: 1, mx: 2 }} />
            )}
          </Box>
        ))}
      </Box>
    </Drawer>
    </Box>
  );
};

export default Sidebar;

