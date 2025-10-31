'use client';

import { useState, useRef, useEffect } from 'react';
import { SidebarDemo } from "@/components/ui/sidebar";
import { DashboardMetrics } from "@/components/ui/dashboard-metrics";
import { ChatInterface } from "@/components/ui/chat-interface";
import { AnalyticsDashboard } from "@/components/ui/analytics-dashboard";
import { SubmitTicket } from "@/components/ui/submit-ticket";
import { MemoryExplorer } from "@/components/ui/memory-explorer";
import { ChevronLeft, ChevronRight } from 'lucide-react';

export type ActiveView = 'dashboard' | 'chat' | 'analytics' | 'submit-ticket' | 'memory-explorer' | 'export';

export default function HomeLayout() {
  const [activeView, setActiveView] = useState<ActiveView>('dashboard');
  const handleViewChange = (view: string) => {
    setActiveView(view as ActiveView);
  };
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const mainContentRef = useRef<HTMLDivElement>(null);
  const sidebarRef = useRef<HTMLDivElement>(null);

  // Scroll to top whenever the active view changes
  useEffect(() => {
    // Use requestAnimationFrame to ensure the DOM is ready
    const scrollToTop = () => {
      if (mainContentRef.current) {
        mainContentRef.current.scrollTop = 0;
      }
      window.scrollTo(0, 0);
    };
    
    // Small delay to ensure the content is rendered
    const timer = setTimeout(scrollToTop, 10);
    return () => clearTimeout(timer);
  }, [activeView]);

  const renderContent = () => {
    switch (activeView) {
      case 'dashboard':
        return <DashboardMetrics />;
      case 'chat':
        return <ChatInterface />;
      case 'analytics':
        return <AnalyticsDashboard />;
      case 'submit-ticket':
        return <SubmitTicket />;
      case 'memory-explorer':
        return <MemoryExplorer />;
      case 'export':
        return (
          <div className="p-6">
            <h1 className="text-2xl font-bold mb-6">Export Data</h1>
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow">
              <p>Export functionality will be implemented here.</p>
            </div>
          </div>
        );
      default:
        return <DashboardMetrics />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      <div className="flex h-screen">
        {/* Mobile sidebar */}
        <div className="md:hidden">
          <SidebarDemo
            activeView={activeView}
            onViewChange={handleViewChange}
            open={sidebarOpen}
            setOpen={setSidebarOpen}
          />
        </div>

        {/* Desktop sidebar with hover behavior */}
        <div 
          className="hidden md:flex"
          onMouseEnter={() => {
            setIsHovered(true);
            setSidebarOpen(true);
          }}
          onMouseLeave={() => {
            setIsHovered(false);
            setSidebarOpen(false);
          }}
          ref={sidebarRef}
        >
          <SidebarDemo
            activeView={activeView}
            onViewChange={handleViewChange}
            open={sidebarOpen}
            isHovered={isHovered}
          />
        </div>

        {/* Main content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Mobile menu button */}
          <div className="md:hidden fixed top-4 left-4 z-50">
            <button
              type="button"
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-500 hover:text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              <span className="sr-only">Toggle sidebar</span>
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>

          {/* Content area */}
          <main 
            ref={mainContentRef}
            id="main-content"
            className={`flex-1 relative overflow-y-auto focus:outline-none bg-white dark:bg-gray-900 transition-all duration-300 ease-in-out ${
              sidebarOpen ? 'md:ml-64' : 'md:ml-20'
            }`}
            style={{ 
              scrollBehavior: 'smooth',
              marginLeft: 'auto',
              width: sidebarOpen ? 'calc(100% - 16rem)' : 'calc(100% - 5rem)'
            }}
          >
            <div className="p-4 md:p-6">
              {renderContent()}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
