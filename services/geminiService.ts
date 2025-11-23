import { GoogleGenAI, Chat, GenerativeModel } from "@google/genai";
import { SYSTEM_INSTRUCTION_TEXT } from "../constants";

let ai: GoogleGenAI | null = null;
let model: GenerativeModel | null = null;
let chatSession: Chat | null = null;

// Initialize the API client
const initializeAI = () => {
  if (!process.env.API_KEY) {
    console.error("API_KEY environment variable is missing.");
    return;
  }
  if (!ai) {
    ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  }
};

export const geminiService = {
  /**
   * Starts a new chat session specifically for a ticket context.
   * We pass the system instruction here to ground the model as an MSP agent.
   */
  startChatSession: async (initialContext?: string) => {
    initializeAI();
    if (!ai) throw new Error("AI not initialized. Check API Key.");

    // Using flash for responsiveness in chat
    chatSession = ai.chats.create({
      model: 'gemini-2.5-flash',
      config: {
        systemInstruction: SYSTEM_INSTRUCTION_TEXT,
        temperature: 0.4, // Keep it relatively deterministic for technical support
      },
    });

    if (initialContext) {
      const response = await chatSession.sendMessage({ message: initialContext });
      return response.text;
    }
    return "Ready to assist. Please provide ticket details.";
  },

  /**
   * Sends a message to the existing chat session.
   */
  sendMessage: async (message: string): Promise<string> => {
    if (!chatSession) {
      // If no session exists, start one without context
      await geminiService.startChatSession();
    }
    if (!chatSession) throw new Error("Failed to start chat session");

    try {
      const response = await chatSession.sendMessage({ message });
      return response.text || "No response received.";
    } catch (error) {
      console.error("Gemini Chat Error:", error);
      return "Error communicating with AI service. Please try again.";
    }
  },

  /**
   * Single-shot analysis for quick summaries or categorization
   */
  analyzeTicket: async (ticketDetails: string): Promise<string> => {
    initializeAI();
    if (!ai) return "AI Configuration Error";

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `Analyze this MSP ticket and provide a brief summary of the likely root cause and 3 initial troubleshooting steps.\n\nTicket: ${ticketDetails}`,
        config: {
            systemInstruction: SYSTEM_INSTRUCTION_TEXT
        }
      });
      return response.text || "Could not analyze ticket.";
    } catch (e) {
      console.error(e);
      return "Analysis failed.";
    }
  }
};