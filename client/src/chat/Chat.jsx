import React, { useEffect, useState, useRef, useCallback, useMemo } from "react";
import { io } from "socket.io-client";
import { AnimatePresence, motion } from "framer-motion";
import { HiChevronDown } from "react-icons/hi2";
import MessageBubble from "./MessageBubble";
import InputBox from "./InputBox";
import ChatHeader from "./ChatHeader";
import TypingIndicator from "./TypingIndicator";
import API from "../api/axios";

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
  partnerName = "Service Provider",
  partnerAvatar,
  partnerOnline = false,
  onBack,
  useDummy = false,
}) => {
  const [messages, setMessages] = useState(useDummy ? DUMMY_MESSAGES : []);
  const [isTyping, setIsTyping] = useState(false);
  const [showScrollBtn, setShowScrollBtn] = useState(false);

  const messagesEndRef = useRef(null);
  const scrollContainerRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  // ─── Socket connection & message fetching ────────────────────────
  useEffect(() => {
    if (useDummy) return;

    const socket = getSocket();
    socket.connect();
    socket.emit("join_room", roomId);

    // Fetch chat history
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

    // Listen for incoming messages
    const handleReceive = (data) => {
      setMessages((prev) => [...prev, data]);
    };

    // Listen for typing events
    const handleTyping = (data) => {
      if (data.senderId !== userId) {
        setIsTyping(true);
        // Auto-clear after 2s of no typing events
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
    socket.on("user_typing", handleTyping);
    socket.on("user_stop_typing", handleStopTyping);

    return () => {
      socket.off("receive_message", handleReceive);
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

      // senderId will be set by the server
      const msgData = {
        room: roomId,
        message: text,
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        status: "sent",
      };

      if (useDummy) {
        setMessages((prev) => [...prev, { ...msgData, senderId: userId, _id: Date.now().toString() }]);
        return;
      }

      getSocket().emit("send_message", msgData);
      getSocket().emit("stop_typing", { room: roomId, senderId: userId });
    },
    [roomId, userId, useDummy]
  );

  // ─── Send image via Cloudinary ───────────────────────────────────
  const handleImageSend = useCallback(
    async (file) => {
      if (!file) return;
      try {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("upload_preset", "aroundyou_upload");

        const res = await fetch(
          "https://api.cloudinary.com/v1_1/dx8khsk8y/image/upload",
          { method: "POST", body: formData }
        );
        const data = await res.json();

        if (!data.secure_url) {
          console.error("Upload failed:", data);
          return;
        }

        const msgData = {
          room: roomId,
          senderId: userId,
          image: data.secure_url,
          time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          status: "sent",
        };

        if (useDummy) {
          setMessages((prev) => [...prev, { ...msgData, _id: Date.now().toString() }]);
          return;
        }

        getSocket().emit("send_message", msgData);
      } catch (error) {
        console.error("Error uploading image:", error);
      }
    },
    [roomId, userId, useDummy]
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
    <div
      className="flex flex-col h-full w-full bg-white relative overflow-hidden"
      id="chat-container"
    >
      {/* ── Header ─────────────────────────────────────────────── */}
      <ChatHeader
        userName={partnerName}
        avatarUrl={partnerAvatar}
        isOnline={partnerOnline}
        onBack={onBack}
      />

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

        {/* Scroll anchor */}
        <div ref={messagesEndRef} />
      </div>

      {/* ── Floating scroll-to-bottom button ───────────────────── */}
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
        onImageSend={handleImageSend}
        onTyping={handleTypingNotify}
      />
    </div>
  );
};

export default Chat;