
import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import Systems from './components/Systems';
import Patches from './components/Patches';
import Alerts from './components/Alerts';
import Helpdesk from './components/Helpdesk';
import KnowledgeBase from './components/KnowledgeBase';
import { View } from './types';

const App: React.FC = () => {
    const [currentView, setCurrentView] = useState<View>(View.Dashboard);

    const renderView = () => {
        switch (currentView) {
            case View.Dashboard:
                return <Dashboard />;
            case View.Systems:
                return <Systems />;
            case View.Patches:
                return <Patches />;
            case View.Alerts:
                return <Alerts />;
            case View.Helpdesk:
                return <Helpdesk />;
            case View.KnowledgeBase:
                return <KnowledgeBase />;
            default:
                return <Dashboard />;
        }
    };

    return (
        <div className="flex h-screen bg-gray-900 text-gray-200 font-sans">
            <Sidebar currentView={currentView} setCurrentView={setCurrentView} />
            <main className="flex-1 p-8 overflow-y-auto">
                {renderView()}
            </main>
        </div>
    );
};

export default App;
