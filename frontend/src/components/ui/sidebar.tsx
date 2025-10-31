"use client";

import { cn } from "@/lib/utils";
import Link, { LinkProps } from "next/link";
import React, { useState, createContext, useContext } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { 
  LayoutDashboard, 
  MessageSquare, 
  BarChart2, 
  PlusCircle, 
  Brain, 
  Download,
  Menu, 
  X,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import Image from "next/image";

interface Links {
  label: string;
  href: string;
  icon: React.JSX.Element | React.ReactNode;
}

interface SidebarContextProps {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  animate: boolean;
}

const SidebarContext = createContext<SidebarContextProps | undefined>(
  undefined
);

export const useSidebar = () => {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error("useSidebar must be used within a SidebarProvider");
  }
  return context;
};

export const SidebarProvider = ({
  children,
  open: openProp,
  setOpen: setOpenProp,
  animate = true,
}: {
  children: React.ReactNode;
  open?: boolean;
  setOpen?: React.Dispatch<React.SetStateAction<boolean>>;
  animate?: boolean;
}) => {
  const [openState, setOpenState] = useState(false);

  const open = openProp !== undefined ? openProp : openState;
  const setOpen = setOpenProp !== undefined ? setOpenProp : setOpenState;

  return (
    <SidebarContext.Provider value={{ open, setOpen, animate }}>
      {children}
    </SidebarContext.Provider>
  );
};

export const Sidebar = ({
  children,
  open,
  setOpen,
  animate,
}: {
  children: React.ReactNode;
  open?: boolean;
  setOpen?: React.Dispatch<React.SetStateAction<boolean>>;
  animate?: boolean;
}) => {
  return (
    <SidebarProvider open={open} setOpen={setOpen} animate={animate}>
      {children}
    </SidebarProvider>
  );
};

export const SidebarBody = (props: React.ComponentProps<typeof motion.div>) => {
  return (
    <>
      <DesktopSidebar {...props} />
      <MobileSidebar {...(props as React.ComponentProps<"div">)} />
    </>
  );
};

export const DesktopSidebar = ({
  className,
  children,
  ...props
}: React.ComponentProps<typeof motion.div>) => {
  const { open, setOpen, animate } = useSidebar();
  return (
    <motion.div
      className={cn(
        "h-full px-4 py-4 hidden md:flex md:flex-col bg-neutral-100 dark:bg-neutral-800 w-[300px] flex-shrink-0",
        className
      )}
      animate={{
        width: animate ? (open ? "300px" : "60px") : "300px",
      }}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      {...props}
    >
      {children}
    </motion.div>
  );
};

export const MobileSidebar = ({
  className,
  children,
  ...props
}: React.ComponentProps<"div">) => {
  const { open, setOpen } = useSidebar();
  return (
    <>
      <div
        className={cn(
          "h-10 px-4 py-4 flex flex-row md:hidden items-center justify-between bg-neutral-100 dark:bg-neutral-800 w-full"
        )}
        {...props}
      >
        <div className="flex justify-end z-20 w-full">
          <Menu
            className="text-neutral-800 dark:text-neutral-200 cursor-pointer"
            onClick={() => setOpen(!open)}
          />
        </div>
        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ x: "-100%", opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: "-100%", opacity: 0 }}
              transition={{
                duration: 0.3,
                ease: "easeInOut",
              }}
              className={cn(
                "fixed h-full w-full inset-0 bg-white dark:bg-neutral-900 p-10 z-[100] flex flex-col justify-between",
                className
              )}
            >
              <div
                className="absolute right-10 top-10 z-50 text-neutral-800 dark:text-neutral-200 cursor-pointer"
                onClick={() => setOpen(!open)}
              >
                <X />
              </div>
              {children}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
};

export const SidebarLink = ({
  link,
  className,
  ...props
}: {
  link: Links;
  className?: string;
  props?: LinkProps;
}) => {
  const { open, animate } = useSidebar();
  return (
    <Link
      href={link.href}
      className={cn(
        "flex items-center justify-start gap-2 group/sidebar py-2",
        className
      )}
      {...props}
    >
      {link.icon}
      <motion.span
        animate={{
          display: animate ? (open ? "inline-block" : "none") : "inline-block",
          opacity: animate ? (open ? 1 : 0) : 1,
        }}
        className="text-neutral-700 dark:text-neutral-200 text-sm group-hover/sidebar:translate-x-1 transition duration-150 whitespace-pre inline-block !p-0 !m-0"
      >
        {link.label}
      </motion.span>
    </Link>
  );
};

const Logo = () => {
  return (
    <Link
      href="#"
      className="font-normal flex space-x-2 items-center text-sm text-black py-1 relative z-20"
    >
      <div className="h-5 w-6 bg-black dark:bg-white rounded-br-lg rounded-tr-sm rounded-tl-lg rounded-bl-sm flex-shrink-0" />
      <motion.span
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="font-medium text-black dark:text-white whitespace-pre"
      >
        MAESTRO
      </motion.span>
    </Link>
  );
};

const LogoIcon = () => {
  return (
    <Link
      href="#"
      className="font-normal flex space-x-2 items-center text-sm text-black py-1 relative z-20"
    >
      <div className="h-5 w-6 bg-black dark:bg-white rounded-br-lg rounded-tr-sm rounded-tl-lg rounded-bl-sm flex-shrink-0" />
    </Link>
  );
};

import { Dispatch, SetStateAction } from 'react';

interface SidebarProps {
  activeView: string;
  onViewChange: (view: string) => void;
  open: boolean;
  isHovered?: boolean;
  setOpen?: (open: boolean) => void;
}

export function SidebarDemo({ activeView, onViewChange, open: isOpen, isHovered, setOpen }: SidebarProps) {
  const links = [
    { id: 'chat', label: 'Chat', icon: <MessageSquare className="h-5 w-5 flex-shrink-0" /> },
    { id: 'analytics', label: 'Analytics', icon: <BarChart2 className="h-5 w-5 flex-shrink-0" /> },
    { id: 'submit-ticket', label: 'Submit Ticket', icon: <PlusCircle className="h-5 w-5 flex-shrink-0" /> },
    { id: 'memory-explorer', label: 'Memory Explorer', icon: <Brain className="h-5 w-5 flex-shrink-0" /> },
    { id: 'export', label: 'Export Data', icon: <Download className="h-5 w-5 flex-shrink-0" /> },
  ];
  
  const handleLinkClick = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    onViewChange(id);
  };

  return (
    <div 
      className={`flex flex-col h-full bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transition-all duration-300 ease-in-out ${
        isOpen ? 'w-64' : 'w-20'
      }`}
    >
      {/* Logo */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
        {isOpen ? (
          <div className="flex items-center">
            <div className="h-8 w-8 bg-blue-500 rounded-md flex items-center justify-center text-white font-bold">M</div>
            <span className="ml-2 text-lg font-semibold text-gray-900 dark:text-white">MAESTRO</span>
          </div>
        ) : (
          <div className="w-8 h-8 bg-blue-500 rounded-md flex items-center justify-center text-white font-bold mx-auto">M</div>
        )}
        {setOpen && (
          <div className="absolute -right-3 top-4">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setOpen(!isOpen);
              }}
              className="p-1.5 rounded-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              {isOpen ? (
                <ChevronLeft className="h-4 w-4 text-gray-500 dark:text-gray-400" />
              ) : (
                <ChevronRight className="h-4 w-4 text-gray-500 dark:text-gray-400" />
              )}
            </button>
          </div>
        )}
        <button
          onClick={() => setOpen?.(!isOpen)}
          className="hidden md:block p-1 rounded-md text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
        >
          <span className="sr-only">{isOpen ? 'Collapse' : 'Expand'} sidebar</span>
          {isOpen ? (
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          ) : (
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          )}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-2">
        <div className="space-y-1">
          {links.map((link) => (
            <button
              key={link.id}
              onClick={(e) => {
                e.preventDefault();
                handleLinkClick(e, link.id);
              }}
              className={`group w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                activeView === link.id
                  ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300'
                  : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700/50'
              }`}
            >
              <span className="flex-shrink-0">{link.icon}</span>
              <span className={`ml-3 ${
                isOpen ? 'opacity-100' : 'opacity-0 w-0'
              } transition-all duration-200 whitespace-nowrap overflow-hidden`}>
                {link.label}
              </span>
            </button>
          ))}
        </div>
      </nav>

      {/* User profile */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center">
          <div className="h-8 w-8 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center flex-shrink-0">
            <span className="text-xs font-medium text-gray-700 dark:text-gray-200">U</span>
          </div>
          <div className={`ml-3 ${!isOpen ? 'opacity-0 w-0' : 'opacity-100'} transition-all duration-200 overflow-hidden`}>
            <p className="text-sm font-medium text-gray-700 dark:text-gray-200">User</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Admin</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// Dummy dashboard component with content
const Dashboard = () => {
  return (
    <div className="flex flex-1">
      <div className="p-2 md:p-10 rounded-tl-2xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 flex flex-col gap-2 flex-1 w-full h-full">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h2>
        <div className="flex gap-2 flex-wrap">
          {[...new Array(4)].map((_, i) => (
            <div
              key={"first-array" + i}
              className="h-20 w-full md:w-[calc(50%-0.5rem)] rounded-lg bg-gray-100 dark:bg-neutral-800 animate-pulse"
            ></div>
          ))}
        </div>
        <div className="flex gap-2 flex-1">
          {[...new Array(2)].map((_, i) => (
            <div
              key={"second-array" + i}
              className="h-full w-full rounded-lg bg-gray-100 dark:bg-neutral-800 animate-pulse"
            ></div>
          ))}
        </div>
      </div>
    </div>
  );
};
