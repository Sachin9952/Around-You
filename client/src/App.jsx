import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { Toaster } from 'react-hot-toast';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import ChatPage from "./chat/ChatPage";
import ChatDemo from "./chat/ChatDemo";
import Inbox from "./pages/Inbox";
import PageTransition from './components/PageTransition';
import { MotionConfig, AnimatePresence } from 'motion/react';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import ProviderLogin from './pages/ProviderLogin';
import Register from './pages/Register';
import ProviderRegister from './pages/ProviderRegister';
import Services from './pages/Services';
import ServiceDetail from './pages/ServiceDetail';
import NearbyServices from './pages/NearbyServices';
import CustomerDashboard from './pages/CustomerDashboard';
import ProviderDashboard from './pages/ProviderDashboard';
import AdminDashboard from './pages/AdminDashboard';
import AdminSupport from './pages/AdminSupport';
import Settings from './pages/Settings';
import PostRequest from './pages/PostRequest';
import Notifications from './pages/Notifications';
import Footer from './components/Footer';
import CardsDemo from './pages/CardsDemo';

const AnimatedRoutes = () => {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        {/* Public Routes */}
        <Route path="/" element={<PageTransition><Home /></PageTransition>} />
        <Route path="/login" element={<PageTransition><Login /></PageTransition>} />
        <Route path="/provider/login" element={<PageTransition><ProviderLogin /></PageTransition>} />
        <Route path="/register" element={<PageTransition><Register /></PageTransition>} />
        <Route path="/provider/register" element={<PageTransition><ProviderRegister /></PageTransition>} />
        <Route path="/services" element={<PageTransition><Services /></PageTransition>} />
        <Route path="/nearby" element={<PageTransition><NearbyServices /></PageTransition>} />
        <Route path="/services/:id" element={<PageTransition><ServiceDetail /></PageTransition>} />
        <Route path="/chat/:providerId" element={<PageTransition><ChatPage /></PageTransition>} />
        <Route path="/chat-demo" element={<PageTransition><ChatDemo /></PageTransition>} />
        <Route path="/cards-demo" element={<PageTransition><CardsDemo /></PageTransition>} />
        <Route path="/inbox" element={<ProtectedRoute><PageTransition><Inbox /></PageTransition></ProtectedRoute>} />

        {/* Customer Routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute roles={['customer']}>
              <PageTransition><CustomerDashboard /></PageTransition>
            </ProtectedRoute>
          }
        />

        {/* Provider Routes */}
        <Route
          path="/provider/dashboard"
          element={
            <ProtectedRoute roles={['provider']}>
              <PageTransition><ProviderDashboard /></PageTransition>
            </ProtectedRoute>
          }
        />

        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <PageTransition><Settings /></PageTransition>
            </ProtectedRoute>
          }
        />
        <Route
          path="/post-request"
          element={
            <ProtectedRoute>
              <PageTransition><PostRequest /></PageTransition>
            </ProtectedRoute>
          }
        />
        <Route
          path="/notifications"
          element={
            <ProtectedRoute>
              <PageTransition><Notifications /></PageTransition>
            </ProtectedRoute>
          }
        />

        {/* Admin Routes */}
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute roles={['admin']}>
              <PageTransition><AdminDashboard /></PageTransition>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/support"
          element={
            <ProtectedRoute roles={['admin']}>
              <PageTransition><AdminSupport /></PageTransition>
            </ProtectedRoute>
          }
        />

        {/* 404 */}
        <Route
          path="*"
          element={
            <PageTransition>
              <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-dark-900 border-t border-dark-900">
                <div className="text-center">
                  <h1 className="text-6xl font-bold text-primary-500 mb-4">404</h1>
                  <p className="text-xl text-dark-200">Page not found</p>
                </div>
              </div>
            </PageTransition>
          }
        />
      </Routes>
    </AnimatePresence>
  );
};

function App() {
  // ── Keep the Render backend alive (free tier sleeps after 15 min) ──
  useEffect(() => {
    const API_URL = import.meta.env.VITE_API_URL;
    if (!API_URL) return;

    // Ping immediately on mount so the server wakes up early
    fetch(`${API_URL}/api/health`).catch(() => {});

    // Then ping every 14 minutes to keep it awake
    const keepAlive = setInterval(() => {
      fetch(`${API_URL}/api/health`).catch(() => {});
    }, 14 * 60 * 1000);

    return () => clearInterval(keepAlive);
  }, []);

  return (
    <Router>
      <AuthProvider>
        <MotionConfig transition={{ duration: 0.3, ease: 'easeInOut' }}>
          <div className="min-h-screen bg-dark-900 flex flex-col">
            <Navbar />
            <main className="flex-1 overflow-x-hidden">
              <AnimatedRoutes />
            </main>
            <Footer />
          </div>
        </MotionConfig>

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
