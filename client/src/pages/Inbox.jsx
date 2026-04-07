import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../api/axios";
import { HiChatAlt2, HiChevronRight } from "react-icons/hi";

const Inbox = () => {
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchInbox = async () => {
      try {
        const res = await API.get("/messages/inbox");
        if (res.data.success) {
          setChats(res.data.data);
        }
      } catch (err) {
        console.error("Failed to load inbox", err);
      } finally {
        setLoading(false);
      }
    };

    fetchInbox();
  }, []);

  const formatTime = (isoString) => {
    if (!isoString) return "";
    const date = new Date(isoString);
    const now = new Date();
    
    // If it's today, show time. Otherwise, show date.
    if (date.toDateString() === now.toDateString()) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 min-h-[calc(100vh-4rem)]">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-12 h-12 bg-primary-600/20 rounded-xl flex items-center justify-center border border-primary-500/30">
          <HiChatAlt2 className="w-6 h-6 text-primary-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white">Your Chats</h1>
          <p className="text-dark-200 text-sm">Recent conversations with providers and customers.</p>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-20">
          <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : chats.length === 0 ? (
        <div className="glass p-12 text-center rounded-2xl flex flex-col items-center border-dark-600/50">
          <div className="w-20 h-20 bg-dark-700 rounded-full flex items-center justify-center mb-4">
            <span className="text-4xl text-dark-300">💬</span>
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">No messages yet</h3>
          <p className="text-dark-200">When you start a conversation, it will appear here.</p>
          <button 
            onClick={() => navigate('/services')} 
            className="mt-6 btn-primary"
          >
            Browse Services
          </button>
        </div>
      ) : (
        <div className="glass rounded-2xl overflow-hidden border border-dark-500/50 divide-y divide-dark-600/50 shadow-lg shadow-black/20">
          {chats.map((chat) => (
            <Link
              key={chat.room}
              to={`/chat/${chat.partner._id}`}
              className="flex items-center justify-between p-4 hover:bg-dark-600/50 transition-colors group cursor-pointer"
            >
              <div className="flex items-center gap-4 min-w-0">
                <div className="relative">
                  {chat.partner.avatar ? (
                    <img 
                      src={chat.partner.avatar} 
                      alt="" 
                      className="w-12 h-12 rounded-full object-cover ring-2 ring-dark-600"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center ring-2 ring-dark-600">
                      <span className="text-sm font-semibold text-white">
                        {chat.partner.name?.charAt(0).toUpperCase() || '?'}
                      </span>
                    </div>
                  )}
                  {/* Minimal unread indicator or status could go here */}
                </div>
                
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-base font-semibold text-white truncate">
                      {chat.partner.name}
                    </h3>
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-dark-600 text-dark-200 border border-dark-500">
                      {chat.partner.role}
                    </span>
                  </div>
                  <p className="text-sm text-dark-200 truncate pr-4">
                    {chat.latestMessage}
                  </p>
                </div>
              </div>
              
              <div className="flex flex-col items-end gap-2 shrink-0 ml-4">
                <span className="text-xs text-dark-300 font-medium">
                  {formatTime(chat.createdAt)}
                </span>
                <div className="w-6 h-6 rounded-full bg-dark-700 group-hover:bg-primary-600/20 flex items-center justify-center transition-colors">
                  <HiChevronRight className="w-4 h-4 text-dark-400 group-hover:text-primary-400" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default Inbox;
