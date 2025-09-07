
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { Ticket } from '../types';

// This is a mock implementation. In a real app, process.env.API_KEY would be set.
// For this frontend simulation, we don't need a real key.
const apiKey = process.env.API_KEY || "mock-api-key-for-frontend";
const ai = new GoogleGenAI({ apiKey });

/**
 * Simulates calling the Gemini API to get a summary and next steps for an escalated ticket.
 * @param ticket The ticket object containing context.
 * @returns A promise that resolves to a string summary.
 */
export const getTicketSummary = async (ticket: Ticket): Promise<string> => {
    // We are mocking the API call here to avoid needing a real API key in the browser.
    // In a real application, this function would make the actual call to the Gemini API.
    
    const prompt = `
        You are an IT support lead. A ticket has been escalated to you.
        Summarize the issue, the steps already taken, and suggest the most likely next step for a human agent.
        
        User: ${ticket.user}
        Subject: ${ticket.subject}
        
        Conversation History:
        ${ticket.messages.map(m => `${m.sender}: ${m.content}`).join('\n')}
        
        System Context:
        - Device: ${ticket.context?.systemInfo.name} (${ticket.context?.systemInfo.os} ${ticket.context?.systemInfo.osVersion})
        - CPU: ${ticket.context?.systemInfo.cpuUsage}%, Mem: ${ticket.context?.systemInfo.memUsage}%, Disk: ${ticket.context?.systemInfo.diskUsage}%
        
        Attempted Fixes by AI:
        ${ticket.context?.attemptedFixes.join(', ')}
        
        Summary and Next Step:
    `;

    console.log("--- MOCK GEMINI PROMPT ---");
    console.log(prompt);
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Mocked Response
    const mockResponseText = `Summary: User '${ticket.user}' cannot connect to VPN (Error 809). Basic troubleshooting like flushing DNS and restarting the client failed. Next Step: This is likely a firewall issue. Check the client's local firewall and network firewall for blocked UDP ports 500 & 4500.`;

    // This is how you would structure the actual API call
    /*
    try {
        const response: GenerateContentResponse = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt
        });
        return response.text;
    } catch (error) {
        console.error("Error calling Gemini API:", error);
        throw new Error("Failed to get summary from Gemini API.");
    }
    */

    return Promise.resolve(mockResponseText);
};
