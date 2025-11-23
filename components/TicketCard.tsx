import React from 'react';
import { Ticket, TicketStatus } from '../types';
import { AlertCircle, CheckCircle, Clock, Server, Monitor, Shield, Box } from 'lucide-react';

interface TicketCardProps {
  ticket: Ticket;
  isSelected: boolean;
  onClick: () => void;
}

export const TicketCard: React.FC<TicketCardProps> = ({ ticket, isSelected, onClick }) => {
  const getStatusColor = (status: TicketStatus) => {
    switch (status) {
      case TicketStatus.New: return 'bg-blue-100 text-blue-800 border-blue-200';
      case TicketStatus.In_Progress: return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case TicketStatus.Resolved: return 'bg-green-100 text-green-800 border-green-200';
      case TicketStatus.Closed: return 'bg-gray-100 text-gray-800 border-gray-200';
      case TicketStatus.Waiting_On_Client: return 'bg-purple-100 text-purple-800 border-purple-200';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityIcon = (p: string) => {
    if (p === 'Critical') return <AlertCircle className="w-4 h-4 text-red-500" />;
    if (p === 'High') return <AlertCircle className="w-4 h-4 text-orange-500" />;
    return <Clock className="w-4 h-4 text-gray-400" />;
  };

  const getCategoryIcon = (c: string) => {
    if (c.includes('Server') || c.includes('NOC')) return <Server className="w-4 h-4" />;
    if (c.includes('Security')) return <Shield className="w-4 h-4" />;
    if (c.includes('Project')) return <Box className="w-4 h-4" />;
    return <Monitor className="w-4 h-4" />;
  };

  return (
    <div 
      onClick={onClick}
      className={`p-4 border-b cursor-pointer transition-colors duration-200 hover:bg-slate-50 ${
        isSelected ? 'bg-indigo-50 border-l-4 border-l-indigo-600' : 'bg-white border-l-4 border-l-transparent'
      }`}
    >
      <div className="flex justify-between items-start mb-1">
        <span className="font-mono text-xs text-slate-500">#{ticket.id}</span>
        <span className="text-xs font-medium text-slate-500">{new Date(ticket.createdAt).toLocaleDateString()}</span>
      </div>
      
      <h3 className={`font-semibold text-sm mb-1 line-clamp-1 ${isSelected ? 'text-indigo-900' : 'text-slate-900'}`}>
        {ticket.title}
      </h3>
      
      <p className="text-xs text-slate-600 mb-3 line-clamp-2">
        {ticket.company} - {ticket.description}
      </p>

      <div className="flex items-center justify-between">
        <div className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${getStatusColor(ticket.status)}`}>
          {ticket.status}
        </div>
        <div className="flex items-center space-x-2 text-slate-400">
          {getCategoryIcon(ticket.category)}
          {getPriorityIcon(ticket.priority)}
        </div>
      </div>
    </div>
  );
};