import { useState, useEffect, useRef } from 'react';
import { Send, Paperclip, FileText, CheckCheck, Check, Users, ArrowLeft, MessageCircle } from 'lucide-react';
import { useParams } from 'react-router-dom';
const API = import.meta.env.VITE_API_BASE_URL;

const Chat = ({ socket }) => {
  const { chatId } = useParams();
  const [chat, setChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messageText, setMessageText] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [timeoutError, setTimeoutError] = useState(false);
  const [error, setError] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const fileInputRef = useRef(null);
  const messagesEndRef = useRef(null);
  const firstUnreadRef = useRef(null);
  const hasScrolledToUnread = useRef(false);
  
  const token = localStorage.getItem('token');
  const userId = localStorage.getItem('userId');

  // Monitor socket connection status
  useEffect(() => {
    if (!socket) return;

    const handleConnect = () => {
      console.log('✅ Socket connected');
      setIsConnected(true);
    };

    const handleDisconnect = () => {
      console.log('❌ Socket disconnected');
      setIsConnected(false);
    };

    setIsConnected(socket.connected);
    socket.on('connect', handleConnect);
    socket.on('disconnect', handleDisconnect);

    return () => {
      socket.off('connect', handleConnect);
      socket.off('disconnect', handleDisconnect);
    };
  }, [socket]);

  // Join chat room and listen for new messages
  useEffect(() => {
    if (!chatId || !socket) return;

    socket.emit('joinChat', chatId);
    console.log(`📨 Joined chat room: ${chatId}`);

    const handleNewMessage = (newMessage) => {
      console.log('📩 New message received:', newMessage);
      
      setMessages(prev => {
        const exists = prev.some(msg => msg._id === newMessage._id);
        if (exists) return prev;
        return [...prev, newMessage];
      });
      
      setTimeout(() => scrollToBottom(), 100);
    };

    socket.on('newMessage', handleNewMessage);

    return () => {
      socket.off('newMessage', handleNewMessage);
      console.log(`👋 Left chat room: ${chatId}`);
    };
  }, [chatId, socket]);

  // Initial data fetch
  useEffect(() => {
    if (chatId) {
      fetchChatAndMessages();
    }
  }, [chatId]);

  // Mark messages as read when viewing them
  useEffect(() => {
    if (!chatId || messages.length === 0) return;

    const unreadMessages = messages.filter(
      msg => msg.author?._id !== userId && !msg.readBy?.includes(userId)
    );

    if (unreadMessages.length > 0) {
      const timer = setTimeout(() => {
        markMessagesAsRead(unreadMessages.map(msg => msg._id));
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [messages, chatId, userId]);

  // Smart scrolling - scroll to first unread or bottom
  useEffect(() => {
    if (messages.length > 0 && !hasScrolledToUnread.current) {
      const firstUnreadMessage = messages.find(
        msg => msg.author?._id !== userId && !msg.readBy?.includes(userId)
      );

      if (firstUnreadMessage && firstUnreadRef.current) {
        setTimeout(() => {
          firstUnreadRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 300);
        hasScrolledToUnread.current = true;
      } else {
        scrollToBottom();
        hasScrolledToUnread.current = true;
      }
    }
  }, [messages, userId]);

  const fetchChatAndMessages = async () => {
    try {
      setLoading(true);
      setTimeoutError(false);
      setError(null);
      hasScrolledToUnread.current = false;
      
      const timeoutId = setTimeout(() => {
        setTimeoutError(true);
        setLoading(false);
      }, 10000);

      console.log('Fetching chat:', chatId);

      const chatResponse = await fetch(`${API}/api/chats/${chatId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      clearTimeout(timeoutId);

      if (!chatResponse.ok) {
        throw new Error(`Failed to fetch chat: ${chatResponse.status}`);
      }

      const chatData = await chatResponse.json();
      setChat(chatData);
      
      await fetchMessages();
      
    } catch (error) {
      console.error('Error in fetchChatAndMessages:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async () => {
    try {
      const response = await fetch(`${API}/api/chats/${chatId}/messages`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!response.ok) {
        if (response.status === 404) {
          setMessages([]);
          return;
        }
        throw new Error('Failed to fetch messages');
      }

      const data = await response.json();
      
      if (Array.isArray(data)) {
        setMessages(data);
      } else if (data.messages) {
        setMessages(data.messages);
      } else {
        setMessages([]);
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const markMessagesAsRead = async (messageIds) => {
    if (!messageIds || messageIds.length === 0) return;

    try {
      await Promise.all(
        messageIds.map(msgId =>
          fetch(`${API}/api/messages/${msgId}/read`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          })
        )
      );

      setMessages(prev =>
        prev.map(msg => {
          if (messageIds.includes(msg._id)) {
            return {
              ...msg,
              readBy: [...(msg.readBy || []), userId]
            };
          }
          return msg;
        })
      );
    } catch (error) {
      console.error('Error marking messages as read:', error);
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!messageText.trim()) return;

    const messageContent = messageText;
    setMessageText('');

    try {
      setSending(true);
      const response = await fetch(
        `${API}/api/chats/${chatId}/messages`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ content: messageContent })
        }
      );

      if (!response.ok) throw new Error('Failed to send message');

      const data = await response.json();
      
      setTimeout(() => scrollToBottom(), 100);
      
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Failed to send message. Please try again.');
      setMessageText(messageContent);
    } finally {
      setSending(false);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
      setUploadingFile(true);
      const response = await fetch(
        `${API}/api/chats/${chatId}/messages`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          },
          body: formData
        }
      );

      if (!response.ok) throw new Error('Failed to upload file');

      scrollToBottom();
    } catch (error) {
      console.error('Error uploading file:', error);
      alert('Failed to upload file');
    } finally {
      setUploadingFile(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const getInitials = (name) => {
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const getChatTitle = () => {
    if (!chat) return 'Chat';
    
    if (chat.isGroupChat) {
      return chat.name || `Group Chat (${chat.participants?.length || 0} members)`;
    }
    
    const otherParticipant = chat.participants?.find(p => p._id !== userId);
    return otherParticipant?.fullname || 'Chat';
  };

  const renderAttachment = (attachment) => {
    const isImage = attachment.fileType?.startsWith('image/');
    
    if (isImage) {
      return (
        <img
          src={attachment.url}
          alt={attachment.filename}
          className="max-w-xs max-h-64 rounded-lg cursor-pointer hover:opacity-90 transition"
          onClick={() => window.open(attachment.url, '_blank')}
        />
      );
    }
    
    return (
      <a
        href={attachment.url}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-2 px-4 py-3 bg-gray-100 rounded-lg hover:bg-gray-200 transition"
      >
        <FileText className="w-5 h-5 text-gray-600" />
        <span className="text-sm text-gray-700">{attachment.filename}</span>
      </a>
    );
  };

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">
            {timeoutError 
              ? "Taking longer than expected... Please check your connection." 
              : "Loading chat..."}
          </p>
          {timeoutError && (
            <button 
              onClick={() => fetchChatAndMessages()}
              className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
            >
              Retry
            </button>
          )}
        </div>
      </div>
    );
  }

  if (error || !chat) {
    return (
      <div className="h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
        <div className="text-center">
          <p className="text-red-600 text-lg mb-4">{error || 'Chat not found'}</p>
          <button
            onClick={() => window.history.back()}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
      {/* Header */}
      <div className="bg-white shadow-md">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => window.history.back()}
                className="p-2 hover:bg-gray-100 rounded-full transition"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </button>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  {getChatTitle()}
                </h1>
                <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
                  {chat.isGroupChat ? (
                    <>
                      <Users className="w-4 h-4" />
                      <span>{chat.participants?.length || 0} participants</span>
                    </>
                  ) : (
                    <>
                      <MessageCircle className="w-4 h-4" />
                      <span>Direct message</span>
                    </>
                  )}
                  <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Participants Bar */}
      {chat.isGroupChat && chat.participants && (
        <div className="bg-white border-b border-gray-200 shadow-sm">
          <div className="max-w-6xl mx-auto px-4 py-3">
            <div className="flex items-center gap-3 overflow-x-auto">
              <span className="text-sm font-medium text-gray-600 flex-shrink-0">Participants:</span>
              {chat.participants.map((participant, idx) => (
                <div 
                  key={participant._id || idx}
                  className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 rounded-full flex-shrink-0"
                >
                  <div className="w-6 h-6 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-white text-xs font-semibold">
                    {getInitials(participant.fullname)}
                  </div>
                  <span className="text-sm text-gray-700">
                    {participant.fullname}
                    {participant._id === userId && ' (You)'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto px-4 py-6 space-y-4">
          {messages.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-20 h-20 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <MessageCircle className="w-10 h-10 text-indigo-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">
                Start the Conversation
              </h3>
              <p className="text-gray-600">
                Send a message to begin chatting
              </p>
            </div>
          ) : (
            <>
              {messages.map((message, idx) => {
                const isOwn = message.author?._id === userId;
                const isUnread = !isOwn && !message.readBy?.includes(userId);
                const isFirstUnread = isUnread && !messages.slice(0, idx).some(
                  m => !m.readBy?.includes(userId) && m.author?._id !== userId
                );
                
                return (
                  <div key={message._id || idx}>
                    {/* Hidden marker for first unread message */}
                    {isFirstUnread && <div ref={firstUnreadRef} />}
                    
                    <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-2xl ${isOwn ? 'items-end' : 'items-start'} flex flex-col gap-1`}>
                        {!isOwn && (
                          <div className="flex items-center gap-2 px-2">
                            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-white text-xs font-semibold">
                              {getInitials(message.author?.fullname)}
                            </div>
                            <span className="text-xs font-medium text-gray-700">
                              {message.author?.fullname || 'Unknown'}
                            </span>
                          </div>
                        )}
                        
                        <div className={`rounded-2xl px-5 py-3 shadow-md ${
                          isOwn 
                            ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-br-none' 
                            : 'bg-white text-gray-800 rounded-bl-none'
                        } ${message.sending ? 'opacity-70' : ''}`}>
                          {message.content && (
                            <p className="whitespace-pre-wrap break-words leading-relaxed">
                              {message.content}
                            </p>
                          )}
                          
                          {message.attachments && message.attachments.length > 0 && (
                            <div className="mt-2 space-y-2">
                              {message.attachments.map((attachment, i) => (
                                <div key={i}>
                                  {renderAttachment(attachment)}
                                </div>
                              ))}
                            </div>
                          )}
                          
                          <div className={`flex items-center gap-2 mt-2 text-xs ${
                            isOwn ? 'text-indigo-200' : 'text-gray-500'
                          }`}>
                            <span>
                              {new Date(message.createdAt).toLocaleTimeString([], { 
                                hour: '2-digit', 
                                minute: '2-digit' 
                              })}
                            </span>
                            {isOwn && (
                              message.sending ? (
                                <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                              ) : message.readBy?.length > 1 ? (
                                <CheckCheck className="w-3.5 h-3.5" />
                              ) : (
                                <Check className="w-3.5 h-3.5" />
                              )
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </>
          )}
          
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area */}
      <div className="bg-white border-t border-gray-200 shadow-lg">
        <div className="max-w-4xl mx-auto px-4 py-4">
          {uploadingFile && (
            <div className="mb-3 text-sm text-gray-600 flex items-center gap-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-indigo-600"></div>
              Uploading file...
            </div>
          )}
          
          <div className="flex items-end gap-3">
            <input
              ref={fileInputRef}
              type="file"
              onChange={handleFileUpload}
              accept="image/*,.pdf,.doc,.docx"
              className="hidden"
            />
            
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadingFile}
              className="p-3 text-gray-600 hover:bg-gray-100 rounded-xl transition disabled:opacity-50 flex-shrink-0"
              title="Attach file"
            >
              <Paperclip className="w-5 h-5" />
            </button>
            
            <div className="flex-1 bg-gray-100 rounded-2xl px-5 py-3">
              <textarea
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    sendMessage(e);
                  }
                }}
                placeholder="Type your message..."
                className="w-full bg-transparent resize-none focus:outline-none text-gray-800 placeholder-gray-500"
                rows="1"
                style={{ 
                  maxHeight: '120px',
                  minHeight: '24px'
                }}
              />
            </div>
            
            <button
              type="button"
              onClick={sendMessage}
              disabled={!messageText.trim() || sending}
              className="p-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:shadow-lg transition disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
              title="Send message"
            >
              {sending ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              ) : (
                <Send className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chat;