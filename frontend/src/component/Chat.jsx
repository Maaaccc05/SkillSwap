import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaPaperPlane } from 'react-icons/fa';
import io from 'socket.io-client';

const Chat = () => {
  const { chatId } = useParams();
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [chat, setChat] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [socketError, setSocketError] = useState('');
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    fetchChat();
    setupSocket();
  }, [chatId]);

  const setupSocket = () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setSocketError('No authentication token found');
      return;
    }

    const newSocket = io('http://localhost:5001', {
      timeout: 5000,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000
    });

    newSocket.on('connect', () => {
      console.log('Connected to chat server');
      setIsConnected(true);
      setSocketError('');
      // Authenticate the socket connection
      newSocket.emit('authenticate', token);
    });

    newSocket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
      setIsConnected(false);
      setSocketError('Connection failed. Messages will still be sent via HTTP.');
    });

    newSocket.on('authenticated', (data) => {
      console.log('Socket authenticated:', data);
      setSocketError('');
    });

    newSocket.on('auth_error', (data) => {
      console.error('Socket authentication failed:', data);
      setSocketError('Authentication failed. Messages will still be sent via HTTP.');
      setIsConnected(false);
    });

    newSocket.on('message_received', (message) => {
      // Only add if the message is NOT from the current user
      if (message.chatId === chatId) {
        const senderId = message.sender._id || message.sender;
        if (senderId !== currentUserId) {
          setMessages(prev => [...prev, message]);
        }
      }
    });

    newSocket.on('message_sent', (message) => {
      console.log('Message sent confirmation:', message);
    });

    newSocket.on('error', (error) => {
      console.error('Socket error:', error);
      setSocketError(error.message || 'Connection error. Messages will still be sent via HTTP.');
    });

    newSocket.on('user_typing', (data) => {
      // You can add typing indicators here
      console.log('User typing:', data);
    });

    newSocket.on('user_stopped_typing', (data) => {
      // Remove typing indicators here
      console.log('User stopped typing:', data);
    });

    newSocket.on('disconnect', (reason) => {
      console.log('Disconnected from chat server:', reason);
      setIsConnected(false);
      if (reason === 'io server disconnect') {
        // the disconnection was initiated by the server, reconnect manually
        newSocket.connect();
      }
    });

    newSocket.on('reconnect', (attemptNumber) => {
      console.log('Reconnected to chat server after', attemptNumber, 'attempts');
      setIsConnected(true);
      setSocketError('');
      // Re-authenticate after reconnection
      newSocket.emit('authenticate', token);
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  };

  const fetchChat = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      const response = await fetch(`http://localhost:5001/api/chat/${chatId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const chatData = await response.json();
        setChat(chatData);
        setMessages(chatData.messages || []);
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Failed to load chat');
      }
    } catch (error) {
      console.error('Error fetching chat:', error);
      setError('Failed to connect to server');
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const messageContent = newMessage.trim();
    setNewMessage('');

    // If socket is connected, send via socket first
    if (socket && isConnected) {
      try {
        // Send via socket for real-time
        socket.emit('send_message', {
          chatId: chatId,
          content: messageContent,
          messageType: 'text'
        });
        
        // Add message to local state immediately for better UX
        const tempMessage = {
          sender: currentUserId,
          content: messageContent,
          messageType: 'text',
          timestamp: new Date(),
          _id: Date.now() // Temporary ID
        };
        setMessages(prev => [...prev, tempMessage]);
        
        // Listen for confirmation from socket
        const handleMessageSent = (message) => {
          if (message.chatId === chatId) {
            // Replace temp message with real one from server
            setMessages(prev => prev.map(msg => 
              msg._id === tempMessage._id ? message : msg
            ));
            socket.off('message_sent', handleMessageSent);
          }
        };
        
        socket.on('message_sent', handleMessageSent);
        
        // Fallback to HTTP if socket doesn't respond within 3 seconds
        setTimeout(() => {
          socket.off('message_sent', handleMessageSent);
          // Check if message was confirmed
          const messageExists = messages.some(msg => 
            msg.content === messageContent && msg.sender === currentUserId
          );
          if (!messageExists) {
            sendViaHTTP(messageContent);
          }
        }, 3000);
        
      } catch (error) {
        console.error('Socket send error:', error);
        sendViaHTTP(messageContent);
      }
    } else {
      // Socket not connected, send via HTTP
      sendViaHTTP(messageContent);
    }
  };

  const sendViaHTTP = async (messageContent) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5001/api/chat/${chatId}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          content: messageContent,
          messageType: 'text'
        })
      });

      if (response.ok) {
        const messageData = await response.json();
        // Only add if not already added by socket
        setMessages(prev => {
          const exists = prev.some(msg => 
            msg.content === messageContent && 
            msg.sender === currentUserId &&
            Math.abs(new Date(msg.timestamp) - new Date(messageData.timestamp)) < 5000
          );
          return exists ? prev : [...prev, messageData];
        });
      } else {
        const errorData = await response.json();
        alert(errorData.message || 'Failed to send message');
        // Restore the message if sending failed
        setNewMessage(messageContent);
      }
    } catch (error) {
      console.error('Error sending message via HTTP:', error);
      alert('Failed to send message');
      // Restore the message if sending failed
      setNewMessage(messageContent);
    }
  };

  const handleTyping = (e) => {
    setNewMessage(e.target.value);
    // Only emit typing events if socket is connected
    if (socket && isConnected) {
      socket.emit('typing_start', { chatId });
      clearTimeout(window.typingTimer);
      window.typingTimer = setTimeout(() => {
        socket.emit('typing_stop', { chatId });
      }, 1000);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading chat...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button 
            onClick={() => navigate('/home')}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  const currentUserId = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user'))._id : null;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => navigate('/chat')}
              className="p-2 hover:bg-gray-100 rounded-full"
            >
              <FaArrowLeft className="text-gray-600" />
            </button>
            <div>
              <h1 className="text-lg font-semibold text-gray-900">
                {chat?.participants?.find(p => p._id !== currentUserId)?.name || 'Chat'}
              </h1>
              <p className="text-sm text-gray-500">
                {chat?.participants?.find(p => p._id !== currentUserId)?.isOnline ? 'Online' : 'Offline'}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
            <span className="text-xs text-gray-500">{isConnected ? 'Connected' : 'Disconnected'}</span>
          </div>
        </div>
      </div>

      {/* Socket Error Warning */}
      {socketError && (
        <div className="max-w-4xl mx-auto px-4 py-2">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <p className="text-yellow-800 text-sm">{socketError}</p>
          </div>
        </div>
      )}

      {/* Messages */}
      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="bg-white rounded-lg shadow-sm border h-96 flex flex-col">
          {/* Messages Container */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.length === 0 ? (
              <div className="text-center text-gray-500 py-8">
                <p>No messages yet. Start the conversation!</p>
              </div>
            ) : (
              messages.map((message, index) => {
                // Fix the comparison by converting both to strings
                const isOwnMessage = message.sender._id === currentUserId || message.sender === currentUserId;
                return (
                  <div
                    key={index}
                    className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                        isOwnMessage
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-200 text-gray-900'
                      }`}
                    >
                      <p className="text-sm">{message.content}</p>
                      <p className={`text-xs mt-1 ${
                        isOwnMessage ? 'text-blue-100' : 'text-gray-500'
                      }`}>
                        {new Date(message.timestamp).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Message Input */}
          <div className="border-t p-4">
            <form onSubmit={sendMessage} className="flex space-x-3">
              <input
                type="text"
                value={newMessage}
                onChange={handleTyping}
                placeholder="Type your message..."
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="submit"
                disabled={!newMessage.trim()}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <FaPaperPlane />
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chat; 