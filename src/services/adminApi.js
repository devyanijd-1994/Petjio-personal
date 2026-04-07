import api from './api'

// Auth APIs
export const authApi = {
  login: (credentials) => api.post('/auth/admin/login', credentials),
  logout: () => {
    const refreshToken = localStorage.getItem('adminRefreshToken')
    return api.post('/auth/admin/logout', { refreshToken })
  },
  refreshToken: (refreshToken) => api.post('/auth/admin/refresh-token', { refreshToken }),
}

// Dashboard APIs
export const dashboardApi = {
  getStats: () => api.get('/admin/dashboard/stats'),
  getRecentActivity: () => api.get('/admin/dashboard/activity'),
}

// User Management APIs (using existing user routes)
export const userApi = {
  getUsers: (params) => api.get('/users', { params }),
  getUserById: (id) => api.get(`/users/${id}`),
  updateUser: (id, data) => api.put(`/users/${id}`, data),
  deleteUser: (id) => api.delete(`/users/${id}`),
  toggleUserStatus: (id) => api.patch(`/users/${id}/toggle-status`),
}

// Vendor Management APIs (using existing vendor routes)
export const vendorApi = {
  getVendors: (params) => api.get('/vendors', { params }),
  getVendorById: (id) => api.get(`/vendors/${id}`),
  updateVendor: (id, data) => api.put(`/vendors/${id}`, data),
  deleteVendor: (id) => api.delete(`/vendors/${id}`),
  approveVendor: (id) => api.patch(`/vendors/${id}/approve`),
  rejectVendor: (id, reason) => api.patch(`/vendors/${id}/reject`, { reason }),
  toggleVendorStatus: (id) => api.patch(`/vendors/${id}/toggle-status`),
}

// Service Management APIs (using existing admin service routes)
export const serviceApi = {
  getServices: (params) => api.get('/admin/service-categories', { params }),
  getServiceById: (id) => api.get(`/admin/service-categories/${id}`),
  createService: (data) => api.post('/admin/service-categories', data),
  updateService: (id, data) => api.put(`/admin/service-categories/${id}`, data),
  deleteService: (id) => api.delete(`/admin/service-categories/${id}`),
  getVendorServices: (params) => api.get('/admin/vendor-services', { params }),
  approveVendorService: (id) => api.patch(`/admin/vendor-services/${id}/approve`),
  rejectVendorService: (id, reason) => api.patch(`/admin/vendor-services/${id}/reject`, { reason }),
}

// Service Form Management APIs (using existing service form routes)
export const serviceFormApi = {
  getForms: (params) => api.get('/admin/service-forms', { params }),
  getFormById: (id) => api.get(`/admin/service-forms/${id}`),
  createForm: (data) => api.post('/admin/service-forms', data),
  updateForm: (id, data) => api.put(`/admin/service-forms/${id}`, data),
  deleteForm: (id) => api.delete(`/admin/service-forms/${id}`),
  addField: (formId, fieldData) => api.post(`/admin/service-forms/${formId}/fields`, fieldData),
  updateField: (fieldId, fieldData) => api.put(`/admin/service-forms/fields/${fieldId}`, fieldData),
  deleteField: (fieldId) => api.delete(`/admin/service-forms/fields/${fieldId}`),
  reorderFields: (formId, fieldOrder) => api.put(`/admin/service-forms/${formId}/fields/reorder`, { fieldOrder }),
}