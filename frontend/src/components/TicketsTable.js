import React from 'react';

const TicketsTable = () => {
  // Static dummy data for tickets
  const tickets = [
    {
      id: 1,
      title: 'Application crashes on startup',
      description: 'The application crashes immediately after launching on Windows 10',
      priority: 'high',
      status: 'open',
      category: 'bug',
      assigned_to: 'John Doe',
      created_at: '2024-01-15T10:30:00Z',
      updated_at: '2024-01-15T10:30:00Z'
    },
    {
      id: 2,
      title: 'Feature request: Dark mode',
      description: 'Users are requesting a dark mode option for better accessibility',
      priority: 'medium',
      status: 'in_progress',
      category: 'enhancement',
      assigned_to: 'Jane Smith',
      created_at: '2024-01-14T14:20:00Z',
      updated_at: '2024-01-15T09:15:00Z'
    },
    {
      id: 3,
      title: 'Database connection timeout',
      description: 'Database connections are timing out during peak hours',
      priority: 'high',
      status: 'open',
      category: 'bug',
      assigned_to: null,
      created_at: '2024-01-15T08:45:00Z',
      updated_at: '2024-01-15T08:45:00Z'
    },
    {
      id: 4,
      title: 'User authentication issue',
      description: 'Some users cannot log in with their credentials',
      priority: 'medium',
      status: 'resolved',
      category: 'bug',
      assigned_to: 'Mike Johnson',
      created_at: '2024-01-13T16:10:00Z',
      updated_at: '2024-01-14T11:30:00Z'
    },
    {
      id: 5,
      title: 'Performance optimization needed',
      description: 'The dashboard loads slowly with large datasets',
      priority: 'low',
      status: 'open',
      category: 'performance',
      assigned_to: null,
      created_at: '2024-01-12T12:00:00Z',
      updated_at: '2024-01-12T12:00:00Z'
    }
  ];

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
        return 'text-red-600 bg-red-100';
      case 'medium':
        return 'text-yellow-600 bg-yellow-100';
      case 'low':
        return 'text-green-600 bg-green-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'open':
        return 'text-blue-600 bg-blue-100';
      case 'in_progress':
        return 'text-orange-600 bg-orange-100';
      case 'resolved':
        return 'text-green-600 bg-green-100';
      case 'closed':
        return 'text-gray-600 bg-gray-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-gray-800">Tickets</h2>
        <span className="text-sm text-gray-500">{tickets.length} total tickets</span>
      </div>
      
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                ID
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Title
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Priority
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Assigned To
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Created
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {tickets.map((ticket) => (
              <tr key={ticket.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  #{ticket.id}
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm font-medium text-gray-900">{ticket.title}</div>
                  <div className="text-sm text-gray-500 truncate max-w-xs">{ticket.description}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPriorityColor(ticket.priority)}`}>
                    {ticket.priority}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(ticket.status)}`}>
                    {ticket.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {ticket.assigned_to || 'Unassigned'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {formatDate(ticket.created_at)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TicketsTable;
