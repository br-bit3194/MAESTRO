
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';
import Card from './Card';

const ticketDeflectionData = [
  { name: 'Jan', AI_Solved: 400, Human: 240 },
  { name: 'Feb', AI_Solved: 300, Human: 139 },
  { name: 'Mar', AI_Solved: 500, Human: 380 },
  { name: 'Apr', AI_Solved: 478, Human: 290 },
  { name: 'May', AI_Solved: 589, Human: 480 },
  { name: 'Jun', AI_Solved: 639, Human: 430 },
];

const mttrData = [
  { name: 'Jan', MTTR: 120 },
  { name: 'Feb', MTTR: 110 },
  { name: 'Mar', MTTR: 95 },
  { name: 'Apr', MTTR: 80 },
  { name: 'May', MTTR: 72 },
  { name: 'Jun', MTTR: 65 },
];


const Dashboard: React.FC = () => {
    return (
        <div>
            <h2 className="text-3xl font-bold mb-6 text-white">Dashboard</h2>

            {/* Metric Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                <Card className="bg-gradient-to-br from-blue-500 to-blue-600">
                    <h4 className="text-lg text-blue-100">Ticket Deflection</h4>
                    <p className="text-4xl font-bold text-white">68%</p>
                    <p className="text-blue-200">+5% this month</p>
                </Card>
                <Card className="bg-gradient-to-br from-teal-400 to-teal-500">
                    <h4 className="text-lg text-teal-100">MTTR Reduction</h4>
                    <p className="text-4xl font-bold text-white">42%</p>
                    <p className="text-teal-200">Avg. 65 mins</p>
                </Card>
                <Card className="bg-gradient-to-br from-purple-500 to-purple-600">
                    <h4 className="text-lg text-purple-100">Agent Efficiency</h4>
                    <p className="text-4xl font-bold text-white">75%</p>
                     <p className="text-purple-200">Time saved on triage</p>
                </Card>
                <Card className="bg-gradient-to-br from-yellow-500 to-yellow-600">
                    <h4 className="text-lg text-yellow-100">KB Growth</h4>
                    <p className="text-4xl font-bold text-white">122</p>
                     <p className="text-yellow-200">New articles this month</p>
                </Card>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card title="Ticket Resolution Volume">
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={ticketDeflectionData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#4a4a4a" />
                            <XAxis dataKey="name" stroke="#9a9a9a" />
                            <YAxis stroke="#9a9a9a" />
                            <Tooltip contentStyle={{ backgroundColor: '#2d2d2d', border: '1px solid #4a4a4a' }} />
                            <Legend />
                            <Bar dataKey="AI_Solved" fill="#14b8a6" name="AI Solved" />
                            <Bar dataKey="Human" fill="#3b82f6" name="Human Escalation" />
                        </BarChart>
                    </ResponsiveContainer>
                </Card>
                <Card title="Mean Time To Resolution (MTTR) in Minutes">
                    <ResponsiveContainer width="100%" height={300}>
                         <LineChart data={mttrData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#4a4a4a" />
                            <XAxis dataKey="name" stroke="#9a9a9a" />
                            <YAxis stroke="#9a9a9a" />
                            <Tooltip contentStyle={{ backgroundColor: '#2d2d2d', border: '1px solid #4a4a4a' }} />
                            <Legend />
                            <Line type="monotone" dataKey="MTTR" stroke="#8b5cf6" strokeWidth={2} name="MTTR (mins)" />
                        </LineChart>
                    </ResponsiveContainer>
                </Card>
            </div>
        </div>
    );
};

export default Dashboard;
