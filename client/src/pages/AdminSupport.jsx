import { useState, useEffect } from 'react';
import API from '../api/axios';
import LoadingSpinner from '../components/LoadingSpinner';
import { HiCheck, HiUser, HiChatAlt2 } from 'react-icons/hi';
import toast from 'react-hot-toast';

const AdminSupport = () => {
  const [supportRequests, setSupportRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSupport();
  }, []);

  const fetchSupport = async () => {
    setLoading(true);
    try {
      const { data } = await API.get('/support');
      setSupportRequests(data.data);
    } catch (err) {
      toast.error('Failed to load support requests');
    } finally {
      setLoading(false);
    }
  };

  const resolveSupport = async (id) => {
    try {
      await API.put(`/support/${id}/resolve`);
      toast.success('Request marked as resolved, user notified!');
      fetchSupport();
    } catch (err) {
      toast.error('Failed to resolve request');
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Support Requests</h1>
        <p className="text-dark-200">Manage user complaints and feature suggestions.</p>
      </div>

      {loading ? <LoadingSpinner text="Loading requests..." /> : (
        supportRequests.length === 0 ? (
          <div className="card text-center py-12 animate-fade-in">
            <p className="text-dark-200">No support requests found</p>
          </div>
        ) : (
          <div className="space-y-4 animate-fade-in">
            {supportRequests.map((req) => (
              <div key={req._id} className={`card-glow border-l-4 ${req.status === 'resolved' ? 'border-l-emerald-500 bg-dark-600/30' : 'border-l-orange-500'}`}>
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className={req.status === 'resolved' ? 'badge-accepted' : 'badge-pending'}>
                        {req.status === 'resolved' ? 'Resolved' : 'Review Needed'}
                      </span>
                      <span className="text-xs text-dark-300 mx-2">•</span>
                      <div className="flex items-center gap-1.5 text-xs text-dark-200">
                        <HiUser className="w-3.5 h-3.5" /> {req.user?.name || 'Unknown User'} ({req.user?.role})
                      </div>
                    </div>
                    <h3 className="text-lg font-bold text-white mb-2">{req.subject}</h3>
                    <p className="text-sm text-dark-100 bg-dark-700/50 p-3 rounded-lg border border-white/5">
                      {req.message}
                    </p>
                  </div>
                  {req.status !== 'resolved' && (
                    <button 
                      onClick={() => resolveSupport(req._id)}
                      className="btn-success sm:shrink-0 flex items-center justify-center gap-2 w-full sm:w-auto mt-2 sm:mt-0"
                    >
                      <HiCheck className="w-4 h-4" /> Mark Resolved
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )
      )}
    </div>
  );
};

export default AdminSupport;
