import { Lead } from '../../types';
import { FiEdit2, FiTrash2, FiEye } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';

interface LeadTableProps {
  leads: Lead[];
  onEdit: (lead: Lead) => void;
  onDelete: (id: string) => void;
  isAdmin: boolean;
}

const LeadTable: React.FC<LeadTableProps> = ({
  leads,
  onEdit,
  onDelete,
  isAdmin,
}) => {
  const navigate = useNavigate();

  // Lowercase keys — match the schema enum values stored in MongoDB
  const statusColors: Record<string, string> = {
    new:       'bg-blue-100 text-blue-800',
    contacted: 'bg-yellow-100 text-yellow-800',
    qualified: 'bg-green-100 text-green-800',
    lost:      'bg-red-100 text-red-800',
  };

  if (leads.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-12 text-center">
        <p className="text-gray-500 text-lg">No leads found</p>
        <p className="text-gray-400 text-sm mt-2">
          Create your first lead to get started
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {['Name', 'Email', 'Phone', 'Status', 'Source', 'Created', 'Actions'].map(
                (h) => (
                  <th
                    key={h}
                    className={`px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider ${
                      h === 'Actions' ? 'text-right' : 'text-left'
                    }`}
                  >
                    {h}
                  </th>
                )
              )}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {leads.map((lead) => (
              <tr
                key={lead._id}
                className="hover:bg-gray-50 transition-colors"
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    {lead.name}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-500">{lead.email}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-500">
                    {lead.phone || 'N/A'}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      statusColors[lead.status] || 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {lead.status.charAt(0).toUpperCase() + lead.status.slice(1)}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-500 capitalize">
                    {lead.source}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-500">
                    {new Date(lead.createdAt).toLocaleDateString()}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-3">
                  <button
                    onClick={() => navigate(`/leads/${lead._id}`)}
                    className="text-blue-600 hover:text-blue-900 transition-colors"
                    title="View Details"
                  >
                    <FiEye className="inline" size={18} />
                  </button>
                  <button
                    onClick={() => onEdit(lead)}
                    className="text-yellow-600 hover:text-yellow-900 transition-colors"
                    title="Edit"
                  >
                    <FiEdit2 className="inline" size={18} />
                  </button>
                  {isAdmin && (
                    <button
                      onClick={() => onDelete(lead._id)}
                      className="text-red-600 hover:text-red-900 transition-colors"
                      title="Delete"
                    >
                      <FiTrash2 className="inline" size={18} />
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default LeadTable;