import React from "react";
import { motion } from "framer-motion";
import { HiArrowLeft, HiEllipsisVertical, HiPhone, HiVideoCameraSlash, HiCalendar } from "react-icons/hi2";

/**
 * ChatHeader — Top bar of the chat view showing:
 *  • Back button (navigates to previous page)
 *  • User avatar, name, online/offline status
 *  • Action icons (call, video, menu)
 *
 * Props:
 *  @param {string}  userName    — Display name of the chat partner
 *  @param {string}  avatarUrl   — URL for the user's avatar (optional)
 *  @param {boolean} isOnline    — Whether the user is currently online
 *  @param {function} onBack     — Handler for back button
 */
const ChatHeader = ({ userName = "User", avatarUrl, isOnline = false, partnerRole, onBack, onBookPress }) => {
  // Generate initials from name (e.g. "John Doe" → "JD")
  const initials = userName
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="flex items-center gap-3 px-3 py-2.5 sm:px-4 sm:py-3
        bg-dark-800/95 backdrop-blur-md border-b border-dark-500/50 z-10"
    >
      {/* Back button */}
      <button
        onClick={onBack}
        className="p-2 -ml-1 rounded-xl text-dark-100 hover:text-white hover:bg-dark-600/60
          transition-all duration-200"
        aria-label="Go back"
      >
        <HiArrowLeft className="w-5 h-5" />
      </button>

      {/* Avatar */}
      <div className="relative flex-shrink-0">
        {avatarUrl ? (
          <img
            src={avatarUrl}
            alt={userName}
            className="w-10 h-10 rounded-full object-cover ring-2 ring-dark-500/50"
          />
        ) : (
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-primary-700
            flex items-center justify-center ring-2 ring-dark-500/50">
            <span className="text-xs font-semibold text-white select-none">{initials}</span>
          </div>
        )}

        {/* Online indicator dot */}
        {isOnline && (
          <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-400 rounded-full
            ring-2 ring-dark-800 animate-pulse" />
        )}
      </div>

      {/* Name & status */}
      <div className="flex-1 min-w-0">
        <h2 className="text-sm font-semibold text-white truncate">{userName}</h2>
        <p className={`text-xs ${isOnline ? "text-emerald-400" : "text-dark-200/60"}`}>
          {isOnline ? "Online" : "Offline"}
        </p>
      </div>

      {/* Action icons */}
      <div className="flex items-center gap-1 sm:gap-2">
        {partnerRole === 'provider' && (
          <button
            onClick={onBookPress}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-primary-600 hover:bg-primary-500 text-white text-xs font-semibold rounded-lg shadow-lg shadow-primary-500/20 transition-colors"
          >
            <HiCalendar className="w-4 h-4" />
            Book Now
          </button>
        )}
        <button
          className="p-2 rounded-xl text-dark-200 hover:text-primary-400 hover:bg-dark-600/60
            transition-all duration-200"
          aria-label="Voice call"
        >
          <HiPhone className="w-5 h-5" />
        </button>
        <button
          className="p-2 rounded-xl text-dark-200 hover:text-primary-400 hover:bg-dark-600/60
            transition-all duration-200 hidden sm:flex"
          aria-label="Video call"
        >
          <HiVideoCameraSlash className="w-5 h-5" />
        </button>
        <button
          className="p-2 rounded-xl text-dark-200 hover:text-primary-400 hover:bg-dark-600/60
            transition-all duration-200"
          aria-label="More options"
        >
          <HiEllipsisVertical className="w-5 h-5" />
        </button>
      </div>
    </motion.header>
  );
};

export default ChatHeader;
