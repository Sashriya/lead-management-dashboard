import Lead from '../models/Lead';

interface LeadFilters {
  status?: string;
  source?: string;
  search?: string;
  assignedTo?: string;
}

interface PaginationOptions {
  page: number;
  limit: number;
  sortBy?: 'latest' | 'oldest';
}

export class LeadService {
  // Build filter query
  static buildFilterQuery(
    filters: LeadFilters,
    userRole: string,
    userId: string
  ) {
    const query: any = {};

    if (filters.status) query.status = filters.status;
    if (filters.source) query.source = filters.source;

    // Role-based access
    if (userRole === 'sales') {
      query.assignedTo = userId;
    } else if (filters.assignedTo) {
      query.assignedTo = filters.assignedTo;
    }

    // Search filter
    if (filters.search) {
      query.$or = [
        { name: { $regex: filters.search, $options: 'i' } },
        { email: { $regex: filters.search, $options: 'i' } },
      ];
    }

    return query;
  }

  // Sorting options
  static getSortOptions(sortBy?: string) {
    if (sortBy === 'oldest') {
      return { createdAt: 1 };
    }
    return { createdAt: -1 };
  }

  // Pagination metadata
  static getPaginationMetadata(total: number, page: number, limit: number) {
    return {
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalRecords: total,
      limit,
      hasNextPage: page < Math.ceil(total / limit),
      hasPrevPage: page > 1,
    };
  }

  // Validate lead data
  static validateLeadData(leadData: any): {
    isValid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    // Name validation
    if (!leadData.name || leadData.name.trim().length === 0) {
      errors.push('Name is required');
    }

    // Email validation
    if (
      !leadData.email ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(leadData.email)
    ) {
      errors.push('Valid email is required');
    }

    // Source validation
    if (!leadData.source) {
      errors.push('Source is required');
    }

    // FIX: use title-case values to match what the schema enum and createLead
    // controller both store — previously lowercase values never matched.
    const validSources = ['Website', 'Instagram', 'Referral', 'LinkedIn'];

    if (leadData.source && !validSources.includes(leadData.source)) {
      errors.push('Invalid source');
    }

    // FIX: same title-case fix for status
    const validStatuses = ['New', 'Contacted', 'Qualified', 'Lost'];

    if (leadData.status && !validStatuses.includes(leadData.status)) {
      errors.push('Invalid status');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  // Lead statistics
  static async getLeadStats(userId?: string, userRole?: string) {
    const filter: any = {};

    // Sales users only see their data
    if (userRole === 'sales' && userId) {
      filter.assignedTo = userId;
    }

    // FIX: use title-case enum values matching the schema — previously lowercase
    // queries ('new', 'website') never matched stored data, so all counts were 0.
    const totalLeads = await Lead.countDocuments(filter);

    const newLeads       = await Lead.countDocuments({ ...filter, status: 'New' });
    const contactedLeads = await Lead.countDocuments({ ...filter, status: 'Contacted' });
    const qualifiedLeads = await Lead.countDocuments({ ...filter, status: 'Qualified' });
    const lostLeads      = await Lead.countDocuments({ ...filter, status: 'Lost' });

    const websiteLeads   = await Lead.countDocuments({ ...filter, source: 'Website' });
    const instagramLeads = await Lead.countDocuments({ ...filter, source: 'Instagram' });
    const referralLeads  = await Lead.countDocuments({ ...filter, source: 'Referral' });
    const linkedInLeads  = await Lead.countDocuments({ ...filter, source: 'LinkedIn' });

    return {
      total: totalLeads,
      byStatus: {
        new:       newLeads,
        contacted: contactedLeads,
        qualified: qualifiedLeads,
        lost:      lostLeads,
      },
      bySource: {
        website:   websiteLeads,
        instagram: instagramLeads,
        referral:  referralLeads,
        linkedin:  linkedInLeads,
      },
      conversionRate:
        totalLeads > 0
          ? ((qualifiedLeads / totalLeads) * 100).toFixed(2)
          : 0,
    };
  }
}

export default LeadService;