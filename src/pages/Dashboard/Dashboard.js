import React, { useState, useEffect } from 'react';
import { 
  Card, 
  CardContent, 
  Typography, 
  Box,
  Avatar,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  Article as ArticleIcon,
  Category as CategoryIcon,
  SubdirectoryArrowRight as SubCategoryIcon,
  FlashOn as FlashNewsIcon,
  Star as FeaturedIcon,
} from '@mui/icons-material';
import { formatDate } from '../../utils/formatDate';
import { api } from '../../utils/api';
import StatusChip from '../../components/forms/StatusChip';
import Breadcrumbs from '../../components/common/Breadcrumbs';

const StatCard = ({ title, value, icon: Icon, color = 'primary' }) => {
  return (
    <Card 
      variant="outlined" 
      sx={{ 
        height: '100%',
        transition: 'all 0.3s ease',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: '0 8px 24px rgba(0, 0, 0, 0.12)',
        },
      }}
    >
      <CardContent sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Box sx={{ flex: 1 }}>
            <Typography 
              color="text.secondary" 
              gutterBottom 
              variant="body2"
              sx={{ 
                fontSize: '0.875rem',
                fontWeight: 700,
              }}
            >
              {title}
            </Typography>
            <Typography 
              variant="h4" 
              component="div" 
              sx={{ 
                fontWeight: 700, 
                mt: 1.5,
                fontSize: '2rem',
                color: '#1a1a1a',
              }}
            >
              {value}
            </Typography>
          </Box>
          <Box
            sx={{
              backgroundColor: `${color}.light`,
              borderRadius: '12px',
              p: 1.5,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              ml: 2,
            }}
          >
            <Icon sx={{ fontSize: 28, color: `${color}.main` }} />
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

const Dashboard = () => {
  const [stats, setStats] = useState([
    { title: 'Total News', value: '0', icon: ArticleIcon, color: 'primary' },
    { title: 'Active Categories', value: '0', icon: CategoryIcon, color: 'success' },
    { title: 'Active Subcategories', value: '0', icon: SubCategoryIcon, color: 'info' },
    { title: "Today's Flash News", value: '0', icon: FlashNewsIcon, color: 'warning' },
    { title: 'Featured News Count', value: '0', icon: FeaturedIcon, color: 'secondary' },
  ]);
  const [recentNews, setRecentNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError('');

      // Fetch all data in parallel
      const [newsResponse, categoriesResponse, subCategoriesResponse, flashNewsResponse] = await Promise.all([
        api.news.list({ page: 1, perPage: 1 }),
        api.categories.list(1, 1, 'active'),
        api.subCategories.list(1, 1, null, 'active'),
        api.flashNews.list(1, 1, 'on'),
      ]);

      // Fetch recent news
      const recentNewsResponse = await api.news.list({ 
        page: 1, 
        perPage: 10,
      });

      // Update stats
      const totalNews = newsResponse.pagination?.total || 0;
      const activeCategories = categoriesResponse.pagination?.total || 0;
      const activeSubCategories = subCategoriesResponse.pagination?.total || 0;
      const todayFlashNews = flashNewsResponse.pagination?.total || 0;

      // Count featured news
      const featuredNewsResponse = await api.news.list({ 
        page: 1, 
        perPage: 1,
        newsType: 'featured',
      });
      const featuredCount = featuredNewsResponse.pagination?.total || 0;

      setStats([
        { title: 'Total News', value: totalNews.toLocaleString(), icon: ArticleIcon, color: 'primary' },
        { title: 'Active Categories', value: activeCategories.toLocaleString(), icon: CategoryIcon, color: 'success' },
        { title: 'Active Subcategories', value: activeSubCategories.toLocaleString(), icon: SubCategoryIcon, color: 'info' },
        { title: "Today's Flash News", value: todayFlashNews.toLocaleString(), icon: FlashNewsIcon, color: 'warning' },
        { title: 'Featured News Count', value: featuredCount.toLocaleString(), icon: FeaturedIcon, color: 'secondary' },
      ]);

      // Set recent news
      if (recentNewsResponse.success) {
        setRecentNews(recentNewsResponse.data || []);
      }
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError(err.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const getCategoryName = (newsItem) => {
    if (newsItem.category?.name) return newsItem.category.name;
    if (typeof newsItem.category_id === 'object') return newsItem.category_id?.name;
    return '-';
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'featured':
        return 'primary';
      case 'trending':
        return 'warning';
      default:
        return 'default';
    }
  };

  return (
    <Box>
      {/* Page Header with Title and Breadcrumb */}
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        mb: 4,
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
          Dashboard
        </Typography>
        <Box sx={{ ml: 'auto' }}>
          <Breadcrumbs />
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Stats Cards */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            sm: 'repeat(2, 1fr)',
            md: 'repeat(3, 1fr)',
            lg: 'repeat(4, 1fr)',
            xl: 'repeat(5, 1fr)',
          },
          gap: 3,
          mb: 4,
        }}
      >
        {stats.map((stat, index) => (
          <Box key={index}>
            {loading ? (
              <Card variant="outlined" sx={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 140 }}>
                <CircularProgress size={24} />
              </Card>
            ) : (
              <StatCard {...stat} />
            )}
          </Box>
        ))}
      </Box>

      {/* Recent News Section */}
      <Card 
        variant="outlined"
        sx={{
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
        }}
      >
        <Box sx={{ p: 3, borderBottom: '1px solid #e0e0e0' }}>
          <Typography variant="h6" sx={{ fontWeight: 700, color: '#1a1a1a' }}>
            Recent News
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            Latest news articles created in the system
          </Typography>
        </Box>
        
        <TableContainer>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
              <CircularProgress />
            </Box>
          ) : recentNews.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 6 }}>
              <Typography color="text.secondary">
                No recent news available
              </Typography>
            </Box>
          ) : (
            <Table sx={{ minWidth: 650 }}>
              <TableHead>
                <TableRow sx={{ backgroundColor: '#f8f9fa' }}>
                  <TableCell sx={{ fontWeight: 700, color: '#1a1a1a', py: 2 }}>
                    Thumbnail
                  </TableCell>
                  <TableCell sx={{ fontWeight: 700, color: '#1a1a1a' }}>
                    Title
                  </TableCell>
                  <TableCell sx={{ fontWeight: 700, color: '#1a1a1a' }}>
                    Category
                  </TableCell>
                  <TableCell sx={{ fontWeight: 700, color: '#1a1a1a' }}>
                    Type
                  </TableCell>
                  <TableCell sx={{ fontWeight: 700, color: '#1a1a1a' }}>
                    Status
                  </TableCell>
                  <TableCell sx={{ fontWeight: 700, color: '#1a1a1a' }}>
                    Created At
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {recentNews.map((news) => (
                  <TableRow
                    key={news.id}
                    sx={{
                      '&:hover': {
                        backgroundColor: '#f8f9fa',
                      },
                      transition: 'background-color 0.2s ease',
                    }}
                  >
                    <TableCell>
                      {news.thumbnail_image_url ? (
                        <Avatar
                          src={news.thumbnail_image_url}
                          variant="rounded"
                          sx={{ 
                            width: 60, 
                            height: 60,
                            borderRadius: 2,
                          }}
                        />
                      ) : (
                        <Box
                          sx={{
                            width: 60,
                            height: 60,
                            borderRadius: 2,
                            backgroundColor: '#e0e0e0',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          <ArticleIcon sx={{ color: '#999' }} />
                        </Box>
                      )}
                    </TableCell>
                    <TableCell>
                      <Typography
                        variant="body2"
                        sx={{
                          fontWeight: 600,
                          color: '#1a1a1a',
                          maxWidth: 300,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {news.title}
                      </Typography>
                      {news.short_description && (
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          sx={{
                            display: 'block',
                            mt: 0.5,
                            maxWidth: 300,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {news.short_description}
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={getCategoryName(news)}
                        size="small"
                        sx={{
                          backgroundColor: '#e3f2fd',
                          color: '#1976d2',
                          fontWeight: 500,
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={news.news_type?.charAt(0).toUpperCase() + news.news_type?.slice(1) || 'Normal'}
                        size="small"
                        color={getTypeColor(news.news_type)}
                        sx={{ fontWeight: 500 }}
                      />
                    </TableCell>
                    <TableCell>
                      <StatusChip status={news.publish_status} />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {formatDate(news.created_at)}
                      </Typography>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </TableContainer>
      </Card>
    </Box>
  );
};

export default Dashboard;

