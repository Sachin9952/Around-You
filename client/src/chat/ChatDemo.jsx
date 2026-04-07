import React from "react";
import Chat from "./Chat";

/**
 * ChatDemo — Standalone demo page for testing the chat UI
 * with dummy data. No authentication required.
 *
 * Access at: /chat-demo
 */
const ChatDemo = () => {
  return (
    <div className="h-[calc(100vh-4rem)] w-full max-w-3xl mx-auto">
      <Chat
        userId="user1"
        roomId="demo_room"
        partnerName="Rahul Sharma"
        partnerOnline={true}
        onBack={() => window.history.back()}
        useDummy={true}
      />
    </div>
  );
};

export default ChatDemo;
