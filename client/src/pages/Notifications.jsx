import { useState, useEffect } from 'react';
import { HiBell, HiCheck } from 'react-icons/hi';
import API from '../api/axios';
import LoadingSpinner from '../components/LoadingSpinner';

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const { data } = await API.get('/notifications');
      setNotifications(data.data);
    } catch (err) {
      console.error('Error fetching notifications', err);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id) => {
    try {
      await API.put(`/notifications/${id}/read`);
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
    } catch (err) {
      console.error('Error marking as read', err);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 animate-fade-in">
      <div className="mb-8 flex items-center gap-3">
        <HiBell className="w-8 h-8 text-purple-400" />
        <div>
          <h1 className="text-3xl font-bold text-white">Notifications</h1>
          <p className="text-dark-200 mt-1">Stay updated on your account and bookings.</p>
        </div>
      </div>

      {loading ? (
        <LoadingSpinner text="Loading your notifications..." />
      ) : (
        <div className="space-y-4">
          {notifications.length === 0 ? (
            <div className="glass p-8 text-center rounded-2xl">
              <p className="text-dark-200">You have no new notifications.</p>
            </div>
          ) : (
            notifications.map(notif => (
              <div 
                key={notif._id} 
                className={`glass p-5 rounded-xl border-l-4 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${notif.isRead ? 'border-l-dark-500 bg-dark-600/10' : 'border-l-purple-500 hover:bg-dark-600/30'}`}
              >
                <div>
                  <h3 className={`text-lg font-bold mb-1 ${notif.isRead ? 'text-dark-100' : 'text-white'}`}>{notif.title}</h3>
                  <p className={notif.isRead ? 'text-dark-200' : 'text-dark-100'}>{notif.message}</p>
                  <p className="text-xs text-dark-300 mt-3">{new Date(notif.createdAt).toLocaleDateString()} at {new Date(notif.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                </div>
                {!notif.isRead && (
                  <button 
                    onClick={() => markAsRead(notif._id)}
                    className="btn-primary sm:shrink-0 !py-2 !px-3 flex items-center justify-center gap-2 text-sm"
                  >
                    <HiCheck className="w-4 h-4" /> Mark Read
                  </button>
                )}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default Notifications;
