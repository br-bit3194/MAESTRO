'use client';

import { useState, useRef, useEffect } from 'react';
import { ticketApi } from '@/lib/api';
import { config } from '@/config';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, CheckCircle2, Upload, X, FileText } from 'lucide-react';

type Priority = 'low' | 'medium' | 'high' | 'critical';
type Category = 'network' | 'storage' | 'compute' | 'security' | 'other';

type Attachment = {
  id: string;
  name: string;
  size: number;
  type: string;
  previewUrl?: string;
};

export function SubmitTicket() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<Priority>('medium');
  const [category, setCategory] = useState<Category>('other');
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<{ success: boolean; message: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newAttachments: Attachment[] = [];

    Array.from(files).forEach(file => {
      const attachment: Attachment = {
        id: Math.random().toString(36).substr(2, 9),
        name: file.name,
        size: file.size,
        type: file.type,
      };

      // Create preview for images
      if (file.type.startsWith('image/')) {
        attachment.previewUrl = URL.createObjectURL(file);
      }

      newAttachments.push(attachment);
    });

    setAttachments(prev => [...prev, ...newAttachments]);
  };

  const removeAttachment = (id: string) => {
    setAttachments(prev => {
      // Revoke object URL to prevent memory leaks
      const attachment = prev.find(a => a.id === id);
      if (attachment?.previewUrl) {
        URL.revokeObjectURL(attachment.previewUrl);
      }
      return prev.filter(att => att.id !== id);
    });
  };

  // Clean up object URLs when component unmounts
  useEffect(() => {
    return () => {
      attachments.forEach(attachment => {
        if (attachment.previewUrl) {
          URL.revokeObjectURL(attachment.previewUrl);
        }
      });
    };
  }, [attachments]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim() || !description.trim()) {
      setSubmitStatus({
        success: false,
        message: 'Please fill in all required fields.'
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      const formData = new FormData();
      formData.append('title', title);
      formData.append('description', description);
      formData.append('priority', priority);
      formData.append('category', category);
      
      // Append files if any
      if (fileInputRef.current?.files) {
        const files = Array.from(fileInputRef.current.files);
        for (let i = 0; i < files.length; i++) {
          formData.append('files', files[i]);
        }
      }
      
      const { data } = await ticketApi.submitTicket(formData);
      
      if (!data) {
        throw new Error('Failed to submit ticket: No data received');
      }
      
      // Reset form
      setTitle('');
      setDescription('');
      setPriority('medium');
      setCategory('other');
      setAttachments([]);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      
      setSubmitStatus({
        success: true,
        message: `Ticket submitted successfully! Your ticket ID is ${data.ticket_id}`
      });
    } catch (error) {
      console.error('Error submitting ticket:', error);
      setSubmitStatus({
        success: false,
        message: error.response?.data?.detail || 'Failed to submit ticket. Please try again.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' bytes';
    else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    else return (bytes / 1048576).toFixed(1) + ' MB';
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">📋 Submit a New Ticket</h2>
        <p className="text-muted-foreground">
          Fill out the form below to submit a new support ticket. Our team will get back to you shortly.
        </p>
      </div>

      {submitStatus && (
        <Alert variant={submitStatus.success ? 'default' : 'destructive'}>
          {submitStatus.success ? (
            <CheckCircle2 className="h-4 w-4" />
          ) : (
            <AlertCircle className="h-4 w-4" />
          )}
          <AlertTitle>{submitStatus.success ? 'Success!' : 'Error'}</AlertTitle>
          <AlertDescription>{submitStatus.message}</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Ticket Details</CardTitle>
          <CardDescription>
            Provide detailed information about your issue to help us assist you better.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  Title <span className="text-destructive">*</span>
                </label>
                <Input
                  placeholder="Briefly describe the issue"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  disabled={isSubmitting}
                />
              </div>
              
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                <div className="space-y-2">
                  <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                    Priority
                  </label>
                  <Select 
                    value={priority} 
                    onValueChange={(value) => setPriority(value as Priority)}
                    disabled={isSubmitting}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="critical">Critical</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                    Category
                  </label>
                  <Select 
                    value={category} 
                    onValueChange={(value) => setCategory(value as Category)}
                    disabled={isSubmitting}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="network">Network</SelectItem>
                      <SelectItem value="storage">Storage</SelectItem>
                      <SelectItem value="compute">Compute</SelectItem>
                      <SelectItem value="security">Security</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                Description <span className="text-destructive">*</span>
              </label>
              <Textarea
                placeholder="Please provide a detailed description of the issue..."
                className="min-h-[150px]"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={isSubmitting}
              />
              <p className="text-xs text-muted-foreground">
                Include error messages, steps to reproduce, and any relevant details.
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                Attachments
              </label>
              <div className="flex items-center justify-center w-full">
                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-muted/50 hover:bg-muted/70 transition-colors">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <Upload className="w-8 h-8 mb-2 text-muted-foreground" />
                    <p className="mb-2 text-sm text-muted-foreground">
                      <span className="font-semibold">Click to upload</span> or drag and drop
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Images, PDFs, or documents (max. 5MB)
                    </p>
                  </div>
                  <input 
                    type="file" 
                    className="hidden" 
                    multiple 
                    accept="image/*,.pdf,.doc,.docx,.txt"
                    onChange={handleFileUpload}
                    ref={fileInputRef}
                    disabled={isSubmitting}
                  />
                </label>
              </div>
              
              {attachments.length > 0 && (
                <div className="mt-2 space-y-2">
                  {attachments.map(attachment => (
                    <div key={attachment.id} className="border rounded-md overflow-hidden">
                      {attachment.previewUrl ? (
                        <div className="relative group">
                          <div className="bg-gray-50 flex items-center justify-center overflow-auto max-h-64">
                            <img
                              src={attachment.previewUrl}
                              alt={attachment.name}
                              className="max-w-full max-h-64 object-contain"
                              onLoad={(e) => {
                                // Optional: You can add any onLoad logic here
                                const img = e.target as HTMLImageElement;
                                console.log(`Image loaded: ${img.naturalWidth}x${img.naturalHeight}`);
                              }}
                            />
                          </div>
                          <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button
                              type="button"
                              variant="destructive"
                              size="icon"
                              onClick={(e) => {
                                e.stopPropagation();
                                removeAttachment(attachment.id);
                              }}
                              className="h-8 w-8 rounded-full"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                          <div className="p-2">
                            <p className="text-xs font-medium text-gray-700 truncate">{attachment.name}</p>
                            <p className="text-xs text-gray-500">
                              {(attachment.size / 1024).toFixed(1)} KB
                            </p>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between p-2 bg-gray-50">
                          <div className="flex items-center space-x-2">
                            <FileText className="h-4 w-4 text-gray-500" />
                            <div>
                              <p className="text-sm font-medium text-gray-700 truncate max-w-[180px]">
                                {attachment.name}
                              </p>
                              <p className="text-xs text-gray-500">
                                {(attachment.size / 1024).toFixed(1)} KB
                              </p>
                            </div>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeAttachment(attachment.id)}
                            className="h-6 w-6 p-0 text-gray-500 hover:text-red-500"
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex justify-end pt-4">
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Submitting...' : 'Submit Ticket'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
