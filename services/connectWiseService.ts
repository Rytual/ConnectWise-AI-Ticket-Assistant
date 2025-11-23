import { Ticket, TicketStatus } from '../types';
import { MOCK_INITIAL_TICKETS } from '../constants';

// In a production app, you would use axios or fetch to hit the CW Manage API
// URL: https://api-na.myconnectwise.net/v4_6_release/apis/3.0/service/tickets
// Headers: Authorization: Basic (Base64 of Company+PublicKey:PrivateKey), ClientID

let localTickets: Ticket[] = [...MOCK_INITIAL_TICKETS] as Ticket[];

export const connectWiseService = {
  getTickets: async (): Promise<Ticket[]> => {
    // Simulate network delay
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(localTickets);
      }, 600);
    });
  },

  updateTicketStatus: async (id: number, status: TicketStatus): Promise<void> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        localTickets = localTickets.map(t => 
          t.id === id ? { ...t, status } : t
        );
        resolve();
      }, 300);
    });
  },

  deleteTicket: async (id: number): Promise<void> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        localTickets = localTickets.filter(t => t.id !== id);
        resolve();
      }, 300);
    });
  },

  // This function mimics ingesting a raw text or creating a ticket from copy/paste
  createTicketFromText: async (summary: string, description: string): Promise<Ticket> => {
     return new Promise((resolve) => {
        const newTicket: Ticket = {
            id: Math.floor(Math.random() * 100000) + 200000,
            title: summary,
            description: description,
            category: "Service Desk" as any,
            status: TicketStatus.New,
            company: "Unknown (Manual Entry)",
            contact: "Unknown",
            priority: "Medium",
            createdAt: new Date().toISOString()
        };
        localTickets = [newTicket, ...localTickets];
        setTimeout(() => resolve(newTicket), 400);
     });
  }
};