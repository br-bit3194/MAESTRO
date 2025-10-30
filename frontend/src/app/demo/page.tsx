'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Terminal, CheckCircle, AlertCircle, Loader2, ArrowLeft } from "lucide-react";
import { useTicketForm } from '@/hooks/useTicketForm';
import { ticketsApi } from '@/lib/api-client';

type TicketStatus = 'idle' | 'submitting' | 'success' | 'error' | 'processing';

interface Ticket {
  id: string;
  description: string;
  priority: 'Low' | 'Medium' | 'High';
  status: string;
  created_at: string;
  resolved_at?: string;
}

const processingSteps = [
  '🔍 Checking memory for similar issues...',
  '📋 Analyzing ticket structure...',
  '🛠️ Routing to appropriate agent...',
  '⚡ Executing diagnostic/resolution...',
  '💾 Storing resolution in memory...',
];

export default function DemoPage() {
  const router = useRouter();
  const [activeStep, setActiveStep] = useState(-1);
  const [ticket, setTicket] = useState<any>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingError, setProcessingError] = useState<string | null>(null);
  
  const {
    submitTicket,
    isSubmitting,
    error: submitError,
  } = useTicketForm();

  const handleSubmit = async (data: { description: string; priority: string }) => {
    try {
      setProcessingError(null);
      const newTicket = await submitTicket(data);
      setTicket(newTicket);
      
      // Start processing animation
      setIsProcessing(true);
      
      // Animate through processing steps
      for (let i = 0; i < processingSteps.length; i++) {
        setActiveStep(i);
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
      
      // Process the ticket
      const { error: processError } = await ticketsApi.process(newTicket.id);
      
      if (processError) {
        throw new Error(processError);
      }
      
      // Get updated ticket status
      const { data: updatedTicket } = await ticketsApi.getById(newTicket.id);
      setTicket(updatedTicket);
    } catch (err) {
      console.error('Error processing ticket:', err);
      setProcessingError(err instanceof Error ? err.message : 'Failed to process ticket');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto space-y-8">
        <Button 
          variant="ghost" 
          className="mb-4"
          onClick={() => router.push('/')}
        >
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Home
        </Button>
        
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">
            MAESTRO Demo
          </h1>
          <p className="text-xl text-gray-400">
            Submit an IT ticket and watch MAESTRO handle it automatically
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Ticket Form */}
          <Card className="border-gray-800 bg-gray-900/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-2xl">Submit IT Ticket</CardTitle>
              <CardDescription>
                Describe your IT issue and MAESTRO will handle the rest
              </CardDescription>
            </CardHeader>
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              handleSubmit({
                description: formData.get('description') as string,
                priority: formData.get('priority') as string,
              });
            }}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="priority" className="text-sm font-medium">
                    Priority
                  </label>
                  <Select 
                    name="priority"
                    defaultValue="Medium"
                    disabled={isSubmitting || isProcessing}
                  >
                    <SelectTrigger className="bg-gray-800 border-gray-700">
                      <SelectValue placeholder="Select priority" />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-700">
                      <SelectItem value="Low">Low</SelectItem>
                      <SelectItem value="Medium">Medium</SelectItem>
                      <SelectItem value="High">High</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label htmlFor="description" className="text-sm font-medium">
                    Description
                  </label>
                  <Textarea
                    id="description"
                    name="description"
                    placeholder="Example: I'm facing an issue where I cannot access 'demo-superop-bucket' in AWS account 'XXXXXXXXXX'"
                    className="min-h-[200px] bg-gray-800 border-gray-700"
                    disabled={isSubmitting || isProcessing}
                    required
                  />
                </div>

                {(submitError || processingError) && (
                  <Alert variant="destructive" className="border-red-900 bg-red-900/20">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>{submitError || processingError}</AlertDescription>
                  </Alert>
                )}

                {ticket?.status === 'Resolved' && (
                  <Alert className="border-green-900 bg-green-900/20">
                    <CheckCircle className="h-4 w-4" />
                    <AlertTitle>Ticket Processed Successfully!</AlertTitle>
                    <AlertDescription>
                      Ticket ID: {ticket.id} has been resolved.
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
              <CardFooter>
                <Button 
                  type="submit" 
                  className="w-full"
                  disabled={isSubmitting || isProcessing}
                >
                  {isSubmitting || isProcessing ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {isSubmitting ? 'Submitting...' : 'Processing...'}
                    </>
                  ) : (
                    'Submit Ticket'
                  )}
                </Button>
              </CardFooter>
            </form>
          </Card>

          {/* Processing Status */}
          <Card className="border-gray-800 bg-gray-900/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-2xl">Workflow Progress</CardTitle>
              <CardDescription>
                {!ticket 
                  ? 'Submit a ticket to see the workflow in action'
                  : isProcessing 
                    ? 'MAESTRO is processing your ticket...'
                    : 'Ticket processing complete'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {!ticket ? (
                  <div className="text-center py-8 text-gray-500">
                    <Terminal className="mx-auto h-12 w-12 mb-4 text-gray-600" />
                    <p>No active ticket. Submit a ticket to see the workflow in action.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="p-4 bg-gray-800/50 rounded-lg">
                      <h3 className="font-medium mb-2">Ticket Details</h3>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div className="text-gray-400">ID:</div>
                        <div className="font-mono">{ticket.id}</div>
                        <div className="text-gray-400">Status:</div>
                        <div className="flex items-center">
                          <span className={`inline-block w-2 h-2 rounded-full mr-2 ${
                            ticket.status === 'Resolved' ? 'bg-green-500' : 'bg-yellow-500'
                          }`}></span>
                          {ticket.status || 'Pending'}
                        </div>
                        <div className="text-gray-400">Priority:</div>
                        <div>{ticket.priority}</div>
                        <div className="text-gray-400">Created:</div>
                        <div>{new Date(ticket.created_at).toLocaleString()}</div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <h4 className="font-medium">Processing Steps</h4>
                      <div className="space-y-2">
                        {processingSteps.map((step, index) => (
                          <div 
                            key={index} 
                            className={`flex items-start transition-opacity duration-300 ${
                              index <= activeStep ? 'opacity-100' : 'opacity-40'
                            }`}
                          >
                            <CheckCircle 
                              className={`h-5 w-5 mr-2 mt-0.5 flex-shrink-0 ${
                                index <= activeStep ? 'text-green-500' : 'text-gray-600'
                              }`} 
                            />
                            <span className={index <= activeStep ? 'text-white' : 'text-gray-500'}>
                              {step}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
