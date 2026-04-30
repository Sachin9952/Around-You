import { useState } from 'react';
import API from '../api/axios';
import toast from 'react-hot-toast';
import { HiSupport, HiCheckCircle, HiExclamationCircle } from 'react-icons/hi';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';

const PostRequest = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    subject: '',
    message: '',
  });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await API.post('/support', formData);
      toast.success('Request sent successfully!');
      setSubmitted(true);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to send request');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', duration: 0.5 }}
        >
          <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-6 border-2 border-emerald-100">
            <HiCheckCircle className="w-10 h-10 text-emerald-500" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-[#1A2B2A] mb-3">Request Submitted!</h2>
          <p className="text-gray-500 mb-8 max-w-md mx-auto leading-relaxed">
            Thank you for reaching out. Our administration team has received your complaint and will review it shortly. You'll receive a notification once it's resolved.
          </p>
          <button
            onClick={() => navigate('/dashboard')}
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#45B1A8] to-[#3a9990] text-white text-sm font-bold shadow-sm hover:shadow-md transition-all"
          >
            Return to Dashboard
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-rose-500 flex items-center justify-center">
            <HiSupport className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-[#1A2B2A]">Support & Complaints</h1>
            <p className="text-sm text-gray-500">Report an issue or suggest a new feature</p>
          </div>
        </div>
      </div>

      {/* Info banner */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-start gap-3 bg-amber-50 border border-amber-100 rounded-xl p-4 mb-6"
      >
        <HiExclamationCircle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
        <p className="text-sm text-amber-800 leading-relaxed">
          Please provide as much detail as possible. Our team reviews every request and you'll be notified once it's resolved.
        </p>
      </motion.div>

      {/* Form Card */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden"
      >
        <div className="px-6 py-4 border-b border-gray-100 bg-[#F5FDFD]">
          <h2 className="text-base font-bold text-[#1A2B2A]">Request Details</h2>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div>
            <label className="block text-sm font-bold text-[#1A2B2A] mb-1.5">Subject</label>
            <input
              type="text"
              required
              className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-sm text-[#1A2B2A] placeholder-gray-400 focus:outline-none focus:border-[#45B1A8] focus:ring-2 focus:ring-[#45B1A8]/20 transition-all"
              placeholder="e.g., Complaint regarding John the Plumber"
              value={formData.subject}
              onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
              maxLength={100}
            />
            <p className="text-xs text-gray-400 text-right mt-1">{formData.subject.length}/100</p>
          </div>

          <div>
            <label className="block text-sm font-bold text-[#1A2B2A] mb-1.5">Detailed Message</label>
            <textarea
              required
              rows="6"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-sm text-[#1A2B2A] placeholder-gray-400 focus:outline-none focus:border-[#45B1A8] focus:ring-2 focus:ring-[#45B1A8]/20 resize-none transition-all"
              placeholder="Please provide all relevant details here — what happened, when, and any supporting information..."
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              maxLength={1000}
            />
            <p className="text-xs text-gray-400 text-right mt-1">{formData.message.length}/1000</p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-[#45B1A8] to-[#3a9990] text-white text-sm font-bold shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Submitting...
              </>
            ) : (
              'Submit Request'
            )}
          </button>
        </form>
      </motion.div>
    </div>
  );
};

export default PostRequest;
