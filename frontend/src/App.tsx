import React, { useState } from 'react';
import Dashboard from './screens/Dashboard';
import Diagnosis from './screens/Diagnosis';
import FarmLog from './screens/FarmLog';
import Report from './screens/Report';
import Settings from './screens/Settings';
import BottomNav from './components/BottomNav';
import { FarmLogEntry, FarmSettings } from './types';
import { mockFarmLog, mockFarmSettings } from './utils/mockData';

type Tab = 'home' | 'diagnosis' | 'log' | 'report' | 'settings';

function App() {
  const [activeTab, setActiveTab] = useState<Tab>('home');
  const [logEntries, setLogEntries] = useState<FarmLogEntry[]>(mockFarmLog);
  const [farmSettings, setFarmSettings] = useState<FarmSettings>(mockFarmSettings);

  function handleAddLogEntry(entry: FarmLogEntry) {
    setLogEntries(prev => [entry, ...prev]);
    setActiveTab('log');
  }

  const renderScreen = () => {
    switch (activeTab) {
      case 'home': return <Dashboard province={farmSettings.province} district={farmSettings.district} farmerName={farmSettings.farmerName} />;
      case 'diagnosis': return <Diagnosis onSaveToLog={handleAddLogEntry} />;
      case 'log': return <FarmLog entries={logEntries} />;
      case 'report': return <Report />;
      case 'settings': return <Settings settings={farmSettings} onSave={setFarmSettings} />;
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
