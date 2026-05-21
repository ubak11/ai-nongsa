import React, { useState, useEffect } from 'react';
import {
  Sun,
  Cloud,
  Droplets,
  Wind,
  AlertTriangle,
  CheckCircle2,
  Circle,
  Clock,
  Bell,
} from 'lucide-react';
import { DailyTask, WeatherData, PestRisk } from '../types';
import { mockWeather, mockTasks, mockPestRisk } from '../utils/mockData';

// ── Toast ────────────────────────────────────────────────────────────────────

interface ToastProps {
  visible: boolean;
  message: string;
}

const Toast: React.FC<ToastProps> = ({ visible, message }) => (
  <div
    className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 transition-all duration-300 ${
      visible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2 pointer-events-none'
    }`}
  >
    <div className="bg-gray-800 text-white text-sm font-medium px-4 py-2.5 rounded-full shadow-lg whitespace-nowrap">
      {message}
    </div>
  </div>
);

// ── Priority badge ────────────────────────────────────────────────────────────

const priorityStyles: Record<DailyTask['priority'], string> = {
  high: 'bg-red-100 text-red-600',
  medium: 'bg-orange-100 text-orange-500',
  low: 'bg-gray-100 text-gray-500',
};

const priorityLabels: Record<DailyTask['priority'], string> = {
  high: '높음',
  medium: '보통',
  low: '낮음',
};

// ── Weather helpers ───────────────────────────────────────────────────────────

const WeatherIcon: React.FC<{ condition: string }> = ({ condition }) => {
  if (condition === 'sunny') return <Sun size={40} className="text-yellow-400" />;
  return <Cloud size={40} className="text-blue-300" />;
};

// ── Risk level dots ───────────────────────────────────────────────────────────

const RiskDots: React.FC<{ level: number }> = ({ level }) => (
  <div className="flex gap-1">
    {Array.from({ length: 5 }).map((_, i) => (
      <span
        key={i}
        className={`inline-block w-3 h-3 rounded-full ${
          i < level ? 'bg-orange-400' : 'bg-orange-100'
        }`}
      />
    ))}
  </div>
);

// ── Dashboard ─────────────────────────────────────────────────────────────────

const Dashboard: React.FC = () => {
  const weather: WeatherData = mockWeather;
  const pestRisk: PestRisk = mockPestRisk;

  const [tasks, setTasks] = useState<DailyTask[]>(() =>
    mockTasks.map((t: DailyTask) => ({ ...t }))
  );
  const [toastVisible, setToastVisible] = useState(false);
  const [toastTimer, setToastTimer] = useState<ReturnType<typeof setTimeout> | null>(null);

  const showToast = () => {
    if (toastTimer) clearTimeout(toastTimer);
    setToastVisible(true);
    const id = setTimeout(() => setToastVisible(false), 2000);
    setToastTimer(id);
  };

  useEffect(() => () => { if (toastTimer) clearTimeout(toastTimer); }, [toastTimer]);

  const toggleTask = (id: DailyTask['id']) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id !== id) return t;
        const next = { ...t, isCompleted: !t.isCompleted };
        if (next.isCompleted) showToast();
        return next;
      })
    );
  };

  const completedCount = tasks.filter((t) => t.isCompleted).length;

  const today = new Date().toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'short',
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <Toast visible={toastVisible} message="참 잘하셨어요! ✓" />

      {/* ── Header ── */}
      <header style={{ backgroundColor: '#4CAF50' }} className="px-4 pt-10 pb-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-green-100 text-sm font-medium">ai 농사</p>
            <h1 className="text-white text-xl font-bold mt-0.5">김지훈 농부</h1>
          </div>
          <button className="relative p-2 rounded-full bg-white/20 active:bg-white/30 transition-colors">
            <Bell size={22} className="text-white" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-400 border-2 border-transparent" />
          </button>
        </div>
      </header>

      <div className="px-4 py-4 space-y-4 pb-24">
        {/* ── Weather card ── */}
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <div className="flex items-start justify-between mb-3">
            <div>
              <p className="text-gray-500 text-xs">{weather.location}</p>
              <p className="text-gray-400 text-xs mt-0.5">{today}</p>
            </div>
            <WeatherIcon condition={weather.condition} />
          </div>
          <p className="text-gray-700 text-sm font-medium mb-3">{weather.conditionText}</p>
          <div className="flex gap-4">
            <div className="flex items-center gap-1.5">
              <Sun size={15} className="text-yellow-400" />
              <span className="text-gray-600 text-sm font-semibold">{weather.temperature}°C</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Droplets size={15} className="text-blue-400" />
              <span className="text-gray-600 text-sm">{weather.humidity}%</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Wind size={15} className="text-gray-400" />
              <span className="text-gray-600 text-sm">{weather.windSpeed}m/s</span>
            </div>
          </div>
        </div>

        {/* ── Pest risk card ── */}
        <div className="bg-orange-50 border border-orange-100 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle size={18} style={{ color: '#FF9800' }} />
            <span className="font-semibold text-orange-700 text-sm">병해충 위험도</span>
          </div>
          <div className="flex items-center justify-between mb-2">
            <RiskDots level={pestRisk.level} />
            <span className="text-orange-500 text-xs font-medium">{pestRisk.level} / 5</span>
          </div>
          <p className="text-orange-800 text-sm font-semibold mb-1">
            주요 위협: {pestRisk.mainThreat}
          </p>
          <p className="text-orange-600 text-xs leading-relaxed">{pestRisk.description}</p>
          {pestRisk.preventionTip && (
            <p className="mt-2 text-orange-500 text-xs bg-orange-100 rounded-lg px-3 py-2">
              예방 팁: {pestRisk.preventionTip}
            </p>
          )}
        </div>

        {/* ── Today's tasks ── */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-gray-800 font-bold text-base">오늘의 할 일</h2>
            <span className="text-gray-400 text-xs">
              {completedCount}/{tasks.length} 완료
            </span>
          </div>

          <div className="space-y-2.5">
            {tasks.map((task) => (
              <div
                key={task.id}
                className={`bg-white rounded-2xl p-4 shadow-sm border transition-colors ${
                  task.isCompleted ? 'border-green-100 opacity-70' : 'border-transparent'
                }`}
              >
                <div className="flex items-start gap-3">
                  <button
                    onClick={() => toggleTask(task.id)}
                    className="mt-0.5 flex-shrink-0 focus:outline-none"
                    aria-label={task.isCompleted ? '완료 취소' : '완료 표시'}
                  >
                    {task.isCompleted ? (
                      <CheckCircle2 size={22} className="text-green-500" />
                    ) : (
                      <Circle size={22} className="text-gray-300" />
                    )}
                  </button>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span
                        className={`text-sm font-semibold ${
                          task.isCompleted ? 'line-through text-gray-400' : 'text-gray-800'
                        }`}
                      >
                        {task.title}
                      </span>
                      <span
                        className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${
                          priorityStyles[task.priority]
                        }`}
                      >
                        {priorityLabels[task.priority]}
                      </span>
                    </div>
                    {task.description && (
                      <p className="text-gray-400 text-xs mt-0.5 leading-relaxed">
                        {task.description}
                      </p>
                    )}
                    {task.timeEstimate && (
                      <div className="flex items-center gap-1 mt-1.5">
                        <Clock size={11} className="text-gray-300" />
                        <span className="text-gray-400 text-[11px]">{task.timeEstimate}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
