import React, { useState, useRef, useEffect } from 'react';
import { Send, Plus, Menu, Settings, User, Bot, ChevronDown, ExternalLink, LogOut, MessageSquare, Trash2, X } from 'lucide-react';

function App() {
  const [messages, setMessages] = useState<Array<{role: string, content: string}>>([
    { role: 'assistant', content: 'Hello! I\'m your personal AI assistant. How can I help you today?' }
  ]);
  const [input, setInput] = useState('');
  const [sidebarMode, setSidebarMode] = useState<'full' | 'icons' | 'hidden'>('full');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [activeConversation, setActiveConversation] = useState<number | null>(1); // Start with the first conversation active
  const [conversations, setConversations] = useState([
    { id: 1, title: 'Welcome to your AI assistant', messages: [{ role: 'assistant', content: 'Hello! I\'m your personal AI assistant. How can I help you today?' }] },
    { id: 2, title: 'Learning about machine learning', messages: [{ role: 'assistant', content: 'What would you like to know about machine learning?' }] },
    { id: 3, title: 'Project planning assistance', messages: [{ role: 'assistant', content: 'I can help you plan your project. What are you working on?' }] }
  ]);
  const [nextId, setNextId] = useState(4);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [conversationToDelete, setConversationToDelete] = useState<number | null>(null);
  const [hoveredConversation, setHoveredConversation] = useState<number | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Load conversation when active conversation changes (only on initial load or when actively changing conversations)
  useEffect(() => {
    if (isInitialLoad) {
      // On initial load, set the messages from the first conversation
      const conversation = conversations.find(c => c.id === activeConversation);
      if (conversation) {
        setMessages([...conversation.messages]);
      }
      setIsInitialLoad(false);
    } else if (activeConversation !== null) {
      // When switching conversations, update the messages
      const conversation = conversations.find(c => c.id === activeConversation);
      if (conversation) {
        setMessages([...conversation.messages]);
      }
    }
  }, [activeConversation, isInitialLoad]);

  // Update conversation messages when messages change, but only if not from the initial load
  useEffect(() => {
    if (!isInitialLoad && activeConversation !== null) {
      // Use a ref to track if this is an update from the conversation selection
      setConversations(prevConversations => 
        prevConversations.map(conv => 
          conv.id === activeConversation 
            ? { ...conv, messages } 
            : conv
        )
      );
    }
  }, [messages, activeConversation, isInitialLoad]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() === '') return;
    
    // Add user message
    const newMessages = [...messages, { role: 'user', content: input }];
    setMessages(newMessages);
    
    // Update conversation title if it's the first user message
    if (activeConversation !== null) {
      const conversation = conversations.find(c => c.id === activeConversation);
      if (conversation && conversation.messages.length === 1 && conversation.messages[0].role === 'assistant') {
        // This is the first user message, update the title
        setConversations(prevConversations => 
          prevConversations.map(conv => 
            conv.id === activeConversation 
              ? { 
                  ...conv, 
                  title: input.length > 30 ? input.substring(0, 30) + '...' : input,
                  messages: newMessages
                } 
              : conv
          )
        );
      } else {
        // Update the messages in the conversation
        setConversations(prevConversations => 
          prevConversations.map(conv => 
            conv.id === activeConversation 
              ? { ...conv, messages: newMessages } 
              : conv
          )
        );
      }
    }
    
    setInput('');
    
    // Simulate AI response
    setIsLoading(true);
    setTimeout(() => {
      const aiResponse = { 
        role: 'assistant', 
        content: `I'm your personal AI assistant. This is a simulated response to: "${input}"`
      };
      
      const updatedMessages = [...newMessages, aiResponse];
      setMessages(updatedMessages);
      
      // Also update in the conversations state
      if (activeConversation !== null) {
        setConversations(prevConversations => 
          prevConversations.map(conv => 
            conv.id === activeConversation 
              ? { ...conv, messages: updatedMessages } 
              : conv
          )
        );
      }
      
      setIsLoading(false);
    }, 1000);
  };

  const toggleSidebar = () => {
    setSidebarMode(current => {
      if (current === 'full') return 'icons';
      if (current === 'icons') return 'hidden';
      return 'full';
    });
  };

  const startNewChat = () => {
    const newChatId = nextId;
    setNextId(prevId => prevId + 1);
    
    const newChat = {
      id: newChatId,
      title: 'New conversation',
      messages: [{ role: 'assistant', content: 'How can I help you today?' }]
    };
    
    setConversations(prev => [newChat, ...prev]);
    setActiveConversation(newChatId);
    setMessages([...newChat.messages]);
  };

  const selectConversation = (id: number) => {
    if (id !== activeConversation) {
      setActiveConversation(id);
    }
  };

  const getSidebarWidth = () => {
    switch (sidebarMode) {
      case 'full': return 'w-64';
      case 'icons': return 'w-16';
      case 'hidden': return 'w-0';
    }
  };

  const handleDeleteClick = (e: React.MouseEvent, id: number) => {
    e.stopPropagation(); // Prevent triggering the conversation selection
    setConversationToDelete(id);
    setShowDeleteModal(true);
  };

  const confirmDelete = () => {
    if (conversationToDelete === null) return;
    
    // Remove the conversation
    setConversations(prev => prev.filter(conv => conv.id !== conversationToDelete));
    
    // If the active conversation is being deleted, select another one
    if (activeConversation === conversationToDelete) {
      const remainingConversations = conversations.filter(conv => conv.id !== conversationToDelete);
      if (remainingConversations.length > 0) {
        // Select the first conversation in the list
        setActiveConversation(remainingConversations[0].id);
        setMessages([...remainingConversations[0].messages]);
      } else {
        // If no conversations left, create a new one
        startNewChat();
      }
    }
    
    // Close the modal
    setShowDeleteModal(false);
    setConversationToDelete(null);
  };

  const cancelDelete = () => {
    setShowDeleteModal(false);
    setConversationToDelete(null);
  };

  return (
    <div className="flex h-screen bg-[#343541] text-gray-100">
      {/* Sidebar */}
      <div className={`${getSidebarWidth()} bg-[#202123] transition-all duration-300 overflow-hidden flex flex-col`}>
        <div className="p-2">
          <button 
            onClick={startNewChat}
            className={`flex items-center gap-3 w-full p-3 rounded-md hover:bg-gray-700 border border-gray-600 text-sm ${sidebarMode === 'icons' ? 'justify-center' : ''}`}
          >
            <Plus size={16} />
            {sidebarMode === 'full' && <span>New chat</span>}
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto">
          <div className="px-2 py-2">
            {sidebarMode === 'full' && <h2 className="px-2 text-xs font-medium text-gray-400 mb-1">Today</h2>}
            {conversations.map(conv => (
              <div 
                key={conv.id}
                className="relative group"
                onMouseEnter={() => setHoveredConversation(conv.id)}
                onMouseLeave={() => setHoveredConversation(null)}
              >
                <button 
                  onClick={() => selectConversation(conv.id)}
                  className={`flex items-center gap-3 w-full p-3 rounded-md hover:bg-gray-700 text-sm text-left ${sidebarMode === 'icons' ? 'justify-center' : ''} ${activeConversation === conv.id ? 'bg-gray-700' : ''}`}
                  title={sidebarMode === 'icons' ? conv.title : ''}
                >
                  <MessageSquare size={16} />
                  {sidebarMode === 'full' && <span className="truncate">{conv.title}</span>}
                </button>
                {sidebarMode === 'full' && (hoveredConversation === conv.id || activeConversation === conv.id) && (
                  <button
                    onClick={(e) => handleDeleteClick(e, conv.id)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-md hover:bg-gray-600 text-gray-400 hover:text-gray-100"
                    title="Delete conversation"
                  >
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
        
        <div className="border-t border-gray-700 p-2">
          <button className={`flex items-center gap-3 w-full p-3 rounded-md hover:bg-gray-700 text-sm ${sidebarMode === 'icons' ? 'justify-center' : ''}`}>
            <User size={16} />
            {sidebarMode === 'full' && <span>My Account</span>}
          </button>
          <button className={`flex items-center gap-3 w-full p-3 rounded-md hover:bg-gray-700 text-sm ${sidebarMode === 'icons' ? 'justify-center' : ''}`}>
            <Settings size={16} />
            {sidebarMode === 'full' && <span>Settings</span>}
          </button>
          <button className={`flex items-center gap-3 w-full p-3 rounded-md hover:bg-gray-700 text-sm ${sidebarMode === 'icons' ? 'justify-center' : ''}`}>
            <LogOut size={16} />
            {sidebarMode === 'full' && <span>Log out</span>}
          </button>
        </div>
      </div>
      
      {/* Main content */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Header */}
        <header className="border-b border-gray-600 p-2 flex items-center">
          <button 
            onClick={toggleSidebar}
            className="p-2 rounded-md hover:bg-gray-700 mr-2 relative group"
          >
            <Menu size={20} />
            <span className="absolute left-full ml-2 px-2 py-1 bg-gray-800 text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
              {sidebarMode === 'full' ? 'Collapse sidebar' : sidebarMode === 'icons' ? 'Hide sidebar' : 'Show sidebar'}
            </span>
          </button>
          <div className="flex-1 flex items-center justify-center">
            <div className="relative">
              <button className="flex items-center gap-2 text-sm font-medium bg-[#202123] hover:bg-gray-700 rounded-md py-2 px-4">
                <span>
                  {activeConversation !== null 
                    ? conversations.find(c => c.id === activeConversation)?.title || 'Personal AI Assistant'
                    : 'Personal AI Assistant'
                  }
                </span>
                <ChevronDown size={16} />
              </button>
            </div>
          </div>
          <div className="w-10"></div> {/* Spacer to balance the menu button */}
        </header>
        
        {/* Messages area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {messages.map((message, index) => (
            <div 
              key={index} 
              className={`flex ${message.role === 'assistant' ? 'bg-[#444654]' : ''} p-4 -mx-4`}
            >
              <div className="max-w-3xl mx-auto w-full flex gap-4">
                <div className="w-8 h-8 rounded-sm flex items-center justify-center flex-shrink-0">
                  {message.role === 'assistant' ? (
                    <div className="bg-green-600 w-full h-full flex items-center justify-center rounded-sm">
                      <Bot size={20} />
                    </div>
                  ) : (
                    <div className="bg-gray-600 w-full h-full flex items-center justify-center rounded-sm">
                      <User size={20} />
                    </div>
                  )}
                </div>
                <div className="min-w-0 whitespace-pre-wrap">
                  {message.content}
                </div>
              </div>
            </div>
          ))}
          
          {isLoading && (
            <div className="flex bg-[#444654] p-4 -mx-4">
              <div className="max-w-3xl mx-auto w-full flex gap-4">
                <div className="w-8 h-8 rounded-sm flex items-center justify-center flex-shrink-0">
                  <div className="bg-green-600 w-full h-full flex items-center justify-center rounded-sm">
                    <Bot size={20} />
                  </div>
                </div>
                <div className="min-w-0">
                  <div className="h-4 w-4 bg-gray-400 rounded-full animate-pulse"></div>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
        
        {/* Input area */}
        <div className="p-4 border-t border-gray-600">
          <form onSubmit={handleSubmit} className="max-w-3xl mx-auto relative">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Message your AI assistant..."
              className="w-full bg-[#40414f] rounded-lg border border-gray-600 py-3 pl-4 pr-12 focus:outline-none focus:border-gray-400"
            />
            <button 
              type="submit"
              disabled={input.trim() === ''}
              className={`absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-md ${input.trim() === '' ? 'text-gray-400' : 'text-gray-200 hover:bg-gray-600'}`}
            >
              <Send size={18} />
            </button>
          </form>
          <div className="max-w-3xl mx-auto mt-2 text-xs text-center text-gray-400">
            <p>
              Personal AI Assistant can make mistakes. Consider checking important information.
              <a href="#" className="underline ml-1 inline-flex items-center">
                Learn more <ExternalLink size={12} className="ml-1" />
              </a>
            </p>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-[#202123] rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">Delete conversation</h3>
              <button 
                onClick={cancelDelete}
                className="p-1 rounded-md hover:bg-gray-700 text-gray-400 hover:text-gray-100"
              >
                <X size={20} />
              </button>
            </div>
            <p className="mb-6">
              Are you sure you want to delete this conversation? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={cancelDelete}
                className="px-4 py-2 rounded-md border border-gray-600 hover:bg-gray-700"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 rounded-md bg-red-600 hover:bg-red-700 text-white"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;