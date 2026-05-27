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

function wmoCondition(code: number): WeatherData['condition'] {
  if (code <= 1) return 'sunny';
  if (code <= 3 || (code >= 45 && code <= 48)) return 'cloudy';
  if ((code >= 71 && code <= 77) || code === 85 || code === 86) return 'cloudy';
  return 'cloudy';
}

function wmoText(code: number): string {
  if (code === 0) return '맑음';
  if (code === 1) return '주로 맑음';
  if (code === 2) return '구름 조금';
  if (code === 3) return '흐림';
  if (code >= 45 && code <= 48) return '안개';
  if (code >= 51 && code <= 57) return '이슬비';
  if (code >= 61 && code <= 67) return '비';
  if (code >= 71 && code <= 77) return '눈';
  if (code >= 80 && code <= 82) return '소나기';
  if (code >= 95) return '천둥번개';
  return '흐림';
}

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

interface Props {
  province: string;
  district: string;
  farmerName: string;
}

const Dashboard: React.FC<Props> = ({ province, district, farmerName }) => {
  const [weather, setWeather] = useState<WeatherData>({ ...mockWeather, location: `${province} ${district}` });
  const [weatherLoading, setWeatherLoading] = useState(false);
  const pestRisk: PestRisk = mockPestRisk;

  const [tasks, setTasks] = useState<DailyTask[]>(() =>
    mockTasks.map((t: DailyTask) => ({ ...t }))
  );
  const [toastVisible, setToastVisible] = useState(false);
  const [toastTimer, setToastTimer] = useState<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function fetchWeather() {
      setWeatherLoading(true);
      try {
        const geoRes = await fetch(
          `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(district)}&count=1&language=ko&country_code=KR`
        );
        const geoData = await geoRes.json();
        if (!geoData.results?.[0]) return;
        const { latitude, longitude } = geoData.results[0];

        const wxRes = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code&timezone=Asia%2FSeoul`
        );
        const wxData = await wxRes.json();
        const c = wxData.current;

        if (!cancelled) {
          setWeather({
            temperature: Math.round(c.temperature_2m),
            humidity: c.relative_humidity_2m,
            windSpeed: Math.round(c.wind_speed_10m * 10) / 10,
            condition: wmoCondition(c.weather_code),
            conditionText: wmoText(c.weather_code),
            location: `${province} ${district}`,
            date: new Date().toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'short' }),
          });
        }
      } catch {
        if (!cancelled) setWeather(prev => ({ ...prev, location: `${province} ${district}` }));
      } finally {
        if (!cancelled) setWeatherLoading(false);
      }
    }
    fetchWeather();
    return () => { cancelled = true; };
  }, [province, district]);

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
            <h1 className="text-white text-xl font-bold mt-0.5">{farmerName} 농부</h1>
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
              <p className="text-gray-500 text-xs flex items-center gap-1">
                {weather.location}
                {weatherLoading && <span className="inline-block w-2.5 h-2.5 border-2 border-gray-300 border-t-green-500 rounded-full animate-spin" />}
              </p>
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
