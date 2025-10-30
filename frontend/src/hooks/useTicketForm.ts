import { useState } from 'react';
import { ticketsApi } from '@/lib/api-client';

export const useTicketForm = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ticket, setTicket] = useState<any>(null);

  const submitTicket = async (data: { description: string; priority: string }) => {
    setIsSubmitting(true);
    setError(null);
    
    try {
      const { data: newTicket, error } = await ticketsApi.create(data);
      
      if (error) {
        throw new Error(error);
      }
      
      setTicket(newTicket);
      return newTicket;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to submit ticket';
      setError(errorMessage);
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    submitTicket,
    isSubmitting,
    error,
    ticket,
  };
};
