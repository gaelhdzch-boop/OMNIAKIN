const rawApiUrl = (
  import.meta.env?.VITE_API_URL || (import.meta.env?.PROD ? '/api' : 'http://localhost:5000/api')
)?.replace(/\/$/, '');

const API_URL = rawApiUrl
  ? (rawApiUrl.endsWith('/api') ? rawApiUrl : `${rawApiUrl}/api`)
  : 'http://localhost:5000/api';

export const apiCall = async (endpoint, method = 'GET', body = null) => {
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(localStorage.getItem('token') && {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      }),
    },
  };

  if (body) {
    options.body = JSON.stringify(body);
  }

  const response = await fetch(`${API_URL}${endpoint}`, options);
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Error en la solicitud');
  }

  return data;
};

// Autenticación
export const authService = {
  register: (nombre, correo, contraseña, confirmarContraseña, preguntaSeguridad, respuestaSeguridad) =>
    apiCall('/auth/register', 'POST', {
      nombre,
      correo,
      contraseña,
      confirmarContraseña,
      preguntaSeguridad,
      respuestaSeguridad,
    }),

  login: (correo, contraseña) =>
    apiCall('/auth/login', 'POST', { correo, contraseña }),

  forgotPassword: (correo, respuestaSeguridad, contraseña, confirmarContraseña) =>
    apiCall('/auth/forgot-password', 'POST', {
      correo,
      respuestaSeguridad,
      contraseña,
      confirmarContraseña,
    }),

  resetPassword: (token, contraseña, confirmarContraseña) =>
    apiCall('/auth/reset-password', 'POST', {
      token,
      contraseña,
      confirmarContraseña,
    }),

  getProfile: () => apiCall('/auth/profile', 'GET'),

  updateProfile: (nombre, fotoPerfil, preguntaSeguridad, respuestaSeguridad) => {
    const body = { nombre };
    if (fotoPerfil !== undefined) body.fotoPerfil = fotoPerfil;
    if (preguntaSeguridad && respuestaSeguridad) {
      body.preguntaSeguridad = preguntaSeguridad;
      body.respuestaSeguridad = respuestaSeguridad;
    }
    return apiCall('/auth/profile', 'PUT', body);
  },

  changePassword: (contraseñaActual, contraseñaNueva, confirmarContraseña) =>
    apiCall('/auth/change-password', 'PUT', {
      contraseñaActual,
      contraseñaNueva,
      confirmarContraseña,
    }),

  listUsers: () => apiCall('/auth/users', 'GET'),

  revealUserPassword: (usuarioId, contraseñaAdmin) =>
    apiCall(`/auth/users/${usuarioId}/reveal-password`, 'POST', { contraseñaAdmin }),

  resetUserPassword: (usuarioId, contraseñaAdmin) =>
    apiCall(`/auth/users/${usuarioId}/reset-password`, 'POST', { contraseñaAdmin }),

  updateUserRole: (usuarioId, rol) =>
    apiCall('/auth/users/role', 'PUT', { usuarioId, rol }),

  getUserCourses: () => apiCall('/auth/courses', 'GET'),

  registerCourse: (courseId, progreso = 10) =>
    apiCall('/auth/courses/register', 'POST', { courseId, progreso }),

  updateCourseProgress: (courseId, progreso) =>
    apiCall('/auth/courses/progress', 'PUT', { courseId, progreso }),

  getFinanzas: () => apiCall('/auth/finanzas', 'GET'),

  createFinanzasMovimiento: (payload) =>
    apiCall('/auth/finanzas/movimientos', 'POST', payload),

  updateFinanzasMetas: (metas) =>
    apiCall('/auth/finanzas/metas', 'PUT', { metas }),

  purchaseMarketplace: (payload) =>
    apiCall('/auth/marketplace/purchase', 'POST', payload),
};

export const publicService = {
  listCourses: () => apiCall('/auth/cursos/public', 'GET'),
  listOpportunities: () => apiCall('/auth/opportunities/public', 'GET'),
};

// Comunidad (foro)
export const communityService = {
  listPosts: (page = 1, limit = 20) => apiCall(`/auth/community/posts?page=${page}&limit=${limit}`, 'GET'),
  getPost: (id) => apiCall(`/auth/community/posts/${id}`, 'GET'),
  createPost: (payload) => apiCall('/auth/community/posts', 'POST', payload),
  updatePost: (id, payload) => apiCall(`/auth/community/posts/${id}`, 'PUT', payload),
  deletePost: (id) => apiCall(`/auth/community/posts/${id}`, 'DELETE'),
  createComment: (postId, texto) => apiCall(`/auth/community/posts/${postId}/comments`, 'POST', { texto }),
  deleteComment: (commentId) => apiCall(`/auth/community/comments/${commentId}`, 'DELETE'),
  toggleReaction: (postId, tipo = 'like') => apiCall(`/auth/community/posts/${postId}/react`, 'POST', { tipo }),
};

// Marketplace
export const marketplaceService = {
  createProduct: (payload) => apiCall('/auth/marketplace', 'POST', payload),
  listProducts: () => apiCall('/auth/marketplace', 'GET'),
  updateProductStock: (productoId, stock) => apiCall(`/auth/marketplace/${productoId}/stock`, 'PUT', { stock }),
  deleteProduct: (productoId) => apiCall(`/auth/marketplace/${productoId}`, 'DELETE'),
  updateProduct: (productoId, payload) => apiCall(`/auth/marketplace/${productoId}`, 'PUT', payload),
};

export const adminService = {
  listCourses: () => apiCall('/auth/admin/courses', 'GET'),
  createCourse: (payload) => apiCall('/auth/admin/courses', 'POST', payload),
  updateCourse: (courseId, payload) => apiCall(`/auth/admin/courses/${courseId}`, 'PUT', payload),
  deleteCourse: (courseId) => apiCall(`/auth/admin/courses/${courseId}`, 'DELETE'),
  listOpportunities: () => apiCall('/auth/admin/opportunities', 'GET'),
  createOpportunity: (payload) => apiCall('/auth/admin/opportunities', 'POST', payload),
  updateOpportunity: (opportunityId, payload) => apiCall(`/auth/admin/opportunities/${opportunityId}`, 'PUT', payload),
  deleteOpportunity: (opportunityId) => apiCall(`/auth/admin/opportunities/${opportunityId}`, 'DELETE'),
};
