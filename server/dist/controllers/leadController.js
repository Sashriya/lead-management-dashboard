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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.exportLeadsCSV = exports.deleteLead = exports.updateLead = exports.getLeadById = exports.getLeads = exports.createLead = void 0;
const Lead_1 = __importDefault(require("../models/Lead"));
const json2csv_1 = require("json2csv");
// @desc    Create a new lead
// @route   POST /api/leads
// @access  Private
const createLead = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        console.log('📥 createLead body:', req.body);
        console.log('👤 req.user:', req.user ? `${req.user.email} | _id: ${req.user._id}` : 'UNDEFINED');
        // ✅ Guard: protect middleware should catch this, but double-check
        if (!req.user || !req.user._id) {
            res.status(401).json({ success: false, message: 'Not authenticated' });
            return;
        }
        const { name, email, phone, status, source, notes } = req.body;
        const validSources = ['website', 'instagram', 'referral', 'linkedin'];
        const normalizedSource = source ? source.trim().toLowerCase() : '';
        if (!normalizedSource || !validSources.includes(normalizedSource)) {
            res.status(400).json({
                success: false,
                message: `Invalid source '${source}'. Must be one of: ${validSources.join(', ')}`,
            });
            return;
        }
        const validStatuses = ['new', 'contacted', 'qualified', 'lost'];
        const normalizedStatus = status ? status.trim().toLowerCase() : 'new';
        if (!validStatuses.includes(normalizedStatus)) {
            res.status(400).json({
                success: false,
                message: `Invalid status '${status}'. Must be one of: ${validStatuses.join(', ')}`,
            });
            return;
        }
        const lead = yield Lead_1.default.create({
            name: name.trim(),
            email: email.trim().toLowerCase(),
            phone: phone ? phone.trim() : '',
            status: normalizedStatus,
            source: normalizedSource,
            notes: notes ? notes.trim() : '',
            assignedTo: req.user._id,
        });
        yield lead.populate('assignedTo', 'name email');
        console.log('✅ Lead created:', lead._id);
        res.status(201).json({ success: true, data: lead });
    }
    catch (error) {
        console.error('❌ Create lead error:', error);
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map((e) => e.message);
            console.error('Mongoose ValidationError details:', messages);
            res.status(400).json({ success: false, message: messages.join(', ') });
            return;
        }
        if (error.code === 11000) {
            res.status(400).json({ success: false, message: 'Duplicate field value' });
            return;
        }
        res.status(500).json({ success: false, message: error.message || 'Server error' });
    }
});
exports.createLead = createLead;
// @desc    Get all leads with filtering and pagination
// @route   GET /api/leads
// @access  Private
const getLeads = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { status, source, search, sortBy = 'latest', page = 1, limit = 10, } = req.query;
        const filter = {};
        if (status)
            filter.status = status;
        if (source)
            filter.source = source;
        if (((_a = req.user) === null || _a === void 0 ? void 0 : _a.role) === 'sales') {
            filter.assignedTo = req.user._id;
        }
        if (search) {
            filter.$or = [
                { name: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } },
            ];
        }
        const sortOptions = {};
        if (sortBy === 'latest')
            sortOptions.createdAt = -1;
        if (sortBy === 'oldest')
            sortOptions.createdAt = 1;
        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);
        const skip = (pageNum - 1) * limitNum;
        const totalRecords = yield Lead_1.default.countDocuments(filter);
        const leads = yield Lead_1.default.find(filter)
            .sort(sortOptions)
            .skip(skip)
            .limit(limitNum)
            .populate('assignedTo', 'name email');
        res.json({
            success: true,
            data: leads,
            pagination: {
                currentPage: pageNum,
                totalPages: Math.ceil(totalRecords / limitNum),
                totalRecords,
                limit: limitNum,
            },
        });
    }
    catch (error) {
        console.error('❌ getLeads error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});
exports.getLeads = getLeads;
// @desc    Get single lead by ID
// @route   GET /api/leads/:id
// @access  Private
const getLeadById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const lead = yield Lead_1.default.findById(req.params.id).populate('assignedTo', 'name email');
        if (!lead) {
            res.status(404).json({ success: false, message: 'Lead not found' });
            return;
        }
        if (((_a = req.user) === null || _a === void 0 ? void 0 : _a.role) === 'sales' &&
            lead.assignedTo._id.toString() !== req.user._id.toString()) {
            res.status(403).json({ success: false, message: 'Not authorized to view this lead' });
            return;
        }
        res.json({ success: true, data: lead });
    }
    catch (error) {
        console.error('❌ getLeadById error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});
exports.getLeadById = getLeadById;
// @desc    Update lead
// @route   PUT /api/leads/:id
// @access  Private
const updateLead = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        let lead = yield Lead_1.default.findById(req.params.id);
        if (!lead) {
            res.status(404).json({ success: false, message: 'Lead not found' });
            return;
        }
        if (((_a = req.user) === null || _a === void 0 ? void 0 : _a.role) === 'sales' &&
            lead.assignedTo.toString() !== req.user._id.toString()) {
            res.status(403).json({ success: false, message: 'Not authorized to update this lead' });
            return;
        }
        // ✅ Strip fields that should never be updated via API
        const _b = req.body, { assignedTo, _id, createdAt, updatedAt, __v } = _b, safeBody = __rest(_b, ["assignedTo", "_id", "createdAt", "updatedAt", "__v"]);
        if (safeBody.source)
            safeBody.source = safeBody.source.toLowerCase();
        if (safeBody.status)
            safeBody.status = safeBody.status.toLowerCase();
        lead = (yield Lead_1.default.findByIdAndUpdate(req.params.id, Object.assign({}, safeBody), { new: true, runValidators: true }).populate('assignedTo', 'name email'));
        res.json({ success: true, data: lead });
    }
    catch (error) {
        console.error('❌ updateLead error:', error);
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map((e) => e.message);
            res.status(400).json({ success: false, message: messages.join(', ') });
            return;
        }
        res.status(500).json({ success: false, message: 'Server error' });
    }
});
exports.updateLead = updateLead;
// @desc    Delete lead
// @route   DELETE /api/leads/:id
// @access  Private/Admin
const deleteLead = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const lead = yield Lead_1.default.findById(req.params.id);
        if (!lead) {
            res.status(404).json({ success: false, message: 'Lead not found' });
            return;
        }
        if (((_a = req.user) === null || _a === void 0 ? void 0 : _a.role) !== 'admin') {
            res.status(403).json({ success: false, message: 'Only admins can delete leads' });
            return;
        }
        yield lead.deleteOne();
        res.json({ success: true, message: 'Lead removed successfully' });
    }
    catch (error) {
        console.error('❌ deleteLead error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});
exports.deleteLead = deleteLead;
// @desc    Export leads to CSV
// @route   GET /api/leads/export/csv
// @access  Private
const exportLeadsCSV = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { status, source, search } = req.query;
        const filter = {};
        if (status)
            filter.status = status;
        if (source)
            filter.source = source;
        if (((_a = req.user) === null || _a === void 0 ? void 0 : _a.role) === 'sales')
            filter.assignedTo = req.user._id;
        if (search) {
            filter.$or = [
                { name: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } },
            ];
        }
        const leads = yield Lead_1.default.find(filter)
            .populate('assignedTo', 'name email')
            .lean();
        const csvData = leads.map((lead) => {
            var _a;
            return ({
                Name: lead.name,
                Email: lead.email,
                Phone: lead.phone || '',
                Status: lead.status,
                Source: lead.source,
                Notes: lead.notes || '',
                'Assigned To': ((_a = lead.assignedTo) === null || _a === void 0 ? void 0 : _a.name) || '',
                'Created Date': lead.createdAt
                    ? new Date(lead.createdAt).toISOString().split('T')[0]
                    : '',
            });
        });
        const parser = new json2csv_1.Parser();
        const csv = parser.parse(csvData);
        res.header('Content-Type', 'text/csv');
        res.attachment(`leads_export_${Date.now()}.csv`);
        res.send(csv);
    }
    catch (error) {
        console.error('❌ exportLeadsCSV error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});
exports.exportLeadsCSV = exportLeadsCSV;
