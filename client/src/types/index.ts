export interface User {
  _id: string;
  name: string;
  email: string;
  role: 'admin' | 'sales';
  token?: string;
}

export interface Lead {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  // Lowercase enums — matches the corrected backend schema
  status: 'new' | 'contacted' | 'qualified' | 'lost';
  source: 'website' | 'instagram' | 'referral' | 'linkedin';
  notes?: string;
  assignedTo: {
    _id: string;
    name: string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface PaginationData {
  currentPage: number;
  totalPages: number;
  totalRecords: number;
  limit: number;
}

export interface LeadsResponse {
  success: boolean;
  data: Lead[];
  pagination: PaginationData;
}

export interface AuthResponse {
  success: boolean;
  data: User;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  name: string;
  email: string;
  password: string;
  role?: string;
}

export interface FilterOptions {
  status?: string;
  source?: string;
  search?: string;
  sortBy?: 'latest' | 'oldest';
  page?: number;
  limit?: number;
}