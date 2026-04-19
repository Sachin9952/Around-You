import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { HiXMark, HiOutlineShieldCheck, HiCalendar } from "react-icons/hi2";
import API from "../api/axios";


const ChatBookingModal = ({ isOpen, onClose, providerId }) => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [bookingService, setBookingService] = useState(null);
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [address, setAddress] = useState("");
  const [submitLoading, setSubmitLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen && providerId) {
      setLoading(true);
      API.get(`/services?provider=${providerId}`)
        .then(res => setServices(res.data.data || []))
        .catch(err => console.error("Error fetching services", err))
        .finally(() => setLoading(false));
    }
  }, [isOpen, providerId]);

  const handleBook = async (e) => {
    e.preventDefault();
    if (!bookingService || !date || !time || !address) return;

    try {
      setSubmitLoading(true);
      setError(null);
      await API.post("/bookings", {
        service: bookingService._id,
        date,
        time,
        address
      });
      onClose(); // Automatically close on success
      // Success is handled silently, chat continues
    } catch (err) {
      setError(err.response?.data?.message || "Booking failed or provider unavailable");
    } finally {
      setSubmitLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-dark-900/60 backdrop-blur-sm"
        >
          <motion.div
            initial={{ scale: 0.95, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.95, y: 20 }}
            className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl"
          >
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h2 className="text-xl font-bold text-dark-900 flex items-center gap-2">
                <HiCalendar className="w-6 h-6 text-primary-500" />
                Book Service
              </h2>
              <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-200">
                <HiXMark className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
              {error && (
                <div className="p-3 bg-red-50 text-red-600 border border-red-200 rounded-xl text-sm font-medium">
                  {error}
                </div>
              )}

              {loading ? (
                <p className="text-center text-gray-500 py-4">Loading active services...</p>
              ) : services.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500 mb-2">Provider has no active services right now.</p>
                </div>
              ) : !bookingService ? (
                <div className="space-y-3">
                  <p className="text-sm text-gray-500 font-medium mb-2">Select a service to book:</p>
                  {services.map(s => (
                    <button
                      key={s._id}
                      onClick={() => setBookingService(s)}
                      className="w-full text-left p-4 rounded-2xl border border-gray-200 hover:border-primary-500 hover:bg-primary-50/30 transition-all focus:outline-none"
                    >
                      <h3 className="font-semibold text-gray-900">{s.title}</h3>
                      <p className="text-primary-600 font-bold text-sm mt-1">₹{s.price}</p>
                    </button>
                  ))}
                </div>
              ) : (
                <form onSubmit={handleBook} className="space-y-4">
                  <div className="flex justify-between items-center mb-4 pb-4 border-b border-gray-100">
                     <span className="font-semibold text-gray-800">{bookingService.title}</span>
                     <button type="button" onClick={() => setBookingService(null)} className="text-sm text-primary-600 hover:underline">Change</button>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                    <input type="date" required value={date} onChange={e => setDate(e.target.value)}
                           className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Time</label>
                    <input type="time" required value={time} onChange={e => setTime(e.target.value)}
                           className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Service Address</label>
                    <textarea required value={address} onChange={e => setAddress(e.target.value)} rows="3"
                           className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500" 
                           placeholder="Enter your full address..." />
                  </div>

                  <div className="flex bg-primary-50 p-3 rounded-xl gap-3 !mt-6">
                     <HiOutlineShieldCheck className="w-8 h-8 text-primary-500 flex-shrink-0" />
                     <p className="text-xs text-primary-700/80">Protected by strict validation. Booking will fail securely if the provider goes offline or deactivates.</p>
                  </div>

                  <button
                    type="submit"
                    disabled={submitLoading}
                    className="w-full py-3.5 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-xl transition shadow-lg shadow-primary-500/30"
                  >
                    {submitLoading ? "Processing..." : "Confirm Secure Booking"}
                  </button>
                </form>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ChatBookingModal;
