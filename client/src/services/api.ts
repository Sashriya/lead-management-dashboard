import axios from 'axios';
import {
  LoginCredentials,
  RegisterCredentials,
  FilterOptions,
  LeadsResponse,
  AuthResponse,
  Lead,
} from '../types';

const API_URL =
  (import.meta as any).env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
});

// Attach JWT to every request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Redirect to login on 401 + LOG all errors so we can see exact backend message
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // ✅ FIX: Log the exact error response so we can see what backend is rejecting
    if (error.response) {
      console.error(
        `❌ API Error [${error.response.status}] ${error.config?.method?.toUpperCase()} ${error.config?.url}:`,
        JSON.stringify(error.response.data, null, 2)
      );
    }

    if (
      error.response?.status === 401 &&
      !error.config.url?.includes('/auth/login')
    ) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// ─── Auth ────────────────────────────────────────────────────────────────────
export const authAPI = {
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const response = await api.post('/auth/login', credentials);
    return response.data;
  },

  register: async (credentials: RegisterCredentials): Promise<AuthResponse> => {
    const response = await api.post('/auth/register', credentials);
    return response.data;
  },

  getMe: async (): Promise<AuthResponse> => {
    const response = await api.get('/auth/me');
    return response.data;
  },
};

// ─── Leads ───────────────────────────────────────────────────────────────────
export const leadAPI = {
  getLeads: async (filters: FilterOptions): Promise<LeadsResponse> => {
    const params = new URLSearchParams();
    if (filters.status) params.append('status', filters.status);
    if (filters.source) params.append('source', filters.source);
    if (filters.search) params.append('search', filters.search);
    if (filters.sortBy) params.append('sortBy', filters.sortBy);
    if (filters.page) params.append('page', filters.page.toString());
    if (filters.limit) params.append('limit', filters.limit.toString());

    const response = await api.get(`/leads?${params.toString()}`);
    return response.data;
  },

  getLeadById: async (id: string): Promise<{ success: boolean; data: Lead }> => {
    const response = await api.get(`/leads/${id}`);
    return response.data;
  },

  createLead: async (
    leadData: Partial<Lead>
  ): Promise<{ success: boolean; data: Lead }> => {
    // ✅ FIX: Only send the fields the backend expects — strip any Lead fields
    // like assignedTo/_id/createdAt/updatedAt that should not be sent on create
    const payload = {
      name:   leadData.name,
      email:  leadData.email,
      phone:  leadData.phone  || '',
      status: leadData.status || 'new',
      source: leadData.source || 'website',
      notes:  leadData.notes  || '',
    };
    console.log('📤 Creating lead with payload:', payload);
    const response = await api.post('/leads', payload);
    return response.data;
  },

  updateLead: async (
    id: string,
    leadData: Partial<Lead>
  ): Promise<{ success: boolean; data: Lead }> => {
    // ✅ FIX: Only send updatable fields — never send assignedTo, _id, timestamps
    const payload: Record<string, any> = {};
    if (leadData.name   !== undefined) payload.name   = leadData.name;
    if (leadData.email  !== undefined) payload.email  = leadData.email;
    if (leadData.phone  !== undefined) payload.phone  = leadData.phone;
    if (leadData.status !== undefined) payload.status = leadData.status;
    if (leadData.source !== undefined) payload.source = leadData.source;
    if (leadData.notes  !== undefined) payload.notes  = leadData.notes;

    console.log('📤 Updating lead with payload:', payload);
    const response = await api.put(`/leads/${id}`, payload);
    return response.data;
  },

  deleteLead: async (
    id: string
  ): Promise<{ success: boolean; message: string }> => {
    const response = await api.delete(`/leads/${id}`);
    return response.data;
  },

  exportCSV: async (filters: FilterOptions): Promise<void> => {
    const params = new URLSearchParams();
    if (filters.status) params.append('status', filters.status);
    if (filters.source) params.append('source', filters.source);
    if (filters.search) params.append('search', filters.search);

    const response = await api.get(
      `/leads/export/csv?${params.toString()}`,
      { responseType: 'blob' }
    );

    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `leads_export_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  },
};

export default api;