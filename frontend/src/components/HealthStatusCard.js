import React from 'react';

const HealthStatusCard = () => {
  // Dummy data for health status
  const healthData = {
    overall: 'healthy',
    uptime: '2h 34m 12s',
    services: [
      { name: 'Ticket Service', status: 'healthy', port: 8001, responseTime: '12ms' },
      { name: 'Healthcheck Service', status: 'healthy', port: 8002, responseTime: '8ms' },
      { name: 'Memory Service', status: 'healthy', port: 8003, responseTime: '15ms' },
      { name: 'Orchestrator Service', status: 'healthy', port: 8004, responseTime: '22ms' },
      { name: 'Sandbox Service', status: 'healthy', port: 8005, responseTime: '18ms' }
    ],
    systemInfo: {
      cpu: '23%',
      memory: '1.2GB / 8GB',
      disk: '45%'
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'healthy':
        return 'text-green-600 bg-green-100';
      case 'unhealthy':
        return 'text-red-600 bg-red-100';
      case 'warning':
        return 'text-yellow-600 bg-yellow-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-gray-800">Health Status</h2>
        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(healthData.overall)}`}>
          {healthData.overall.toUpperCase()}
        </span>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Services Status */}
        <div>
          <h3 className="text-lg font-medium text-gray-700 mb-3">Services</h3>
          <div className="space-y-2">
            {healthData.services.map((service, index) => (
              <div key={index} className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded">
                <div className="flex items-center space-x-3">
                  <div className={`w-2 h-2 rounded-full ${service.status === 'healthy' ? 'bg-green-500' : 'bg-red-500'}`}></div>
                  <span className="text-sm font-medium text-gray-700">{service.name}</span>
                  <span className="text-xs text-gray-500">:{service.port}</span>
                </div>
                <span className="text-xs text-gray-500">{service.responseTime}</span>
              </div>
            ))}
          </div>
        </div>

        {/* System Info */}
        <div>
          <h3 className="text-lg font-medium text-gray-700 mb-3">System Resources</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">CPU Usage</span>
              <span className="text-sm font-medium text-gray-800">{healthData.systemInfo.cpu}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Memory</span>
              <span className="text-sm font-medium text-gray-800">{healthData.systemInfo.memory}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Disk Usage</span>
              <span className="text-sm font-medium text-gray-800">{healthData.systemInfo.disk}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Uptime</span>
              <span className="text-sm font-medium text-gray-800">{healthData.uptime}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HealthStatusCard;
