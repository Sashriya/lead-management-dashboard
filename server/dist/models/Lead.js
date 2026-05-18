"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importStar(require("mongoose"));
const leadSchema = new mongoose_1.Schema({
    name: {
        type: String,
        required: [true, 'Lead name is required'],
        trim: true,
        minlength: 2,
        maxlength: 100,
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        lowercase: true,
        trim: true,
        match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Please provide a valid email'],
    },
    phone: {
        type: String,
        trim: true,
    },
    status: {
        type: String,
        enum: ['new', 'contacted', 'qualified', 'lost'],
        default: 'new',
    },
    source: {
        type: String,
        enum: ['website', 'instagram', 'referral', 'linkedin'],
        required: [true, 'Source is required'],
    },
    notes: {
        type: String,
        trim: true,
        maxlength: 500,
    },
    assignedTo: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Assigned user is required'],
    },
}, { timestamps: true });
// Indexes
leadSchema.index({ email: 1 });
leadSchema.index({ status: 1, createdAt: -1 });
leadSchema.index({ assignedTo: 1, createdAt: -1 });
// Virtual
leadSchema.virtual('formattedCreatedDate').get(function () {
    return this.createdAt ? this.createdAt.toLocaleDateString() : '';
});
// ✅ FIX: Mongoose 7+ pre-save hooks no longer receive `next` as a function.
// Use async/await and throw an Error instead of calling next(error).
leadSchema.pre('save', function () {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        const disposableDomains = ['tempmail.com', 'throwaway.com'];
        const emailDomain = (_a = this.email) === null || _a === void 0 ? void 0 : _a.split('@')[1];
        if (emailDomain && disposableDomains.includes(emailDomain)) {
            throw new Error('Disposable email addresses are not allowed');
        }
    });
});
// Static methods
leadSchema.statics.getLeadsByStatus = function (status) {
    return this.find({ status }).populate('assignedTo', 'name email');
};
leadSchema.statics.getLeadsBySource = function (source) {
    return this.find({ source }).populate('assignedTo', 'name email');
};
const Lead = mongoose_1.default.model('Lead', leadSchema);
exports.default = Lead;
