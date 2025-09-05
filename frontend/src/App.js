import React from 'react';
import HealthStatusCard from './components/HealthStatusCard';
import TicketsTable from './components/TicketsTable';
import HealthcheckButton from './components/HealthcheckButton';

function App() {
  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">MAESTRO</h1>
              <p className="text-sm text-gray-600 mt-1">
                Multi-Agent Enterprise Service Transformation & Resolution Orchestrator
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm text-gray-600">All Systems Operational</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {/* Health Status and Health Check Button */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <HealthStatusCard />
            </div>
            <div>
              <HealthcheckButton />
            </div>
          </div>

          {/* Tickets Table */}
          <div>
            <TicketsTable />
          </div>

          {/* Service Status Overview */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Service Overview</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              {[
                { name: 'Ticket Service', port: 8001, status: 'Running' },
                { name: 'Healthcheck Service', port: 8002, status: 'Running' },
                { name: 'Memory Service', port: 8003, status: 'Running' },
                { name: 'Orchestrator Service', port: 8004, status: 'Running' },
                { name: 'Sandbox Service', port: 8005, status: 'Running' }
              ].map((service, index) => (
                <div key={index} className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="w-3 h-3 bg-green-500 rounded-full mx-auto mb-2"></div>
                  <h3 className="font-medium text-gray-900 text-sm">{service.name}</h3>
                  <p className="text-xs text-gray-500">Port {service.port}</p>
                  <p className="text-xs text-green-600 font-medium">{service.status}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center text-sm text-gray-500">
            <p>MAESTRO Dashboard - SuperHacks 2025</p>
            <p className="mt-1">All services running on ports 8001-8005</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
