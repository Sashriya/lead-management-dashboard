import { Request, Response } from 'express';
import Lead from '../models/Lead';
import { Parser } from 'json2csv';

// @desc    Create a new lead
// @route   POST /api/leads
// @access  Private
export const createLead = async (req: Request, res: Response): Promise<void> => {
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

    const lead = await Lead.create({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      phone: phone ? phone.trim() : '',
      status: normalizedStatus,
      source: normalizedSource,
      notes: notes ? notes.trim() : '',
      assignedTo: req.user._id,
    });

    await lead.populate('assignedTo', 'name email');
    console.log('✅ Lead created:', lead._id);
    res.status(201).json({ success: true, data: lead });
  } catch (error: any) {
    console.error('❌ Create lead error:', error);
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((e: any) => e.message);
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
};

// @desc    Get all leads with filtering and pagination
// @route   GET /api/leads
// @access  Private
export const getLeads = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      status,
      source,
      search,
      sortBy = 'latest',
      page = 1,
      limit = 10,
    } = req.query;

    const filter: any = {};
    if (status) filter.status = status;
    if (source) filter.source = source;

    if (req.user?.role === 'sales') {
      filter.assignedTo = req.user._id;
    }

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    const sortOptions: any = {};
    if (sortBy === 'latest') sortOptions.createdAt = -1;
    if (sortBy === 'oldest') sortOptions.createdAt = 1;

    const pageNum  = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip     = (pageNum - 1) * limitNum;

    const totalRecords = await Lead.countDocuments(filter);
    const leads = await Lead.find(filter)
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
  } catch (error) {
    console.error('❌ getLeads error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Get single lead by ID
// @route   GET /api/leads/:id
// @access  Private
export const getLeadById = async (req: Request, res: Response): Promise<void> => {
  try {
    const lead = await Lead.findById(req.params.id).populate('assignedTo', 'name email');

    if (!lead) {
      res.status(404).json({ success: false, message: 'Lead not found' });
      return;
    }

    if (
      req.user?.role === 'sales' &&
      (lead.assignedTo as any)._id.toString() !== req.user._id.toString()
    ) {
      res.status(403).json({ success: false, message: 'Not authorized to view this lead' });
      return;
    }

    res.json({ success: true, data: lead });
  } catch (error) {
    console.error('❌ getLeadById error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Update lead
// @route   PUT /api/leads/:id
// @access  Private
export const updateLead = async (req: Request, res: Response): Promise<void> => {
  try {
    let lead = await Lead.findById(req.params.id);

    if (!lead) {
      res.status(404).json({ success: false, message: 'Lead not found' });
      return;
    }

    if (
      req.user?.role === 'sales' &&
      lead.assignedTo.toString() !== req.user._id.toString()
    ) {
      res.status(403).json({ success: false, message: 'Not authorized to update this lead' });
      return;
    }

    // ✅ Strip fields that should never be updated via API
    const { assignedTo, _id, createdAt, updatedAt, __v, ...safeBody } = req.body;

    if (safeBody.source) safeBody.source = safeBody.source.toLowerCase();
    if (safeBody.status) safeBody.status = safeBody.status.toLowerCase();

    lead = await Lead.findByIdAndUpdate(
      req.params.id,
      { ...safeBody },
      { new: true, runValidators: true }
    ).populate('assignedTo', 'name email') as any;

    res.json({ success: true, data: lead });
  } catch (error: any) {
    console.error('❌ updateLead error:', error);
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((e: any) => e.message);
      res.status(400).json({ success: false, message: messages.join(', ') });
      return;
    }
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Delete lead
// @route   DELETE /api/leads/:id
// @access  Private/Admin
export const deleteLead = async (req: Request, res: Response): Promise<void> => {
  try {
    const lead = await Lead.findById(req.params.id);

    if (!lead) {
      res.status(404).json({ success: false, message: 'Lead not found' });
      return;
    }

    if (req.user?.role !== 'admin') {
      res.status(403).json({ success: false, message: 'Only admins can delete leads' });
      return;
    }

    await lead.deleteOne();
    res.json({ success: true, message: 'Lead removed successfully' });
  } catch (error) {
    console.error('❌ deleteLead error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Export leads to CSV
// @route   GET /api/leads/export/csv
// @access  Private
export const exportLeadsCSV = async (req: Request, res: Response): Promise<void> => {
  try {
    const { status, source, search } = req.query;
    const filter: any = {};

    if (status) filter.status = status;
    if (source) filter.source = source;
    if (req.user?.role === 'sales') filter.assignedTo = req.user._id;

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    const leads: any[] = await Lead.find(filter)
      .populate('assignedTo', 'name email')
      .lean();

    const csvData = leads.map((lead) => ({
      Name: lead.name,
      Email: lead.email,
      Phone: lead.phone || '',
      Status: lead.status,
      Source: lead.source,
      Notes: lead.notes || '',
      'Assigned To': lead.assignedTo?.name || '',
      'Created Date': lead.createdAt
        ? new Date(lead.createdAt).toISOString().split('T')[0]
        : '',
    }));

    const parser = new Parser();
    const csv = parser.parse(csvData);

    res.header('Content-Type', 'text/csv');
    res.attachment(`leads_export_${Date.now()}.csv`);
    res.send(csv);
  } catch (error) {
    console.error('❌ exportLeadsCSV error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};