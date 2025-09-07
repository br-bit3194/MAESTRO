
import React from 'react';
import Card from './Card';
import { MOCK_DEVICES } from '../constants';
import { Device } from '../types';

const getStatusColor = (status: 'Up-to-date' | 'Pending' | 'Enabled' | 'Active' | 'Disabled' | 'Inactive') => {
    switch (status) {
        case 'Up-to-date':
        case 'Enabled':
        case 'Active':
            return 'bg-green-500/20 text-green-300';
        case 'Pending':
            return 'bg-yellow-500/20 text-yellow-300';
        case 'Disabled':
        case 'Inactive':
            return 'bg-red-500/20 text-red-300';
        default:
            return 'bg-gray-500/20 text-gray-300';
    }
};

const UsageBar: React.FC<{ value: number }> = ({ value }) => {
    const getColor = () => {
        if (value > 80) return 'bg-red-500';
        if (value > 60) return 'bg-yellow-500';
        return 'bg-teal-500';
    };
    return (
        <div className="w-full bg-gray-700 rounded-full h-2.5">
            <div className={`${getColor()} h-2.5 rounded-full`} style={{ width: `${value}%` }}></div>
        </div>
    );
};


const Systems: React.FC = () => {
    return (
        <div>
            <h2 className="text-3xl font-bold mb-6 text-white">Systems Monitoring</h2>
            <Card>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="border-b border-gray-700 text-gray-400">
                            <tr>
                                <th className="p-4">Name</th>
                                <th className="p-4">OS</th>
                                <th className="p-4">Uptime</th>
                                <th className="p-4">Patch Level</th>
                                <th className="p-4">CPU</th>
                                <th className="p-4">Memory</th>
                                <th className="p-4">Disk</th>
                                <th className="p-4">Security</th>
                            </tr>
                        </thead>
                        <tbody>
                            {MOCK_DEVICES.map((device: Device) => (
                                <tr key={device.id} className="border-b border-gray-700 hover:bg-gray-700/50">
                                    <td className="p-4 font-medium">{device.name}<p className="text-xs text-gray-500">{device.id}</p></td>
                                    <td className="p-4">{device.os} {device.osVersion}</td>
                                    <td className="p-4">{device.uptime}</td>
                                    <td className="p-4">
                                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(device.patchLevel)}`}>
                                            {device.patchLevel}
                                        </span>
                                    </td>
                                    <td className="p-4 w-32"><UsageBar value={device.cpuUsage} /></td>
                                    <td className="p-4 w-32"><UsageBar value={device.memUsage} /></td>
                                    <td className="p-4 w-32"><UsageBar value={device.diskUsage} /></td>
                                    <td className="p-4">
                                        <div className="flex flex-col space-y-1">
                                            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(device.security.antivirus)}`}>
                                                AV: {device.security.antivirus}
                                            </span>
                                             <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(device.security.firewall)}`}>
                                                FW: {device.security.firewall}
                                            </span>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    );
};

export default Systems;
