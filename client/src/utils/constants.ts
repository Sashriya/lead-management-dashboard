export const LEAD_STATUS = {
  NEW: 'new',
  CONTACTED: 'contacted',
  QUALIFIED: 'qualified',
  LOST: 'lost',
} as const;

export const LEAD_SOURCES = {
  WEBSITE: 'website',
  INSTAGRAM: 'instagram',
  REFERRAL: 'referral',
  LINKEDIN: 'linkedin',
} as const;

export const STATUS_COLORS: Record<string, string> = {
  new: 'bg-blue-100 text-blue-800',
  contacted: 'bg-yellow-100 text-yellow-800',
  qualified: 'bg-green-100 text-green-800',
  lost: 'bg-red-100 text-red-800',
};

export const STATUS_OPTIONS = [
  { value: 'new', label: 'New' },
  { value: 'contacted', label: 'Contacted' },
  { value: 'qualified', label: 'Qualified' },
  { value: 'lost', label: 'Lost' },
];

export const SOURCE_OPTIONS = [
  { value: 'website', label: 'Website' },
  { value: 'instagram', label: 'Instagram' },
  { value: 'referral', label: 'Referral' },
  { value: 'linkedin', label: 'LinkedIn' },
];

export const ITEMS_PER_PAGE = 10;
export const DEBOUNCE_DELAY = 500;