import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { leadAPI } from '../services/api';
import { Lead, FilterOptions } from '../types';
import Layout from '../components/Layout/Layout';
import LeadTable from '../components/Leads/LeadTable';
import LeadFilters from '../components/Leads/LeadFilters';
import Pagination from '../components/Common/Pagination';
import Loader from '../components/Common/Loader';
import toast from 'react-hot-toast';
import { FiPlus, FiDownload } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';

const AllLeads = () => {
  const { isAdmin } = useAuth();
  const navigate = useNavigate();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
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
      const response = await leadAPI.getLeads(filters);
      setLeads(response.data);
      setPagination(response.pagination);
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

  const handlePageChange = (page: number) =>
    setFilters((prev) => ({ ...prev, page }));

  const handleSearch = (searchTerm: string) =>
    setFilters((prev) => ({ ...prev, search: searchTerm, page: 1 }));

  if (loading && leads.length === 0) return <Loader />;

  return (
    <Layout>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">All Leads</h2>
          <p className="text-sm text-gray-500 mt-1">
            {pagination.totalRecords} total records
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
            onClick={() => navigate('/leads/new')}
            className="flex items-center px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <FiPlus className="mr-2" />
            Add Lead
          </button>
        </div>
      </div>

      <LeadFilters
        filters={filters}
        onFilterChange={setFilters}
        onSearch={handleSearch}
      />

      <LeadTable
        leads={leads}
        onEdit={(lead) => navigate(`/leads/${lead._id}`)}
        onDelete={handleDelete}
        isAdmin={isAdmin}
      />

      <Pagination
        currentPage={pagination.currentPage}
        totalPages={pagination.totalPages}
        onPageChange={handlePageChange}
      />
    </Layout>
  );
};

export default AllLeads;