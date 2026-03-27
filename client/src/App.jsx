import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { Toaster } from 'react-hot-toast';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import ProviderLogin from './pages/ProviderLogin';
import Register from './pages/Register';
import ProviderRegister from './pages/ProviderRegister';
import Services from './pages/Services';
import ServiceDetail from './pages/ServiceDetail';
import CustomerDashboard from './pages/CustomerDashboard';
import ProviderDashboard from './pages/ProviderDashboard';
import AdminDashboard from './pages/AdminDashboard';
import AdminSupport from './pages/AdminSupport';
import Settings from './pages/Settings';
import PostRequest from './pages/PostRequest';
import Notifications from './pages/Notifications';

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="min-h-screen bg-dark-900">
          <Navbar />
          <main>
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/provider/login" element={<ProviderLogin />} />
              <Route path="/register" element={<Register />} />
              <Route path="/provider/register" element={<ProviderRegister />} />
              <Route path="/services" element={<Services />} />
              <Route path="/services/:id" element={<ServiceDetail />} />

              {/* Customer Routes */}
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute roles={['customer']}>
                    <CustomerDashboard />
                  </ProtectedRoute>
                }
              />

              {/* Provider Routes */}
              <Route
                path="/provider/dashboard"
                element={
                  <ProtectedRoute roles={['provider']}>
                    <ProviderDashboard />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/settings"
                element={
                  <ProtectedRoute>
                    <Settings />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/post-request"
                element={
                  <ProtectedRoute>
                    <PostRequest />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/notifications"
                element={
                  <ProtectedRoute>
                    <Notifications />
                  </ProtectedRoute>
                }
              />

              {/* Admin Routes */}
              <Route
                path="/admin/dashboard"
                element={
                  <ProtectedRoute roles={['admin']}>
                    <AdminDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/support"
                element={
                  <ProtectedRoute roles={['admin']}>
                    <AdminSupport />
                  </ProtectedRoute>
                }
              />

              {/* 404 */}
              <Route
                path="*"
                element={
                  <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
                    <div className="text-center">
                      <h1 className="text-6xl font-bold text-primary-500 mb-4">404</h1>
                      <p className="text-xl text-dark-200">Page not found</p>
                    </div>
                  </div>
                }
              />
            </Routes>
          </main>
        </div>

        {/* Toast notifications */}
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: {
              background: '#25262B',
              color: '#fff',
              border: '1px solid #373A40',
            },
            success: {
              iconTheme: { primary: '#40c057', secondary: '#fff' },
            },
            error: {
              iconTheme: { primary: '#fa5252', secondary: '#fff' },
            },
          }}
        />
      </AuthProvider>
    </Router>
  );
}

export default App;
