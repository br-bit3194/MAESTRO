'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Bot, Download, Trash2, AlertCircle, Loader2 } from 'lucide-react';
import { PromptBox } from '@/components/ui/chatgpt-prompt-input';

interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
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
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
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
      if (retryCount >= MAX_RETRIES - 1) {
        setIsLoading(false);
      }
    }
  };

  const processTicket = async (ticketId: string, typingMessageId: string) => {
    try {
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
      
      // Update the typing message with the final response
      setMessages(prev =>
        prev.map(msg =>
          msg.id === typingMessageId
            ? {
                ...msg,
                content: processData.message || 'Your request has been processed successfully.',
                isTyping: false,
              }
            : msg
        )
      );
      
      return true;
    } catch (error) {
      console.error('Error processing ticket:', error);
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
    if (message.role === 'user') {
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
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">💬 Chat with MAESTRO</h2>
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

      <div className="flex-1 flex flex-col h-full max-h-[calc(100vh-200px)] overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
            <Bot className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-2xl font-bold tracking-tight">How can I help you today?</h3>
            <p className="text-muted-foreground mt-2">Ask me anything about your infrastructure or system issues.</p>
            
            <div className="mt-8 w-full max-w-md">
              <h4 className="text-sm font-medium mb-3 text-muted-foreground">Or try one of these examples:</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {quickPrompts.map((prompt, i) => (
                  <button
                    key={i}
                    onClick={() => handleSend(prompt.prompt)}
                    className="p-3 text-left text-sm border rounded-lg hover:bg-accent transition-colors"
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
                      message={message.content} 
                      onRetry={() => handleRetry(message)}
                    />
                  ) : (
                    <div className="whitespace-pre-wrap">{message.content}</div>
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
      </div>

      <div className="p-4">
        <PromptBox 
          onSend={handleSend}
          isLoading={isLoading}
          className="w-full"
          disabled={isLoading}
          placeholder="Type your message here..."
        />
      </div>
    </div>
  );
}
