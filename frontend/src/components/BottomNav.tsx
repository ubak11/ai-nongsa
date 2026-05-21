import React from 'react';
import { Home, Camera, BookOpen, BarChart2, Settings } from 'lucide-react';

interface BottomNavProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const tabs = [
  { id: 'home', label: '홈', Icon: Home },
  { id: 'diagnosis', label: '진단', Icon: Camera },
  { id: 'log', label: '일지', Icon: BookOpen },
  { id: 'report', label: '보고서', Icon: BarChart2 },
  { id: 'settings', label: '설정', Icon: Settings },
];

const BottomNav: React.FC<BottomNavProps> = ({ activeTab, onTabChange }) => {
  return (
    <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] bg-white border-t border-gray-100 pb-safe z-50">
      <div className="flex items-stretch">
        {tabs.map(({ id, label, Icon }) => {
          const isActive = activeTab === id;
          return (
            <button
              key={id}
              onClick={() => onTabChange(id)}
              className="flex-1 flex flex-col items-center justify-center py-2 min-h-[56px] relative focus:outline-none"
              aria-label={label}
              aria-current={isActive ? 'page' : undefined}
            >
              <Icon
                size={22}
                className={isActive ? 'text-green-500' : 'text-gray-400'}
                strokeWidth={isActive ? 2.5 : 1.8}
              />
              <span
                className={`text-[11px] mt-0.5 font-medium ${
                  isActive ? 'text-green-500' : 'text-gray-400'
                }`}
              >
                {label}
              </span>
              {isActive && (
                <span className="absolute bottom-1.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-green-500" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;
