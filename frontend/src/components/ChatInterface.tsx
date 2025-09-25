import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { chatAPI } from '../services/api';
import { ChatMessage } from '../types';

const ChatInterface: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const { logout } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const fetchChats = useCallback(async () => {
    if (!projectId) return;
    try {
      const res = await chatAPI.getByProject(projectId);
      if (res.data.success) {
        // FIXED: Map backend Chat to frontend ChatMessage (handles message/response/tokens/role)
        const mappedMessages: ChatMessage[] = (res.data.data || []).map((chat: any) => ({
          _id: chat._id,
          message: chat.message,  // Backend user input
          response: chat.response,  // Backend AI output
          tokensUsed: chat.metadata?.tokens || 0,  // Nested metadata.tokens
          project: chat.project?._id || chat.project?.toString() || projectId,  // Handle populated or string
          createdAt: chat.createdAt?.toISOString() || new Date().toISOString(),
          role: chat.role || 'user'  // Backend role (fallback user)
        }));
        setMessages(mappedMessages);
      }
    } catch (err) {
      console.error('Fetch chats error:', err);
    }
  }, [projectId]);

  useEffect(() => {
    if (projectId) fetchChats();
  }, [projectId, fetchChats]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !projectId) return;
    const userMessage = input.trim();
    setInput('');
    setLoading(true);

    // Optimistically add user message (with role for styling)
    const tempMessage: ChatMessage = {
      _id: 'temp',
      message: userMessage,
      response: '',  // Empty until AI
      tokensUsed: 0,
      project: projectId,
      createdAt: new Date().toISOString(),
      role: 'user'  // For bubble styling
    };
    setMessages((prev) => [...prev, tempMessage]);

    try {
      // Use chatAPI.send (sends { message: userMessage } to backend)
      const res = await chatAPI.send(projectId, userMessage);
      console.log('✅ Message sent:', res.data);  // Debug: See full response with AI

      if (res.data.success) {
        // Refresh to get server-saved message (with AI response/tokens)
        await fetchChats();  // Replaces temp with mapped real chat (shows response)
      } else {
        throw new Error(res.data.error || 'Send failed');
      }
    } catch (err: any) {
      console.error('❌ Send error:', err.response?.data?.error || err.message);
      alert(err.response?.data?.error || 'Error sending message');
      // Remove temp on error
      setMessages((prev) => prev.filter((msg) => msg._id !== 'temp'));
    } finally {
      setLoading(false);
    }
  };

  // Helper: Render message bubble based on role (with fallback)
  const renderMessage = (msg: ChatMessage) => {
    const role = msg.role || 'user';  // FIXED: Default to 'user' (since backend sets 'user' for interactions)
    const isUser  = role === 'user';
    return (
      <div
        key={msg._id}
        className={`flex ${isUser  ? 'justify-end' : 'justify-start'} mb-4`}
      >
        <div
          className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
            isUser 
              ? 'bg-blue-500 text-white'  // User: Blue right bubble
              : 'bg-gray-200 text-gray-800'  // AI: Gray left bubble
          }`}
        >
          {isUser  ? (
            <div>
              <p>{msg.message}</p>
              {msg.tokensUsed && msg.tokensUsed > 0 && (
                <p className="text-xs opacity-75 mt-1">Tokens: {msg.tokensUsed}</p>
              )}
            </div>
          ) : (
            <div>
              <strong>AI:</strong>
              <p className="mt-1">{msg.response || msg.message || 'No response yet...'}</p>
              {msg.tokensUsed && msg.tokensUsed > 0 && (
                <p className="text-xs text-gray-500 mt-1">Tokens: {msg.tokensUsed}</p>
              )}
            </div>
          )}
          <p className={`text-xs ${isUser  ? 'opacity-75' : 'text-gray-500'} mt-1`}>
            {new Date(msg.createdAt).toLocaleTimeString()}
          </p>
        </div>
      </div>
    );
  };

  if (!projectId) {
    return <div className="text-center p-8">No project selected.</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <nav className="bg-indigo-600 text-white p-4 flex justify-between items-center">
        <Link to="/dashboard" className="text-lg font-semibold hover:underline">
          ← Back to Dashboard
        </Link>
        <div className="space-x-4">
          <button className="px-3 py-1 bg-indigo-500 rounded hover:bg-indigo-400">
            Add Prompt
          </button>
          <button
            onClick={logout}
            className="px-3 py-1 bg-red-500 rounded hover:bg-red-400"
          >
            Logout
          </button>
        </div>
      </nav>
      <div className="flex-1 max-w-4xl mx-auto w-full px-4 py-8">
        <h1 className="text-2xl font-bold mb-4">
          Chat for Project: {projectId?.slice(-6)}  {/* Short ID for display */}
        </h1>
        <div className="bg-white rounded-lg shadow-md h-96 overflow-y-auto p-4 mb-4 space-y-2">
          {messages.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No messages yet. Start chatting!</p>
          ) : (
            messages.map(renderMessage)
          )}
          {loading && (
            <div className="flex justify-start mb-4">
              <div className="bg-gray-200 text-gray-800 px-4 py-2 rounded-lg max-w-xs">
                <strong>AI:</strong> Thinking...
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
        <form onSubmit={sendMessage} className="flex space-x-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-100"
            disabled={loading}
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="bg-indigo-600 text-white px-6 py-2 rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Sending...' : 'Send'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatInterface;