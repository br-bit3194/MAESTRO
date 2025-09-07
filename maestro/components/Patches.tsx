
import React from 'react';
import Card from './Card';
import { MOCK_PATCHES } from '../constants';
import { Patch, PatchUrgency } from '../types';

const getUrgencyColor = (urgency: PatchUrgency) => {
    switch (urgency) {
        case PatchUrgency.Critical:
            return 'border-red-500 text-red-300';
        case PatchUrgency.Security:
            return 'border-yellow-500 text-yellow-300';
        case PatchUrgency.Optional:
            return 'border-blue-500 text-blue-300';
    }
};

const getStatusPill = (status: 'Pending' | 'Scheduled' | 'Applied') => {
    switch (status) {
        case 'Pending':
            return <span className="px-2 py-1 text-xs font-semibold text-yellow-300 bg-yellow-500/20 rounded-full">Pending</span>;
        case 'Scheduled':
            return <span className="px-2 py-1 text-xs font-semibold text-blue-300 bg-blue-500/20 rounded-full">Scheduled</span>;
        case 'Applied':
            return <span className="px-2 py-1 text-xs font-semibold text-green-300 bg-green-500/20 rounded-full">Applied</span>;
    }
};

const Patches: React.FC = () => {
    return (
        <div>
            <h2 className="text-3xl font-bold mb-6 text-white">Patch Management</h2>
            <Card>
                <div className="space-y-4">
                    {MOCK_PATCHES.map((patch: Patch) => (
                        <div key={patch.id} className={`p-4 bg-gray-700/50 rounded-lg flex items-center justify-between border-l-4 ${getUrgencyColor(patch.urgency)}`}>
                            <div>
                                <p className="font-bold text-lg text-white">{patch.description}</p>
                                <p className="text-sm text-gray-400">{patch.id} for <span className="font-medium text-gray-300">{patch.deviceName}</span></p>
                                <span className={`text-sm font-semibold`}>AI Urgency: {patch.urgency}</span>
                            </div>
                            <div className="flex items-center space-x-4">
                                {getStatusPill(patch.status)}
                                {patch.status === 'Pending' && (
                                    <>
                                        <button className="bg-gray-600 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded-lg transition">Schedule</button>
                                        <button className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 px-4 rounded-lg transition">Apply Now</button>
                                    </>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </Card>
        </div>
    );
};

export default Patches;
