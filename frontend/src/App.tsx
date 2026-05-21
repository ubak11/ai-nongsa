import React, { useState } from 'react';
import Dashboard from './screens/Dashboard';
import Diagnosis from './screens/Diagnosis';
import FarmLog from './screens/FarmLog';
import Report from './screens/Report';
import Settings from './screens/Settings';
import BottomNav from './components/BottomNav';

type Tab = 'home' | 'diagnosis' | 'log' | 'report' | 'settings';

function App() {
  const [activeTab, setActiveTab] = useState<Tab>('home');

  const renderScreen = () => {
    switch (activeTab) {
      case 'home': return <Dashboard />;
      case 'diagnosis': return <Diagnosis />;
      case 'log': return <FarmLog />;
      case 'report': return <Report />;
      case 'settings': return <Settings />;
    }
  };

  return (
    <div className="relative min-h-screen bg-gray-50">
      <div className="pb-16">
        {renderScreen()}
      </div>
      <BottomNav activeTab={activeTab} onTabChange={(tab) => setActiveTab(tab as Tab)} />
    </div>
  );
}

export default App;
