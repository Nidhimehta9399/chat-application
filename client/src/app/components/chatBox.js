"use client";

import { useState, useEffect } from "react";
import io from "socket.io-client";
import styles from "./ChatBox.module.css"; // Import the CSS module

let socket;

const ChatBox = () => {
  const [username, setUsername] = useState(""); // To store username
  const [message, setMessage] = useState(""); // To store current message
  const [messages, setMessages] = useState([]); // To store all messages
  const [users, setUsers] = useState([]); // To store online users

  useEffect(() => {
    // Connect to backend server using socket.io
    socket = io("http://localhost:5000");

    // Listen for incoming messages
    socket.on("receiveMessage", (message) => {
      setMessages((prevMessages) => [...prevMessages, message]);
    });

    // Listen for user joins and updates
    socket.on("userJoined", (users) => {
      setUsers(users);
    });

    // Listen for user leaves
    socket.on("userLeft", (users) => {
      setUsers(users);
    });

    // Clean up socket connection when component is unmounted
    return () => {
      socket.disconnect();
    };
  }, []);

  // Handle the username joining event
  const handleJoin = () => {
    if (username) {
      socket.emit("join", username); // Send username to the server
    }
  };

  // Handle sending a message
  const handleSendMessage = () => {
    if (message) {
      const msg = {
        user: username,
        text: message,
        time: new Date().toLocaleTimeString(),
      };
      socket.emit("sendMessage", msg); // Send message to the server
      setMessage(""); // Reset message input field
    }
  };

  return (
    <div className={styles.chatContainer}>
      <h1>Chat Application</h1>
      <div>
        <input
          type="text"
          placeholder="Enter your username"
          value={username} // Ensure the value is bound to state
          onChange={(e) => setUsername(e.target.value)} // Update state on change
          maxLength={30} // Optional: limit input length to avoid issues
        />
        <button onClick={handleJoin}>Join Chat</button>
      </div>
      {username && (
        <div>
          <div className={styles.welcomeMessage}>Welcome, {username}</div>

          {/* Display list of online users */}
          <div className={styles.userList}>
            <h4>Users:</h4>
            <ul>
              {users.map((user) => (
                <li key={user.id}>{user.username}</li>
              ))}
            </ul>
          </div>

          {/* Message input and send button */}
          <div>
            <input
              type="text"
              placeholder="Type a message"
              value={message} // Bind input value to message state
              onChange={(e) => setMessage(e.target.value)} // Update message on input change
            />
            <button onClick={handleSendMessage}>Send</button>
          </div>

          {/* Display messages */}
          <div className={styles.messageList}>
            <h4>Messages:</h4>
            <ul>
              {messages.map((msg, index) => (
                <li key={index}>
                  <strong>{msg.user}</strong>: {msg.text}{" "}
                  <small>({msg.time})</small>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatBox;
