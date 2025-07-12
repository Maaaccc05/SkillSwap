import React, { useEffect, useState } from "react";
import io from "socket.io-client";

const socket = io("http://localhost:5001"); // Updated to match backend port

const ChatBox = ({ username = "Anonymous" }) => {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);

  const sendMessage = () => {
    if (message.trim()) {
      const data = {
        author: username,
        message,
        time: new Date().toLocaleTimeString()
      };
      socket.emit("send_message", data);
      setMessages((prev) => [...prev, data]);
      setMessage("");
    }
  };

  useEffect(() => {
    socket.on("receive_message", (data) => {
      setMessages((prev) => [...prev, data]);
    });

    return () => {
      socket.off("receive_message");
    };
  }, []);

  return (
    <div className="border border-gray-300 p-4 w-full max-w-lg mx-auto rounded-lg bg-gray-50">
      <h3 className="text-lg font-semibold mb-3">Live Chat</h3>
      <div className="h-64 overflow-y-auto border border-gray-200 p-2 mb-3 bg-white rounded">
        {messages.map((msg, i) => (
          <div key={i} className="mb-2 text-sm">
            <strong className="text-blue-600">{msg.author}</strong> 
            <span className="text-gray-500 text-xs ml-2">[{msg.time}]</span>: 
            <span className="ml-1">{msg.message}</span>
          </div>
        ))}
      </div>
      <div className="flex gap-2">
        <input
          type="text"
          placeholder="Type message..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          className="flex-1 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button 
          onClick={sendMessage} 
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default ChatBox;
