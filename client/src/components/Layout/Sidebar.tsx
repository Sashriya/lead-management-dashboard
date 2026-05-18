import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { FiHome, FiUsers, FiPlusCircle, FiLogOut } from 'react-icons/fi';

interface SidebarProps {
  isOpen: boolean;
  onClose?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { user, logout } = useAuth();

  const navItems = [
    { path: '/dashboard', name: 'Dashboard', icon: FiHome },
    { path: '/leads', name: 'All Leads', icon: FiUsers },
    { path: '/leads/new', name: 'Add Lead', icon: FiPlusCircle },
  ];

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`
          fixed top-0 left-0 z-30 h-full bg-white shadow-lg transition-all duration-300
          ${isOpen ? 'w-64 translate-x-0' : 'w-64 -translate-x-full lg:translate-x-0 lg:w-20'}
          lg:relative
        `}
      >
        {/* Logo */}
        <div className="flex items-center justify-center h-16 border-b">
          <div
            className={`flex items-center ${isOpen ? 'space-x-2' : 'justify-center'}`}
          >
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">L</span>
            </div>
            {isOpen && (
              <span className="font-semibold text-gray-800">LeadManager</span>
            )}
          </div>
        </div>

        {/* User Info */}
        <div className={`p-4 border-b ${!isOpen && 'text-center'}`}>
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-blue-600 font-semibold">
                {user?.name?.charAt(0).toUpperCase()}
              </span>
            </div>
            {isOpen && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {user?.name}
                </p>
                <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
              </div>
            )}
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-4">
          <div className="px-3 space-y-1">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center px-3 py-2 rounded-lg transition-colors
                  ${isActive ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-100'}
                  ${!isOpen ? 'justify-center' : ''}`
                }
              >
                <item.icon className="h-5 w-5 flex-shrink-0" />
                {isOpen && <span className="ml-3 text-sm">{item.name}</span>}
              </NavLink>
            ))}
          </div>
        </nav>

        {/* Logout */}
        <div className="p-4 border-t">
          <button
            onClick={logout}
            className={`flex items-center w-full px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors
              ${!isOpen ? 'justify-center' : ''}`}
          >
            <FiLogOut className="h-5 w-5 flex-shrink-0" />
            {isOpen && <span className="ml-3 text-sm">Logout</span>}
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;