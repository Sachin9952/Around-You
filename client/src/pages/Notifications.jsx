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
    <div className="bg-[#F5FDFD] min-h-screen py-10 font-sans">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 animate-fade-in">
        <div className="mb-8 flex items-center gap-4 bg-white p-6 sm:p-8 rounded-[2rem] border border-[#E0F5F3] shadow-sm">
          <div className="w-14 h-14 bg-[#E0F5F3] rounded-full flex items-center justify-center border border-[#45B1A8]/20 shrink-0">
            <HiBell className="w-7 h-7 text-[#45B1A8]" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-[#1A2B2A]">Notifications</h1>
            <p className="text-[#4A5568] mt-1 font-medium text-sm md:text-base">Stay updated on your account and bookings.</p>
          </div>
        </div>

        {loading ? (
          <div className="bg-white py-16 rounded-[2rem] border border-[#E0F5F3] shadow-sm flex items-center justify-center">
            <LoadingSpinner text="Loading your notifications..." />
          </div>
        ) : (
          <div className="space-y-4">
            {notifications.length === 0 ? (
              <div className="bg-white p-12 text-center rounded-[2.5rem] border border-[#E0F5F3] shadow-sm border-dashed">
                <div className="w-16 h-16 bg-[#F5FDFD] rounded-full flex items-center justify-center mx-auto mb-4 border border-[#E0F5F3]">
                  <HiBell className="w-8 h-8 text-gray-300" />
                </div>
                <h3 className="text-xl font-bold text-[#1A2B2A] mb-2">You're all caught up!</h3>
                <p className="text-[#4A5568] font-medium">You have no new notifications.</p>
              </div>
            ) : (
              notifications.map(notif => (
                <div 
                  key={notif._id} 
                  className={`p-6 rounded-[1.5rem] border-l-4 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-5 shadow-sm ${notif.isRead ? 'border-l-gray-300 bg-white border-y border-r border-[#E0F5F3]' : 'border-l-[#45B1A8] bg-white border-y border-r border-[#45B1A8]/30 shadow-md ring-1 ring-[#45B1A8]/10'}`}
                >
                  <div>
                    <h3 className={`text-lg font-bold mb-1 line-clamp-1 ${notif.isRead ? 'text-[#4A5568]' : 'text-[#1A2B2A]'}`}>{notif.title}</h3>
                    <p className={`font-medium mb-3 text-sm leading-relaxed ${notif.isRead ? 'text-gray-500' : 'text-[#4A5568]'}`}>{notif.message}</p>
                    <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">{new Date(notif.createdAt).toLocaleDateString(undefined, {month: 'short', day: 'numeric', year: 'numeric'})} at {new Date(notif.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                  </div>
                  {!notif.isRead && (
                    <button 
                      onClick={() => markAsRead(notif._id)}
                      className="bg-[#F5FDFD] text-[#45B1A8] border border-[#E0F5F3] hover:bg-[#45B1A8] hover:text-white sm:shrink-0 px-5 py-2.5 rounded-full font-bold transition-colors flex items-center justify-center gap-2 text-sm shadow-sm"
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
    </div>
  );
};

export default Notifications;
