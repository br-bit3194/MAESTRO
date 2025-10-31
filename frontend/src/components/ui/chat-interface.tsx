'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Bot, Download, Trash2, AlertCircle, Loader2 } from 'lucide-react';
import { PromptBox } from '@/components/ui/chatgpt-prompt-input';
import { LoadingOverlay } from '@/components/ui/loading-overlay';
import { LoadingPopup } from '@/components/ui/loading-popup';

interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string | {
    ticketDetails?: Array<{ label: string; value: string }>;
    response?: string;
  };
  timestamp: string;
  isTyping?: boolean;
  error?: boolean;
  retryCount?: number;
}

const MAX_RETRIES = 3;
const RETRY_DELAY = 1000;

const TypingIndicator = () => (
  <div className="flex items-center space-x-1 py-2 px-4">
    <div className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: '0ms' }}></div>
    <div className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: '150ms' }}></div>
    <div className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: '300ms' }}></div>
  </div>
);

const ErrorMessage = ({ message, onRetry }: { message: string; onRetry: () => void }) => (
  <div className="flex items-center gap-2 text-red-600 dark:text-red-400 text-sm">
    <AlertCircle className="h-4 w-4 flex-shrink-0" />
    <span>{message}</span>
    <Button
      variant="ghost"
      size="sm"
      onClick={onRetry}
      className="h-auto p-1 text-red-600 hover:bg-red-100 dark:text-red-400 dark:hover:bg-red-900/50"
    >
      Retry
    </Button>
  </div>
);

export function ChatInterface() {
  // State for loading popup
  const [showLoading, setShowLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const processingMessageId = useRef<string | null>(null);

  // Quick action prompts
  const quickPrompts = [
    { label: 'AWS S3 Issue', prompt: 'I cannot access my S3 bucket. Please help diagnose the issue.' },
    { label: 'Network Problem', prompt: 'Users are experiencing network connectivity issues. Please investigate.' },
    { label: 'System Health', prompt: 'Can you check the overall system health and performance?' },
    { label: 'Memory Status', prompt: 'Show me the current memory usage and stored resolutions.' },
  ];

  const handleSend = async (input: string, retryCount = 0) => {
    setShowLoading(true);
    if (!input.trim()) return;

    const messageId = `msg-${Date.now()}`;
    const userMessage: Message = {
      id: messageId,
      role: 'user',
      content: input,
      timestamp: new Date().toISOString(),
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);
    setIsProcessing(true);
    document.body.style.overflow = 'hidden'; // Prevent scrolling while loading

    try {
      // Add typing indicator
      const typingMessageId = `typing-${Date.now()}`;
      const typingMessage: Message = {
        id: typingMessageId,
        role: 'assistant',
        content: '',
        timestamp: new Date().toISOString(),
        isTyping: true,
      };
      setMessages(prev => [...prev, typingMessage]);
      processingMessageId.current = typingMessageId;

      // First, create the ticket
      const ticketResponse = await fetchWithRetry(
        `${process.env.NEXT_PUBLIC_API_URL}/api/tickets`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            description: input,
            priority: 'Medium',
            timestamp: new Date().toISOString(),
          }),
        },
        retryCount
      );

      if (!ticketResponse.ok) {
        throw new Error('Failed to create ticket');
      }

      const ticketData = await ticketResponse.json();
      
      // Update the typing message with initial response
      setMessages(prev =>
        prev.map(msg =>
          msg.id === typingMessageId
            ? {
                ...msg,
                content: ticketData.message || 'Processing your request...',
                isTyping: false,
              }
            : msg
        )
      );

      // If ticket was created successfully, process it
      if (ticketData.id || ticketData.ticket_id) {
        const ticketId = ticketData.id || ticketData.ticket_id;
        await processTicket(ticketId, typingMessageId);
      } else {
        // If no ticket ID was returned, ensure loading state is reset
        setIsLoading(false);
      }
    } catch (error) {
      console.error('Error:', error);
      
      const errorMessage = retryCount < MAX_RETRIES - 1
        ? 'Failed to process request. Retrying...'
        : 'Sorry, we encountered an error. Please try again.';
      
      setMessages(prev => {
        const newMessages = prev.filter(msg => msg.id !== processingMessageId.current);
        if (retryCount < MAX_RETRIES - 1) {
          // Auto-retry
          setTimeout(() => handleSend(input, retryCount + 1), RETRY_DELAY);
        } else {
          // Show error message with retry option
          newMessages.push({
            id: `error-${Date.now()}`,
            role: 'assistant',
            content: errorMessage,
            timestamp: new Date().toISOString(),
            error: true,
            retryCount: retryCount,
          });
        }
        return newMessages;
      });
    } finally {
      processingMessageId.current = null;
      setIsLoading(false);
      setShowLoading(false);
    }
  };

  const processTicket = async (ticketId: string, typingMessageId: string) => {
    setShowLoading(true);
    setIsProcessing(true);
    try {
      // Show loading popup before making the API call
      setIsProcessing(true);
      
      const response = await fetchWithRetry(
        `${process.env.NEXT_PUBLIC_API_URL}/api/process-ticket/${ticketId}`,
        { 
          method: 'POST',
          headers: { 'Content-Type': 'application/json' }
        },
        0
      );

      if (!response.ok) {
        throw new Error('Failed to process ticket');
      }

      const processData = await response.json();
      
      // Parse the response and extract ticket details and response message
      const ticketingAgentResult = processData.result?.results?.ticketing_agent?.result;
      const orchestratorResult = processData.result?.results?.orchestrator_agent?.result;
      
      let content = {
        ticketDetails: [] as Array<{label: string, value: string}>,
        response: ''
      };

      // Extract ticket details from the response
      if (ticketingAgentResult?.ticket) {
        const ticket = ticketingAgentResult.ticket;
        content.ticketDetails = [
          { label: 'Ticket ID', value: ticket.id || 'N/A' },
          { label: 'Status', value: ticket.status || 'Open' },
          { label: 'Priority', value: ticket.priority || 'Medium' },
          { label: 'Created At', value: ticket.created_at || new Date().toLocaleString() },
        ];
      }

      // Extract response message
      if (ticketingAgentResult?.message?.content?.[0]?.text) {
        content.response = ticketingAgentResult.message.content[0].text;
      } else if (orchestratorResult?.message?.content?.[0]?.text) {
        content.response = orchestratorResult.message.content[0].text;
      } else {
        content.response = 'Received an unexpected response format from the server.';
      }
      
      setMessages(prev =>
        prev.map(msg =>
          msg.id === typingMessageId
            ? {
                ...msg,
                content: content,
                isTyping: false,
              }
            : msg
        )
      );
      
      return true;
    } catch (error) {
      console.error('Error processing ticket:', error);
      setIsProcessing(false);
      setMessages(prev =>
        prev.map(msg =>
          msg.id === typingMessageId
            ? {
                ...msg,
                content: 'Error processing your request. Please try again.',
                isTyping: false,
                error: true,
              }
            : msg
        )
      );
      return false;
    } finally {
      // Ensure loading state is always reset
      setIsLoading(false);
      setShowLoading(false);
      setIsProcessing(false);
    }
  };

  const fetchWithRetry = async (
    url: string,
    options: RequestInit,
    retryCount: number
  ): Promise<Response> => {
    try {
      const response = await fetch(url, options);
      if (!response.ok && retryCount < MAX_RETRIES - 1) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response;
    } catch (error) {
      if (retryCount < MAX_RETRIES - 1) {
        await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
        return fetchWithRetry(url, options, retryCount + 1);
      }
      throw error;
    }
  };

  const handleRetry = (message: Message) => {
    if (message.role === 'user' && typeof message.content === 'string') {
      const userInput = message.content;
      setMessages(prev => prev.filter(m => m.id !== message.id));
      handleSend(userInput);
    }
  };

  const clearChat = () => {
    if (confirm('Are you sure you want to clear the chat history?')) {
      setMessages([]);
    }
  };

  const exportChat = () => {
    const chatData = JSON.stringify(messages, null, 2);
    const blob = new Blob([chatData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `maestro_chat_${new Date().toISOString()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Auto-scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      const input = e.currentTarget.value.trim();
      if (input) {
        handleSend(input);
        e.currentTarget.value = '';
      }
    }
  };

  return (
    <div className="relative flex flex-col h-full">
      {/* Loading Overlay with Dotted Surface */}
      <LoadingOverlay show={isProcessing} text="Processing your request..." />

      <Card className="w-full max-w-4xl mx-auto h-[600px] flex flex-col">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full overflow-hidden">
                <img 
                  src="/logo.jpeg" 
                  alt="MAESTRO Logo" 
                  className="w-full h-full object-cover"
                />
              </div>
              <span className="text-lg font-semibold">Chat with MAESTRO</span>
            </CardTitle>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={exportChat}>
                <Download className="h-4 w-4 mr-2" />
                Export Chat
              </Button>
              <Button variant="outline" size="sm" onClick={clearChat}>
                <Trash2 className="h-4 w-4 mr-2" />
                Clear Chat
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="flex-1 overflow-y-auto">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full">
              <div className="text-center">
                <div className="w-20 h-20 mx-auto mb-6 rounded-full overflow-hidden border-2 border-blue-400/30 p-1 animate-bounce">
                  <img 
                    src="/logo.jpeg" 
                    alt="MAESTRO Logo" 
                    className="w-full h-full object-cover rounded-full"
                  />
                </div>
                <h4 className="text-sm font-medium mb-3 text-muted-foreground">Try one of these examples:</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {quickPrompts.map((prompt, i) => (
                    <button
                      key={i}
                      onClick={() => handleSend(prompt.prompt)}
                      className="p-3 text-left text-sm border rounded-lg hover:bg-accent transition-colors w-full"
                    >
                      {prompt.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] rounded-lg px-4 py-2 ${
                      message.error
                        ? 'bg-destructive/10 border border-destructive/20'
                        : message.role === 'user'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted'
                    }`}
                  >
                    {message.isTyping ? (
                      <TypingIndicator />
                    ) : message.error ? (
                      <ErrorMessage 
                        message={typeof message.content === 'string' ? message.content : 'An error occurred'} 
                        onRetry={() => handleRetry(message)}
                      />
                    ) : message.role === 'assistant' && typeof message.content !== 'string' ? (
                      <div className="space-y-3">
                        {message.content.ticketDetails && message.content.ticketDetails.length > 0 && (
                          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
                            <h3 className="font-semibold text-lg mb-2 text-gray-900 dark:text-white">Ticket Details</h3>
                            <div className="space-y-2 text-sm">
                              {message.content.ticketDetails.map((detail, index) => (
                                <div key={index} className="grid grid-cols-3 gap-2">
                                  <span className="text-gray-500 dark:text-gray-400">{detail.label}:</span>
                                  <span className="col-span-2 font-medium text-gray-900 dark:text-white">{detail.value}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                        {message.content.response && (
                          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-900 p-4">
                            <h3 className="font-semibold text-lg mb-2 text-blue-700 dark:text-blue-300">Response</h3>
                            <div className="whitespace-pre-wrap text-gray-800 dark:text-gray-200">
                              {message.content.response}
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="whitespace-pre-wrap">
                        {typeof message.content === 'string' ? message.content : 'Unsupported message format'}
                      </div>
                    )}
                    <div className={`text-xs mt-1 ${message.role === 'user' ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>
                      {new Date(message.timestamp).toLocaleTimeString()}
                    </div>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          )}
        </CardContent>
        <CardFooter className="border-t p-4">
          <div className="w-full">
            <PromptBox 
              onSend={handleSend}
              isLoading={isLoading}
              className="w-full"
              disabled={isLoading}
              placeholder="Type your message here..."
            />
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
