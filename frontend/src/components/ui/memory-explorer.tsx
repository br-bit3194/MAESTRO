'use client';

import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Search, Trash2, AlertCircle, FileText, Clock, Tag, Ticket } from 'lucide-react';

type Ticket = {
  ticket_id: string;
  description: string;
  status: string;
  priority: string;
  created_at: string;
  updated_at?: string;
  resolved_at?: string;
  summary?: string;
};

type Memory = {
  id: string;
  content: string;
  timestamp: string;
  tags: string[];
  type: 'ticket' | 'knowledge' | 'resolution';
  status?: string;
  priority?: string;
};

export function MemoryExplorer() {
  const [searchQuery, setSearchQuery] = useState('');
  const [memories, setMemories] = useState<Memory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedType, setSelectedType] = useState<string>('all');

  // Fetch tickets from the backend
  useEffect(() => {
    const fetchTickets = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const response = await fetch('/api/tickets');
        
        if (!response.ok) {
          throw new Error(`Failed to fetch tickets: ${response.statusText}`);
        }
        
        const tickets: Ticket[] = await response.json();
        
        // Transform tickets to memories and take the 10 most recent
        const recentTickets = tickets
          .sort((a, b) => 
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
          )
          .slice(0, 10)
          .map(ticket => ({
            id: ticket.ticket_id,
            content: ticket.summary || ticket.description,
            timestamp: ticket.updated_at || ticket.created_at,
            tags: [
              ticket.priority?.toLowerCase(),
              ticket.status?.toLowerCase(),
              ...(ticket.resolved_at ? ['resolved'] : ['active'])
            ].filter(Boolean) as string[],
            type: 'ticket' as const,
            status: ticket.status,
            priority: ticket.priority
          }));
        
        setMemories(recentTickets);
      } catch (err) {
        console.error('Error fetching tickets:', err);
        setError('Failed to load tickets. Please try again later.');
        
        // Fallback to empty array to prevent UI breaking
        setMemories([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTickets();
  }, []);

  const filteredMemories = memories.filter(memory => {
    const matchesSearch = memory.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      memory.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesType = selectedType === 'all' || memory.type === selectedType;
    
    const matchesTags = selectedTags.length === 0 || 
      selectedTags.every(tag => memory.tags.includes(tag));
    
    return matchesSearch && matchesType && matchesTags;
  });

  const allTags = Array.from(new Set(memories.flatMap(memory => memory.tags)));
  
  const toggleTag = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'ticket': return 'Ticket';
      case 'knowledge': return 'Knowledge';
      case 'resolution': return 'Resolution';
      default: return type;
    }
  };

  const getPriorityColor = (priority?: string) => {
    if (!priority) return 'bg-gray-100 text-gray-800';
    switch (priority.toLowerCase()) {
      case 'high': return 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300';
      case 'medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300';
      case 'low': return 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
    }
  };

  const getStatusColor = (status?: string) => {
    if (!status) return 'bg-gray-100 text-gray-800';
    switch (status.toLowerCase()) {
      case 'resolved':
      case 'closed':
        return 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300';
      case 'in progress':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300';
      case 'open':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
    }
  };

  const formatRelativeTime = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
    return date.toLocaleDateString();
  };

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">🎫 Recent Tickets</h2>
        </div>
        <Card>
          <CardContent className="pt-6 text-center">
            <AlertCircle className="h-12 w-12 mx-auto mb-4 text-red-500" />
            <p className="text-red-500 mb-4">{error}</p>
            <Button 
              variant="outline" 
              onClick={() => window.location.reload()}
            >
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">🎫 Recent Tickets</h2>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">
            Showing {filteredMemories.length} of {memories.length} tickets
          </span>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-0">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search tickets by description or ID..."
                className="pl-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <select
              className="flex h-10 w-full sm:w-48 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="open">Open</option>
              <option value="in progress">In Progress</option>
              <option value="resolved">Resolved</option>
              <option value="closed">Closed</option>
            </select>
          </div>
        </CardHeader>
        
        <CardContent className="pt-6">
          {/* Tags filter */}
          {allTags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-6">
              {allTags.map(tag => (
                <Button
                  key={tag}
                  variant={selectedTags.includes(tag) ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => toggleTag(tag)}
                  className="h-8 text-xs"
                >
                  <Tag className="h-3 w-3 mr-1" />
                  {tag}
                </Button>
              ))}
            </div>
          )}

          {/* Tickets list */}
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : filteredMemories.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Ticket className="h-12 w-12 mx-auto mb-4 opacity-20" />
              <p>No tickets found matching your search criteria.</p>
              {searchQuery && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="mt-2"
                  onClick={() => setSearchQuery('')}
                >
                  Clear search
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {filteredMemories.map((ticket) => {
                // Ensure we have a valid ID to use as key and for display
                const ticketId = ticket.id || `ticket-${Math.random().toString(36).substring(2, 10)}`;
                const displayId = ticket.id ? `#${ticket.id.substring(0, 8)}` : '#unknown';
                
                return (
                  <Card key={ticketId} className="overflow-hidden hover:shadow-md transition-shadow">
                    <div className="p-4">
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <span className={`px-2 py-0.5 text-xs rounded-full ${getStatusColor(ticket.status)}`}>
                              {ticket.status || 'Unknown Status'}
                            </span>
                            <span className={`px-2 py-0.5 text-xs rounded-full ${getPriorityColor(ticket.priority)}`}>
                              {ticket.priority || 'No Priority'}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {displayId}
                            </span>
                          </div>
                          <h3 className="font-medium text-sm sm:text-base">
                            {ticket.content}
                          </h3>
                        </div>
                        <div className="flex items-center gap-2 sm:flex-col sm:items-end">
                          <span className="text-xs text-muted-foreground whitespace-nowrap">
                            {formatRelativeTime(ticket.timestamp)}
                          </span>
                          <Button variant="ghost" size="icon" className="h-8 w-8 ml-auto">
                            <FileText className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      
                      {ticket.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2 pt-2 border-t">
                          {ticket.tags.map(tag => (
                            <span 
                              key={tag} 
                              className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
