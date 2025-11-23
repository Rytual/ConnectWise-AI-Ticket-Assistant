import React, { useState, useEffect, useRef } from 'react';
import { Ticket, TicketStatus, TicketCategory, ChatMessage } from './types';
import { connectWiseService } from './services/connectWiseService';
import { geminiService } from './services/geminiService';
import { TicketCard } from './components/TicketCard';
import { ChatMessage as ChatMessageComponent } from './components/ChatMessage';
import { 
  Search, Filter, RefreshCw, Send, Trash2, 
  Terminal, MonitorPlay, CheckCircle2, MoreVertical, Plus 
} from 'lucide-react';

const App: React.FC = () => {
  // --- State ---
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [filteredTickets, setFilteredTickets] = useState<Ticket[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  // Chat State
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isAiProcessing, setIsAiProcessing] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Filters
  const [filterCategory, setFilterCategory] = useState<string>('All');
  const [searchTerm, setSearchTerm] = useState('');

  // --- Effects ---

  useEffect(() => {
    fetchTickets();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    let result = tickets;
    if (filterCategory !== 'All') {
      result = result.filter(t => t.category === filterCategory);
    }
    if (searchTerm) {
      const lower = searchTerm.toLowerCase();
      result = result.filter(t => 
        t.title.toLowerCase().includes(lower) || 
        t.description.toLowerCase().includes(lower) ||
        t.id.toString().includes(lower) ||
        t.company.toLowerCase().includes(lower)
      );
    }
    setFilteredTickets(result);
  }, [tickets, filterCategory, searchTerm]);

  // Scroll to bottom of chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isAiProcessing]);

  // --- Handlers ---

  const fetchTickets = async () => {
    setIsLoading(true);
    try {
      const data = await connectWiseService.getTickets();
      setTickets(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTicketSelect = async (ticket: Ticket) => {
    if (selectedTicket?.id === ticket.id) return;
    
    setSelectedTicket(ticket);
    setMessages([]); // Clear chat for new ticket
    setIsAiProcessing(true);

    // Initial AI Handshake for the selected ticket
    const initialPrompt = `
      I am working on Ticket #${ticket.id}.
      Title: ${ticket.title}
      Company: ${ticket.company}
      Description: ${ticket.description}
      Category: ${ticket.category}
      
      Please analyze this ticket. Acknowledge the issue, determine the scope (Server, Network, User), and suggest 3 initial discovery steps using PowerShell or basic troubleshooting.
    `;

    try {
      const responseText = await geminiService.startChatSession(initialPrompt);
      setMessages([
        {
          id: 'system-init',
          role: 'model',
          content: responseText,
          timestamp: Date.now()
        }
      ]);
    } catch (e) {
      setMessages([{
        id: 'err', role: 'model', content: "Error connecting to Gemini AI. Please check your API Key.", timestamp: Date.now()
      }]);
    } finally {
      setIsAiProcessing(false);
    }
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: inputMessage,
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, userMsg]);
    setInputMessage('');
    setIsAiProcessing(true);

    try {
      const responseText = await geminiService.sendMessage(inputMessage);
      const aiMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        content: responseText,
        timestamp: Date.now()
      };
      setMessages(prev => [...prev, aiMsg]);
    } catch (err) {
      console.error(err);
    } finally {
      setIsAiProcessing(false);
    }
  };

  const handleDeleteTicket = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this ticket?")) return;
    await connectWiseService.deleteTicket(id);
    setTickets(prev => prev.filter(t => t.id !== id));
    if (selectedTicket?.id === id) setSelectedTicket(null);
  };

  const handleCreateTicket = async () => {
    const summary = prompt("Enter Ticket Summary:");
    if (!summary) return;
    const desc = prompt("Enter Ticket Description (Paste content):");
    if (!desc) return;

    setIsLoading(true);
    try {
      await connectWiseService.createTicketFromText(summary, desc);
      await fetchTickets();
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateScript = async () => {
    const prompt = "Please provide a safe PowerShell script to gather exhaustive diagnostic information relevant to this specific issue. Include comments explaining the output.";
    setInputMessage(prompt);
    // Don't auto send, let user review or just call handleSendMessage directly if preferred. 
    // For UX fluidity, let's just trigger the send logic directly:
    const userMsg: ChatMessage = {
        id: Date.now().toString(),
        role: 'user',
        content: prompt,
        timestamp: Date.now()
    };
    setMessages(prev => [...prev, userMsg]);
    setIsAiProcessing(true);
    try {
        const responseText = await geminiService.sendMessage(prompt);
        const aiMsg: ChatMessage = {
          id: (Date.now() + 1).toString(),
          role: 'model',
          content: responseText,
          timestamp: Date.now()
        };
        setMessages(prev => [...prev, aiMsg]);
    } catch(e) {
        console.error(e);
    } finally {
        setIsAiProcessing(false);
    }
  };

  // --- Render ---

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      
      {/* Sidebar / Ticket List */}
      <div className="w-96 flex flex-col border-r border-gray-200 bg-white shadow-xl z-10 flex-shrink-0">
        
        {/* Header */}
        <div className="p-4 border-b border-gray-100 bg-slate-900 text-white">
          <div className="flex items-center justify-between mb-4">
            <h1 className="font-bold text-lg flex items-center gap-2">
              <MonitorPlay className="w-5 h-5 text-indigo-400" />
              MSP Ticket AI
            </h1>
            <button onClick={handleCreateTicket} className="p-1 hover:bg-slate-700 rounded transition">
              <Plus className="w-5 h-5" />
            </button>
          </div>
          
          <div className="relative">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search tickets..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-800 border-none rounded-lg py-2 pl-9 pr-4 text-sm text-white placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 outline-none"
            />
          </div>
        </div>

        {/* Filter Bar */}
        <div className="flex items-center gap-2 p-2 border-b border-gray-100 bg-gray-50 overflow-x-auto">
          <Filter className="w-4 h-4 text-gray-400 ml-2 flex-shrink-0" />
          <select 
            value={filterCategory} 
            onChange={(e) => setFilterCategory(e.target.value)}
            className="bg-transparent text-sm font-medium text-slate-600 outline-none cursor-pointer"
          >
            <option value="All">All Categories</option>
            {Object.values(TicketCategory).map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <div className="flex-grow"></div>
          <button onClick={fetchTickets} className="p-2 text-gray-400 hover:text-indigo-600 transition">
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto scrollbar-thin">
          {filteredTickets.map(ticket => (
            <TicketCard 
              key={ticket.id} 
              ticket={ticket} 
              isSelected={selectedTicket?.id === ticket.id} 
              onClick={() => handleTicketSelect(ticket)} 
            />
          ))}
          {filteredTickets.length === 0 && !isLoading && (
            <div className="p-8 text-center text-gray-400 text-sm">
              No tickets found.
            </div>
          )}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full relative">
        {selectedTicket ? (
          <>
            {/* Top Bar: Ticket Details */}
            <div className="h-16 border-b border-gray-200 bg-white flex items-center justify-between px-6 shadow-sm z-10">
              <div className="flex flex-col">
                <div className="flex items-center gap-3">
                    <h2 className="text-lg font-bold text-slate-900 truncate max-w-lg">
                    #{selectedTicket.id} - {selectedTicket.title}
                    </h2>
                    <span className={`px-2 py-0.5 rounded text-xs font-semibold bg-gray-100 text-gray-600`}>
                        {selectedTicket.status}
                    </span>
                </div>
                <span className="text-xs text-gray-500">
                    {selectedTicket.company} • {selectedTicket.contact}
                </span>
              </div>
              
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => handleDeleteTicket(selectedTicket.id)}
                  className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 rounded-md transition"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete
                </button>
                <button className="p-2 hover:bg-gray-100 rounded-full text-gray-500">
                  <MoreVertical className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Split View: Details & Chat */}
            <div className="flex-1 overflow-hidden flex flex-row">
              
              {/* Chat Area */}
              <div className="flex-1 flex flex-col bg-slate-50 relative">
                
                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-6 scrollbar-thin">
                   {/* Context Header Bubble */}
                   <div className="flex justify-center mb-6">
                      <div className="bg-white border border-indigo-100 rounded-full px-4 py-1 text-xs text-indigo-600 font-medium shadow-sm">
                        AI Session Active • Context: {selectedTicket.category}
                      </div>
                   </div>

                   {messages.map((msg) => (
                     <ChatMessageComponent key={msg.id} message={msg} />
                   ))}
                   
                   {isAiProcessing && (
                     <div className="flex items-center gap-2 text-slate-400 text-sm ml-4 animate-pulse">
                       <div className="w-2 h-2 bg-indigo-400 rounded-full"></div>
                       Analyzing environment & generating remediation...
                     </div>
                   )}
                   <div ref={chatEndRef} />
                </div>

                {/* Input Area */}
                <div className="p-4 bg-white border-t border-gray-200">
                   {/* Quick Actions */}
                   <div className="flex gap-2 mb-3 overflow-x-auto pb-1">
                      <button 
                        onClick={handleGenerateScript}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-medium rounded-full border border-indigo-200 transition"
                      >
                        <Terminal className="w-3 h-3" />
                        Generate Discovery Script
                      </button>
                      <button 
                        onClick={() => setInputMessage("What is the next step?")}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 hover:bg-gray-100 text-gray-600 text-xs font-medium rounded-full border border-gray-200 transition"
                      >
                         <CheckCircle2 className="w-3 h-3" />
                         Next Step
                      </button>
                   </div>

                   <div className="relative flex items-center gap-2">
                     <textarea
                       value={inputMessage}
                       onChange={(e) => setInputMessage(e.target.value)}
                       onKeyDown={(e) => {
                         if (e.key === 'Enter' && !e.shiftKey) {
                           e.preventDefault();
                           handleSendMessage();
                         }
                       }}
                       placeholder="Ask AI for remediation, scripts, or details..."
                       className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 pr-12 text-sm text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none resize-none h-[52px]"
                     />
                     <button 
                       onClick={handleSendMessage}
                       disabled={isAiProcessing || !inputMessage.trim()}
                       className="absolute right-2 top-2 p-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:hover:bg-indigo-600 transition"
                     >
                       <Send className="w-4 h-4" />
                     </button>
                   </div>
                   <div className="text-[10px] text-gray-400 text-center mt-2">
                     AI can make mistakes. Verify all PowerShell scripts before running in production.
                   </div>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-8 bg-slate-50/50">
            <div className="w-24 h-24 bg-indigo-100 rounded-full flex items-center justify-center mb-6">
              <MonitorPlay className="w-12 h-12 text-indigo-500" />
            </div>
            <h2 className="text-2xl font-bold text-slate-800 mb-2">Select a Ticket</h2>
            <p className="text-slate-500 max-w-md">
              Choose a ticket from the sidebar to view details, ingest data, and start an AI-assisted remediation session.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default App;