import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LoginCredentials } from '../types';

const Login = () => {
  const [credentials, setCredentials] = useState<LoginCredentials>({
    email: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(credentials);
      navigate('/dashboard');
    } catch (error) {
      // toast is shown inside AuthContext.login
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="mx-auto w-14 h-14 bg-blue-600 rounded-xl flex items-center justify-center mb-4">
            <span className="text-white text-2xl font-bold">L</span>
          </div>
          <h2 className="text-3xl font-extrabold text-gray-900">
            Smart Leads
          </h2>
          <p className="mt-2 text-sm text-gray-600">Sign in to your account</p>
        </div>

        <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email address
            </label>
            <input
              type="email"
              required
              autoComplete="email"
              className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-lg placeholder-gray-400 text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="you@example.com"
              value={credentials.email}
              onChange={(e) =>
                setCredentials({ ...credentials, email: e.target.value })
              }
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              type="password"
              required
              autoComplete="current-password"
              className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-lg placeholder-gray-400 text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="••••••••"
              value={credentials.password}
              onChange={(e) =>
                setCredentials({ ...credentials, password: e.target.value })
              }
            />
          </div>

          {/* FIX: was 'text-black bg-primary-600' — black text on a dark blue background
              is invisible. Changed to 'text-white'. Also replaced undefined primary-* classes
              with explicit blue-* classes that Tailwind resolves by default. */}
          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center py-2.5 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 transition-colors"
          >
            {loading ? 'Signing in…' : 'Sign in'}
          </button>

          <div className="text-center">
            <Link
              to="/register"
              className="text-sm text-blue-600 hover:text-blue-500"
            >
              Don't have an account? Register
            </Link>
          </div>

          <div className="bg-gray-100 rounded-lg p-3 text-xs text-center text-gray-500 space-y-1">
            <p className="font-medium text-gray-600">Demo Accounts</p>
            <p>Admin: admin@smartleads.com / Admin123!</p>
            <p>Sales: sales1@smartleads.com / Sales123!</p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;