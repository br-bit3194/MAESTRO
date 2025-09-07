
import React from 'react';
import { View } from '../types';
import { ICONS } from '../constants';

interface SidebarProps {
    currentView: View;
    setCurrentView: (view: View) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentView, setCurrentView }) => {
    const navItems = Object.values(View);

    return (
        <aside className="w-64 bg-gray-800 flex flex-col p-4 border-r border-gray-700">
            <div className="flex items-center mb-10">
                <div className="bg-teal-500 p-2 rounded-lg mr-3">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M12 6V3m0 18v-3" /></svg>
                </div>
                <h1 className="text-2xl font-bold text-white">MAESTRO</h1>
            </div>
            <nav className="flex-1">
                <ul>
                    {navItems.map((view) => (
                        <li key={view}>
                            <a
                                href="#"
                                onClick={(e) => {
                                    e.preventDefault();
                                    setCurrentView(view);
                                }}
                                className={`flex items-center p-3 my-2 rounded-lg transition-colors ${
                                    currentView === view
                                        ? 'bg-teal-500 text-white'
                                        : 'text-gray-400 hover:bg-gray-700 hover:text-white'
                                }`}
                            >
                                <span className="mr-4">{ICONS[view.replace(/\s/g, '') as keyof typeof ICONS]}</span>
                                {view}
                            </a>
                        </li>
                    ))}
                </ul>
            </nav>
            <div className="mt-auto text-center text-gray-600 text-sm">
                <p>&copy; 2025 MAESTRO</p>
                <p>v1.0.0</p>
            </div>
        </aside>
    );
};

export default Sidebar;