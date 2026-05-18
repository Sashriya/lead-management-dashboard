import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { leadAPI } from '../services/api';
import { Lead } from '../types';
import Loader from '../components/Common/Loader';
import toast from 'react-hot-toast';
import { FiArrowLeft, FiEdit2, FiTrash2 } from 'react-icons/fi';

const LeadDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  const [lead, setLead] = useState<Lead | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState<Partial<Lead>>({});

  useEffect(() => {
    fetchLead();
  }, [id]);

  const fetchLead = async () => {
    try {
      const response = await leadAPI.getLeadById(id!);
      setLead(response.data);
      setFormData(response.data);
    } catch (error) {
      toast.error('Failed to fetch lead details');
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async () => {
    try {
      await leadAPI.updateLead(id!, formData);
      toast.success('Lead updated successfully');
      fetchLead();
      setEditing(false);
    } catch (error) {
      toast.error('Failed to update lead');
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this lead?')) {
      try {
        await leadAPI.deleteLead(id!);
        toast.success('Lead deleted successfully');
        navigate('/dashboard');
      } catch (error) {
        toast.error('Failed to delete lead');
      }
    }
  };

  if (loading) return <Loader />;
  if (!lead) return null;

  const statusColors = {
    new: 'bg-blue-100 text-blue-800',
    contacted: 'bg-yellow-100 text-yellow-800',
    qualified: 'bg-green-100 text-green-800',
    lost: 'bg-red-100 text-red-800',
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-6 flex justify-between items-center">
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center text-gray-600 hover:text-gray-900"
          >
            <FiArrowLeft className="mr-2" />
            Back to Dashboard
          </button>
          <div className="flex space-x-3">
            {isAdmin && (
              <button
                onClick={handleDelete}
                className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                <FiTrash2 className="mr-2" />
                Delete
              </button>
            )}
            <button
              onClick={() => setEditing(!editing)}
              className="flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
            >
              <FiEdit2 className="mr-2" />
              {editing ? 'Cancel' : 'Edit'}
            </button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="px-6 py-4 bg-gray-50 border-b">
            <h1 className="text-2xl font-bold text-gray-900">
              {editing ? 'Edit Lead' : 'Lead Details'}
            </h1>
          </div>

          <div className="p-6">
            {editing ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Name *
                  </label>
                  <input
                    type="text"
                    className="input-field"
                    value={formData.name || ''}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email *
                  </label>
                  <input
                    type="email"
                    className="input-field"
                    value={formData.email || ''}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone
                  </label>
                  <input
                    type="tel"
                    className="input-field"
                    value={formData.phone || ''}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Status
                  </label>
                  <select
                    className="input-field"
                    value={formData.status || 'new'}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                  >
                    <option value="new">New</option>
                    <option value="contacted">Contacted</option>
                    <option value="qualified">Qualified</option>
                    <option value="lost">Lost</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Source *
                  </label>
                  <select
                    className="input-field"
                    value={formData.source || 'website'}
                    onChange={(e) => setFormData({ ...formData, source: e.target.value as any })}
                  >
                    <option value="website">Website</option>
                    <option value="instagram">Instagram</option>
                    <option value="referral">Referral</option>
                    <option value="linkedin">LinkedIn</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Notes
                  </label>
                  <textarea
                    rows={4}
                    className="input-field"
                    value={formData.notes || ''}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  />
                </div>
                <div className="flex justify-end pt-4">
                  <button onClick={handleUpdate} className="btn-primary">
                    Save Changes
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Lead Name</p>
                    <p className="font-medium">{lead.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Email</p>
                    <p className="font-medium">{lead.email}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Phone</p>
                    <p className="font-medium">{lead.phone || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Status</p>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${statusColors[lead.status]}`}>
                      {lead.status.toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Source</p>
                    <p className="font-medium capitalize">{lead.source}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Assigned To</p>
                    <p className="font-medium">{lead.assignedTo?.name || 'Unassigned'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Created At</p>
                    <p className="font-medium">{new Date(lead.createdAt).toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Last Updated</p>
                    <p className="font-medium">{new Date(lead.updatedAt).toLocaleString()}</p>
                  </div>
                </div>
                {lead.notes && (
                  <div>
                    <p className="text-sm text-gray-500">Notes</p>
                    <p className="mt-1 text-gray-700">{lead.notes}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LeadDetailsPage;