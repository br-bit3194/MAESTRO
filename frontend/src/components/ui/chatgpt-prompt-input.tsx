'use client';

import * as React from "react";
import * as TooltipPrimitive from "@radix-ui/react-tooltip";
import * as PopoverPrimitive from "@radix-ui/react-popover";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { cn } from "@/lib/utils";

// --- SVG Icon Components ---
const PlusIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
    <path d="M12 5V19" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M5 12H19" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const Settings2Icon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M20 7h-9" />
    <path d="M14 17H5" />
    <circle cx="17" cy="17" r="3" />
    <circle cx="7" cy="7" r="3" />
  </svg>
);

const SendIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
    <path d="M12 5.25L12 18.75" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M18.75 12L12 5.25L5.25 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const XIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

const MicIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path>
    <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
    <line x1="12" y1="19" x2="12" y2="23"></line>
  </svg>
);

// --- The Final, Self-Contained PromptBox Component ---
interface PromptBoxProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  onSend?: (message: string) => void;
  isLoading?: boolean;
}

export const PromptBox = React.forwardRef<HTMLTextAreaElement, PromptBoxProps>(
  ({ className, onSend, isLoading, ...props }, ref) => {
    const internalTextareaRef = React.useRef<HTMLTextAreaElement>(null);
    const fileInputRef = React.useRef<HTMLInputElement>(null);
    const [value, setValue] = React.useState("");
    const [image, setImage] = React.useState<File | null>(null);
    const [imagePreview, setImagePreview] = React.useState<string | null>(null);
    const [isImageDialogOpen, setIsImageDialogOpen] = React.useState(false);
    
    React.useImperativeHandle(ref, () => internalTextareaRef.current!, []);
    
    React.useLayoutEffect(() => { 
      const textarea = internalTextareaRef.current; 
      if (textarea) { 
        textarea.style.height = "auto"; 
        const newHeight = Math.min(textarea.scrollHeight, 200); 
        textarea.style.height = `${newHeight}px`; 
      } 
    }, [value]);
    
    const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => { 
      setValue(e.target.value); 
      if (props.onChange) props.onChange(e); 
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSend();
      }
    };

    const handleSend = () => {
      if ((!value || value.trim() === '') && !imagePreview) return;
      
      if (onSend) {
        onSend(value);
      }
      
      // Reset the input
      setValue('');
      setImagePreview(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    };
    
    const handlePlusClick = () => { 
      fileInputRef.current?.click(); 
    };
    
    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => { 
      const file = event.target.files?.[0]; 
      if (file && file.type.startsWith("image/")) { 
        const reader = new FileReader(); 
        reader.onloadend = () => { 
          setImagePreview(reader.result as string); 
        }; 
        reader.readAsDataURL(file); 
      } 
      event.target.value = ""; 
    };
    
    const handleRemoveImage = (e: React.MouseEvent<HTMLButtonElement>) => { 
      e.stopPropagation(); 
      setImagePreview(null); 
      if(fileInputRef.current) { 
        fileInputRef.current.value = ""; 
      } 
    };
    
    const hasValue = value.trim().length > 0 || imagePreview;

    return (
      <div className={cn("flex flex-col rounded-[28px] p-2 shadow-sm transition-colors bg-white border dark:bg-[#303030] dark:border-transparent cursor-text", className)}>
        <input 
          type="file" 
          ref={fileInputRef} 
          onChange={handleFileChange} 
          className="hidden" 
          accept="image/*"
        />
        
        {imagePreview && ( 
          <div className="relative mb-1 w-fit rounded-[1rem] px-1 pt-1">
            <button 
              type="button" 
              className="transition-transform" 
              onClick={() => setIsImageDialogOpen(true)}
            >
              <img 
                src={imagePreview} 
                alt="Image preview" 
                className="h-14.5 w-14.5 rounded-[1rem]" 
              />
            </button>
            <button 
              onClick={handleRemoveImage} 
              className="absolute right-2 top-2 z-10 flex h-4 w-4 items-center justify-center rounded-full bg-white/50 dark:bg-[#303030] text-black dark:text-white transition-colors hover:bg-accent dark:hover:bg-[#515151]" 
              aria-label="Remove image"
            >
              <XIcon className="h-4 w-4" />
            </button>
          </div>
        )}
        
        <div className="flex items-center gap-2">
          <textarea 
            ref={(node) => {
              internalTextareaRef.current = node;
              if (typeof ref === 'function') {
                ref(node);
              } else if (ref) {
                ref.current = node;
              }
            }}
            rows={1} 
            value={value} 
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder="Message..." 
            className="flex-1 resize-none border-0 bg-transparent p-3 text-foreground dark:text-white placeholder:text-muted-foreground dark:placeholder:text-gray-300 focus:ring-0 focus-visible:outline-none min-h-12 max-h-48 overflow-y-auto" 
            disabled={isLoading}
            {...props} 
          />
          
          <button
            type="button"
            onClick={handleSend}
            disabled={!hasValue || isLoading}
            className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
              hasValue && !isLoading 
                ? 'bg-black text-white hover:bg-black/80 dark:bg-white dark:text-black dark:hover:bg-white/80' 
                : 'bg-gray-200 text-gray-400 dark:bg-gray-700 dark:text-gray-500 cursor-not-allowed'
            }`}
          >
            {isLoading ? (
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
            ) : (
              <SendIcon className="h-5 w-5" />
            )}
            <span className="sr-only">Send message</span>
          </button>
        </div>
        
        <div className="mt-0.5 p-1 pt-0">
          <div className="flex items-center gap-2">
            <button 
              type="button" 
              onClick={handlePlusClick} 
              className="flex h-8 w-8 items-center justify-center rounded-full text-foreground dark:text-white transition-colors hover:bg-accent dark:hover:bg-[#515151] focus-visible:outline-none"
              disabled={isLoading}
            >
              <PlusIcon className="h-5 w-5" />
              <span className="sr-only">Attach image</span>
            </button>
            <div className="flex-1" />
          </div>
        </div>

        <DialogPrimitive.Root open={isImageDialogOpen} onOpenChange={setIsImageDialogOpen}>
          <DialogPrimitive.Portal>
            <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
            <DialogPrimitive.Content className="fixed left-[50%] top-[50%] z-50 grid w-full max-w-[90vw] md:max-w-[800px] translate-x-[-50%] translate-y-[-50%] gap-4 border-none bg-transparent p-0 shadow-none duration-300 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95">
              <div className="relative bg-card dark:bg-[#303030] rounded-[24px] overflow-hidden shadow-2xl p-1">
                {imagePreview && (
                  <img 
                    src={imagePreview} 
                    alt="Full size preview" 
                    className="w-full max-h-[95vh] object-contain rounded-[24px]" 
                  />
                )}
                <DialogPrimitive.Close className="absolute right-3 top-3 z-10 rounded-full bg-background/50 dark:bg-[#303030] p-1 hover:bg-accent dark:hover:bg-[#515151] transition-all">
                  <XIcon className="h-5 w-5 text-muted-foreground dark:text-gray-200 hover:text-foreground dark:hover:text-white" />
                  <span className="sr-only">Close</span>
                </DialogPrimitive.Close>
              </div>
            </DialogPrimitive.Content>
          </DialogPrimitive.Portal>
        </DialogPrimitive.Root>
      </div>
    );
  }
);

PromptBox.displayName = "PromptBox";

// Demo component for testing
interface PromptBoxDemoProps {
  onSubmit?: (message: string) => void;
  isLoading?: boolean;
}

export function PromptBoxDemo({ onSubmit, isLoading }: PromptBoxDemoProps) {
  const handleSubmit = (message: string) => {
    console.log('Message submitted:', message);
    if (onSubmit) {
      onSubmit(message);
    }
  };

  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-center bg-background dark:bg-[#212121] p-4">
      <div className="w-full max-w-xl flex flex-col gap-10">
        <p className="text-center text-3xl text-foreground">
          How Can I Help You
        </p>
        <PromptBox 
          onSend={handleSubmit} 
          isLoading={isLoading}
          className="w-full"
        />
      </div>
    </div>
  );
}
