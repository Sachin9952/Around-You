import React, { memo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { HiCheck, HiX } from "react-icons/hi";

/**
 * MessageBubble — Renders a single chat message with:
 *  • Gradient background for sender, glass-light for receiver
 *  • Smooth slide-in animation via Framer Motion
 *  • Timestamp and delivery-status indicator (sent / delivered / seen)
 *  • Image support with rounded preview and full-screen modal
 *
 * Props:
 *  @param {object}  msg   – { message, image, time, status }
 *  @param {boolean} isOwn – true if the current user sent this message
 */
const MessageBubble = memo(({ msg, isOwn }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Status icons: single check → sent, double → delivered, blue double → seen
  const renderStatus = () => {
    if (!isOwn) return null;

    const status = msg.status || "sent";

    const iconClass =
      status === "seen"
        ? "text-sky-400"
        : "text-dark-200/70";

    return (
      <span className="inline-flex items-center ml-1.5 -mb-0.5">
        {status === "sent" && <HiCheck className={`w-3.5 h-3.5 ${iconClass}`} />}
        {(status === "delivered" || status === "seen") && (
          <span className="relative flex">
            <HiCheck className={`w-3.5 h-3.5 ${iconClass}`} />
            <HiCheck className={`w-3.5 h-3.5 ${iconClass} -ml-2`} />
          </span>
        )}
      </span>
    );
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
        className={`flex flex-col ${isOwn ? "items-end" : "items-start"} group`}
      >
        {/* Bubble */}
        <div
          className={`relative px-4 py-2.5 max-w-[85%] sm:max-w-[75%] break-words
            ${isOwn
              ? "bg-gradient-to-br from-primary-600 to-primary-700 text-white rounded-2xl rounded-br-md shadow-lg shadow-primary-600/20"
              : "bg-dark-600/80 text-dark-50 rounded-2xl rounded-bl-md shadow-lg shadow-black/10 border border-dark-500/40"
            }
          `}
        >
          {/* Text content */}
          {msg.message && (
            <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.message}</p>
          )}

          {/* Voice content */}
          {msg.type === 'voice' && msg.fileUrl && (
            <div className="mt-1">
              <audio controls src={msg.fileUrl} className={`h-10 ${isOwn ? 'invert brightness-0 contrast-200 sepia hue-rotate-180' : ''}`} />
            </div>
          )}

          {/* PDF content */}
          {msg.type === 'pdf' && msg.fileUrl && (
            <a href={msg.fileUrl} target="_blank" rel="noopener noreferrer" className="mt-2 flex items-center gap-3 bg-black/20 p-3 rounded-lg hover:bg-black/30 transition">
              <div className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">PDF</div>
              <span className="text-sm font-medium underline">View Document</span>
            </a>
          )}

          {/* Image content */}
          {(msg.type === 'image' || (!msg.type && msg.image)) && (msg.fileUrl || msg.image) && (
            <img
              src={msg.fileUrl || msg.image}
              alt="shared"
              loading="lazy"
              onClick={() => setIsModalOpen(true)}
              className="mt-1.5 rounded-xl max-w-[220px] w-full object-cover cursor-pointer
                hover:opacity-90 transition-opacity duration-200"
            />
          )}

          {/* Timestamp + status row */}
          <div
            className={`flex items-center gap-0.5 mt-1 ${isOwn ? "justify-end" : "justify-start"
              }`}
          >
            <span
              className={`text-[10px] leading-none select-none ${isOwn ? "text-white/60" : "text-dark-200/60"
                }`}
            >
              {msg.time}
            </span>
            {renderStatus()}
          </div>
        </div>
      </motion.div>

      {/* Full Screen Image Modal */}
      <AnimatePresence>
        {isModalOpen && (msg.fileUrl || msg.image) && (msg.type === 'image' || !msg.type) && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center p-4 backdrop-blur-sm"
            onClick={() => setIsModalOpen(false)}
          >
            {/* Close Button */}
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 sm:top-6 sm:right-6 w-12 h-12 flex flex-col items-center justify-center bg-dark-800/50 hover:bg-dark-700 rounded-full text-white/70 hover:text-white transition-colors"
            >
              <HiX className="w-6 h-6" />
            </button>

            {/* Expanded Image */}
            <motion.img
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              src={msg.fileUrl || msg.image}
              alt="shared full screen"
              className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl drop-shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
});

MessageBubble.displayName = "MessageBubble";

export default MessageBubble;