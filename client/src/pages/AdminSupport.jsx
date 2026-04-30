import { useState, useEffect, useMemo } from 'react';
import API from '../api/axios';
import LoadingSpinner from '../components/LoadingSpinner';
import { motion, AnimatePresence } from 'motion/react';
import {
  HiCheck, HiUser, HiClock, HiX, HiExclamationCircle,
  HiShieldCheck, HiInbox, HiSearch, HiChevronDown, HiReply,
  HiCheckCircle, HiExclamation, HiBadgeCheck
} from 'react-icons/hi';
import toast from 'react-hot-toast';

const timeAgo = (date) => {
  const seconds = Math.floor((new Date() - new Date(date)) / 1000);
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
};

const AdminSupport = () => {
  const [supportRequests, setSupportRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Resolve modal state
  const [resolveModal, setResolveModal] = useState(null);
  const [adminReply, setAdminReply] = useState('');
  const [resolving, setResolving] = useState(false);

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

  const handleResolve = async () => {
    if (!resolveModal) return;
    setResolving(true);
    try {
      await API.put(`/support/${resolveModal._id}/resolve`, { adminReply: adminReply.trim() });
      toast.success('Complaint resolved — user has been notified!');
      setResolveModal(null);
      setAdminReply('');
      fetchSupport();
    } catch (err) {
      toast.error('Failed to resolve request');
    } finally {
      setResolving(false);
    }
  };

  const stats = useMemo(() => {
    const total = supportRequests.length;
    const pending = supportRequests.filter(r => r.status === 'pending').length;
    const resolved = supportRequests.filter(r => r.status === 'resolved').length;
    return { total, pending, resolved };
  }, [supportRequests]);

  const filteredRequests = useMemo(() => {
    let items = supportRequests;

    if (filter !== 'all') {
      items = items.filter(r => r.status === filter);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      items = items.filter(r =>
        r.subject?.toLowerCase().includes(q) ||
        r.message?.toLowerCase().includes(q) ||
        r.user?.name?.toLowerCase().includes(q) ||
        r.user?.email?.toLowerCase().includes(q)
      );
    }

    return items;
  }, [supportRequests, filter, searchQuery]);

  const filterTabs = [
    { key: 'all', label: 'All', count: stats.total },
    { key: 'pending', label: 'Pending', count: stats.pending },
    { key: 'resolved', label: 'Resolved', count: stats.resolved },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-rose-500 flex items-center justify-center">
            <HiShieldCheck className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-[#1A2B2A]">Support Center</h1>
            <p className="text-sm text-gray-500">Review and resolve user complaints</p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      {!loading && (
        <div className="grid grid-cols-3 gap-3 sm:gap-4 mb-6">
          {[
            { label: 'Total Requests', value: stats.total, icon: HiInbox, gradient: 'from-blue-500 to-cyan-500', bg: 'bg-blue-50', text: 'text-blue-700' },
            { label: 'Pending Review', value: stats.pending, icon: HiExclamation, gradient: 'from-amber-500 to-orange-500', bg: 'bg-amber-50', text: 'text-amber-700' },
            { label: 'Resolved', value: stats.resolved, icon: HiCheckCircle, gradient: 'from-emerald-500 to-teal-500', bg: 'bg-emerald-50', text: 'text-emerald-700' },
          ].map((stat) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl border border-gray-100 p-4 sm:p-5 shadow-sm"
            >
              <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${stat.gradient} flex items-center justify-center mb-3`}>
                <stat.icon className="w-4 h-4 text-white" />
              </div>
              <p className="text-2xl sm:text-3xl font-bold text-[#1A2B2A]">{stat.value}</p>
              <p className="text-xs sm:text-sm text-gray-500 mt-0.5">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      )}

      {/* Filter bar */}
      {!loading && (
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          {/* Tabs */}
          <div className="flex gap-1.5 bg-gray-100 p-1 rounded-xl flex-shrink-0">
            {filterTabs.map(tab => (
              <button
                key={tab.key}
                onClick={() => setFilter(tab.key)}
                className={`px-3 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
                  filter === tab.key
                    ? 'bg-white text-[#1A2B2A] shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab.label}
                <span className={`ml-1.5 px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                  filter === tab.key ? 'bg-[#45B1A8] text-white' : 'bg-gray-200 text-gray-600'
                }`}>
                  {tab.count}
                </span>
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="relative flex-1">
            <HiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by subject, user, or message..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm text-[#1A2B2A] placeholder-gray-400 focus:outline-none focus:border-[#45B1A8] focus:ring-2 focus:ring-[#45B1A8]/20 transition-all"
            />
          </div>
        </div>
      )}

      {/* Content */}
      {loading ? <LoadingSpinner text="Loading requests..." /> : (
        filteredRequests.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-white rounded-2xl border border-gray-100 text-center py-16 shadow-sm"
          >
            <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
              <HiInbox className="w-7 h-7 text-gray-400" />
            </div>
            <p className="text-gray-500 font-medium">
              {searchQuery ? 'No matching requests found' : filter === 'all' ? 'No support requests yet' : `No ${filter} requests`}
            </p>
          </motion.div>
        ) : (
          <div className="space-y-3">
            {filteredRequests.map((req, idx) => (
              <motion.div
                key={req._id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.04 }}
                className={`bg-white rounded-2xl border shadow-sm overflow-hidden transition-all hover:shadow-md ${
                  req.status === 'resolved'
                    ? 'border-emerald-100'
                    : 'border-orange-100'
                }`}
              >
                {/* Status accent bar */}
                <div className={`h-1 ${
                  req.status === 'resolved'
                    ? 'bg-gradient-to-r from-emerald-400 to-teal-400'
                    : 'bg-gradient-to-r from-orange-400 to-amber-400'
                }`} />

                <div className="p-4 sm:p-5">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                    {/* Left: Info */}
                    <div className="flex-1 min-w-0">
                      {/* Meta row */}
                      <div className="flex flex-wrap items-center gap-2 mb-2.5">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${
                          req.status === 'resolved'
                            ? 'bg-emerald-50 text-emerald-700'
                            : 'bg-orange-50 text-orange-700'
                        }`}>
                          {req.status === 'resolved' ? (
                            <><HiBadgeCheck className="w-3.5 h-3.5" /> Resolved</>
                          ) : (
                            <><HiExclamationCircle className="w-3.5 h-3.5" /> Pending Review</>
                          )}
                        </span>

                        <span className="text-gray-300">•</span>

                        <div className="flex items-center gap-1.5 text-xs text-gray-500">
                          <HiUser className="w-3.5 h-3.5" />
                          <span className="font-medium">{req.user?.name || 'Unknown'}</span>
                          <span className="text-gray-300">—</span>
                          <span>{req.user?.email}</span>
                        </div>

                        <span className="text-gray-300 hidden sm:inline">•</span>

                        <div className="flex items-center gap-1 text-xs text-gray-400">
                          <HiClock className="w-3.5 h-3.5" />
                          {timeAgo(req.createdAt)}
                        </div>
                      </div>

                      {/* Subject */}
                      <h3 className="text-base sm:text-lg font-bold text-[#1A2B2A] mb-2">{req.subject}</h3>

                      {/* Message */}
                      <div className="bg-gray-50 border border-gray-100 rounded-xl p-3.5">
                        <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">{req.message}</p>
                      </div>

                      {/* Admin Reply (if resolved) */}
                      {req.status === 'resolved' && req.adminReply && (
                        <div className="mt-3 bg-emerald-50/70 border border-emerald-100 rounded-xl p-3.5">
                          <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-700 mb-1.5">
                            <HiReply className="w-3.5 h-3.5" /> Admin Response
                          </div>
                          <p className="text-sm text-emerald-800 leading-relaxed whitespace-pre-wrap">{req.adminReply}</p>
                        </div>
                      )}
                    </div>

                    {/* Right: Action */}
                    {req.status !== 'resolved' && (
                      <div className="sm:shrink-0 sm:pt-1">
                        <button
                          onClick={() => { setResolveModal(req); setAdminReply(''); }}
                          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-[#45B1A8] to-[#3a9990] hover:from-[#3a9990] hover:to-[#2f8880] shadow-sm hover:shadow-md transition-all"
                        >
                          <HiReply className="w-4 h-4" /> Resolve & Reply
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )
      )}

      {/* Resolve Modal */}
      <AnimatePresence>
        {resolveModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setResolveModal(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: 'spring', duration: 0.4 }}
              onClick={e => e.stopPropagation()}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden"
            >
              {/* Modal header */}
              <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-[#F5FDFD] to-white">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#45B1A8] to-[#3a9990] flex items-center justify-center">
                      <HiShieldCheck className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-[#1A2B2A]">Resolve Complaint</h3>
                      <p className="text-xs text-gray-500">Reply will be sent as a notification to the user</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setResolveModal(null)}
                    className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center transition-colors"
                  >
                    <HiX className="w-4 h-4 text-gray-500" />
                  </button>
                </div>
              </div>

              {/* Complaint preview */}
              <div className="px-6 pt-5">
                <div className="bg-gray-50 border border-gray-100 rounded-xl p-4 mb-4">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Complaint by {resolveModal.user?.name}</p>
                  <p className="text-sm font-bold text-[#1A2B2A] mb-1.5">{resolveModal.subject}</p>
                  <p className="text-sm text-gray-600 leading-relaxed line-clamp-3">{resolveModal.message}</p>
                </div>

                {/* Reply textarea */}
                <label className="block text-sm font-bold text-[#1A2B2A] mb-1.5">
                  Your Response <span className="text-gray-400 font-normal">(optional)</span>
                </label>
                <textarea
                  rows={4}
                  value={adminReply}
                  onChange={e => setAdminReply(e.target.value)}
                  placeholder="Write a response to the user explaining how the issue was resolved..."
                  className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-[#1A2B2A] placeholder-gray-400 focus:outline-none focus:border-[#45B1A8] focus:ring-2 focus:ring-[#45B1A8]/20 resize-none transition-all"
                  maxLength={1000}
                />
                <p className="text-xs text-gray-400 text-right mt-1">{adminReply.length}/1000</p>
              </div>

              {/* Modal footer */}
              <div className="px-6 py-4 flex items-center justify-end gap-3 border-t border-gray-100 mt-2">
                <button
                  onClick={() => setResolveModal(null)}
                  className="px-4 py-2.5 rounded-xl text-sm font-bold text-gray-600 hover:bg-gray-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleResolve}
                  disabled={resolving}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  {resolving ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Resolving...
                    </>
                  ) : (
                    <>
                      <HiCheck className="w-4 h-4" />
                      Mark as Resolved
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminSupport;
