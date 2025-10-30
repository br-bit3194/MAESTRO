'use client';

import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Search, Trash2, AlertCircle, FileText, Clock, Tag } from 'lucide-react';

type Memory = {
  id: string;
  content: string;
  timestamp: string;
  tags: string[];
  type: 'ticket' | 'knowledge' | 'resolution';
};

export function MemoryExplorer() {
  const [searchQuery, setSearchQuery] = useState('');
  const [memories, setMemories] = useState<Memory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedType, setSelectedType] = useState<string>('all');

  // Simulated API call to fetch memories
  useEffect(() => {
    const fetchMemories = async () => {
      try {
        // TODO: Replace with actual API call
        await new Promise(resolve => setTimeout(resolve, 800));
        
        // Mock data
        const mockMemories: Memory[] = [
          {
            id: '1',
            content: 'Resolved S3 bucket permission issue for customer-uploads',
            timestamp: '2025-10-30T14:30:00Z',
            tags: ['aws', 's3', 'permissions'],
            type: 'ticket'
          },
          {
            id: '2',
            content: 'Documentation: Steps to configure VPC peering',
            timestamp: '2025-10-29T10:15:00Z',
            tags: ['aws', 'vpc', 'networking', 'documentation'],
            type: 'knowledge'
          },
          {
            id: '3',
            content: 'Resolution for 503 errors on the API gateway',
            timestamp: '2025-10-28T16:45:00Z',
            tags: ['api', 'troubleshooting', 'errors'],
            type: 'resolution'
          }
        ];
        
        setMemories(mockMemories);
      } catch (error) {
        console.error('Error fetching memories:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMemories();
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

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h2 className="text-2xl font-bold">🧠 Memory Explorer</h2>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <FileText className="h-4 w-4 mr-2" />
            Export All
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search memories..."
                className="pl-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <select
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
            >
              <option value="all">All Types</option>
              <option value="ticket">Tickets</option>
              <option value="knowledge">Knowledge</option>
              <option value="resolution">Resolutions</option>
            </select>
          </div>
        </CardHeader>
        
        <CardContent>
          {/* Tags filter */}
          <div className="flex flex-wrap gap-2 mb-6">
            {allTags.map(tag => (
              <Button
                key={tag}
                variant={selectedTags.includes(tag) ? 'default' : 'outline'}
                size="sm"
                onClick={() => toggleTag(tag)}
                className="h-8"
              >
                <Tag className="h-3 w-3 mr-1" />
                {tag}
              </Button>
            ))}
          </div>

          {/* Memories list */}
          {isLoading ? (
            <div className="flex justify-center items-center h-40">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : filteredMemories.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <AlertCircle className="h-12 w-12 mx-auto mb-4 opacity-20" />
              <p>No memories found matching your search criteria.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredMemories.map(memory => (
                <Card key={memory.id} className="overflow-hidden">
                  <div className="p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="px-2 py-0.5 text-xs rounded-full bg-primary/10 text-primary">
                            {getTypeLabel(memory.type)}
                          </span>
                          <span className="text-xs text-muted-foreground flex items-center">
                            <Clock className="h-3 w-3 mr-1" />
                            {formatDate(memory.timestamp)}
                          </span>
                        </div>
                        <p className="text-sm">{memory.content}</p>
                      </div>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {memory.tags.map(tag => (
                        <span 
                          key={tag} 
                          className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
