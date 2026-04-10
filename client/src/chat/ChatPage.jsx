import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import API from "../api/axios";
import Chat from "./Chat";

/**
 * ChatPage — Full-screen wrapper for the Chat component.
 * Reads providerId from URL params and constructs a deterministic
 * roomId from the sorted user IDs.
 *
 * The page takes full viewport height and hides the navbar overflow
 * so the chat feels like a native app experience.
 */
const ChatPage = () => {
  const { providerId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [partner, setPartner] = useState(null);

  useEffect(() => {
    const fetchPartner = async () => {
      try {
        const res = await API.get(`/auth/users/${providerId}`);
        setPartner(res.data.user);
      } catch (err) {
        console.error("Failed to fetch partner details", err);
      }
    };
    if (providerId) {
      fetchPartner();
    }
  }, [providerId]);

  // ── Not logged in ──────────────────────────────────────────────
  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center h-screen gap-4 bg-[#F5FDFD] font-sans">
        <div className="w-16 h-16 rounded-3xl bg-white border border-[#E0F5F3] shadow-sm
          flex items-center justify-center text-[#45B1A8]">
          <span className="text-2xl">🔒</span>
        </div>
        <p className="text-[#4A5568] font-medium text-sm">Please log in to start chatting.</p>
        <button
          onClick={() => navigate("/login")}
          className="bg-[#45B1A8] text-white px-8 py-3 rounded-full font-bold hover:bg-[#3a9990] transition-colors shadow-sm text-sm"
        >
          Go to Login
        </button>
      </div>
    );
  }

  const userId = user._id;
  // Deterministic room ID: always the same regardless of who opens the chat
  const roomId = [userId, providerId].sort().join("_");

  return (
    <div className="h-[calc(100vh-4rem)] bg-[#F5FDFD] w-full pt-4 pb-0 sm:py-6 px-0 sm:px-4 flex justify-center font-sans">
      {/*
        On desktop, we limit the chat width and center it beautifully in a card.
        On mobile, it fills the full viewport width.
      */}
      <div className="w-full max-w-3xl bg-white sm:rounded-[2.5rem] sm:shadow-lg sm:border border-[#E0F5F3] overflow-hidden flex flex-col h-full relative">
        <Chat
          userId={userId}
          roomId={roomId}
          partnerName={partner?.name || "Service Provider"}
          partnerAvatar={partner?.avatar}
          partnerOnline={true}
          onBack={() => navigate(-1)}
        />
      </div>
    </div>
  );
};

export default ChatPage;