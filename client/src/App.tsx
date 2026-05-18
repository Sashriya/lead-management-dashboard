import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import PrivateRoute from './components/Common/PrivateRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import LeadDetailsPage from './pages/LeadDetailsPage';
import AllLeads from './pages/AllLeads';
import AddLead from './pages/AddLead';
import NotFound from './pages/NotFound';

function App() {
  return (
    // FIX: Added future flags to suppress React Router v6 → v7 deprecation warnings:
    //   v7_startTransition  — wraps state updates in React.startTransition
    //   v7_relativeSplatPath — changes relative route resolution inside splat routes
    <Router
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true,
      }}
    >
      <AuthProvider>
        <Toaster position="top-right" />
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected Routes */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route
            path="/dashboard"
            element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            }
          />
          <Route
            path="/leads"
            element={
              <PrivateRoute>
                <AllLeads />
              </PrivateRoute>
            }
          />
          <Route
            path="/leads/new"
            element={
              <PrivateRoute>
                <AddLead />
              </PrivateRoute>
            }
          />
          <Route
            path="/leads/:id"
            element={
              <PrivateRoute>
                <LeadDetailsPage />
              </PrivateRoute>
            }
          />

          {/* 404 Page */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;