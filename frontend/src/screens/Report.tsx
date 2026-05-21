import React from 'react';
import { BarChart2, Calendar, Leaf, TrendingUp, AlertTriangle } from 'lucide-react';
import { FarmSettings, FarmLogEntry } from '../types';
import { mockFarmSettings, mockFarmLog } from '../utils/mockData';

const stages = [
  { label: '육묘기', pct: 0 },
  { label: '영양생장기', pct: 20 },
  { label: '개화기', pct: 50 },
  { label: '착과기', pct: 75 },
  { label: '수확기', pct: 100 },
];

const DAY_LABELS = ['월', '화', '수', '목', '금', '토', '일'];

function getDaysSincePlanting(plantingDate: string): number {
  const planting = new Date(plantingDate);
  const today = new Date();
  const diff = today.getTime() - planting.getTime();
  return Math.max(0, Math.floor(diff / (1000 * 60 * 60 * 24)));
}

function getExpectedHarvestDate(plantingDate: string): string {
  const planting = new Date(plantingDate);
  planting.setDate(planting.getDate() + 180);
  return planting.toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' });
}

function getWeeklyBarData(logs: FarmLogEntry[]): number[] {
  const today = new Date();
  const startOfWeek = new Date(today);
  // Get Monday of the current week
  const dayOfWeek = today.getDay(); // 0=Sun, 1=Mon, ...
  const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  startOfWeek.setDate(today.getDate() + diffToMonday);
  startOfWeek.setHours(0, 0, 0, 0);

  const counts = Array(7).fill(0);
  logs.forEach((entry) => {
    const entryDate = new Date(entry.createdAt);
    const diff = Math.floor((entryDate.getTime() - startOfWeek.getTime()) / (1000 * 60 * 60 * 24));
    if (diff >= 0 && diff < 7) {
      counts[diff]++;
    }
  });
  return counts;
}

export default function Report() {
  const settings: FarmSettings = mockFarmSettings;
  const logs: FarmLogEntry[] = mockFarmLog;

  const daysSincePlanting = getDaysSincePlanting(settings.plantingDate);
  const expectedHarvest = getExpectedHarvestDate(settings.plantingDate);
  const weeklyData = getWeeklyBarData(logs);
  const maxCount = Math.max(...weeklyData, 1);

  const currentStagePct = 50;

  return (
    <div className="min-h-screen bg-gray-50 pb-6">
      {/* Header */}
      <div className="bg-green-600 px-4 pt-10 pb-5">
        <div className="flex items-center gap-2">
          <BarChart2 className="text-white" size={22} />
          <h1 className="text-white text-xl font-bold">성장 보고서</h1>
          <Calendar className="text-white ml-auto" size={20} />
        </div>
      </div>

      <div className="px-4 mt-4 space-y-4">
        {/* Summary cards */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <div className="flex items-center gap-1 mb-1">
              <Leaf size={14} className="text-green-500" />
              <span className="text-xs text-gray-500">재배 일수</span>
            </div>
            <p className="text-2xl font-bold text-green-700">{daysSincePlanting}일</p>
            <p className="text-xs text-gray-400 mt-0.5">정식일 기준</p>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <div className="flex items-center gap-1 mb-1">
              <TrendingUp size={14} className="text-green-500" />
              <span className="text-xs text-gray-500">예상 수확일</span>
            </div>
            <p className="text-sm font-bold text-green-700 leading-tight">{expectedHarvest}</p>
            <p className="text-xs text-gray-400 mt-0.5">정식 후 180일</p>
          </div>
        </div>

        {/* 생육 단계 progress */}
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <h2 className="text-sm font-semibold text-gray-700 mb-3">생육 단계</h2>
          <div className="relative h-4 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-green-500 rounded-full transition-all"
              style={{ width: `${currentStagePct}%` }}
            />
          </div>
          <div className="flex justify-between mt-2">
            {stages.map((s) => (
              <div key={s.label} className="flex flex-col items-center" style={{ width: '20%' }}>
                <span
                  className={`text-[10px] text-center leading-tight ${
                    s.pct === currentStagePct ? 'text-green-600 font-bold' : 'text-gray-400'
                  }`}
                >
                  {s.label}
                </span>
              </div>
            ))}
          </div>
          <div className="mt-2 text-center">
            <span className="inline-block bg-green-100 text-green-700 text-xs font-semibold px-3 py-1 rounded-full">
              현재: 개화기
            </span>
          </div>
        </div>

        {/* 주간 기록 차트 */}
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <h2 className="text-sm font-semibold text-gray-700 mb-3">주간 기록 차트</h2>
          <div className="flex items-end justify-between gap-1 h-24">
            {weeklyData.map((count, i) => {
              const heightPct = maxCount > 0 ? (count / maxCount) * 100 : 0;
              return (
                <div key={i} className="flex flex-col items-center flex-1 h-full justify-end">
                  <div
                    className="w-full bg-green-400 rounded-t"
                    style={{ height: `${Math.max(heightPct, count > 0 ? 8 : 0)}%` }}
                  />
                </div>
              );
            })}
          </div>
          <div className="flex justify-between mt-1 px-0.5">
            {DAY_LABELS.map((label) => (
              <span key={label} className="text-[11px] text-gray-400 flex-1 text-center">
                {label}
              </span>
            ))}
          </div>
        </div>

        {/* AI 주간 코멘트 */}
        <div className="bg-white rounded-xl p-4 shadow-sm border-l-4 border-green-500">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <AlertTriangle size={16} className="text-yellow-500" />
              <h2 className="text-sm font-semibold text-gray-700">이번 주 AI 코멘트</h2>
            </div>
            <span className="bg-yellow-100 text-yellow-700 text-xs font-semibold px-2 py-0.5 rounded-full">
              위험도 3/5 (주의)
            </span>
          </div>
          <p className="text-sm text-gray-600 leading-relaxed">
            개화기 후반부입니다. 습도 관리에 주의하고 지속적인 잿빛곰팡이 예방이 필요합니다.
            착과기 전환까지 약 14일 예상됩니다.
          </p>
        </div>
      </div>
    </div>
  );
}
