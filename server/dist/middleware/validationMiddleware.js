"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.leadValidation = exports.loginValidation = exports.registerValidation = exports.validateRequest = void 0;
const express_validator_1 = require("express-validator");
const validateRequest = (req, res, next) => {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        res.status(400).json({ success: false, errors: errors.array() });
        return;
    }
    next();
};
exports.validateRequest = validateRequest;
exports.registerValidation = [
    (0, express_validator_1.body)('name').trim().notEmpty().withMessage('Name is required'),
    (0, express_validator_1.body)('email').isEmail().withMessage('Please provide a valid email'),
    (0, express_validator_1.body)('password')
        .isLength({ min: 6 })
        .withMessage('Password must be at least 6 characters long'),
    (0, express_validator_1.body)('role').optional().isIn(['admin', 'sales']),
    exports.validateRequest,
];
exports.loginValidation = [
    (0, express_validator_1.body)('email').isEmail().withMessage('Please provide a valid email'),
    (0, express_validator_1.body)('password').notEmpty().withMessage('Password is required'),
    exports.validateRequest,
];
// ✅ FIX: leadValidation is intentionally empty — all lead validation is done
// inside leadController.ts (createLead / updateLead) with manual checks.
// express-validator's isIn() was incorrectly rejecting valid lowercase values
// like 'instagram', 'contacted' even though they were in the allowed list.
exports.leadValidation = [];
