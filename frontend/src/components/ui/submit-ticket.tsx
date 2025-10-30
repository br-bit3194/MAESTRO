'use client';

import { useState, useRef } from 'react';
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

    const newAttachments = Array.from(files).map(file => ({
      id: Math.random().toString(36).substr(2, 9),
      name: file.name,
      size: file.size,
      type: file.type
    }));

    setAttachments(prev => [...prev, ...newAttachments]);
  };

  const removeAttachment = (id: string) => {
    setAttachments(prev => prev.filter(att => att.id !== id));
  };

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
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Reset form
      setTitle('');
      setDescription('');
      setPriority('medium');
      setCategory('other');
      setAttachments([]);
      
      setSubmitStatus({
        success: true,
        message: 'Ticket submitted successfully! Your ticket ID is #' + Math.floor(1000 + Math.random() * 9000)
      });
    } catch (error) {
      setSubmitStatus({
        success: false,
        message: 'Failed to submit ticket. Please try again.'
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
              
              <div className="grid grid-cols-2 gap-4">
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
              <div className="flex items-center gap-2">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  className="hidden"
                  multiple
                  disabled={isSubmitting}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isSubmitting}
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Add Files
                </Button>
                <span className="text-sm text-muted-foreground">
                  {attachments.length} file{attachments.length !== 1 ? 's' : ''} attached
                </span>
              </div>
              
              {attachments.length > 0 && (
                <div className="mt-2 space-y-2">
                  {attachments.map((file) => (
                    <div 
                      key={file.id}
                      className="flex items-center justify-between p-2 border rounded-md text-sm"
                    >
                      <div className="flex items-center gap-2">
                        <div className="h-8 w-8 flex items-center justify-center bg-muted rounded">
                          <FileText className="h-4 w-4" />
                        </div>
                        <div>
                          <div className="font-medium">{file.name}</div>
                          <div className="text-xs text-muted-foreground">
                            {formatFileSize(file.size)}
                          </div>
                        </div>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => removeAttachment(file.id)}
                        disabled={isSubmitting}
                      >
                        <X className="h-4 w-4" />
                      </Button>
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
