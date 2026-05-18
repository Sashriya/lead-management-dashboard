// FIX: was Layout.jsx — TypeScript interface syntax doesn't compile in a .jsx file.
// Renamed to Layout.tsx.
import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import { FiMenu } from 'react-icons/fi';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  const getPageTitle = () => {
    const path = location.pathname;
    if (path === '/dashboard') return 'Dashboard';
    if (path === '/leads') return 'All Leads';
    if (path === '/leads/new') return 'Add New Lead';
    if (path.startsWith('/leads/')) return 'Lead Details';
    return 'Smart Leads';
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white shadow-sm border-b px-4 py-3">
          <div className="flex items-center">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 rounded-md text-gray-500 hover:bg-gray-100 lg:hidden"
            >
              <FiMenu size={24} />
            </button>
            <h1 className="ml-3 text-xl font-semibold text-gray-800">
              {getPageTitle()}
            </h1>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
};

export default Layout;