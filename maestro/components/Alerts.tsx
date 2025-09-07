
import React from 'react';
import Card from './Card';
import { MOCK_ALERTS } from '../constants';
import { Alert, AlertSeverity } from '../types';

const getSeverityColor = (severity: AlertSeverity) => {
    switch (severity) {
        case AlertSeverity.Critical:
            return 'border-red-500 text-red-300';
        case AlertSeverity.High:
            return 'border-yellow-500 text-yellow-300';
        case AlertSeverity.Medium:
            return 'border-blue-500 text-blue-300';
        case AlertSeverity.Low:
            return 'border-gray-500 text-gray-400';
    }
};

const Alerts: React.FC = () => {
    return (
        <div>
            <h2 className="text-3xl font-bold mb-6 text-white">Alert Management</h2>
             <Card>
                <div className="space-y-4">
                    {MOCK_ALERTS.map((alert: Alert) => (
                         <div key={alert.id} className={`p-4 bg-gray-700/50 rounded-lg border-l-4 ${getSeverityColor(alert.severity)}`}>
                            <div className="flex justify-between items-start">
                                <div>
                                    <div className="flex items-center space-x-3">
                                        <span className="font-semibold">{alert.severity}</span>
                                        <h4 className="text-lg font-bold text-white">{alert.title}</h4>
                                        {alert.count > 1 && <span className="text-xs bg-gray-600 text-gray-300 px-2 py-1 rounded-full">{alert.count} instances</span>}
                                    </div>
                                    <p className="text-sm text-gray-400">{alert.source} &bull; {alert.timestamp}</p>
                                </div>
                                <div className="flex space-x-2">
                                    <button className="text-sm bg-gray-600 hover:bg-gray-500 text-white font-bold py-1 px-3 rounded-lg transition">Acknowledge</button>
                                    <button className="text-sm bg-blue-600 hover:bg-blue-500 text-white font-bold py-1 px-3 rounded-lg transition">Create Ticket</button>
                                </div>
                            </div>
                            <div className="mt-3 p-3 bg-gray-800 rounded-lg">
                                <p><span className="font-semibold text-gray-400">AI Summary:</span> {alert.summary}</p>
                                <p className="mt-1"><span className="font-semibold text-gray-400">AI Suggested Remediation:</span> <span className="font-mono text-teal-300">{alert.remediation}</span></p>
                            </div>
                        </div>
                    ))}
                </div>
            </Card>
        </div>
    );
};

export default Alerts;
