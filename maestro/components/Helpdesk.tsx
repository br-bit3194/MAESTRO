import React, { useState, useCallback, useEffect } from 'react';
import Card from './Card';
import { MOCK_TICKETS } from '../constants';
import { Ticket, TicketStatus, Agent, AgentStatus, AgentName, TicketMessage } from '../types';
import { getTicketSummary } from '../services/geminiService';

const getStatusColor = (status: TicketStatus) => {
    switch (status) {
        case TicketStatus.Escalated: return 'bg-red-500/20 text-red-300';
        case TicketStatus.AI_Responding: return 'bg-blue-500/20 text-blue-300';
        case TicketStatus.Resolved: return 'bg-green-500/20 text-green-300';
    }
};

const agentIcons: Record<AgentName, React.ReactNode> = {
    [AgentName.Orchestrator]: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4s-8 4-8 10 8 10 8 10 8-4 8-10S20 4 12 4zm0 0v2m0 16v-2m-7-9H3m18 0h-2m-4 4l-1.5-1.5M16 8l-1.5 1.5M8 8l1.5 1.5M8 16l1.5-1.5" /></svg>,
    [AgentName.BackupRecoveryAgent]: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 7v10c0 1.1.9 2 2 2h12a2 2 0 002-2V7M16 3h-8a2 2 0 00-2 2v1h12V5a2 2 0 00-2-2z" /><path strokeLinecap="round" strokeLinejoin="round" d="M9 14l3-3m0 0l3 3m-3-3v5" /></svg>,
    [AgentName.DocumentationGeneratorAgent]: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>,
    [AgentName.TicketAgent]: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 002 2h14a2 2 0 002-2V7a2 2 0 00-2-2H5z" /></svg>,
    [AgentName.MemoryAgent]: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 7v10c0 1.1.9 2 2 2h12a2 2 0 002-2V7m-4-4h-8a2 2 0 00-2 2v4h12V5a2 2 0 00-2-2zM8 11h8M8 15h8" /></svg>,
    [AgentName.AutoPatchFixingAgent]: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>,
    [AgentName.ImageAnalysisAgent]: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>,
    [AgentName.SandboxScriptExecutorAgent]: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8 9l4-4 4 4m0 6l-4 4-4-4" /><path strokeLinecap="round" strokeLinejoin="round" d="M10 20l4-16" /></svg>,
    [AgentName.NetworkDiagnosticAgent]: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071a10 10 0 0114.142 0M1.394 8.111a15 15 0 0121.213 0" /></svg>,
    [AgentName.SecurityAssessmentAgent]: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z" stroke="none"/></svg>,
    [AgentName.PerformanceOptimizationAgent]: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>,
    [AgentName.AssetDiscoveryAgent]: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>,
    [AgentName.ComplianceAuditingAgent]: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
};

const WorkerAgentEcosystem: React.FC<{ agents: Agent[] }> = ({ agents }) => {
    const orchestrator = agents.find(a => a.name === AgentName.Orchestrator);
    const workerAgents = agents.filter(a => a.name !== AgentName.Orchestrator);
    const numAgents = workerAgents.length;
    const radiusX = 42; // in %
    const radiusY = 28; // in %

    return (
        <div className="relative w-full h-[320px] bg-gray-900 bg-[radial-gradient(#2d2d2d_1px,transparent_1px)] [background-size:16px_16px] flex items-center justify-center p-4 rounded-lg border border-gray-700">
            {orchestrator && (
                <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center justify-center w-40 h-20 bg-gray-800 border-2 rounded-full shadow-lg transition-all duration-500 z-10 ${orchestrator.status === AgentStatus.Active ? 'border-teal-400 shadow-teal-400/30' : 'border-gray-600'}`}>
                    <span className="text-base font-bold text-white">{orchestrator.name}</span>
                    <span className="text-xs text-teal-300">{orchestrator.status === AgentStatus.Active ? 'Coordinating...' : orchestrator.status}</span>
                </div>
            )}

            {workerAgents.map((agent, index) => {
                const angle = (index / numAgents) * 2 * Math.PI - (Math.PI / 2); // Start from top
                const x = 50 + radiusX * Math.cos(angle);
                const y = 50 + radiusY * Math.sin(angle);

                const isActive = agent.status === AgentStatus.Active;
                const isCompleted = agent.status === AgentStatus.Completed;

                return (
                    <div
                        key={agent.name}
                        className={`absolute flex items-center p-2 rounded-lg bg-gray-800/80 backdrop-blur-sm border transition-all duration-300 w-44 h-16 shadow-md ${isActive ? 'border-teal-400 scale-110 shadow-teal-400/20 z-20' : isCompleted ? 'border-green-500 opacity-80' : 'border-gray-700 opacity-70'}`}
                        style={{ top: `${y}%`, left: `${x}%`, transform: 'translate(-50%, -50%)' }}
                    >
                        <div className={`mr-2 ${isActive ? 'text-teal-400' : isCompleted ? 'text-green-500' : 'text-gray-400'}`}>
                            {agentIcons[agent.name]}
                        </div>
                        <div className="flex-1">
                            <p className={`text-xs font-bold ${isActive || isCompleted ? 'text-white' : 'text-gray-400'}`}>{agent.name.replace(' Agent', '')}</p>
                            <p className={`text-[10px] ${isActive ? 'text-teal-300 animate-pulse' : isCompleted ? 'text-green-400' : 'text-gray-500'}`}>{agent.status}</p>
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

const AgentActivityLog: React.FC<{ agents: Agent[] }> = ({ agents }) => {
    const logEntries = agents.filter(agent => agent.status === AgentStatus.Completed);
    const activeAgent = agents.find(agent => agent.status === AgentStatus.Active);

    return (
        <div className="bg-gray-800 p-4 rounded-lg border border-gray-700 h-[320px] flex flex-col">
            <h4 className="text-lg font-semibold mb-3 text-white flex-shrink-0">Agent Activity Log</h4>
            <div className="overflow-y-auto space-y-3 pr-2 flex-1">
                {!activeAgent && logEntries.length === 0 && (
                    <p className="text-gray-500 text-sm h-full flex items-center justify-center">Awaiting agent activity...</p>
                )}
                {activeAgent && (
                     <div className="flex items-start text-sm p-2 bg-blue-500/10 rounded-lg">
                        <div className="mr-3 mt-1 text-teal-400">
                             <svg className="h-5 w-5 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                        </div>
                        <div>
                            <p className="font-bold text-teal-300">{activeAgent.name}</p>
                            <p className="text-gray-300">{activeAgent.task}</p>
                        </div>
                    </div>
                )}
                {logEntries.slice().reverse().map(agent => (
                    <div key={agent.name} className="flex items-start text-sm opacity-80">
                         <div className="mr-3 mt-1 text-green-500">
                             <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                        </div>
                        <div>
                            <p className="font-semibold text-gray-400">{agent.name}</p>
                            <p className="text-gray-500">{agent.task}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

const Helpdesk: React.FC = () => {
    const [localTickets, setLocalTickets] = useState<Ticket[]>(MOCK_TICKETS);
    const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(localTickets.find(t => t.status === TicketStatus.AI_Responding) || localTickets[0]);
    const [summary, setSummary] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [newMessage, setNewMessage] = useState<string>('');
    
    useEffect(() => {
        if (selectedTicket && selectedTicket.status === TicketStatus.AI_Responding && selectedTicket.swarmState?.some(a => a.status === AgentStatus.Pending)) {
            const runSwarmSimulation = async () => {
                let currentAgents = selectedTicket.swarmState!;
                
                const activationSequence = [
                    AgentName.Orchestrator,
                    AgentName.TicketAgent,
                    AgentName.AssetDiscoveryAgent,
                    AgentName.PerformanceOptimizationAgent,
                    AgentName.MemoryAgent,
                    AgentName.DocumentationGeneratorAgent,
                    AgentName.AutoPatchFixingAgent
                ];

                for (const agentNameToActivate of activationSequence) {
                    const agentIndex = currentAgents.findIndex(a => a.name === agentNameToActivate);
                    if (agentIndex === -1) continue;
                    
                    currentAgents = currentAgents.map((agent, index) => index === agentIndex ? { ...agent, status: AgentStatus.Active } : agent);
                    updateTicketInState({ ...selectedTicket, swarmState: [...currentAgents] });

                    await new Promise(resolve => setTimeout(resolve, agentNameToActivate === AgentName.Orchestrator ? 1000 : 1500));

                    const task = currentAgents[agentIndex].task;
                    currentAgents = currentAgents.map((agent, index) => index === agentIndex ? { ...agent, status: AgentStatus.Completed, task: `${task.split('.')[0]}. - Done.` } : agent);
                    
                    if (agentNameToActivate === activationSequence[activationSequence.length -1]) {
                        const orchestratorIndex = currentAgents.findIndex(a => a.name === AgentName.Orchestrator);
                        if (orchestratorIndex > -1) {
                            currentAgents[orchestratorIndex] = { ...currentAgents[orchestratorIndex], status: AgentStatus.Completed, task: 'Coordination complete.' };
                        }
                    }
                    updateTicketInState({ ...selectedTicket, swarmState: [...currentAgents] });
                }
                
                await new Promise(resolve => setTimeout(resolve, 1000));
                const finalTicketState = { ...selectedTicket, swarmState: currentAgents };
                addSwarmResponse(finalTicketState);
            };
            
            const timeoutId = setTimeout(runSwarmSimulation, 500);
            return () => clearTimeout(timeoutId);
        }
    }, [selectedTicket?.id]);

    const updateTicketInState = (updatedTicket: Ticket) => {
        setLocalTickets(prevTickets => prevTickets.map(t => t.id === updatedTicket.id ? updatedTicket : t));
        if (selectedTicket?.id === updatedTicket.id) {
            setSelectedTicket(updatedTicket);
        }
    };
    
    const addSwarmResponse = (ticket: Ticket) => {
        let responseContent = "I've analyzed the situation. Could you please provide more details?";
        let newStatus = TicketStatus.Escalated;
        if (ticket.subject.includes("marketing folder")) {
            responseContent = "I can help with that. To process your request, I need to verify your manager's approval. Could you please forward the approval email to it-requests@maestro.ai? The system will automatically process it.";
            newStatus = TicketStatus.Resolved;
        } else if (ticket.subject.includes("Outlook")) {
            responseContent = "Based on my analysis, Outlook performance issues are often caused by faulty add-ins. Let's try starting Outlook in Safe Mode. Press `Win + R`, type `outlook.exe /safe`, and press Enter. Let me know if it opens without freezing.";
            newStatus = TicketStatus.Resolved;
        }

        const newAiMessage: TicketMessage = {
            sender: 'ai',
            content: responseContent,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        
        const updatedTicket = {
            ...ticket,
            messages: [...ticket.messages, newAiMessage],
            status: newStatus,
        };
        updateTicketInState(updatedTicket);
    };

    const handleSelectTicket = (ticketId: number) => {
        setSummary('');
        setNewMessage('');
        const ticket = localTickets.find(t => t.id === ticketId);
        if (ticket) {
            setSelectedTicket(ticket);
        }
    };

    const handleSummarize = useCallback(async () => {
        if (!selectedTicket || selectedTicket.status !== TicketStatus.Escalated) return;
        setIsLoading(true);
        setSummary('');
        try {
            const result = await getTicketSummary(selectedTicket);
            setSummary(result);
        } catch (error) {
            console.error(error);
            setSummary('Error generating summary.');
        } finally {
            setIsLoading(false);
        }
    }, [selectedTicket]);

    const handleSendMessage = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim() || !selectedTicket) return;

        const newAiMessage: TicketMessage = {
            sender: 'ai',
            content: newMessage,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        
        const updatedTicket = {
            ...selectedTicket,
            messages: [...selectedTicket.messages, newAiMessage],
        };

        updateTicketInState(updatedTicket);
        setNewMessage('');
    };

    return (
        <div className="h-[calc(100vh-4rem)] flex flex-col">
            <h2 className="text-3xl font-bold mb-6 text-white">GenAI Helpdesk Copilot</h2>
            <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-6 h-full overflow-hidden">
                {/* Ticket List */}
                <Card className="lg:col-span-1 flex flex-col overflow-y-auto">
                    <ul className="space-y-2">
                        {localTickets.map(ticket => (
                            <li key={ticket.id} onClick={() => handleSelectTicket(ticket.id)}
                                className={`p-3 rounded-lg cursor-pointer transition ${selectedTicket?.id === ticket.id ? 'bg-teal-500/20' : 'hover:bg-gray-700/50'}`}>
                                <div className="flex items-center space-x-3">
                                    <img src={ticket.userAvatar} alt={ticket.user} className="w-10 h-10 rounded-full" />
                                    <div className="flex-1 min-w-0">
                                        <p className="font-semibold text-white truncate">{ticket.user}</p>
                                        <p className="text-sm text-gray-300 truncate">{ticket.subject}</p>
                                    </div>
                                    <span className={`text-xs font-bold px-2 py-1 rounded-full flex-shrink-0 ${getStatusColor(ticket.status)}`}>{ticket.status}</span>
                                </div>
                            </li>
                        ))}
                    </ul>
                </Card>

                {/* Ticket Details */}
                <Card className="lg:col-span-2 flex flex-col h-full overflow-hidden">
                    {selectedTicket && (
                        <div className="flex flex-col h-full">
                            <div className="pb-4 border-b border-gray-700">
                                <h3 className="text-2xl font-bold text-white">{selectedTicket.subject}</h3>
                                <p className="text-gray-400">Ticket #{selectedTicket.id} &bull; Classification: {selectedTicket.classification}</p>
                            </div>
                            
                             {selectedTicket.status === TicketStatus.AI_Responding && selectedTicket.swarmState && (
                                <div className="flex flex-col gap-4 py-4 border-b border-gray-700">
                                    <WorkerAgentEcosystem agents={selectedTicket.swarmState} />
                                    <AgentActivityLog agents={selectedTicket.swarmState} />
                                </div>
                            )}
                            
                            <div className="flex-1 py-4 space-y-4 overflow-y-auto">
                                {selectedTicket.messages.map((msg, index) => (
                                    <div key={index} className={`flex items-start gap-3 ${msg.sender === 'user' ? 'justify-start' : 'justify-end'}`}>
                                        <div className={`p-3 rounded-lg max-w-[80%] ${msg.sender === 'user' ? 'bg-gray-700' : 'bg-blue-600 text-white'}`}>
                                            <p>{msg.content}</p>
                                            {msg.image && <img src={msg.image} alt="User screenshot" className="mt-2 rounded-lg max-w-xs" />}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="flex-shrink-0 mt-auto border-t border-gray-700">
                                <form onSubmit={handleSendMessage} className="flex items-center gap-2 p-4">
                                    <input
                                        type="text"
                                        value={newMessage}
                                        onChange={(e) => setNewMessage(e.target.value)}
                                        placeholder={
                                            selectedTicket.status === TicketStatus.Resolved
                                                ? "This ticket is resolved and closed."
                                                : "Type your response as the AI agent..."
                                        }
                                        disabled={selectedTicket.status === TicketStatus.Resolved}
                                        className="flex-1 p-3 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 disabled:bg-gray-800 disabled:cursor-not-allowed"
                                        aria-label="Send a message"
                                    />
                                    <button
                                        type="submit"
                                        disabled={!newMessage.trim() || selectedTicket.status === TicketStatus.Resolved}
                                        className="p-3 bg-blue-600 rounded-lg hover:bg-blue-500 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors"
                                        aria-label="Send"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                                        </svg>
                                    </button>
                                </form>

                                {selectedTicket.status === TicketStatus.Escalated && (
                                    <div className="p-4 bg-gray-800 border-t border-gray-700">
                                        <h4 className="font-bold text-lg mb-2 text-yellow-300">Escalation Context</h4>
                                        <div className="text-sm bg-gray-900 p-3 rounded-lg font-mono max-h-32 overflow-y-auto mb-3">
                                            <p className="text-gray-400 font-sans font-semibold">Attempted Fixes:</p>
                                            <ul className="list-disc list-inside text-gray-300">
                                                {selectedTicket.context?.attemptedFixes.map(fix => <li key={fix}>{fix}</li>)}
                                            </ul>
                                            <p className="text-gray-400 font-sans font-semibold mt-2">System Info:</p>
                                            <p className="text-gray-300">{selectedTicket.context?.systemInfo.name} ({selectedTicket.context?.systemInfo.os} {selectedTicket.context?.systemInfo.osVersion})</p>
                                        </div>
                                        
                                        <div className="flex items-start gap-4">
                                            <button onClick={handleSummarize} disabled={isLoading} className="bg-teal-500 hover:bg-teal-400 text-white font-bold py-2 px-4 rounded-lg transition disabled:bg-gray-600">
                                                {isLoading ? 'Summarizing...' : 'Summarize with Gemini'}
                                            </button>
                                            {summary && <Card className="flex-1 !p-3 bg-teal-500/10 border-teal-500"><p className="text-sm text-teal-200">{summary}</p></Card>}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </Card>
            </div>
        </div>
    );
};

export default Helpdesk;