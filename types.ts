export enum TicketStatus {
  New = 'New',
  In_Progress = 'In Progress',
  Waiting_On_Client = 'Waiting on Client',
  Resolved = 'Resolved',
  Closed = 'Closed'
}

export enum TicketCategory {
  Service_Desk = 'Service Desk',
  NOC_Ecare = 'Ecare NOC',
  Projects = 'Projects',
  Security = 'Security / Entra',
  On_Site = 'On Site'
}

export interface Ticket {
  id: number;
  title: string;
  description: string;
  category: TicketCategory;
  status: TicketStatus;
  company: string;
  contact: string;
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  createdAt: string;
  // This mimics the structure of CW Manage API responses
  rawDetails?: any; 
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  content: string;
  timestamp: number;
  isThinking?: boolean;
}

export interface MSPContext {
  role: string;
  environment: string;
  guidelines: string[];
}