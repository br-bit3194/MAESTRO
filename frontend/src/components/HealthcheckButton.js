import React, { useState } from 'react';

const HealthcheckButton = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [lastRun, setLastRun] = useState(null);

  const handleRunHealthcheck = () => {
    setIsLoading(true);
    
    // Simulate API call delay
    setTimeout(() => {
      setIsLoading(false);
      setLastRun(new Date().toLocaleTimeString());
    }, 2000);
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-gray-800">Health Check</h2>
        {lastRun && (
          <span className="text-sm text-gray-500">
            Last run: {lastRun}
          </span>
        )}
      </div>
      
      <div className="text-center">
        <button
          onClick={handleRunHealthcheck}
          disabled={isLoading}
          className={`inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white transition-colors duration-200 ${
            isLoading
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500'
          }`}
        >
          {isLoading ? (
            <>
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Running Health Check...
            </>
          ) : (
            <>
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Run Health Check
            </>
          )}
        </button>
        
        <p className="mt-3 text-sm text-gray-500">
          {isLoading 
            ? 'Checking all services and system health...' 
            : 'Click to run a comprehensive health check of all services'
          }
        </p>
      </div>
    </div>
  );
};

export default HealthcheckButton;
