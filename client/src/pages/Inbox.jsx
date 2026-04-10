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
    <div className="bg-[#F5FDFD] min-h-screen py-10 font-sans">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-center gap-4 bg-white p-6 sm:p-8 rounded-[2rem] border border-[#E0F5F3] shadow-sm">
          <div className="w-14 h-14 bg-[#E0F5F3] rounded-full flex items-center justify-center border border-[#45B1A8]/20 shrink-0">
            <HiChatAlt2 className="w-7 h-7 text-[#45B1A8]" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-[#1A2B2A]">Your Chats</h1>
            <p className="text-[#4A5568] mt-1 font-medium text-sm md:text-base">Recent conversations with your service providers and customers.</p>
          </div>
        </div>

        {loading ? (
          <div className="bg-white py-20 rounded-[2.5rem] border border-[#E0F5F3] shadow-sm flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-[#45B1A8] border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : chats.length === 0 ? (
          <div className="bg-white p-12 text-center rounded-[2.5rem] border border-[#E0F5F3] shadow-sm border-dashed flex flex-col items-center">
            <div className="w-16 h-16 bg-[#F5FDFD] rounded-full flex items-center justify-center mx-auto mb-4 border border-[#E0F5F3]">
              <span className="text-3xl">💬</span>
            </div>
            <h3 className="text-xl font-bold text-[#1A2B2A] mb-2">No messages yet</h3>
            <p className="text-[#4A5568] font-medium max-w-sm">When you start a conversation by messaging a provider, it will appear here.</p>
            <button 
              onClick={() => navigate('/services')} 
              className="mt-6 bg-[#1A2B2A] text-white px-8 py-3.5 rounded-full font-bold hover:bg-black transition-colors"
            >
              Browse Services
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-[2rem] overflow-hidden border border-[#E0F5F3] divide-y divide-[#E0F5F3] shadow-sm">
            {chats.map((chat) => (
              <Link
                key={chat.room}
                to={`/chat/${chat.partner._id}`}
                className="flex items-center justify-between p-5 sm:p-6 hover:bg-[#F5FDFD] transition-colors group cursor-pointer"
              >
                <div className="flex items-center gap-4 min-w-0">
                  <div className="relative shrink-0">
                    {chat.partner.avatar ? (
                      <img 
                        src={chat.partner.avatar} 
                        alt="" 
                        className="w-14 h-14 rounded-full object-cover border-2 border-white shadow-sm ring-1 ring-[#E0F5F3]"
                      />
                    ) : (
                      <div className="w-14 h-14 rounded-full bg-[#E0F5F3] flex items-center justify-center border-2 border-white shadow-sm ring-1 ring-[#E0F5F3]">
                        <span className="text-xl font-black text-[#45B1A8]">
                          {chat.partner.name?.charAt(0).toUpperCase() || '?'}
                        </span>
                      </div>
                    )}
                  </div>
                  
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1.5">
                      <h3 className="text-lg font-bold text-[#1A2B2A] truncate group-hover:text-[#45B1A8] transition-colors">
                        {chat.partner.name}
                      </h3>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#F5FDFD] text-[#45B1A8] font-bold border border-[#E0F5F3] uppercase tracking-wider hidden sm:inline-block">
                        {chat.partner.role}
                      </span>
                    </div>
                    <p className="text-sm font-medium text-[#4A5568] truncate pr-4">
                      {chat.latestMessage}
                    </p>
                  </div>
                </div>
                
                <div className="flex flex-col items-end gap-3 shrink-0 ml-4">
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                    {formatTime(chat.createdAt)}
                  </span>
                  <div className="w-8 h-8 rounded-full bg-[#F5FDFD] border border-[#E0F5F3] group-hover:bg-[#45B1A8]/10 group-hover:border-[#45B1A8]/30 flex items-center justify-center transition-colors">
                    <HiChevronRight className="w-5 h-5 text-gray-400 group-hover:text-[#45B1A8]" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Inbox;
