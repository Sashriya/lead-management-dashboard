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
Object.defineProperty(exports, "__esModule", { value: true });
exports.CSVExporter = void 0;
const json2csv_1 = require("json2csv");
class CSVExporter {
    // Convert leads to CSV format
    static leadsToCSV(leads) {
        try {
            const csvData = leads.map((lead) => {
                var _a;
                return ({
                    'Lead Name': lead.name,
                    Email: lead.email,
                    Phone: lead.phone || '',
                    Status: lead.status,
                    Source: lead.source,
                    Notes: lead.notes || '',
                    'Assigned To': ((_a = lead.assignedTo) === null || _a === void 0 ? void 0 : _a.name) || 'Unassigned',
                    'Created Date': new Date(lead.createdAt).toLocaleDateString(),
                    'Last Updated': new Date(lead.updatedAt).toLocaleDateString(),
                });
            });
            const parser = new json2csv_1.Parser({ fields: this.fields });
            return parser.parse(csvData);
        }
        catch (error) {
            console.error('CSV Generation Error:', error);
            throw new Error('Failed to generate CSV');
        }
    }
    // Generate filename with timestamp
    static generateFilename(prefix = 'leads') {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        return `${prefix}_export_${timestamp}.csv`;
    }
    // Set CSV response headers
    static setCSVHeaders(res, filename) {
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename=${filename}`);
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Pragma', 'no-cache');
    }
    // Export leads with filters applied
    static exportFilteredLeads(leads, filters, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const csv = this.leadsToCSV(leads);
                const filename = this.generateFilename(`leads_${filters.status || 'all'}`);
                this.setCSVHeaders(res, filename);
                res.send(csv);
            }
            catch (error) {
                console.error('Export Error:', error);
                res
                    .status(500)
                    .json({ success: false, message: 'Failed to export leads' });
            }
        });
    }
    // Format leads for CSV with custom fields
    static formatForCSV(leads, customFields) {
        return leads.map((lead) => {
            var _a;
            return (Object.assign({ 'Lead Name': lead.name, Email: lead.email, Phone: lead.phone || 'N/A', Status: lead.status.toUpperCase(), Source: lead.source.toUpperCase(), Notes: lead.notes || 'No notes', 'Assigned To': ((_a = lead.assignedTo) === null || _a === void 0 ? void 0 : _a.name) || 'Unassigned', 'Created Date': new Date(lead.createdAt).toISOString().split('T')[0], 'Created Time': new Date(lead.createdAt).toLocaleTimeString(), 'Last Updated': new Date(lead.updatedAt).toISOString().split('T')[0] }, (customFields && this.addCustomFields(lead, customFields))));
        });
    }
    static addCustomFields(lead, fields) {
        const customData = {};
        fields.forEach((field) => {
            customData[field] = lead[field] || 'N/A';
        });
        return customData;
    }
    // Generate summary report CSV
    static generateSummaryReport(stats) {
        var _a, _b, _c, _d, _e, _f, _g, _h;
        const summaryData = [
            { Metric: 'Total Leads', Value: stats.total },
            { Metric: 'New Leads', Value: ((_a = stats.byStatus) === null || _a === void 0 ? void 0 : _a.new) || 0 },
            { Metric: 'Contacted Leads', Value: ((_b = stats.byStatus) === null || _b === void 0 ? void 0 : _b.contacted) || 0 },
            { Metric: 'Qualified Leads', Value: ((_c = stats.byStatus) === null || _c === void 0 ? void 0 : _c.qualified) || 0 },
            { Metric: 'Lost Leads', Value: ((_d = stats.byStatus) === null || _d === void 0 ? void 0 : _d.lost) || 0 },
            { Metric: 'Conversion Rate', Value: `${stats.conversionRate}%` },
            { Metric: 'Website Leads', Value: ((_e = stats.bySource) === null || _e === void 0 ? void 0 : _e.website) || 0 },
            { Metric: 'Instagram Leads', Value: ((_f = stats.bySource) === null || _f === void 0 ? void 0 : _f.instagram) || 0 },
            { Metric: 'Referral Leads', Value: ((_g = stats.bySource) === null || _g === void 0 ? void 0 : _g.referral) || 0 },
            { Metric: 'LinkedIn Leads', Value: ((_h = stats.bySource) === null || _h === void 0 ? void 0 : _h.linkedin) || 0 },
        ];
        const parser = new json2csv_1.Parser({ fields: ['Metric', 'Value'] });
        return parser.parse(summaryData);
    }
}
exports.CSVExporter = CSVExporter;
CSVExporter.fields = [
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
exports.default = CSVExporter;
