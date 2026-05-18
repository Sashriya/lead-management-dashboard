import { body, validationResult } from 'express-validator';
import { Request, Response, NextFunction } from 'express';

export const validateRequest = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ success: false, errors: errors.array() });
    return;
  }
  next();
};

export const registerValidation = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Please provide a valid email'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  body('role').optional().isIn(['admin', 'sales']),
  validateRequest,
];

export const loginValidation = [
  body('email').isEmail().withMessage('Please provide a valid email'),
  body('password').notEmpty().withMessage('Password is required'),
  validateRequest,
];

// ✅ FIX: leadValidation is intentionally empty — all lead validation is done
// inside leadController.ts (createLead / updateLead) with manual checks.
// express-validator's isIn() was incorrectly rejecting valid lowercase values
// like 'instagram', 'contacted' even though they were in the allowed list.
export const leadValidation: any[] = [];