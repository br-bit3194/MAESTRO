import { useState } from 'react';
import { ticketsApi } from '@/lib/api-client';

export const useTicketForm = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ticket, setTicket] = useState<any>(null);

  const submitTicket = async (formData: FormData) => {
    setIsSubmitting(true);
    setError(null);
    
    try {
      const { data: newTicket, error } = await ticketsApi.create(formData);
      
      if (error) {
        throw new Error(error);
      }
      
      setTicket(newTicket);
      return newTicket;
    } catch (err: any) {
      const errorMessage = err?.response?.data?.error || 
                         err?.message || 
                         'Failed to submit ticket';
      setError(errorMessage);
      throw new Error(errorMessage);
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
