import React, { useState, useEffect, useRef } from "react";
import poolsConfig from '../../config/poolsConfig';
import "./ChatBubble.css";

const ChatBubble = ({ onClose }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [username, setUsername] = useState("");
  const [isChoosingUsername, setIsChoosingUsername] = useState(true);
  const [timers, setTimers] = useState({});
  const [error, setError] = useState("");
  const [activeUsers, setActiveUsers] = useState(new Set());
  const chatMessagesRef = useRef(null);
  const [isFirstMessageSent, setIsFirstMessageSent] = useState(false);

  useEffect(() => {
    // Load saved messages and username
    const savedMessages = JSON.parse(localStorage.getItem("chatMessages")) || [];
    const savedUsername = localStorage.getItem("chatUsername") || "";
    if (savedMessages.length) setMessages(savedMessages);
    if (savedUsername) {
      setUsername(savedUsername);
      setIsChoosingUsername(false);
      addUserToChat(savedUsername);
    }

    // Cleanup on unload
    const handleUnload = () => {
      removeUserFromChat(username);
    };
    window.addEventListener("beforeunload", handleUnload);
    return () => window.removeEventListener("beforeunload", handleUnload);
  }, []);

  useEffect(() => {
    localStorage.setItem("chatMessages", JSON.stringify(messages.slice(-100)));
  }, [messages]);

  useEffect(() => {
    if (username) {
      localStorage.setItem("chatUsername", username);
    }
  }, [username]);

  useEffect(() => {
    if (chatMessagesRef.current) {
      chatMessagesRef.current.scrollTo({
        top: chatMessagesRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [messages]);



  useEffect(() => {
    const handleResize = () => {
        const chatWindow = document.querySelector('.chat-window');
        if (window.innerHeight < window.screen.height * 0.8) {
            // Keyboard is open
            chatWindow.style.height = '50vh';
        } else {
            // Keyboard is closed
            chatWindow.style.height = 'calc(100vh - 50px)';
        }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
}, []);
  



  const addUserToChat = (newUser) => {
    setActiveUsers((prev) => new Set(prev).add(newUser));
  };

  const removeUserFromChat = (user) => {
    setActiveUsers((prev) => {
      const updatedUsers = new Set(prev);
      updatedUsers.delete(user);
      return updatedUsers;
    });
  };

  const handleSend = () => {
    if (newMessage.trim()) {
      setMessages((prev) => [
        ...prev.slice(-99),
        {
          text: newMessage,
          sender: username || "Anonymous",
          type: "text",
          timestamp: new Date().toISOString(),
        },
      ]);
      setNewMessage("");
      setIsFirstMessageSent(true);
    }
  };

  const handlePaste = (e) => {
    const clipboardItems = e.clipboardData.items;
    for (const item of clipboardItems) {
      if (item.type.startsWith("image/")) {
        const file = item.getAsFile();
        const reader = new FileReader();
        reader.onload = (event) => {
          setMessages((prev) => [
            ...prev.slice(-99),
            {
              content: event.target.result,
              sender: username || "Anonymous",
              type: "image",
              timestamp: new Date().toISOString(),
            },
          ]);
        };
        reader.readAsDataURL(file);
        e.preventDefault();
        return;
      }
      if (item.type === "text/plain") {
        const text = e.clipboardData.getData("text");
        if (text.match(/\.(gif|jpe?g|tiff?|png|webp|bmp)$/i)) {
          setMessages((prev) => [
            ...prev.slice(-99),
            {
              content: text,
              sender: username || "Anonymous",
              type: "image",
              timestamp: new Date().toISOString(),
            },
          ]);
          e.preventDefault();
          return;
        }
      }
    }
    const clipboardText = e.clipboardData.getData("text");
    if (clipboardText.trim()) {
      setNewMessage((prev) => prev + clipboardText);
    }
  };

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const formattedHours = hours % 12 || 12;
    const amPm = hours >= 12 ? "PM" : "AM";
    return `${formattedHours}:${minutes.toString().padStart(2, "0")} ${amPm}`;
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      if (isChoosingUsername) {
        handleSetUsername();
      } else {
        handleSend();
      }
    }
  };

  const handleSetUsername = () => {
    if (username.length < 3 || username.length > 15) {
      setError("Username must be between 3 and 15 characters.");
      return;
    }
    setError("");
    setIsChoosingUsername(false);
    addUserToChat(username);
  };

  const calculateTimeLeft = (endTime) => {
    const now = new Date();
    const end = new Date(endTime);
    const diff = end - now;
    if (diff <= 0) return "Expired";
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);
    return `${hours}h ${minutes}m ${seconds}s`;
  };

  useEffect(() => {
    const interval = setInterval(() => {
      const updatedTimers = poolsConfig.reduce((acc, pool) => {
        acc[pool.name] = calculateTimeLeft(pool.endTime);
        return acc;
      }, {});
      setTimers(updatedTimers);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="chat-window">
      <div className="chat-header">
        <h4>
          Live Chat
          <span className="user-count">
            ({activeUsers.size} {activeUsers.size === 1 ? "user" : "users"})
          </span>
        </h4>
        <button className="close-chat" onClick={onClose}>
          &times;
        </button>
      </div>
      <div className="chat-pool-info">
        {poolsConfig.map((pool) => {
          const ticketsSold = pool.ticketsSold || 0;
          const totalTickets = pool.totalTickets || 1;
          const progressPercentage = Math.min(
            Math.floor((ticketsSold / totalTickets) * 30),
            30
          );
          return (
            <div key={pool.name} className="pool-info">
              <span className="pool-name">{pool.name}:</span>
              <span className="dots">
                {".".repeat(progressPercentage)}
                <span className="empty-dots">
                  {".".repeat(30 - progressPercentage)}
                </span>
              </span>
              <span className="pool-timer">
                ends in: {timers[pool.name] || "Loading..."}
              </span>
            </div>
          );
        })}
      </div>
      {isChoosingUsername ? (
        <div className="username-prompt">
          <p>Please enter a username to participate in the chat:</p>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Enter your username..."
            maxLength="15"
            onKeyPress={handleKeyPress}
          />
          {error && <p className="error">{error}</p>}
          <button onClick={handleSetUsername}>Set Username</button>
        </div>
      ) : (
        <>
<div className="chat-messages" ref={chatMessagesRef}>
  {messages.map((msg, index) => (
    <div
      key={index}
      className={`chat-message ${
        msg.sender === username ? "user-message" : "other-message"
      }`}
    >
      <div className="terminal-bubble">
        {/* Display the username */}
        <span className="terminal-username">
          {msg.sender === username ? "You:" : msg.sender}
        </span>
        {/* Display the message content */}
        <span className="terminal-content">
          {msg.type === "text" ? (
            msg.text
          ) : (
            <img
              src={msg.content}
              alt="User uploaded"
              className="chat-image"
            />
          )}
        </span>
        {/* Display the timestamp */}
        <span className="terminal-timestamp">
          [{msg.timestamp ? formatTimestamp(msg.timestamp) : "unknown"}]
        </span>
      </div>
    </div>
  ))}
</div>
          <div className="chat-input">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              onPaste={handlePaste}
              placeholder={
                isFirstMessageSent
                  ? ""
                  : "Type a message or share an image/GIF"
              }
            />
            <button onClick={handleSend} className="send-button">
              ➤
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default ChatBubble;
