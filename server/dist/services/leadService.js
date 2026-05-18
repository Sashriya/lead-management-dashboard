"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LeadService = void 0;
const Lead_1 = __importDefault(require("../models/Lead"));
class LeadService {
    // Build filter query
    static buildFilterQuery(filters, userRole, userId) {
        const query = {};
        if (filters.status)
            query.status = filters.status;
        if (filters.source)
            query.source = filters.source;
        // Role-based access
        if (userRole === 'sales') {
            query.assignedTo = userId;
        }
        else if (filters.assignedTo) {
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
    static getSortOptions(sortBy) {
        if (sortBy === 'oldest') {
            return { createdAt: 1 };
        }
        return { createdAt: -1 };
    }
    // Pagination metadata
    static getPaginationMetadata(total, page, limit) {
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
    static validateLeadData(leadData) {
        const errors = [];
        // Name validation
        if (!leadData.name || leadData.name.trim().length === 0) {
            errors.push('Name is required');
        }
        // Email validation
        if (!leadData.email ||
            !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(leadData.email)) {
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
    static getLeadStats(userId, userRole) {
        return __awaiter(this, void 0, void 0, function* () {
            const filter = {};
            // Sales users only see their data
            if (userRole === 'sales' && userId) {
                filter.assignedTo = userId;
            }
            // FIX: use title-case enum values matching the schema — previously lowercase
            // queries ('new', 'website') never matched stored data, so all counts were 0.
            const totalLeads = yield Lead_1.default.countDocuments(filter);
            const newLeads = yield Lead_1.default.countDocuments(Object.assign(Object.assign({}, filter), { status: 'New' }));
            const contactedLeads = yield Lead_1.default.countDocuments(Object.assign(Object.assign({}, filter), { status: 'Contacted' }));
            const qualifiedLeads = yield Lead_1.default.countDocuments(Object.assign(Object.assign({}, filter), { status: 'Qualified' }));
            const lostLeads = yield Lead_1.default.countDocuments(Object.assign(Object.assign({}, filter), { status: 'Lost' }));
            const websiteLeads = yield Lead_1.default.countDocuments(Object.assign(Object.assign({}, filter), { source: 'Website' }));
            const instagramLeads = yield Lead_1.default.countDocuments(Object.assign(Object.assign({}, filter), { source: 'Instagram' }));
            const referralLeads = yield Lead_1.default.countDocuments(Object.assign(Object.assign({}, filter), { source: 'Referral' }));
            const linkedInLeads = yield Lead_1.default.countDocuments(Object.assign(Object.assign({}, filter), { source: 'LinkedIn' }));
            return {
                total: totalLeads,
                byStatus: {
                    new: newLeads,
                    contacted: contactedLeads,
                    qualified: qualifiedLeads,
                    lost: lostLeads,
                },
                bySource: {
                    website: websiteLeads,
                    instagram: instagramLeads,
                    referral: referralLeads,
                    linkedin: linkedInLeads,
                },
                conversionRate: totalLeads > 0
                    ? ((qualifiedLeads / totalLeads) * 100).toFixed(2)
                    : 0,
            };
        });
    }
}
exports.LeadService = LeadService;
exports.default = LeadService;
