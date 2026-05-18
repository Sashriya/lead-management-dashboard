import { Parser } from 'json2csv';

export interface LeadCSVData {
  'Lead Name': string;
  Email: string;
  Phone: string;
  Status: string;
  Source: string;
  Notes: string;
  'Assigned To': string;
  'Created Date': string;
  'Last Updated': string;
}

export class CSVExporter {
  private static fields = [
    'Lead Name',
    'Email',
    'Phone',
    'Status',
    'Source',
    'Notes',
    'Assigned To',
    'Created Date',
    'Last Updated',
  ];

  // Convert leads to CSV format
  static leadsToCSV(leads: any[]): string {
    try {
      const csvData = leads.map((lead) => ({
        'Lead Name': lead.name,
        Email: lead.email,
        Phone: lead.phone || '',
        Status: lead.status,
        Source: lead.source,
        Notes: lead.notes || '',
        'Assigned To': lead.assignedTo?.name || 'Unassigned',
        'Created Date': new Date(lead.createdAt).toLocaleDateString(),
        'Last Updated': new Date(lead.updatedAt).toLocaleDateString(),
      }));

      const parser = new Parser({ fields: this.fields });
      return parser.parse(csvData);
    } catch (error) {
      console.error('CSV Generation Error:', error);
      throw new Error('Failed to generate CSV');
    }
  }

  // Generate filename with timestamp
  static generateFilename(prefix: string = 'leads'): string {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    return `${prefix}_export_${timestamp}.csv`;
  }

  // Set CSV response headers
  static setCSVHeaders(res: any, filename: string): void {
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=${filename}`);
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Pragma', 'no-cache');
  }

  // Export leads with filters applied
  static async exportFilteredLeads(
    leads: any[],
    filters: any,
    res: any
  ): Promise<void> {
    try {
      const csv = this.leadsToCSV(leads);
      const filename = this.generateFilename(
        `leads_${filters.status || 'all'}`
      );
      this.setCSVHeaders(res, filename);
      res.send(csv);
    } catch (error) {
      console.error('Export Error:', error);
      res
        .status(500)
        .json({ success: false, message: 'Failed to export leads' });
    }
  }

  // Format leads for CSV with custom fields
  static formatForCSV(leads: any[], customFields?: string[]): any[] {
    return leads.map((lead) => ({
      'Lead Name': lead.name,
      Email: lead.email,
      Phone: lead.phone || 'N/A',
      Status: lead.status.toUpperCase(),
      Source: lead.source.toUpperCase(),
      Notes: lead.notes || 'No notes',
      'Assigned To': lead.assignedTo?.name || 'Unassigned',
      'Created Date': new Date(lead.createdAt).toISOString().split('T')[0],
      'Created Time': new Date(lead.createdAt).toLocaleTimeString(),
      'Last Updated': new Date(lead.updatedAt).toISOString().split('T')[0],
      ...(customFields && this.addCustomFields(lead, customFields)),
    }));
  }

  private static addCustomFields(lead: any, fields: string[]): any {
    const customData: any = {};
    fields.forEach((field) => {
      customData[field] = lead[field] || 'N/A';
    });
    return customData;
  }

  // Generate summary report CSV
  static generateSummaryReport(stats: any): string {
    const summaryData = [
      { Metric: 'Total Leads', Value: stats.total },
      { Metric: 'New Leads', Value: stats.byStatus?.new || 0 },
      { Metric: 'Contacted Leads', Value: stats.byStatus?.contacted || 0 },
      { Metric: 'Qualified Leads', Value: stats.byStatus?.qualified || 0 },
      { Metric: 'Lost Leads', Value: stats.byStatus?.lost || 0 },
      { Metric: 'Conversion Rate', Value: `${stats.conversionRate}%` },
      { Metric: 'Website Leads', Value: stats.bySource?.website || 0 },
      { Metric: 'Instagram Leads', Value: stats.bySource?.instagram || 0 },
      { Metric: 'Referral Leads', Value: stats.bySource?.referral || 0 },
      { Metric: 'LinkedIn Leads', Value: stats.bySource?.linkedin || 0 },
    ];

    const parser = new Parser({ fields: ['Metric', 'Value'] });
    return parser.parse(summaryData);
  }
}

export default CSVExporter;