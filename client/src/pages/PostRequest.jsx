import { useState } from 'react';
import API from '../api/axios';
import toast from 'react-hot-toast';
import { HiChatAlt2, HiCheckCircle } from 'react-icons/hi';
import { useNavigate } from 'react-router-dom';

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
      <div className="max-w-2xl mx-auto px-4 py-16 text-center animate-fade-in">
        <div className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
          <HiCheckCircle className="w-10 h-10 text-emerald-400" />
        </div>
        <h2 className="text-3xl font-bold text-white mb-4">Request Submitted!</h2>
        <p className="text-dark-200 mb-8 max-w-lg mx-auto">
          Thank you for reaching out. The administration team has received your complaint/suggestion and will review it shortly.
        </p>
        <button onClick={() => navigate('/dashboard')} className="btn-primary">
          Return to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Post a Request</h1>
        <p className="text-dark-200">Submit a complaint regarding a service provider, or suggest a new feature to the administrators.</p>
      </div>

      <div className="glass p-6 md:p-8 animate-fade-in origin-bottom">
        <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
          <HiChatAlt2 className="text-primary-400" /> Request Details
        </h2>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-dark-100 mb-1.5">Subject</label>
            <input
              type="text"
              required
              className="input-field"
              placeholder="e.g., Complaint regarding John the Plumber"
              value={formData.subject}
              onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
              maxLength={100}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-dark-100 mb-1.5">Detailed Message</label>
            <textarea
              required
              rows="6"
              className="input-field resize-none"
              placeholder="Please provide all relevant details here..."
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              maxLength={1000}
            ></textarea>
            <p className="text-xs text-dark-300 mt-2 text-right">{formData.message.length}/1000 characters</p>
          </div>
          <button type="submit" className="btn-primary w-full mt-2" disabled={loading}>
            {loading ? 'Submitting...' : 'Submit Request'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default PostRequest;
