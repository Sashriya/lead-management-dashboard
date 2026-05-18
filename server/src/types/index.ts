import { Request } from 'express';

export interface IUser {
  _id: string;
  name: string;
  email: string;
  password: string;
  role: 'admin' | 'sales';
  createdAt: Date;
  updatedAt: Date;
}

export interface ILead {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  // FIX: was title-case to match wrong schema — now lowercase
  status: 'new' | 'contacted' | 'qualified' | 'lost';
  source: 'website' | 'instagram' | 'referral' | 'linkedin';
  notes?: string;
  assignedTo: string | IUser;
  createdAt: Date;
  updatedAt: Date;
}

export interface IFilterOptions {
  status?: string;
  source?: string;
  search?: string;
  sortBy?: 'latest' | 'oldest';
  page?: number;
  limit?: number;
}

export interface IPaginationResponse {
  data: ILead[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalRecords: number;
    limit: number;
  };
}

export interface IAuthRequest extends Request {
  user?: IUser;
}