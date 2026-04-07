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
      <div className="flex flex-col items-center justify-center h-screen gap-4">
        <div className="w-16 h-16 rounded-2xl bg-dark-700 border border-dark-500/50
          flex items-center justify-center">
          <span className="text-2xl">🔒</span>
        </div>
        <p className="text-dark-200 text-sm">Please log in to start chatting.</p>
        <button
          onClick={() => navigate("/login")}
          className="btn-primary text-sm"
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
    <div className="h-[calc(100vh-4rem)] w-full max-w-3xl mx-auto sm:my-0">
      {/*
        On desktop, we limit the chat width and center it.
        On mobile, it fills the full viewport width.
        The height accounts for the navbar (4rem).
      */}
      <Chat
        userId={userId}
        roomId={roomId}
        partnerName={partner?.name || "Service Provider"}
        partnerAvatar={partner?.avatar}
        partnerOnline={true}
        onBack={() => navigate(-1)}
      />
    </div>
  );
};

export default ChatPage;