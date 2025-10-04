const handleResponse = async (response) => {
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Une erreur est survenue');
  }
  return response.json();
};

const apiCall = async (endpoint, options = {}) => {
  const baseURL = import.meta.env.VITE_API_URL || '';
  const token = localStorage.getItem('auth_token');
  
  const defaultOptions = {
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  };

  const response = await fetch(`${baseURL}${endpoint}`, {
    ...defaultOptions,
    ...options,
    headers: {
      ...defaultOptions.headers,
      ...options.headers,
    },
  });

  return handleResponse(response);
};

export const api = {
  auth: {
    login: async (email, password) => {
      return apiCall('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
    },

    validateToken: async (token) => {
      return apiCall('/auth/validate', {
        method: 'POST',
        body: JSON.stringify({ token }),
      });
    },

    logout: async () => {
      return apiCall('/auth/logout', {
        method: 'POST',
      });
    },
  },

  tasks: {
    getAll: () => apiCall('/api/tasks'),
    getById: (id) => apiCall(`/api/tasks/${id}`),
    create: (data) => apiCall('/api/tasks', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
    update: (id, data) => apiCall(`/api/tasks/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
    delete: (id) => apiCall(`/api/tasks/${id}`, {
      method: 'DELETE',
    }),
    uploadFile: async (formData) => {
      const baseURL = import.meta.env.VITE_API_URL || '';
      const token = localStorage.getItem('auth_token');
      
      const response = await fetch(`${baseURL}/api/tasks/upload`, {
        method: 'POST',
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: formData,
      });
      
      return handleResponse(response);
    },
  },

  cases: {
    getAll: () => apiCall('/api/cases'),
    getById: (id) => apiCall(`/api/cases/${id}`),
    create: (data) => apiCall('/api/cases', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
    update: (id, data) => apiCall(`/api/cases/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
    delete: (id) => apiCall(`/api/cases/${id}`, {
      method: 'DELETE',
    }),
  },

  clients: {
    getAll: () => apiCall('/api/clients'),
    getById: (id) => apiCall(`/api/clients/${id}`),
    create: (data) => apiCall('/api/clients', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
    update: (id, data) => apiCall(`/api/clients/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
    delete: (id) => apiCall(`/api/clients/${id}`, {
      method: 'DELETE',
    }),
  },
  
  team: {
    getAll: () => apiCall('/api/team'),
    getById: (id) => apiCall(`/api/team/${id}`),
    create: (data) => apiCall('/api/team', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
    update: (id, data) => apiCall(`/api/team/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
    delete: (id) => apiCall(`/api/team/${id}`, {
      method: 'DELETE',
    }),
  },
};