const API_BASE_URL = 'http://127.0.0.1:8000/api';

/**
 * Get the bearer token from localStorage
 */
export const getToken = () => {
  return localStorage.getItem('bearer_token');
};

/**
 * Get the authorization header with bearer token
 */
export const getAuthHeaders = (isMultipart = false) => {
  const token = getToken();
  const headers = {
    Accept: 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
  };
  
  if (!isMultipart) {
    headers['Content-Type'] = 'application/json';
  }
  
  return headers;
};

/**
 * Make an API request
 */
export const apiRequest = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  const isMultipart = options.isMultipart || false;
  const headers = getAuthHeaders(isMultipart);

  const config = {
    ...options,
    headers: {
      ...headers,
      ...options.headers,
    },
  };

  // Remove isMultipart from config as it's not a fetch option
  delete config.isMultipart;

  try {
    const response = await fetch(url, config);
    const data = await response.json();

    if (!response.ok) {
      const errorMessage = data.message || data.errors || 'An error occurred';
      const error = new Error(typeof errorMessage === 'string' ? errorMessage : JSON.stringify(errorMessage));
      error.errors = data.errors;
      error.status = response.status;
      throw error;
    }

    return data;
  } catch (error) {
    throw error;
  }
};

/**
 * Create FormData from object
 */
export const createFormData = (data) => {
  const formData = new FormData();
  
  Object.keys(data).forEach((key) => {
    const value = data[key];
    if (value !== null && value !== undefined) {
      // Skip URL strings (only send File objects for images)
      if (typeof value === 'string' && (value.startsWith('http://') || value.startsWith('https://') || value.startsWith('/storage/'))) {
        // Don't append URL strings - only send if it's a new file
        return;
      }
      
      if (Array.isArray(value)) {
        // Handle arrays (like tags, gallery_images)
        value.forEach((item) => {
          if (item instanceof File) {
            formData.append(`${key}[]`, item);
          } else if (typeof item === 'string' && !(item.startsWith('http://') || item.startsWith('https://') || item.startsWith('/storage/'))) {
            // For tags and other string arrays, append as key[]
            formData.append(`${key}[]`, item);
          }
        });
      } else if (value instanceof File || value instanceof FileList) {
        // Handle single file or FileList
        if (value instanceof FileList) {
          Array.from(value).forEach((file) => {
            formData.append(`${key}[]`, file);
          });
        } else {
          formData.append(key, value);
        }
      } else if (typeof value === 'object' && !(value instanceof Date)) {
        // Handle objects (convert to JSON string)
        formData.append(key, JSON.stringify(value));
      } else if (value instanceof Date) {
        // Handle dates
        formData.append(key, value.toISOString().slice(0, 19).replace('T', ' '));
      } else {
        formData.append(key, value);
      }
    }
  });
  
  return formData;
};

/**
 * API methods
 */
export const api = {
  // Auth
  login: async (email, password) => {
    return apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  },

  // Categories
  categories: {
    list: async (page = 1, perPage = 15, status = null) => {
      const body = { page, per_page: perPage };
      if (status && status !== 'all') {
        body.status = status;
      }
      return apiRequest('/categories/list', {
        method: 'POST',
        body: JSON.stringify(body),
      });
    },
    create: async (data) => {
      const formData = createFormData(data);
      return apiRequest('/categories/create', {
        method: 'POST',
        body: formData,
        isMultipart: true,
      });
    },
    update: async (data) => {
      const formData = createFormData(data);
      return apiRequest('/categories/update', {
        method: 'POST',
        body: formData,
        isMultipart: true,
      });
    },
    delete: async (id) => {
      return apiRequest('/categories/delete', {
        method: 'POST',
        body: JSON.stringify({ id }),
      });
    },
    show: async (id) => {
      return apiRequest('/categories/show', {
        method: 'POST',
        body: JSON.stringify({ id }),
      });
    },
  },

  // Sub-Categories
  subCategories: {
    list: async (page = 1, perPage = 15, categoryId = null, status = null) => {
      const body = { page, per_page: perPage };
      if (categoryId) body.category_id = categoryId;
      if (status && status !== 'all') body.status = status;
      return apiRequest('/sub-categories/list', {
        method: 'POST',
        body: JSON.stringify(body),
      });
    },
    create: async (data) => {
      return apiRequest('/sub-categories/create', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },
    update: async (data) => {
      return apiRequest('/sub-categories/update', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },
    delete: async (id) => {
      return apiRequest('/sub-categories/delete', {
        method: 'POST',
        body: JSON.stringify({ id }),
      });
    },
    show: async (id) => {
      return apiRequest('/sub-categories/show', {
        method: 'POST',
        body: JSON.stringify({ id }),
      });
    },
  },

  // News
  news: {
    list: async (filters = {}) => {
      const body = {
        page: filters.page || 1,
        per_page: filters.perPage || 15,
      };
      if (filters.categoryId) body.category_id = filters.categoryId;
      if (filters.subCategoryId) body.sub_category_id = filters.subCategoryId;
      if (filters.newsType && filters.newsType !== 'all') body.news_type = filters.newsType;
      if (filters.publishStatus && filters.publishStatus !== 'all') body.publish_status = filters.publishStatus;
      if (filters.search) body.search = filters.search;
      if (filters.tags && filters.tags.length > 0) body.tags = filters.tags;
      
      return apiRequest('/news/list', {
        method: 'POST',
        body: JSON.stringify(body),
      });
    },
    create: async (data) => {
      const formData = createFormData(data);
      return apiRequest('/news/create', {
        method: 'POST',
        body: formData,
        isMultipart: true,
      });
    },
    update: async (data) => {
      const formData = createFormData(data);
      return apiRequest('/news/update', {
        method: 'POST',
        body: formData,
        isMultipart: true,
      });
    },
    delete: async (id) => {
      return apiRequest('/news/delete', {
        method: 'POST',
        body: JSON.stringify({ id }),
      });
    },
    show: async (id) => {
      return apiRequest('/news/show', {
        method: 'POST',
        body: JSON.stringify({ id }),
      });
    },
  },

  // Flash News
  flashNews: {
    list: async (page = 1, perPage = 15, status = null) => {
      const body = { page, per_page: perPage };
      if (status && status !== 'all') body.status = status;
      return apiRequest('/flash-news/list', {
        method: 'POST',
        body: JSON.stringify(body),
      });
    },
    create: async (data) => {
      return apiRequest('/flash-news/create', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },
    update: async (data) => {
      return apiRequest('/flash-news/update', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },
    delete: async (id) => {
      return apiRequest('/flash-news/delete', {
        method: 'POST',
        body: JSON.stringify({ id }),
      });
    },
  },

  // Users
  users: {
    list: async (page = 1, perPage = 15, role = null, search = null, status = null) => {
      const body = { page, per_page: perPage };
      if (role && role !== 'all') body.role = role;
      if (search) body.search = search;
      if (status && status !== 'all') body.status = status;
      return apiRequest('/users/list', {
        method: 'POST',
        body: JSON.stringify(body),
      });
    },
    create: async (data) => {
      return apiRequest('/users/create', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },
    update: async (data) => {
      return apiRequest('/users/update', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },
    delete: async (id) => {
      return apiRequest('/users/delete', {
        method: 'POST',
        body: JSON.stringify({ id }),
      });
    },
    activate: async (id) => {
      return apiRequest('/users/activate', {
        method: 'POST',
        body: JSON.stringify({ id }),
      });
    },
    deactivate: async (id) => {
      return apiRequest('/users/deactivate', {
        method: 'POST',
        body: JSON.stringify({ id }),
      });
    },
  },

  // Public APIs
  public: {
    categories: async () => {
      return apiRequest('/public/categories', {
        method: 'POST',
        body: JSON.stringify({}),
      });
    },
    subCategories: async (categoryId = null) => {
      const body = categoryId ? { category_id: categoryId } : {};
      return apiRequest('/public/sub-categories', {
        method: 'POST',
        body: JSON.stringify(body),
      });
    },
  },

  // Generic POST request
  post: async (endpoint, data) => {
    return apiRequest(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
};

