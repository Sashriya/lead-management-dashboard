import express from 'express';
import {
  createLead,
  getLeads,
  getLeadById,
  updateLead,
  deleteLead,
  exportLeadsCSV,
} from '../controllers/leadController';
import { protect, authorize } from '../middleware/authMiddleware';

// ✅ FIX: No leadValidation middleware here — leadController handles all validation.

const router = express.Router();

router.use(protect);

// NOTE: /export/csv MUST be before /:id
router.get('/export/csv', exportLeadsCSV);

router.route('/').get(getLeads).post(createLead);

router
  .route('/:id')
  .get(getLeadById)
  .put(updateLead)
  .delete(authorize('admin'), deleteLead);

export default router;