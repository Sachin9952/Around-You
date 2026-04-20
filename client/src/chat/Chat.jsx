import React, { useEffect, useState, useRef, useCallback, useMemo } from "react";
import { io } from "socket.io-client";
import { AnimatePresence, motion } from "framer-motion";
import { HiChevronDown } from "react-icons/hi2";
import { HiSignal, HiSignalSlash } from "react-icons/hi2";
import MessageBubble from "./MessageBubble";
import InputBox from "./InputBox";
import ChatHeader from "./ChatHeader";
import TypingIndicator from "./TypingIndicator";
import API from "../api/axios";
import ChatBookingModal from "./ChatBookingModal";

/**
 * DUMMY DATA — Used for testing when no real backend is available.
 * Remove or replace with real data in production.
 */
const DUMMY_MESSAGES = [
  {
    _id: "1",
    senderId: "user1",
    message: "Hi! I'm looking for a plumber near me. Are you available this weekend?",
    time: "10:30 AM",
    status: "seen",
  },
  {
    _id: "2",
    senderId: "provider1",
    message: "Hello! Yes, I'm available on Saturday. What kind of work do you need done?",
    time: "10:32 AM",
    status: "seen",
  },
  {
    _id: "3",
    senderId: "user1",
    message: "There's a leaking pipe under the kitchen sink. It's been dripping for a couple of days now.",
    time: "10:33 AM",
    status: "seen",
  },
  {
    _id: "4",
    senderId: "provider1",
    message: "I can fix that. Usually takes about an hour. My rate is ₹500 for pipe repairs. Want me to come Saturday morning around 10 AM?",
    time: "10:35 AM",
    status: "delivered",
  },
  {
    _id: "5",
    senderId: "user1",
    message: "That works perfectly! I'll share my address on chat. Thanks 🙏",
    time: "10:36 AM",
    status: "sent",
  },
];

// Helper: create or return an existing socket with the *current* JWT token.
// We keep the reference in a module-level variable so every Chat mount
// shares the same connection, but re-create it when the token changes.
let _socket = null;
let _lastToken = null;

function getSocket() {
  const token = localStorage.getItem("token");
  if (!_socket || _lastToken !== token) {
    if (_socket) _socket.disconnect();
    _lastToken = token;
    _socket = io(import.meta.env.VITE_API_URL || "http://localhost:5000", {
      autoConnect: false,
      auth: { token },
      transports: ["websocket", "polling"],   // Explicit transport order
      reconnection: true,                      // Enable auto-reconnection
      reconnectionAttempts: 15,                // Retry up to 15 times
      reconnectionDelay: 1000,                 // Start with 1 s delay
      reconnectionDelayMax: 5000,              // Max 5 s between retries
      timeout: 20000,                          // 20 s timeout (covers Render cold starts)
    });
  }
  return _socket;
}

/**
 * Chat — Main chat component orchestrating:
 *  • Message fetching & real-time socket updates
 *  • Typing indicator (with debounce)
 *  • Smooth auto-scroll + "scroll to bottom" button
 *  • Image upload via Cloudinary
 *
 * Props:
 *  @param {string} userId         — Current user's ID
 *  @param {string} roomId         — Chat room identifier
 *  @param {string} partnerName    — Name of the chat partner (optional)
 *  @param {string} partnerAvatar  — Avatar URL of the partner (optional)
 *  @param {boolean} partnerOnline — Whether the partner is online (optional)
 *  @param {function} onBack       — Navigate back handler (optional)
 *  @param {boolean} useDummy      — If true, uses dummy data for testing
 */
const Chat = ({
  userId,
  roomId,
  partnerId,
  partnerName = "Service Provider",
  partnerAvatar,
  partnerOnline = false,
  partnerRole,
  onBack,
  useDummy = false,
}) => {
  const [messages, setMessages] = useState(useDummy ? DUMMY_MESSAGES : []);
  const [isTyping, setIsTyping] = useState(false);
  const [showScrollBtn, setShowScrollBtn] = useState(false);
  const [isPartnerOnline, setIsPartnerOnline] = useState(partnerOnline);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  // "connected" | "connecting" | "disconnected" | "error"
  const [connectionStatus, setConnectionStatus] = useState(useDummy ? "connected" : "connecting");

  const messagesEndRef = useRef(null);
  const scrollContainerRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  // ─── Socket connection & message fetching ────────────────────────
  useEffect(() => {
    if (useDummy) return;

    const socket = getSocket();
    setConnectionStatus("connecting");
    socket.connect();

    // Fetch chat history (HTTP — works even during socket reconnection)
    const fetchMessages = async () => {
      try {
        const res = await API.get(`/messages/${roomId}`);
        setMessages(res.data || []);
      } catch (err) {
        console.error("Failed to fetch messages:", err);
        setMessages([]);
      }
    };
    fetchMessages();

    // ── Connection lifecycle listeners ──────────────────────────────
    const handleConnect = () => {
      console.log("✅ Socket connected:", socket.id);
      setConnectionStatus("connected");
      socket.emit("join_room", roomId); // (re-)join room on every connect
    };

    const handleDisconnect = (reason) => {
      console.warn("⚠️ Socket disconnected:", reason);
      setConnectionStatus("disconnected");
    };

    const handleConnectError = (err) => {
      console.error("❌ Socket connection error:", err.message);
      setConnectionStatus("error");
    };

    const handleReconnectAttempt = (attempt) => {
      console.log(`🔄 Reconnection attempt ${attempt}…`);
      setConnectionStatus("connecting");
    };

    const handleReconnect = (attempt) => {
      console.log(`✅ Reconnected after ${attempt} attempt(s)`);
      // Re-join the room after reconnection
      socket.emit("join_room", roomId);
    };

    // If already connected (module-level singleton), join immediately
    if (socket.connected) {
      handleConnect();
    }

    socket.on("connect", handleConnect);
    socket.on("disconnect", handleDisconnect);
    socket.on("connect_error", handleConnectError);
    socket.io.on("reconnect_attempt", handleReconnectAttempt);
    socket.io.on("reconnect", handleReconnect);

    // ── Message & typing listeners ─────────────────────────────────
    const handleReceive = (data) => {
      setMessages((prev) => {
        // Prevent duplicates (especially for the sender who now gets the message via 'user_Room' broadcast)
        if (prev.some(m => m._id === data._id)) return prev;
        return [...prev, data];
      });
      
      // If we are actively looking at the chat and the message is from partner, mark it as seen!
      if (document.hasFocus() && data.senderId?.toString() !== userId?.toString()) {
        socket.emit("message_seen", { messageId: data._id, senderId: data.senderId });
      } else if (data.senderId?.toString() !== userId?.toString()) {
        socket.emit("message_delivered", { messageId: data._id, senderId: data.senderId });
      }
    };

    const handleUpdateStatus = ({ messageId, status }) => {
      setMessages((prev) => 
        prev.map(m => m._id === messageId ? { ...m, status } : m)
      );
    };

    const handleBatchUpdate = ({ room, status }) => {
      setMessages((prev) => 
        prev.map(m => (m.conversationId === room || m.room === room) && m.senderId === userId && m.status !== 'seen' ? { ...m, status } : m)
      );
    };

    const handleUserOnline = ({ userId: id }) => {
      if (id?.toString() === partnerId?.toString()) setIsPartnerOnline(true);
    };

    const handleUserOffline = ({ userId: id }) => {
      if (id?.toString() === partnerId?.toString()) setIsPartnerOnline(false);
    };

    const handleTyping = (data) => {
      if (data.senderId !== userId) {
        setIsTyping(true);
        clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = setTimeout(() => setIsTyping(false), 2000);
      }
    };

    const handleStopTyping = (data) => {
      if (data.senderId !== userId) {
        setIsTyping(false);
      }
    };

    socket.on("receive_message", handleReceive);
    socket.on("update_message_status", handleUpdateStatus);
    socket.on("batch_update_status", handleBatchUpdate);
    socket.on("user_online", handleUserOnline);
    socket.on("user_offline", handleUserOffline);
    socket.on("user_typing", handleTyping);
    socket.on("user_stop_typing", handleStopTyping);

    // Initial batch seen emit when chat mounts
    socket.emit("messages_seen_batch", { room: roomId, partnerId: partnerId });

    return () => {
      socket.off("connect", handleConnect);
      socket.off("disconnect", handleDisconnect);
      socket.off("connect_error", handleConnectError);
      socket.io.off("reconnect_attempt", handleReconnectAttempt);
      socket.io.off("reconnect", handleReconnect);
      socket.off("receive_message", handleReceive);
      socket.off("update_message_status", handleUpdateStatus);
      socket.off("batch_update_status", handleBatchUpdate);
      socket.off("user_online", handleUserOnline);
      socket.off("user_offline", handleUserOffline);
      socket.off("user_typing", handleTyping);
      socket.off("user_stop_typing", handleStopTyping);
      clearTimeout(typingTimeoutRef.current);
    };
  }, [roomId, userId, useDummy]);

  // ─── Auto-scroll to bottom on new messages ───────────────────────
  useEffect(() => {
    // Only auto-scroll if user is near the bottom already
    const container = scrollContainerRef.current;
    if (!container) return;

    const isNearBottom =
      container.scrollHeight - container.scrollTop - container.clientHeight < 150;

    if (isNearBottom) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isTyping]);

  // ─── Scroll position tracking for "scroll to bottom" button ──────
  const handleScroll = useCallback(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const distanceFromBottom =
      container.scrollHeight - container.scrollTop - container.clientHeight;
    setShowScrollBtn(distanceFromBottom > 200);
  }, []);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  // ─── Send text message ───────────────────────────────────────────
  const handleSendText = useCallback(
    (text) => {
      if (!text) return;

      const msgData = {
        room: roomId,
        receiverId: partnerId,
        type: 'text',
        message: text,
      };

      if (useDummy) return;

      getSocket().emit("send_message", msgData);
      getSocket().emit("stop_typing", { room: roomId, senderId: userId });
    },
    [roomId, userId, partnerId, useDummy]
  );

  // ─── Send uploaded files (Images, PDFs, Voice) ───────────────────
  const handleAttachmentSend = useCallback(
    async (file, type = 'image') => {
      if (!file) return;
      try {
        const formData = new FormData();
        formData.append("file", file);

        const res = await API.post("/upload/attachment", formData, {
          headers: { "Content-Type": "multipart/form-data" }
        });

        if (!res.data.success || !res.data.url) {
          console.error("Upload failed");
          return;
        }

        const msgData = {
          room: roomId,
          receiverId: partnerId,
          type: type,
          fileUrl: res.data.url,
        };

        if (useDummy) return;

        getSocket().emit("send_message", msgData);
      } catch (error) {
        console.error("Error uploading attachment:", error);
      }
    },
    [roomId, partnerId, useDummy]
  );

  // ─── Typing notification ────────────────────────────────────────
  const handleTypingNotify = useCallback(() => {
    if (useDummy) return;
    getSocket().emit("typing", { room: roomId, senderId: userId });
  }, [roomId, userId, useDummy]);

  // ─── Grouped messages with date separators (future-ready) ───────
  const renderedMessages = useMemo(
    () =>
      messages.map((msg, i) => (
        <MessageBubble
          key={msg._id || i}
          msg={msg}
          isOwn={msg.senderId === userId}
        />
      )),
    [messages, userId]
  );

  return (
    <div className="flex flex-col h-[100dvh] sm:h-[600px] bg-dark-900 w-full relative">
      {/* ── Header ─────────────────────────────────────────────── */}
      <ChatHeader
        userName={partnerName}
        avatarUrl={partnerAvatar}
        isOnline={isPartnerOnline}
        partnerRole={partnerRole}
        onBack={onBack}
        onBookPress={() => setIsBookingModalOpen(true)}
      />

      {/* ── Connection status banner ────────────────────────────── */}
      <AnimatePresence>
        {connectionStatus !== "connected" && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className={`flex items-center justify-center gap-2 px-4 py-2 text-xs font-bold tracking-wide overflow-hidden ${
              connectionStatus === "connecting"
                ? "bg-amber-50 text-amber-700 border-b border-amber-200"
                : "bg-red-50 text-red-600 border-b border-red-200"
            }`}
          >
            {connectionStatus === "connecting" ? (
              <>
                <span className="w-3 h-3 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
                Connecting to server…
              </>
            ) : (
              <>
                <HiSignalSlash className="w-4 h-4" />
                Connection lost — retrying automatically…
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Messages area ──────────────────────────────────────── */}
      <div
        ref={scrollContainerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto px-3 py-4 sm:px-5 space-y-3
          scrollbar-thin scrollbar-thumb-dark-500 scrollbar-track-transparent"
      >
        {/* Empty state */}
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center gap-3 opacity-60">
            <div className="w-16 h-16 rounded-2xl bg-dark-700 border border-dark-500/50
              flex items-center justify-center">
              <span className="text-2xl">💬</span>
            </div>
            <p className="text-sm text-dark-200">
              No messages yet. Start the conversation!
            </p>
          </div>
        )}

        {renderedMessages}

        {/* Typing indicator */}
        <AnimatePresence>
          {isTyping && <TypingIndicator userName={partnerName} />}
        </AnimatePresence>

      {/* scroll-to-bottom anchor */}
      <div ref={messagesEndRef} className="h-4" />
    </div>

    {/* ── ChatBookingModal ── */}
    <ChatBookingModal 
      isOpen={isBookingModalOpen} 
      onClose={() => setIsBookingModalOpen(false)} 
      providerId={partnerId} 
    />

    {/* ── Scroll to bottom button ────────────────────────────── */}
      <AnimatePresence>
        {showScrollBtn && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 10 }}
            transition={{ duration: 0.2 }}
            onClick={scrollToBottom}
            className="absolute bottom-24 right-4 sm:right-6 z-20
              w-10 h-10 rounded-full bg-dark-600/90 border border-dark-500/60
              flex items-center justify-center shadow-xl shadow-black/30
              hover:bg-dark-500 transition-colors duration-200 cursor-pointer"
            aria-label="Scroll to bottom"
          >
            <HiChevronDown className="w-5 h-5 text-white" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* ── Input bar ──────────────────────────────────────────── */}
      <InputBox
        onSend={handleSendText}
        onAttachmentSend={handleAttachmentSend}
        onTyping={handleTypingNotify}
      />
    </div>
  );
};

export default Chat;