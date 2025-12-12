// src/pages/Messages.jsx
import React, { useState, useEffect, useRef } from "react";
import api from "../utils/api";
import "./Messages.css";

export default function Messages() {
  const [conversations, setConversations] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [currentUser, setCurrentUser] = useState(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    setCurrentUser(user);
    fetchConversations();
  }, []);

  useEffect(() => {
    if (selectedUser) {
      fetchConversation(selectedUser._id);
    }
  }, [selectedUser]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const fetchConversations = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await api.get("/messages/conversations", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setConversations(res.data.conversations);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchConversation = async (userId) => {
    try {
      const token = localStorage.getItem("token");
      const res = await api.get(`/messages/${userId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMessages(res.data.messages);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedUser) return;

    try {
      const token = localStorage.getItem("token");
      await api.post("/messages", {
        receiverId: selectedUser._id,
        content: newMessage
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setNewMessage("");
      fetchConversation(selectedUser._id);
      fetchConversations(); // Update conversations list
    } catch (err) {
      alert(err.response?.data?.msg || "Error sending message");
    }
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    
    // Less than 1 minute
    if (diff < 60000) return "Just now";
    
    // Less than 1 hour
    if (diff < 3600000) {
      const mins = Math.floor(diff / 60000);
      return `${mins}m ago`;
    }
    
    // Less than 24 hours
    if (diff < 86400000) {
      const hours = Math.floor(diff / 3600000);
      return `${hours}h ago`;
    }
    
    // More than 24 hours
    return date.toLocaleDateString();
  };

  return (
    <div className="messages-container">
      <div className="conversations-sidebar">
        <h2>Messages</h2>
        <div className="conversations-list">
          {conversations.length === 0 ? (
            <p className="empty-state">No conversations yet</p>
          ) : (
            conversations.map(conv => (
              <div
                key={conv.user._id}
                className={`conversation-item ${selectedUser?._id === conv.user._id ? "active" : ""}`}
                onClick={() => setSelectedUser(conv.user)}
              >
                <div className="conversation-info">
                  <div className="conversation-header">
                    <h3>{conv.user.name}</h3>
                    {conv.unreadCount > 0 && (
                      <span className="unread-badge">{conv.unreadCount}</span>
                    )}
                  </div>
                  <p className="last-message">
                    {conv.lastMessage?.content.substring(0, 40)}
                    {conv.lastMessage?.content.length > 40 ? "..." : ""}
                  </p>
                </div>
                <span className="time">{formatTime(conv.lastMessage?.createdAt)}</span>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="chat-area">
        {selectedUser ? (
          <>
            <div className="chat-header">
              <h2>{selectedUser.name}</h2>
              <span className="user-role">{selectedUser.role}</span>
            </div>

            <div className="messages-list">
              {messages.length === 0 ? (
                <p className="empty-chat">No messages yet. Start the conversation!</p>
              ) : (
                messages.map(msg => (
                  <div
                    key={msg._id}
                    className={`message ${msg.senderId._id === currentUser?.id ? "sent" : "received"}`}
                  >
                    <div className="message-content">
                      <p>{msg.content}</p>
                      <span className="message-time">{formatTime(msg.createdAt)}</span>
                    </div>
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>

            <form onSubmit={handleSendMessage} className="message-input-form">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type a message..."
                maxLength="2000"
              />
              <button type="submit" disabled={!newMessage.trim()}>
                Send
              </button>
            </form>
          </>
        ) : (
          <div className="no-chat-selected">
            <p>Select a conversation to start messaging</p>
          </div>
        )}
      </div>
    </div>
  );
}