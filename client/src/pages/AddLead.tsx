import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout/Layout';
import { leadAPI } from '../services/api';
import toast from 'react-hot-toast';

const AddLead = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<{
    name: string;
    email: string;
    phone: string;
    status: "new" | "contacted" | "qualified" | "lost";
    source: "website" | "instagram" | "referral" | "linkedin";
    notes: string;
  }>({
    name: "",
    email: "",
    phone: "",
    status: "new",
    source: "website",
    notes: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await leadAPI.createLead(formData);
      toast.success('Lead created successfully');
      navigate('/leads');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to create lead');
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    'w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500';

  return (
    <Layout>
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Add New Lead</h2>
          <p className="text-sm text-gray-500 mt-1">
            Create a new lead in the system
          </p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Name *
              </label>
              <input
                type="text"
                required
                className={inputClass}
                value={formData.name}
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
                required
                className={inputClass}
                value={formData.email}
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
                className={inputClass}
                value={formData.phone}
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
                className={inputClass}
                value={formData.status}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    status: e.target.value as
                      | "new"
                      | "contacted"
                      | "qualified"
                      | "lost",
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
                required
                className={inputClass}
                value={formData.source}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    source: e.target.value as
                      | "website"
                      | "instagram"
                      | "referral"
                      | "linkedin",
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
                Notes
              </label>
              <textarea
                rows={4}
                className={inputClass}
                value={formData.notes}
                onChange={(e) =>
                  setFormData({ ...formData, notes: e.target.value })
                }
              />
            </div>

            <div className="flex justify-end space-x-3 pt-2">
              <button
                type="button"
                onClick={() => navigate("/leads")}
                className="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                {loading ? "Creating…" : "Create Lead"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  );
};

export default AddLead;