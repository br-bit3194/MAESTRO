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
        // Try to get error details from the response
        let errorMessage = 'Failed to process ticket';
        try {
          const errorData = await response.json();
          errorMessage = errorData.detail || errorData.message || errorData.error || errorMessage;
        } catch (e) {
          // If parsing JSON fails, use status text
          errorMessage = `Failed to process ticket: ${response.status} ${response.statusText}`;
        }
        throw new Error(errorMessage);
      }

      const processData = await response.json();
      
      // 🔍 COMPREHENSIVE LOGGING - Log everything from backend
      console.log('='.repeat(60));
      console.log('🔍 BACKEND RESPONSE - FULL DATA');
      console.log('='.repeat(60));
      console.log('1. Full processData:', JSON.stringify(processData, null, 2));
      console.log('\n2. processData keys:', Object.keys(processData));
      console.log('\n3. processData.result:', processData.result);
      console.log('\n4. processData.result type:', typeof processData.result);
      
      const ticketResult = processData.result || {};
      console.log('\n5. ticketResult:', ticketResult);
      console.log('\n6. ticketResult keys:', Object.keys(ticketResult));
      
      const results = ticketResult.results || {};
      console.log('\n7. results:', results);
      console.log('\n8. results keys:', Object.keys(results));
      
      const nodeHistory = ticketResult.node_history || [];
      console.log('\n9. nodeHistory length:', nodeHistory.length);
      console.log('\n10. nodeHistory:', nodeHistory);
      
      if (nodeHistory.length > 0) {
        console.log('\n11. Sample node (first):', nodeHistory[0]);
        console.log('\n12. Sample node (last):', nodeHistory[nodeHistory.length - 1]);
        
        // Log each node in detail
        nodeHistory.forEach((node, index) => {
          console.log(`\n13.${index} Node ${index}:`, {
            node_id: node.node_id,
            status: node.status,
            execution_time: node.execution_time,
            result: node.result,
            hasResult: !!node.result
          });
        });
      }
      
      // Log all agent results
      console.log('\n14. All Agent Results:');
      Object.entries(results).forEach(([agentName, agentData]: [string, any]) => {
        console.log(`\n   Agent: ${agentName}`);
        console.log(`   - Has result:`, !!agentData?.result);
        console.log(`   - Result:`, agentData?.result);
        console.log(`   - Message:`, agentData?.result?.message);
        console.log(`   - Content:`, agentData?.result?.message?.content);
      });
      
      console.log('\n' + '='.repeat(60));
      console.log('END OF BACKEND RESPONSE LOGGING');
      console.log('='.repeat(60) + '\n');
      
      let content = {
        ticketDetails: [] as Array<{label: string, value: string}>,
        response: ''
      };
      
      // Extract ticket details from the ticketing agent if available
      const ticketingAgentResult = results.ticketing_agent?.result;
      if (ticketingAgentResult?.ticket) {
        const ticket = ticketingAgentResult.ticket;
        content.ticketDetails = [
          { label: 'Ticket ID', value: ticket.id || 'N/A' },
          { label: 'Status', value: ticket.status || 'Open' },
          { label: 'Priority', value: ticket.priority || 'Medium' },
          { label: 'Created At', value: ticket.created_at || new Date().toLocaleString() },
        ];
      }

      // 🔧 PARSER: Extract text from Python string representations
      // The backend returns Python object string representations like:
      // "NodeResult(result=AgentResult(..., message={'content': [{'text': '...'}]}))"
      // We need to parse these strings to extract the actual text
      
      const extractTextFromPythonStr = (pythonStr: string): string | null => {
        if (!pythonStr || typeof pythonStr !== 'string') return null;
        
        console.log(`  🔍 Parsing string of length: ${pythonStr.length}`);
        
        // Strategy 1: Look for message={'content': [{'text': '...'
        // Replace newlines to handle multiline matching
        const singleLine = pythonStr.replace(/\n/g, ' ');
        const pattern1 = /message=\{[^}]*'content':\s*\[\{[^}]*'text':\s*'((?:[^'\\]|\\.)*)'/;
        let match = singleLine.match(pattern1);
        
        if (match && match[1]) {
          console.log(`  ✅ Found text using pattern 1 (length: ${match[1].length})`);
          return match[1]
            .replace(/\\n/g, '\n')
            .replace(/\\t/g, '\t')
            .replace(/\\'/g, "'")
            .replace(/\\"/g, '"')
            .replace(/\\\\/g, '\\');
        }
        
        // Strategy 2: Look for 'text': 'content' with more flexible matching
        const pattern2 = /'text':\s*'((?:[^'\\]|\\.)+)'/;
        match = singleLine.match(pattern2);
        
        if (match && match[1] && match[1].length > 20) {
          console.log(`  ✅ Found text using pattern 2 (length: ${match[1].length})`);
          return match[1]
            .replace(/\\n/g, '\n')
            .replace(/\\t/g, '\t')
            .replace(/\\'/g, "'")
            .replace(/\\"/g, '"')
            .replace(/\\\\/g, '\\');
        }
        
        // Strategy 3: Look for any long text content in quotes (500+ chars = likely resolution)
        const pattern3 = /'([^']{500,})'/;
        match = singleLine.match(pattern3);
        
        if (match && match[1]) {
          console.log(`  ✅ Found long text using pattern 3 (length: ${match[1].length})`);
          return match[1]
            .replace(/\\n/g, '\n')
            .replace(/\\t/g, '\t')
            .replace(/\\'/g, "'")
            .replace(/\\"/g, '"')
            .replace(/\\\\/g, '\\');
        }
        
        console.log(`  ❌ No text pattern matched`);
        return null;
      };
      
      // Extract the final resolution using the same logic as maestro_ui_enhanced.py
      // Iterate through node_history in reverse to find the last meaningful result
      let finalResolution = '';
      
      console.log('🔄 Starting resolution extraction...');
      console.log('📋 Node history:', nodeHistory);
      
      if (nodeHistory && nodeHistory.length > 0) {
        console.log(`\n🔍 Checking ${nodeHistory.length} nodes in reverse order...`);
        
        // Reverse iterate through node history
        for (let i = nodeHistory.length - 1; i >= 0; i--) {
          const nodeName = typeof nodeHistory[i] === 'string' ? nodeHistory[i] : nodeHistory[i].node_id;
          console.log(`\n  📌 Node ${i}: ${nodeName}`);
          
          // Get the agent's result string from the results object
          const agentResultStr = results[nodeName];
          
          if (agentResultStr && typeof agentResultStr === 'string') {
            console.log(`  ✅ Found result string for ${nodeName}`);
            const extractedText = extractTextFromPythonStr(agentResultStr);
            
            if (extractedText && extractedText.trim().length > 30) {
              finalResolution = extractedText.trim();
              console.log(`\n  ✨ SUCCESS! Extracted ${extractedText.length} chars from ${nodeName}`);
              console.log(`  📝 Preview: ${finalResolution.substring(0, 150)}...`);
              break;
            }
          } else {
            console.log(`  ⚠️ No result string for ${nodeName}`);
          }
        }
      }
      
      // If no resolution found in node history, try specific agents in priority order
      if (!finalResolution) {
        console.log('\n🔄 Node history search failed, trying priority agents...');
        
        const agentPriority = [
          'summarization_agent',  // Best: contains final summary
          'ticketing_agent',      // Good: contains resolution details and ticket info
          'cloud_service_agent',  // Specific: cloud-related resolutions
          'network_diagnostic_agent', // Specific: network-related resolutions
          'memory_agent',         // May have cached resolutions
          'orchestrator_agent'    // Last resort: coordination messages
        ];
        
        for (const agentName of agentPriority) {
          const agentResultStr = results[agentName];
          
          if (agentResultStr && typeof agentResultStr === 'string') {
            console.log(`\n  📌 Trying ${agentName}...`);
            const extractedText = extractTextFromPythonStr(agentResultStr);
            
            if (extractedText && extractedText.trim().length > 30) {
              finalResolution = extractedText.trim();
              console.log(`  ✨ SUCCESS! Using ${agentName} response`);
              break;
            }
          }
        }
      }
      
      // Last resort: check all agents
      if (!finalResolution) {
        console.log('\n🔄 Priority search failed, checking ALL agents...');
        
        for (const [agentName, agentResultStr] of Object.entries(results)) {
          if (typeof agentResultStr === 'string') {
            console.log(`\n  📌 Trying ${agentName}...`);
            const extractedText = extractTextFromPythonStr(agentResultStr);
            
            if (extractedText && extractedText.trim().length > 30) {
              finalResolution = extractedText.trim();
              console.log(`  ✨ SUCCESS! Using ${agentName} (fallback)`);
              break;
            }
          }
        }
      }
      
      // If still no resolution found, show generic message
      if (!finalResolution) {
        console.error('\n❌❌❌ FAILED TO EXTRACT RESOLUTION ❌❌❌');
        console.error('📋 Results structure:', results);
        const sampleResult = Object.values(results)[0];
        if (typeof sampleResult === 'string') {
          console.error('📋 Sample result:', sampleResult.substring(0, 500));
        }
        console.error('💡 TIP: Check the console logs above for parsing details');
        
        finalResolution = '✅ Ticket has been processed successfully.\n\n' +
                         '⚠️ However, we could not extract the detailed resolution text.\n\n' +
                         '🔍 Debug Information:\n' +
                         `• Agents involved: ${Object.keys(results).join(', ')}\n` +
                         `• Node history: ${nodeHistory.join(' → ')}\n\n` +
                         '💡 Please open the browser console (F12 → Console tab) to see detailed logs and the full backend response.';
      } else {
        console.log('\n✅✅✅ RESOLUTION EXTRACTED SUCCESSFULLY! ✅✅✅');
        console.log(`📝 Length: ${finalResolution.length} characters`);
        console.log(`📝 Preview:\n${finalResolution.substring(0, 200)}...`);
      }
      
      content.response = finalResolution;
      
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
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      setIsProcessing(false);
      setMessages(prev =>
        prev.map(msg =>
          msg.id === typingMessageId
            ? {
                ...msg,
                content: `❌ Error: ${errorMessage}\n\nPlease check:\n• Backend server is running\n• AWS credentials are configured\n• Network connectivity`,
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
