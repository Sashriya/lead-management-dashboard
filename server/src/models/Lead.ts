import mongoose, { Document, Schema, Model } from 'mongoose';

export interface ILeadDocument extends Document {
  name: string;
  email: string;
  phone?: string;
  status: 'new' | 'contacted' | 'qualified' | 'lost';
  source: 'website' | 'instagram' | 'referral' | 'linkedin';
  notes?: string;
  assignedTo: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

interface ILeadModel extends Model<ILeadDocument> {
  getLeadsByStatus(status: string): Promise<ILeadDocument[]>;
  getLeadsBySource(source: string): Promise<ILeadDocument[]>;
}

const leadSchema = new Schema<ILeadDocument, ILeadModel>(
  {
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
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Assigned user is required'],
    },
  },
  { timestamps: true }
);

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
leadSchema.pre<ILeadDocument>('save', async function () {
  const disposableDomains = ['tempmail.com', 'throwaway.com'];
  const emailDomain = this.email?.split('@')[1];
  if (emailDomain && disposableDomains.includes(emailDomain)) {
    throw new Error('Disposable email addresses are not allowed');
  }
});

// Static methods
leadSchema.statics.getLeadsByStatus = function (status: string) {
  return this.find({ status }).populate('assignedTo', 'name email');
};

leadSchema.statics.getLeadsBySource = function (source: string) {
  return this.find({ source }).populate('assignedTo', 'name email');
};

const Lead = mongoose.model<ILeadDocument, ILeadModel>('Lead', leadSchema);
export default Lead;