import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { leadAPI } from '../services/api';
import { Lead, FilterOptions } from '../types';
import Layout from '../components/Layout/Layout';
import LeadTable from '../components/Leads/LeadTable';
import LeadFilters from '../components/Leads/LeadFilters';
import LeadForm from '../components/Leads/LeadForm';
import StatsCards from '../components/Dashboard/StatsCards';
import Pagination from '../components/Common/Pagination';
import Loader from '../components/Common/Loader';
import toast from 'react-hot-toast';
import { FiPlus, FiDownload } from 'react-icons/fi';

const Dashboard = () => {
  const { isAdmin } = useAuth();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingLead, setEditingLead] = useState<Lead | null>(null);

  // FIX: stats were calculated from response.data (current page only, max 10 leads)
  // instead of the full dataset. Now fetched separately with a high limit so the
  // counts reflect all records, not just the visible page.
  const [stats, setStats] = useState({
    total: 0,
    byStatus: { new: 0, contacted: 0, qualified: 0, lost: 0 },
    bySource: { website: 0, instagram: 0, referral: 0, linkedin: 0 },
  });

  const [filters, setFilters] = useState<FilterOptions>({
    status: '',
    source: '',
    search: '',
    sortBy: 'latest',
    page: 1,
    limit: 10,
  });
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalRecords: 0,
    limit: 10,
  });

  const fetchLeads = useCallback(async () => {
    setLoading(true);
    try {
      // Paginated leads for the table
      const response = await leadAPI.getLeads(filters);
      setLeads(response.data);
      setPagination(response.pagination);

      // FIX: fetch ALL leads (high limit) to compute accurate stats across the full dataset
      const allResponse = await leadAPI.getLeads({
        ...filters,
        page: 1,
        limit: 10000,
      });
      const all = allResponse.data;
      setStats({
        total: allResponse.pagination.totalRecords,
        byStatus: {
          new:       all.filter((l) => l.status === 'new').length,
          contacted: all.filter((l) => l.status === 'contacted').length,
          qualified: all.filter((l) => l.status === 'qualified').length,
          lost:      all.filter((l) => l.status === 'lost').length,
        },
        bySource: {
          website:   all.filter((l) => l.source === 'website').length,
          instagram: all.filter((l) => l.source === 'instagram').length,
          referral:  all.filter((l) => l.source === 'referral').length,
          linkedin:  all.filter((l) => l.source === 'linkedin').length,
        },
      });
    } catch (error) {
      toast.error('Failed to fetch leads');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchLeads();
  }, [fetchLeads]);

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this lead?')) {
      try {
        await leadAPI.deleteLead(id);
        toast.success('Lead deleted successfully');
        fetchLeads();
      } catch (error) {
        toast.error('Failed to delete lead');
      }
    }
  };

  const handleExport = async () => {
    try {
      await leadAPI.exportCSV(filters);
      toast.success('CSV downloaded');
    } catch (error) {
      toast.error('Failed to export leads');
    }
  };

  const handlePageChange = (page: number) => {
    setFilters((prev) => ({ ...prev, page }));
  };

  const handleSearch = (searchTerm: string) => {
    setFilters((prev) => ({ ...prev, search: searchTerm, page: 1 }));
  };

  if (loading && leads.length === 0) return <Loader />;

  return (
    <Layout>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Lead Management</h2>
          <p className="text-sm text-gray-500 mt-1">
            Track and manage your leads
          </p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={handleExport}
            className="flex items-center px-4 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <FiDownload className="mr-2" />
            Export CSV
          </button>
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <FiPlus className="mr-2" />
            Add Lead
          </button>
        </div>
      </div>

      <StatsCards stats={stats} />

      <LeadFilters
        filters={filters}
        onFilterChange={setFilters}
        onSearch={handleSearch}
      />

      <LeadTable
        leads={leads}
        onEdit={setEditingLead}
        onDelete={handleDelete}
        isAdmin={isAdmin}
      />

      <Pagination
        currentPage={pagination.currentPage}
        totalPages={pagination.totalPages}
        onPageChange={handlePageChange}
      />

      {(showForm || editingLead) && (
        <LeadForm
          lead={editingLead}
          onClose={() => {
            setShowForm(false);
            setEditingLead(null);
          }}
          onSuccess={() => {
            fetchLeads();
            setShowForm(false);
            setEditingLead(null);
          }}
        />
      )}
    </Layout>
  );
};

export default Dashboard;