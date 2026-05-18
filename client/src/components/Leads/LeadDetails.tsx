import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { leadAPI } from '../../services/api';
import { Lead } from '../../types';
import Layout from '../Layout/Layout';
import Loader from '../Common/Loader';
import toast from 'react-hot-toast';
import {
  FiArrowLeft,
  FiEdit2,
  FiTrash2,
  FiMail,
  FiPhone,
  FiCalendar,
  FiUser,
  FiTag,
  // FIX: FiSource does NOT exist in react-icons/fi — removed. Was causing a runtime crash.
  // Using FiTag for source instead.
  FiSave,
  FiX,
  FiCheckCircle,
  FiClock,
  FiAlertCircle,
} from 'react-icons/fi';

const LeadDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAdmin, user } = useAuth();
  const [lead, setLead] = useState<Lead | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState<Partial<Lead>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchLead();
  }, [id]);

  const fetchLead = async () => {
    try {
      setLoading(true);
      const response = await leadAPI.getLeadById(id!);
      if (response.success) {
        setLead(response.data);
        setFormData(response.data);
      }
    } catch (error: any) {
      if (error.response?.status === 403) {
        toast.error('You are not authorized to view this lead');
      } else if (error.response?.status === 404) {
        toast.error('Lead not found');
      } else {
        toast.error('Failed to fetch lead details');
      }
      navigate('/leads');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async () => {
    setSaving(true);
    try {
      const response = await leadAPI.updateLead(id!, formData);
      if (response.success) {
        setLead(response.data);
        setFormData(response.data);
        toast.success('Lead updated successfully');
        setEditing(false);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update lead');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (
      window.confirm(
        'Are you sure you want to delete this lead? This action cannot be undone.'
      )
    ) {
      try {
        await leadAPI.deleteLead(id!);
        toast.success('Lead deleted successfully');
        navigate('/leads');
      } catch (error: any) {
        toast.error(
          error.response?.status === 403
            ? 'Only admins can delete leads'
            : 'Failed to delete lead'
        );
      }
    }
  };

  // Lowercase keys — match the schema
  const statusColors: Record<string, string> = {
    new:       'bg-green-100 text-green-800 border-green-200',
    contacted: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    qualified: 'bg-blue-100 text-blue-800 border-blue-200',
    lost:      'bg-red-100 text-red-800 border-red-200',
  };

  const statusIcons: Record<string, JSX.Element> = {
    new:       <FiCheckCircle className="w-4 h-4" />,
    contacted: <FiClock className="w-4 h-4" />,
    qualified: <FiCheckCircle className="w-4 h-4" />,
    lost:      <FiAlertCircle className="w-4 h-4" />,
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-96">
          <Loader />
        </div>
      </Layout>
    );
  }

  if (!lead) {
    return (
      <Layout>
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-gray-700">Lead not found</h2>
          <button
            onClick={() => navigate('/leads')}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Back to Leads
          </button>
        </div>
      </Layout>
    );
  }

  // FIX: was comparing lead.assignedTo._id === user?._id — MongoDB ObjectId from the
  // populated doc vs the string stored in auth context. Needs explicit toString() on both.
  const canEdit =
    isAdmin ||
    (user?.role === 'sales' &&
      lead.assignedTo._id.toString() === user?._id?.toString());
  const canDelete = isAdmin;

  return (
    <Layout>
      <div className="max-w-5xl mx-auto">
        {/* Back + action buttons */}
        <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <button
            onClick={() => navigate('/leads')}
            className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
          >
            <FiArrowLeft className="mr-2" />
            Back to Leads
          </button>

          {!editing && (
            <div className="flex space-x-3">
              {canEdit && (
                <button
                  onClick={() => setEditing(true)}
                  className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                >
                  <FiEdit2 className="mr-2" />
                  Edit Lead
                </button>
              )}
              {canDelete && (
                <button
                  onClick={handleDelete}
                  className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
                >
                  <FiTrash2 className="mr-2" />
                  Delete Lead
                </button>
              )}
            </div>
          )}
        </div>

        {/* Card */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          {/* Banner */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-800 px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-white">
                  {editing ? 'Edit Lead' : 'Lead Details'}
                </h1>
                {!editing && (
                  <p className="text-blue-200 text-sm mt-1">ID: {lead._id}</p>
                )}
              </div>
              {!editing && (
                <div
                  className={`flex items-center space-x-2 px-3 py-1 rounded-full border text-sm font-semibold ${
                    statusColors[lead.status]
                  }`}
                >
                  {statusIcons[lead.status]}
                  <span className="capitalize">{lead.status}</span>
                </div>
              )}
            </div>
          </div>

          <div className="p-6">
            {editing ? (
              <div className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Lead Name *
                    </label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={formData.name || ''}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email *
                    </label>
                    <input
                      type="email"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={formData.email || ''}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Phone
                    </label>
                    <input
                      type="tel"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={formData.phone || ''}
                      onChange={(e) =>
                        setFormData({ ...formData, phone: e.target.value })
                      }
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Status
                    </label>
                    <select
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={formData.status || 'new'}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          status: e.target.value as Lead['status'],
                        })
                      }
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
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={formData.source || 'website'}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          source: e.target.value as Lead['source'],
                        })
                      }
                    >
                      <option value="website">Website</option>
                      <option value="instagram">Instagram</option>
                      <option value="referral">Referral</option>
                      <option value="linkedin">LinkedIn</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Assigned To
                    </label>
                    <input
                      type="text"
                      disabled
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-500"
                      value={lead.assignedTo?.name || 'Unassigned'}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Notes
                  </label>
                  <textarea
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={formData.notes || ''}
                    onChange={(e) =>
                      setFormData({ ...formData, notes: e.target.value })
                    }
                  />
                </div>

                <div className="flex justify-end space-x-3 pt-2 border-t">
                  <button
                    onClick={() => {
                      setEditing(false);
                      setFormData(lead);
                    }}
                    className="flex items-center px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    <FiX className="mr-2" />
                    Cancel
                  </button>
                  <button
                    onClick={handleUpdate}
                    disabled={saving}
                    className="flex items-center px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                  >
                    <FiSave className="mr-2" />
                    {saving ? 'Saving…' : 'Save Changes'}
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {[
                    { icon: FiUser,     label: 'Lead Name',    value: lead.name },
                    { icon: FiMail,     label: 'Email',        value: lead.email },
                    { icon: FiPhone,    label: 'Phone',        value: lead.phone || 'Not provided' },
                    { icon: FiTag,      label: 'Source',       value: lead.source,     capitalize: true },
                    { icon: FiUser,     label: 'Assigned To',  value: lead.assignedTo?.name || 'Unassigned' },
                    { icon: FiCalendar, label: 'Created',
                      value: new Date(lead.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric', month: 'long', day: 'numeric',
                      }) },
                    { icon: FiCalendar, label: 'Last Updated',
                      value: new Date(lead.updatedAt).toLocaleDateString('en-US', {
                        year: 'numeric', month: 'long', day: 'numeric',
                      }) },
                  ].map(({ icon: Icon, label, value, capitalize }) => (
                    <div key={label} className="flex items-start space-x-3">
                      <Icon className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-sm text-gray-500">{label}</p>
                        <p
                          className={`text-base font-semibold text-gray-900 ${
                            capitalize ? 'capitalize' : ''
                          }`}
                        >
                          {value}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {lead.notes && (
                  <div className="border-t pt-5">
                    <h3 className="text-base font-semibold text-gray-900 mb-2">
                      Notes
                    </h3>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-sm text-gray-700 whitespace-pre-wrap">
                        {lead.notes}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default LeadDetails;